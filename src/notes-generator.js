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
  '당신은 프레젠테이션 발표자 옆에서 말할 "발표 노트"를 작성하는 전문 작가입니다.',
  '',
  '출력 규칙 (엄격):',
  '- 한국어 마크다운 본문만 출력합니다. frontmatter, 코드 블록(```), 설명 문구는 금지합니다.',
  '- 기본 3~5문장 분량. 페르소나에 default-length가 있으면 그 값을 우선 따릅니다.',
  '- 필요하면 불릿(`- `)을 최대 4개까지 사용할 수 있습니다.',
  '- 화면에 이미 보이는 텍스트를 풀어쓰거나 반복하지 마세요. "옆에서" 덧붙일 맥락·근거·비유·의미만 적습니다.',
  '- 수치·고유명사·인용은 화면에 나온 그대로 정확히 사용하세요. 불확실하면 생략하세요. 사실을 지어내지 마세요.',
  '- 이모지, 감탄사, "이 슬라이드는…" 같은 메타 발언 금지.',
  '- h1/h2 헤딩, HTML 태그 금지.',
  '',
  '덱 맥락 규칙 (spine이 주어진 경우):',
  '- 이전 슬라이드 beat에서 이미 다룬 내용을 다시 설명하지 마세요.',
  '- 다음 슬라이드 beat에서 다룰 내용을 미리 꺼내지 마세요.',
  '- 현재 슬라이드 beat을 벗어난 이야기를 덧붙이지 마세요.',
  '',
  '역할(role)별 기능 (엄격):',
  '- cover: 주제에 대한 한 줄 훅과 청중 초대만. **관리 수치·방법·이유(예: "물 적게", "실내에서", "인테리어", "관리 쉽다")를 언급하지 마세요.** 본론은 이후 슬라이드 몫입니다.',
  '- contents / toc: **발표 구성/목차만 짚으세요.** 본론 개념(매력 이유, 관리 팁 등)을 설명하거나 요약하지 마세요. "어떤 순서로 다룬다"에서 멈춥니다.',
  '- closing / summary: 본론 재요약·재나열 금지. 덱 전체를 관통하는 한 줄 태도/메시지로 수렴.',
  '- 그 외(body): 한 슬라이드 한 포인트. 비유·사례·근거 중 1개에 집중.',
  '',
  'hook 규칙 (엄격):',
  '- hook="bridge": 마지막 한 문장에 다음 슬라이드로 넘어가는 전환을 둘 수 있습니다.',
  '- hook="question": 청중에게 던지는 질문 한 문장을 허용합니다.',
  '- **hook이 지정되지 않은 슬라이드에서는 "다음", "다음 슬라이드", "이제", "살펴보겠습니다", "알아보겠습니다" 같은 다음-슬라이드 전환 표현을 절대 사용하지 마세요.** 현재 beat로 마무리하고 끝냅니다.',
  '- **hook이 지정되지 않은 슬라이드에서는 수사적 질문("왜 중요할까요?", "어떻게 생각하세요?" 등)도 사용하지 마세요.**',
].join('\n');

const SPINE_SYSTEM_PROMPT = [
  '당신은 발표 전체의 흐름을 설계하는 코치입니다.',
  '슬라이드 outline + persona를 보고, 슬라이드마다 발표자가 "무엇을, 어느 수준까지" 말해야 하는지 짧게 정합니다.',
  '',
  '목적:',
  '- 인접 슬라이드에서 같은 내용을 두 번 말하지 않도록 beat의 경계를 긋는다.',
  '- 슬라이드 역할(cover/contents/body/closing 등)을 살린다.',
  '- 덱 전체가 오프닝 → 전개 → 수렴의 리듬을 갖게 한다.',
  '',
  '출력 규칙 (엄격):',
  '- 순수 JSON 객체만 출력. 코드 펜스(```), 주석, 설명 문구 금지.',
  '- 스키마:',
  '  {"spine":[{"n":<정수>,"role":"<slide type>","title":"<제목>","beat":"<한 문장 30~80자>","hook":"bridge"|"question"|null}]}',
  '- 반드시 입력 슬라이드 수와 동일한 길이의 배열. n은 1부터 증가.',
  '- beat은 "이 슬라이드에서 발표자가 말할 핵심 한 줄". 필요 시 "N번에서 정의하므로 여기서는 금지" 같이 경계를 명시.',
  '- hook은 기본 null. 덱 전체에서 최대 2개 슬라이드에만 "bridge" 또는 "question" 허용.',
  '- role이 "cover"인 슬라이드의 beat에는 관리 수치·방법·이유를 포함하지 마세요. 주제 소개만.',
  '- role이 "contents" 또는 "toc"인 슬라이드의 beat은 "이 발표에서 다룰 구성/목차만 짚는다" 정도로만 작성. 본론 내용 선제 요약 금지.',
  '- role이 "closing"인 슬라이드의 beat은 본론 재요약이 아니라 메시지 수렴.',
  '- 사실 창작 금지. 슬라이드에 없는 수치·고유명사 만들지 말 것.',
].join('\n');

export function buildUserPrompt({
  outlineFrontmatter = {},
  slideSection = '',
  slideText = '',
  persona,
  customPrompt = '',
  slideNumber = null,
  spine = null,
  currentBeat = null,
  prevBeat = null,
  nextBeat = null,
}) {
  const lines = [];

  const fmEntries = Object.entries(outlineFrontmatter).filter(([, v]) => typeof v === 'string' && v.trim());
  if (fmEntries.length > 0) {
    lines.push('## 덱 전체 컨텍스트 (slide-outline.md frontmatter)');
    for (const [k, v] of fmEntries) lines.push(`- ${k}: ${v}`);
    lines.push('');
  }

  if (Array.isArray(spine) && spine.length > 0) {
    lines.push('## 덱 전체 흐름 (spine — 각 슬라이드의 한 줄 의도)');
    for (const s of spine) {
      const marker = currentBeat && s.n === currentBeat.n ? '  ← 지금 이 슬라이드' : '';
      const hookStr = s.hook ? `  (hook: ${s.hook})` : '';
      lines.push(`- ${s.n}. [${s.role || '?'}] ${s.beat}${hookStr}${marker}`);
    }
    lines.push('');
  }

  if (currentBeat) {
    lines.push(`## 이 슬라이드의 beat (Slide ${currentBeat.n}, role: ${currentBeat.role || '?'})`);
    lines.push(currentBeat.beat);
    if (currentBeat.hook) lines.push(`hook: ${currentBeat.hook}`);
    lines.push('');
  }

  if (prevBeat) {
    lines.push(`## 직전 슬라이드(${prevBeat.n})의 beat — 이미 말했으니 여기서 반복 금지`);
    lines.push(prevBeat.beat);
    lines.push('');
  }
  if (nextBeat) {
    lines.push(`## 다음 슬라이드(${nextBeat.n})의 beat — 여기서 선제 설명 금지`);
    lines.push(nextBeat.beat);
    lines.push('');
  }

  if (slideSection) {
    lines.push(`## 이 슬라이드${slideNumber ? `(Slide ${slideNumber})` : ''}의 아웃라인`);
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

export function buildSpineUserPrompt({ outlineContent, slideCount, persona }) {
  const lines = [];
  lines.push(`## 슬라이드 수: ${slideCount}`);
  lines.push('');
  lines.push('## 덱 전체 outline');
  lines.push(outlineContent || '(outline 없음)');
  lines.push('');
  if (persona) {
    lines.push(`## persona: ${persona.name || persona.id}`);
    if (persona.description) lines.push(persona.description);
    if (persona.defaultLength) lines.push(`분량 기준: ${persona.defaultLength}`);
    lines.push('');
    lines.push(persona.body || '');
    lines.push('');
  }
  lines.push('위 outline을 읽고, 앞서 제시한 JSON 스키마만 출력하세요.');
  return lines.join('\n');
}

function parseSpineJson(raw) {
  if (!raw) return null;
  let text = String(raw).trim();
  const fence = text.match(/^```(?:json)?\n([\s\S]*?)\n```\s*$/);
  if (fence) text = fence[1].trim();
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (!braceMatch) return null;
  try {
    const obj = JSON.parse(braceMatch[0]);
    if (!obj || !Array.isArray(obj.spine)) return null;
    const items = obj.spine
      .filter((s) => s && Number.isInteger(s.n) && typeof s.beat === 'string' && s.beat.trim())
      .map((s) => ({
        n: s.n,
        role: typeof s.role === 'string' ? s.role.trim() : '',
        title: typeof s.title === 'string' ? s.title.trim() : '',
        beat: s.beat.trim(),
        hook: s.hook === 'bridge' || s.hook === 'question' ? s.hook : null,
      }))
      .sort((a, b) => a.n - b.n);
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

// ── AI call dispatch ────────────────────────────────────────────────

const BRIDGE_PHRASE_RE = /다음\s*슬라이드|이어서\s*(?:살펴|알아|다루|이야기)|알아보겠습니다|살펴보겠습니다|이야기하겠습니다|소개하겠습니다|다루겠습니다|넘어가\s*보겠습니다|들어가\s*보겠습니다|설명하겠습니다/;
const RHETORICAL_Q_RE = /(?:왜\s*중요할까요|어떻게\s*생각하세요|어떠신가요|어떨까요|궁금하지\s*않으세요|그렇지\s*않을까요|이해가\s*되시나요|안\s*될까요|할까요|될까요)\s*[?？]/;

/**
 * Split Korean/Eng text into sentences while preserving trailing punctuation.
 * Treats `.` `!` `?` `…` and their full-width cousins as sentence terminators.
 */
function splitSentences(text) {
  if (!text) return [];
  const re = /[^.!?…\n]+[.!?…]+[\s"'”’)]*|[^.!?…\n]+$/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const s = m[0];
    if (s.trim()) out.push(s);
  }
  return out;
}

function stripBannedTrailing(text, { allowBridge, allowQuestion }) {
  if (!text) return text;
  let sents = splitSentences(text);
  let changed = true;
  let guard = 0;
  while (changed && sents.length > 0 && guard < 4) {
    changed = false;
    guard++;
    const last = sents[sents.length - 1];
    const isBridge = BRIDGE_PHRASE_RE.test(last);
    const isQuestion = RHETORICAL_Q_RE.test(last) || /[?？]\s*$/.test(last.trim());
    if ((isBridge && !allowBridge) || (isQuestion && !allowQuestion)) {
      sents.pop();
      changed = true;
    }
  }
  return sents.join('').trim();
}

function sanitizeNoteOutput(raw, { allowBridge = false, allowQuestion = false } = {}) {
  if (!raw) return '';
  let text = String(raw).trim();
  // Strip surrounding code fences if the model disobeyed.
  const fence = text.match(/^```(?:markdown|md)?\n([\s\S]*?)\n```\s*$/);
  if (fence) text = fence[1].trim();
  // Strip any YAML frontmatter the model may have prepended.
  text = text.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
  // Drop trailing bridge/question sentences that leak past the prompt.
  text = stripBannedTrailing(text, { allowBridge, allowQuestion });
  // Enforce max length.
  if (text.length > MAX_NOTE_CHARS) {
    text = text.slice(0, MAX_NOTE_CHARS).trimEnd() + '…';
  }
  return text;
}

async function callOpenAI({
  systemPrompt, userPrompt, model, tracker, timeout = 60_000,
  operation = 'generate-notes', maxTokens = 800, temperature = 0.4,
  jsonMode = false,
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set. Add it to your .env file.');

  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey, timeout });

  const promptChars = systemPrompt.length + userPrompt.length;
  const callId = tracker?.startCall(operation, model, { promptChars });

  const params = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  };
  if (jsonMode) params.response_format = { type: 'json_object' };

  let response;
  try {
    response = await client.chat.completions.create(params);
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

async function callClaude({
  systemPrompt, userPrompt, model, tracker, cwd,
  operation = 'generate-notes',
}) {
  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const promptChars = fullPrompt.length;
  const callId = tracker?.startCall(operation, model, { promptChars });

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

export async function callAIForNote({
  systemPrompt, userPrompt, model, tracker, cwd,
  allowBridge = false, allowQuestion = false,
}) {
  if (!NOTE_MODELS.includes(model)) {
    throw new Error(`Unsupported model: ${model}. Supported: ${NOTE_MODELS.join(', ')}`);
  }
  const raw = isClaudeModel(model)
    ? await callClaude({ systemPrompt, userPrompt, model, tracker, cwd })
    : await callOpenAI({ systemPrompt, userPrompt, model, tracker });
  return sanitizeNoteOutput(raw, { allowBridge, allowQuestion });
}

async function callAIForSpine({ systemPrompt, userPrompt, model, tracker, cwd }) {
  if (!NOTE_MODELS.includes(model)) {
    throw new Error(`Unsupported model: ${model}. Supported: ${NOTE_MODELS.join(', ')}`);
  }
  const raw = isClaudeModel(model)
    ? await callClaude({ systemPrompt, userPrompt, model, tracker, cwd, operation: 'generate-spine' })
    : await callOpenAI({
        systemPrompt, userPrompt, model, tracker,
        operation: 'generate-spine',
        maxTokens: 1500,
        temperature: 0.3,
        jsonMode: true,
      });
  return parseSpineJson(raw);
}

/**
 * Generate a deck-level "spine" — per-slide beat + role + optional hook.
 * Returns an array of {n, role, title, beat, hook} or null if the deck
 * is too small / parsing failed.
 */
export async function generateDeckSpine({
  outlineContent,
  persona,
  model = DEFAULT_NOTE_MODEL,
  tracker,
  cwd,
}) {
  if (!outlineContent) throw new Error('outlineContent is required for spine generation.');
  if (!persona) throw new Error('persona is required for spine generation.');

  const parsed = parseOutline(outlineContent, '');
  const slides = parsed.slides || [];
  if (slides.length < 2) return null;

  const userPrompt = buildSpineUserPrompt({
    outlineContent,
    slideCount: slides.length,
    persona,
  });

  const spine = await callAIForSpine({
    systemPrompt: SPINE_SYSTEM_PROMPT,
    userPrompt,
    model,
    tracker,
    cwd: cwd || process.cwd(),
  });
  if (!spine) return null;

  return spine.slice(0, slides.length);
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
  spine = null,
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

  const currentBeat = Array.isArray(spine) && slideNumber
    ? spine.find((s) => s.n === slideNumber) || null
    : null;
  const prevBeat = Array.isArray(spine) && slideNumber
    ? spine.find((s) => s.n === slideNumber - 1) || null
    : null;
  const nextBeat = Array.isArray(spine) && slideNumber
    ? spine.find((s) => s.n === slideNumber + 1) || null
    : null;

  const userPrompt = buildUserPrompt({
    outlineFrontmatter,
    slideSection,
    slideText,
    persona,
    customPrompt,
    slideNumber,
    spine,
    currentBeat,
    prevBeat,
    nextBeat,
  });

  return callAIForNote({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    model,
    tracker,
    cwd: deckDir,
    allowBridge: currentBeat?.hook === 'bridge',
    allowQuestion: currentBeat?.hook === 'question',
  });
}
