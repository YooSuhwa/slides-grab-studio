import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

import { CLAUDE_MODELS, CODEX_MODELS } from '../../../src/editor/codex-edit.js';
import { normalizePackId } from '../../../src/resolve.js';

import { broadcastSSE } from '../sse.js';
import {
  randomRunId,
  parseOutline,
  appendOutlinePrompt,
  spawnAIEdit,
  setupFileWatcher,
  listExistingDeckNames,
} from '../helpers.js';

const ALL_MODELS = [...CLAUDE_MODELS, ...CODEX_MODELS];

/**
 * Plan and outline routes.
 * Routes: POST /api/plan, POST /api/plan/revise,
 *         GET /api/outline, PUT /api/outline
 */
export function createPlanRouter(ctx) {
  const { express, opts } = ctx;
  const router = express.Router();

  // ── GET /api/outline ────────────────────────────────────────────────
  router.get('/api/outline', async (_req, res) => {
    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) {
      return res.status(404).json({ error: 'No slides directory set.' });
    }
    const outlinePath = join(slidesDirectory, 'slide-outline.md');
    try {
      const content = await readFile(outlinePath, 'utf-8');
      const outline = parseOutline(content, basename(slidesDirectory));
      res.json(outline);
    } catch {
      res.status(404).json({ error: 'No slide-outline.md found.' });
    }
  });

  // ── PUT /api/outline ────────────────────────────────────────────────
  router.put('/api/outline', async (req, res) => {
    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) {
      return res.status(404).json({ error: 'No slides directory set.' });
    }
    const { content } = req.body ?? {};
    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Missing `content` string.' });
    }
    const outlinePath = join(slidesDirectory, 'slide-outline.md');
    try {
      await writeFile(outlinePath, content, 'utf-8');
      const outline = parseOutline(content, basename(slidesDirectory));
      res.json(outline);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /api/plan ──────────────────────────────────────────────────
  router.post('/api/plan', async (req, res) => {
    const { topic, requirements, model, slideCount: slideCountRange, packId: reqPackId, useImages } = req.body ?? {};

    if (typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ error: 'Missing or invalid `topic`.' });
    }

    if (!ctx.generateMutex.tryAcquire()) {
      return res.status(409).json({ error: 'A generation is already in progress.' });
    }

    const selectedModel = typeof model === 'string' && ALL_MODELS.includes(model.trim())
      ? model.trim()
      : CLAUDE_MODELS[0];

    const runId = randomRunId();

    broadcastSSE(ctx.sseClients, 'planStarted', { runId, topic: topic.trim() });
    broadcastSSE(ctx.sseClients, 'progress', { runId, phase: 'plan', step: 'Analyzing topic and structuring outline' });
    res.json({ runId, topic: topic.trim(), model: selectedModel });

    (async () => {
      try {
        const countLabel = typeof slideCountRange === 'string' && slideCountRange.trim()
          ? slideCountRange.trim()
          : '';
        const selectedPackId = normalizePackId(reqPackId);
        const existingDeckNames = await listExistingDeckNames();

        const promptLines = [
          `주제: ${topic.trim()}`,
        ];
        if (typeof requirements === 'string' && requirements.trim()) {
          promptLines.push(`요구사항: ${requirements.trim()}`);
        }
        if (countLabel) {
          promptLines.push(`슬라이드 수: ${countLabel}장`);
        } else {
          promptLines.push('슬라이드 수: 주제에 적합한 분량으로 자유롭게 결정하세요 (보통 8~12장)');
        }
        if (useImages) {
          promptLines.push('이미지 사용: ON — 전체 슬라이드의 약 50~70%에 이미지를 포함하세요.');
          promptLines.push('');
          promptLines.push('이미지 마커 형식 (2종류):');
          promptLines.push('- image-search: <영문 키워드> — 실제 사진 (인물, 장소, 제품, 실제 장면)');
          promptLines.push('- image-generate: <영문 설명> — 추상적/개념적/미래적/은유적 이미지');
          promptLines.push('');
          promptLines.push('마커 선택 예시:');
          promptLines.push('- image-search: people working in office, Tokyo skyline at night');
          promptLines.push('- image-generate: abstract neural network visualization, futuristic city with flying cars');
          promptLines.push('');
          promptLines.push('이미지가 효과적인 경우:');
          promptLines.push('- Cover: 주제를 상징하는 히어로 이미지');
          promptLines.push('- Quote: 인용 인물의 초상 사진');
          promptLines.push('- 사례/비교: 실제 제품, 현장, before/after');
          promptLines.push('- 감성/문제 제기: 상황 사진으로 공감 유도');
          promptLines.push('- 개념 설명: 은유적 이미지로 시각화');
          promptLines.push('');
          promptLines.push('이미지를 생략해도 좋은 경우:');
          promptLines.push('- 텍스트가 많거나 정보 밀도가 높은 슬라이드');
          promptLines.push('- 수치/KPI/차트가 핵심인 슬라이드');
          promptLines.push('');
          promptLines.push('검색어/설명은 영어로, 구체적으로 작성하세요.');
        }
        promptLines.push('');
        promptLines.push('다음을 수행하세요:');
        promptLines.push('');
        promptLines.push('1. 주제에서 핵심 키워드 2~3개를 뽑아 영어 소문자 kebab-case 폴더명을 결정하세요.');
        promptLines.push('   예: "인공지능 트렌드 2025" → ai-trends-2025');
        promptLines.push('');
        promptLines.push('2. 해당 폴더에 slide-outline.md를 생성하세요. (HTML 슬라이드는 생성하지 마세요)');
        promptLines.push('   mkdir -p decks/<name> && 아웃라인 파일만 작성');
        promptLines.push('');
        appendOutlinePrompt(promptLines, selectedPackId, { existingDeckNames });

        const fullPrompt = promptLines.join('\n');

        broadcastSSE(ctx.sseClients, 'progress', { runId, phase: 'plan', step: 'Generating outline with AI' });

        const result = await spawnAIEdit({
          prompt: fullPrompt,
          imagePath: null,
          model: selectedModel,
          cwd: process.cwd(),
          onLog: (stream, chunk) => {
            broadcastSSE(ctx.sseClients, 'planLog', { runId, stream, chunk });
          },
        }, { tracker: ctx.usageTracker, operation: 'outline' });

        const success = result.code === 0;
        let outline = null;
        let detectedDeckName = '';

        if (success) {
          broadcastSSE(ctx.sseClients, 'progress', { runId, phase: 'plan', step: 'Parsing generated outline' });
        }

        if (success) {
          try {
            const decksRoot = resolve(process.cwd(), 'decks');
            const dirs = await readdir(decksRoot, { withFileTypes: true });
            let bestDir = '';
            let bestMtime = 0;

            for (const d of dirs) {
              if (!d.isDirectory()) continue;
              const outlinePath = join(decksRoot, d.name, 'slide-outline.md');
              try {
                const s = await stat(outlinePath);
                if (s.mtimeMs > bestMtime) {
                  bestMtime = s.mtimeMs;
                  bestDir = d.name;
                }
              } catch { /* no outline */ }
            }

            if (bestDir) {
              detectedDeckName = bestDir;
              const outlinePath = join(decksRoot, bestDir, 'slide-outline.md');
              const content = await readFile(outlinePath, 'utf-8');
              outline = parseOutline(content, bestDir);

              ctx.setSlidesDir(join(decksRoot, bestDir));
              setupFileWatcher(ctx, ctx.getSlidesDir());
            }
          } catch (err) {
            console.error('Failed to parse outline:', err);
          }
        }

        broadcastSSE(ctx.sseClients, 'planFinished', {
          runId,
          success,
          message: success ? 'Outline ready.' : `Plan failed (exit code ${result.code}).`,
          outline,
          deckName: detectedDeckName,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        broadcastSSE(ctx.sseClients, 'planFinished', { runId, success: false, message, outline: null });
      } finally {
        ctx.generateMutex.release();
      }
    })().catch((err) => {
      console.error('[plan] Unhandled error in async block:', err);
    });
  });

  // ── POST /api/plan/revise ───────────────────────────────────────────
  router.post('/api/plan/revise', async (req, res) => {
    const { feedback, deckName, targetSlide } = req.body ?? {};

    if (typeof feedback !== 'string' || feedback.trim() === '') {
      return res.status(400).json({ error: 'Missing feedback.' });
    }

    if (!ctx.generateMutex.tryAcquire()) {
      return res.status(409).json({ error: 'A generation is already in progress.' });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) {
      ctx.generateMutex.release();
      return res.status(400).json({ error: 'No outline to revise.' });
    }

    const selectedModel = CLAUDE_MODELS[0];
    const runId = randomRunId();

    const targetLabel = typeof targetSlide === 'number'
      ? `Revise Slide ${targetSlide}: ${feedback.trim().slice(0, 40)}`
      : `Revise: ${feedback.trim().slice(0, 50)}`;
    broadcastSSE(ctx.sseClients, 'planStarted', { runId, topic: targetLabel });
    broadcastSSE(ctx.sseClients, 'progress', { runId, phase: 'revise', step: 'Applying revision feedback' });
    res.json({ runId });

    (async () => {
      try {
        const outlinePath = join(slidesDirectory, 'slide-outline.md');

        const promptLines = [
          '현재 아웃라인 파일을 수정 요청에 따라 업데이트하세요.',
          '',
          `파일 경로: ${outlinePath}`,
          '',
        ];

        if (typeof targetSlide === 'number') {
          promptLines.push(`대상: Slide ${targetSlide}만 수정하세요. 다른 슬라이드는 변경하지 마세요.`);
          promptLines.push('');
        }

        promptLines.push('수정 요청:');
        promptLines.push(feedback.trim());
        promptLines.push('');
        promptLines.push('규칙:');
        promptLines.push('- slide-outline.md 파일만 수정하세요');
        promptLines.push('- HTML 파일은 생성하지 마세요');
        promptLines.push('- 기존 아웃라인 형식을 유지하세요');

        const fullPrompt = promptLines.join('\n');

        const result = await spawnAIEdit({
          prompt: fullPrompt,
          imagePath: null,
          model: selectedModel,
          cwd: process.cwd(),
          onLog: (stream, chunk) => {
            broadcastSSE(ctx.sseClients, 'planLog', { runId, stream, chunk });
          },
        }, { tracker: ctx.usageTracker, operation: 'revise' });

        const success = result.code === 0;

        let outline = null;
        if (success) {
          try {
            const content = await readFile(outlinePath, 'utf-8');
            outline = parseOutline(content, deckName || basename(slidesDirectory));
          } catch (err) {
            console.error('Failed to parse revised outline:', err);
          }
        }

        broadcastSSE(ctx.sseClients, 'planFinished', {
          runId,
          success,
          message: success ? 'Outline revised.' : `Revision failed (exit code ${result.code}).`,
          outline,
          deckName: deckName || basename(slidesDirectory),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        broadcastSSE(ctx.sseClients, 'planFinished', { runId, success: false, message, outline: null });
      } finally {
        ctx.generateMutex.release();
      }
    })().catch((err) => {
      console.error('[plan/revise] Unhandled error in async block:', err);
    });
  });

  return router;
}
