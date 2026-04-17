/**
 * AI-driven slide notes (presenter script) generator.
 *
 * Inputs per slide:
 *   - deck's slide-outline.md (frontmatter + per-slide sections)
 *   - the slide's HTML (body text)
 *   - a persona preset (packs/personas/<id>.md)
 *   - optional custom prompt
 *
 * Output: a plain markdown string to be written to slide-NN.notes.md.
 */

import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { getPackageRoot, getCwd } from './resolve.js';
import { parseOutline } from '../scripts/server/outline.js';
import { spawnClaudeEdit } from '../scripts/server/spawn.js';
import { isClaudeModel } from './editor/codex-edit.js';

export const DEFAULT_NOTE_MODEL = 'gpt-4o-mini';

export const NOTE_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'claude-sonnet-4-6',
  'claude-opus-4-6',
];

const PERSONA_FILE_RE = /^[a-z0-9][a-z0-9\-]*\.md$/i;
const MAX_NOTE_CHARS = 2000;

// ── Persona loading ─────────────────────────────────────────────────

function personaDirs() {
  return [join(getCwd(), 'packs', 'personas'), join(getPackageRoot(), 'packs', 'personas')];
}

function parsePersonaMarkdown(id, raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontmatter = {};
  let body = raw;
  if (match) {
    body = match[2] || '';
    for (const line of match[1].split('\n')) {
      const m = line.match(/^\s*([a-zA-Z][\w-]*)\s*:\s*(.+?)\s*$/);
      if (!m) continue;
      const key = m[1].trim();
      let value = m[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }
  return {
    id: frontmatter.id || id,
    name: frontmatter.name || id,
    description: frontmatter.description || '',
    defaultLength: frontmatter['default-length'] || '',
    body: body.trim(),
  };
}

export function listPersonas() {
  const seen = new Map();
  for (const dir of personaDirs()) {
    if (!existsSync(dir)) continue;
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (!PERSONA_FILE_RE.test(name)) continue;
      const id = name.replace(/\.md$/i, '');
      if (seen.has(id)) continue;
      try {
        const persona = parsePersonaMarkdown(id, readFileSync(join(dir, name), 'utf-8'));
        seen.set(id, { id: persona.id, name: persona.name, description: persona.description });
      } catch {
        /* skip unreadable */
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export async function loadPersona(id) {
  if (!id || !/^[a-z0-9][a-z0-9\-]*$/i.test(id)) {
    throw new Error(`Invalid persona id: ${id}`);
  }
  for (const dir of personaDirs()) {
    const path = join(dir, `${id}.md`);
    if (!existsSync(path)) continue;
    const raw = await readFile(path, 'utf-8');
    return parsePersonaMarkdown(id, raw);
  }
  throw new Error(`Persona not found: ${id}`);
}

// ── Outline + slide-file helpers ────────────────────────────────────

export function extractOutlineFrontmatter(outlineContent) {
  if (!outlineContent) return {};
  const match = outlineContent.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return {};
  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^\s*([a-zA-Z][\w-]*)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    frontmatter[m[1].trim()] = value;
  }
  return frontmatter;
}

export function extractSlideOutlineSection(outlineContent, slideNumber) {
  if (!outlineContent || !Number.isInteger(slideNumber)) return '';
  const parsed = parseOutline(outlineContent, '');
  if (parsed.slides.length === 0) return '';
  const idx = slideNumber - 1;
  if (idx < 0 || idx >= parsed.slides.length) return '';
  return (parsed.slides[idx].rawBlock || '').trim();
}

export function extractHtmlText(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function slideNumberOf(slideFile) {
  const m = String(slideFile || '').match(/slide-0*(\d+)\.html$/i);
  return m ? Number.parseInt(m[1], 10) : null;
}

// ── Prompt building ─────────────────────────────────────────────────

const SYSTEM_PROMPT = [
  '당신은 프레젠테이션 발표자의 옆에서 말할 발표 노트를 작성하는 전문 작가입니다.',
  '',
  '출력 규칙 (엄격히 준수):',
  '- 한국어 마크다운 본문만 출력합니다. frontmatter, 코드 블록(```), 설명 문구는 금지합니다.',
  '- 기본 3~5문장 분량. 페르소나 가이드에 default-length가 있으면 그 값을 우선 따릅니다.',
  '- 필요하면 불릿(`- `)을 최대 4개까지 사용할 수 있습니다.',
  '- 슬라이드에 이미 보이는 텍스트를 그대로 반복하지 마세요. 청중에게 "옆에서 덧붙일" 맥락, 근거, 비유, 의미를 적으세요.',
  '- 수치·고유명사·인용은 슬라이드에 나온 그대로 정확히 사용하세요. 불확실하면 생략하세요. 사실을 지어내지 마세요.',
  '- 이모지, 감탄사, "이 슬라이드는…" 같은 메타 발언 금지.',
  '- h1/h2 헤딩, HTML 태그 금지.',
].join('\n');

export function buildUserPrompt({
  outlineFrontmatter = {},
  slideSection = '',
  slideText = '',
  persona,
  customPrompt = '',
  slideNumber = null,
}) {
  const lines = [];

  const fmEntries = Object.entries(outlineFrontmatter).filter(([, v]) => typeof v === 'string' && v.trim());
  if (fmEntries.length > 0) {
    lines.push('## 덱 전체 컨텍스트 (slide-outline.md frontmatter)');
    for (const [k, v] of fmEntries) lines.push(`- ${k}: ${v}`);
    lines.push('');
  }

  if (slideSection) {
    lines.push(`## 이 슬라이드${slideNumber ? `(Slide ${slideNumber})` : ''}의 아웃라인 의도`);
    lines.push(slideSection);
    lines.push('');
  }

  lines.push('## 이 슬라이드의 실제 화면 내용 (HTML 본문 추출)');
  lines.push(slideText || '(화면 텍스트 없음)');
  lines.push('');

  if (persona) {
    lines.push(`## 발표 페르소나: ${persona.name || persona.id}`);
    if (persona.description) lines.push(`(${persona.description})`);
    if (persona.defaultLength) lines.push(`분량 기준: ${persona.defaultLength}`);
    lines.push('');
    lines.push(persona.body || '');
    lines.push('');
  }

  if (customPrompt && customPrompt.trim()) {
    lines.push('## 추가 요청사항 (사용자 커스텀 — 최우선 반영)');
    lines.push(customPrompt.trim());
    lines.push('');
  }

  lines.push('위 컨텍스트를 바탕으로 이 한 슬라이드의 발표 노트를 작성하세요. 다른 설명 없이 마크다운 본문만 출력하세요.');
  return lines.join('\n');
}

// ── AI call dispatch ────────────────────────────────────────────────

function sanitizeNoteOutput(raw) {
  if (!raw) return '';
  let text = String(raw).trim();
  // Strip surrounding code fences if the model disobeyed.
  const fence = text.match(/^```(?:markdown|md)?\n([\s\S]*?)\n```\s*$/);
  if (fence) text = fence[1].trim();
  // Strip any YAML frontmatter the model may have prepended.
  text = text.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  // Enforce max length.
  if (text.length > MAX_NOTE_CHARS) {
    text = text.slice(0, MAX_NOTE_CHARS).trimEnd() + '…';
  }
  return text;
}

async function callOpenAI({ systemPrompt, userPrompt, model, tracker, timeout = 60_000 }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set. Add it to your .env file.');

  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey, timeout });

  const promptChars = systemPrompt.length + userPrompt.length;
  const callId = tracker?.startCall('generate-notes', model, { promptChars });

  let response;
  try {
    response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 800,
    });
  } catch (err) {
    tracker?.finishCall(callId, { success: false });
    throw err;
  }

  const text = response.choices?.[0]?.message?.content || '';
  tracker?.finishCall(callId, {
    inputTokens: response.usage?.prompt_tokens ?? null,
    outputTokens: response.usage?.completion_tokens ?? null,
    promptChars,
    outputChars: text.length,
    success: true,
  });

  return text;
}

async function callClaude({ systemPrompt, userPrompt, model, tracker, cwd }) {
  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const promptChars = fullPrompt.length;
  const callId = tracker?.startCall('generate-notes', model, { promptChars });

  const result = await spawnClaudeEdit({
    prompt: fullPrompt,
    model,
    cwd: cwd || process.cwd(),
    onLog: () => {},
    timeout: 180_000,
  });

  tracker?.finishCall(callId, {
    inputTokens: result.usage?.inputTokens ?? null,
    outputTokens: result.usage?.outputTokens ?? null,
    reportedCostUsd: result.usage?.costUsd ?? null,
    numTurns: result.usage?.numTurns ?? null,
    promptChars,
    outputChars: (result.stdout || '').length,
    success: result.code === 0,
  });

  if (result.code !== 0) {
    throw new Error(`Claude CLI failed (code ${result.code}): ${result.stderr?.slice(0, 300) || 'unknown'}`);
  }
  return result.stdout || '';
}

export async function callAIForNote({ systemPrompt, userPrompt, model, tracker, cwd }) {
  if (!NOTE_MODELS.includes(model)) {
    throw new Error(`Unsupported model: ${model}. Supported: ${NOTE_MODELS.join(', ')}`);
  }
  const raw = isClaudeModel(model)
    ? await callClaude({ systemPrompt, userPrompt, model, tracker, cwd })
    : await callOpenAI({ systemPrompt, userPrompt, model, tracker });
  return sanitizeNoteOutput(raw);
}

// ── High-level entry: generate one slide's note ─────────────────────

/**
 * Generate a presenter note for a single slide.
 * Returns the generated markdown text. Does NOT write to disk — caller decides.
 *
 * @param {object} p
 * @param {string} p.deckDir — absolute path to the deck directory
 * @param {string} p.slideFile — filename like "slide-03.html"
 * @param {object} p.persona — result of loadPersona()
 * @param {string} [p.customPrompt] — optional extra prompt from user
 * @param {string} [p.model] — one of NOTE_MODELS
 * @param {object} [p.tracker] — ai-usage tracker
 * @param {string} [p.outlineContent] — pre-loaded slide-outline.md (optional, will be read if absent)
 */
export async function generateNote({
  deckDir,
  slideFile,
  persona,
  customPrompt = '',
  model = DEFAULT_NOTE_MODEL,
  tracker,
  outlineContent,
}) {
  if (!deckDir) throw new Error('deckDir is required.');
  if (!slideFile) throw new Error('slideFile is required.');
  if (!persona) throw new Error('persona is required. Use loadPersona() first.');

  const slideNumber = slideNumberOf(slideFile);

  let resolvedOutline = outlineContent;
  if (resolvedOutline === undefined) {
    try {
      resolvedOutline = await readFile(join(deckDir, 'slide-outline.md'), 'utf-8');
    } catch {
      resolvedOutline = '';
    }
  }

  const outlineFrontmatter = extractOutlineFrontmatter(resolvedOutline);
  const slideSection = slideNumber
    ? extractSlideOutlineSection(resolvedOutline, slideNumber)
    : '';

  let html = '';
  try {
    html = await readFile(join(deckDir, slideFile), 'utf-8');
  } catch (err) {
    throw new Error(`Cannot read slide file ${slideFile}: ${err.message}`);
  }
  const slideText = extractHtmlText(html);

  const userPrompt = buildUserPrompt({
    outlineFrontmatter,
    slideSection,
    slideText,
    persona,
    customPrompt,
    slideNumber,
  });

  return callAIForNote({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    model,
    tracker,
    cwd: deckDir,
  });
}
