/**
 * Routes for AI-driven presenter notes generation.
 *
 *   GET  /api/personas                         — list available persona presets
 *   POST /api/slides/:file/notes/generate      — generate one slide's note (409 if exists without overwrite)
 *   POST /api/notes/generate-all               — generate notes for all slides in deck (SSE progress)
 */

import { readFile, writeFile, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { listSlideFiles, normalizeSlideFilename } from '../helpers.js';
import {
  listPersonas,
  loadPersona,
  generateNote,
  generateDeckSpine,
  NOTE_MODELS,
  DEFAULT_NOTE_MODEL,
} from '../../../src/notes-generator.js';
import {
  ensureNotesDir,
  ensureNotesFolderLayout,
  notesBackupPathFor,
  notesPathFor,
  spinePath,
} from '../../../src/notes-paths.js';
import { broadcastSSE } from '../sse.js';

const BATCH_CONCURRENCY = 3;

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readSpineCache(deckDir) {
  const cachePath = spinePath(deckDir);
  try {
    const [raw, outlineStat, spineStat] = await Promise.all([
      readFile(cachePath, 'utf-8'),
      stat(join(deckDir, 'slide-outline.md')).catch(() => null),
      stat(cachePath),
    ]);
    const obj = JSON.parse(raw);
    if (!obj || !Array.isArray(obj.spine)) return null;
    const spineMtime = spineStat.mtime.getTime();
    const outlineMtime = outlineStat ? outlineStat.mtime.getTime() : 0;
    if (outlineMtime > spineMtime) return { ...obj, stale: true };
    return { ...obj, stale: false };
  } catch {
    return null;
  }
}

async function writeSpineCache(deckDir, { personaId, model, spine }) {
  await ensureNotesDir(deckDir);
  const cachePath = spinePath(deckDir);
  const payload = {
    generatedAt: new Date().toISOString(),
    personaId,
    model,
    spine,
  };
  const tmp = `${cachePath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tmp, JSON.stringify(payload, null, 2), 'utf-8');
  await rename(tmp, cachePath);
}

async function loadOrCreateSpine(deckDir, {
  personaId, persona, model, tracker, outlineContent, forceFresh = false,
}) {
  if (!outlineContent) return { spine: null, reused: false, regenerated: false };

  if (!forceFresh) {
    const cached = await readSpineCache(deckDir);
    if (cached && !cached.stale
      && cached.personaId === personaId
      && cached.model === model
      && Array.isArray(cached.spine) && cached.spine.length > 0) {
      return { spine: cached.spine, reused: true, regenerated: false };
    }
  }

  const spine = await generateDeckSpine({
    outlineContent, persona, model, tracker, cwd: deckDir,
  }).catch((err) => {
    console.warn('[notes-generate] spine generation failed, continuing without spine:', err.message);
    return null;
  });

  if (spine) {
    try {
      await writeSpineCache(deckDir, { personaId, model, spine });
    } catch (err) {
      console.warn('[notes-generate] failed to persist deck-spine.json:', err.message);
    }
  }

  return { spine, reused: false, regenerated: !!spine };
}

function resolveModel(raw) {
  const model = typeof raw === 'string' ? raw.trim() : '';
  if (!model) return DEFAULT_NOTE_MODEL;
  if (!NOTE_MODELS.includes(model)) {
    throw new Error(`Invalid model. Allowed: ${NOTE_MODELS.join(', ')}`);
  }
  return model;
}

function sanitizeCustomPrompt(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, 4000);
}

async function writeNoteAtomic(deckDir, slideFile, text, { backupOnOverwrite }) {
  await ensureNotesDir(deckDir);
  const notesPath = notesPathFor(deckDir, slideFile);
  if (backupOnOverwrite && await pathExists(notesPath)) {
    // Rolling single-slot backup — overwrites any prior `.bak`.
    try { await rename(notesPath, notesBackupPathFor(deckDir, slideFile)); }
    catch { /* best-effort */ }
  }
  const tmp = `${notesPath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(tmp, text, 'utf8');
  await rename(tmp, notesPath);
}

async function loadOutlineIfPresent(deckDir) {
  try {
    return await readFile(join(deckDir, 'slide-outline.md'), 'utf-8');
  } catch {
    return '';
  }
}

async function processOneSlide({
  deckDir,
  slideFile,
  persona,
  customPrompt,
  model,
  tracker,
  overwrite,
  outlineContent,
  spine,
}) {
  const notesPath = notesPathFor(deckDir, slideFile);
  const exists = await pathExists(notesPath);
  if (exists && !overwrite) {
    const existing = await readFile(notesPath, 'utf-8').catch(() => '');
    return { slide: slideFile, status: 'skipped', reason: 'existing', existing };
  }

  const note = await generateNote({
    deckDir, slideFile, persona, customPrompt, model, tracker, outlineContent, spine,
  });
  if (!note || !note.trim()) {
    return { slide: slideFile, status: 'failed', reason: 'empty-output' };
  }
  await writeNoteAtomic(deckDir, slideFile, note, { backupOnOverwrite: exists });
  return { slide: slideFile, status: 'generated', overwritten: exists };
}

async function runBatchWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function runner() {
    while (cursor < items.length) {
      const idx = cursor++;
      try {
        results[idx] = await worker(items[idx], idx);
      } catch (err) {
        results[idx] = { slide: items[idx], status: 'failed', reason: err.message || String(err) };
      }
    }
  }
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, () => runner());
  await Promise.all(workers);
  return results;
}

export function createNotesGenerateRouter(ctx) {
  const { express } = ctx;
  const router = express.Router();

  router.get('/api/personas', (_req, res) => {
    try {
      const personas = listPersonas();
      res.json({ personas, models: NOTE_MODELS, defaultModel: DEFAULT_NOTE_MODEL });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/api/slides/:file/notes/generate', async (req, res) => {
    let slideFile;
    try {
      slideFile = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const deckDir = ctx.getSlidesDir();
    if (!deckDir) return res.status(400).json({ error: 'No slides directory set.' });
    if (!await pathExists(join(deckDir, slideFile))) {
      return res.status(404).json({ error: `Slide not found: ${slideFile}` });
    }
    await ensureNotesFolderLayout(deckDir);

    const personaId = typeof req.body?.persona === 'string' ? req.body.persona.trim() : '';
    if (!personaId) return res.status(400).json({ error: 'Missing `persona`.' });

    let model;
    try { model = resolveModel(req.body?.model); }
    catch (err) { return res.status(400).json({ error: err.message }); }

    const customPrompt = sanitizeCustomPrompt(req.body?.customPrompt);
    const overwrite = req.body?.overwrite === true;

    let persona;
    try { persona = await loadPersona(personaId); }
    catch (err) { return res.status(400).json({ error: err.message }); }

    const notesPath = notesPathFor(deckDir, slideFile);
    if (await pathExists(notesPath) && !overwrite) {
      const existing = await readFile(notesPath, 'utf-8').catch(() => '');
      return res.status(409).json({
        error: 'Notes already exist. Set `overwrite: true` to replace.',
        existing,
      });
    }

    try {
      const outlineContent = await loadOutlineIfPresent(deckDir);
      const { spine } = await loadOrCreateSpine(deckDir, {
        personaId, persona, model,
        tracker: ctx.usageTracker,
        outlineContent,
      });
      const result = await processOneSlide({
        deckDir, slideFile, persona, customPrompt, model,
        tracker: ctx.usageTracker, overwrite: true,
        outlineContent,
        spine,
      });
      if (result.status !== 'generated') {
        return res.status(500).json({ error: result.reason || 'Generation failed.' });
      }
      const note = await readFile(notesPath, 'utf-8');
      return res.json({ success: true, slide: slideFile, notes: note, overwritten: !!result.overwritten });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.post('/api/notes/generate-all', async (req, res) => {
    const deckDir = ctx.getSlidesDir();
    if (!deckDir) return res.status(400).json({ error: 'No slides directory set.' });
    await ensureNotesFolderLayout(deckDir);

    const personaId = typeof req.body?.persona === 'string' ? req.body.persona.trim() : '';
    if (!personaId) return res.status(400).json({ error: 'Missing `persona`.' });

    let model;
    try { model = resolveModel(req.body?.model); }
    catch (err) { return res.status(400).json({ error: err.message }); }

    const customPrompt = sanitizeCustomPrompt(req.body?.customPrompt);
    const overwrite = req.body?.overwrite === true;

    let persona;
    try { persona = await loadPersona(personaId); }
    catch (err) { return res.status(400).json({ error: err.message }); }

    const slides = await listSlideFiles(deckDir).catch(() => []);
    if (slides.length === 0) return res.status(400).json({ error: 'No slides found in deck.' });

    const runId = `notes-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const forceRefreshSpine = req.body?.refreshSpine === true;
    res.json({ runId, total: slides.length, persona: persona.id, model });

    const outlineContent = await loadOutlineIfPresent(deckDir);
    broadcastSSE(ctx.sseClients, 'notesGenerateStarted', {
      runId, total: slides.length, persona: persona.id, model,
    });

    let spine = null;
    try {
      const spineResult = await loadOrCreateSpine(deckDir, {
        personaId, persona, model,
        tracker: ctx.usageTracker,
        outlineContent,
        forceFresh: forceRefreshSpine,
      });
      spine = spineResult.spine;
      broadcastSSE(ctx.sseClients, 'notesSpineReady', {
        runId,
        hasSpine: !!spine,
        reused: !!spineResult.reused,
        regenerated: !!spineResult.regenerated,
        slides: spine ? spine.length : 0,
      });
    } catch (err) {
      broadcastSSE(ctx.sseClients, 'notesSpineReady', {
        runId, hasSpine: false, reused: false, regenerated: false,
        error: err.message || String(err),
      });
    }

    let completed = 0;
    const onDone = (result) => {
      completed++;
      broadcastSSE(ctx.sseClients, 'notesGenerateProgress', {
        runId, completed, total: slides.length, ...result,
      });
    };

    (async () => {
      try {
        const results = await runBatchWithConcurrency(slides, BATCH_CONCURRENCY, async (slideFile) => {
          const result = await processOneSlide({
            deckDir, slideFile, persona, customPrompt, model,
            tracker: ctx.usageTracker, overwrite,
            outlineContent,
            spine,
          });
          onDone(result);
          return result;
        });

        const generated = results.filter((r) => r?.status === 'generated').length;
        const skipped = results.filter((r) => r?.status === 'skipped').length;
        const failed = results.filter((r) => r?.status === 'failed').length;

        broadcastSSE(ctx.sseClients, 'notesGenerateFinished', {
          runId, total: slides.length, generated, skipped, failed,
          results: results.map((r) => r || { status: 'failed' }),
        });
      } catch (err) {
        broadcastSSE(ctx.sseClients, 'notesGenerateFinished', {
          runId, total: slides.length, generated: 0, skipped: 0, failed: slides.length,
          error: err.message || String(err),
        });
      }
    })().catch((err) => {
      console.error('[notes-generate] Unhandled error:', err);
    });
  });

  return router;
}
