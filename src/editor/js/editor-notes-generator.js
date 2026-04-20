// editor-notes-generator.js — AI 초안 생성 모달 (페르소나 / 모델 / 프롬프트 / 배치)

import { currentSlideFile } from './editor-utils.js';

const STORAGE_KEYS = {
  persona: 'sg-notes-persona',
  model: 'sg-notes-model',
  prompt: 'sg-notes-custom-prompt',
  overwrite: 'sg-notes-overwrite',
};

/** @type {HTMLElement|null} */ let overlay = null;
/** @type {HTMLElement|null} */ let modal = null;
/** @type {HTMLSelectElement|null} */ let personaSelect = null;
/** @type {HTMLSelectElement|null} */ let modelSelect = null;
/** @type {HTMLTextAreaElement|null} */ let promptTextarea = null;
/** @type {HTMLInputElement|null} */ let overwriteCheckbox = null;
/** @type {HTMLButtonElement|null} */ let btnGenerateOne = null;
/** @type {HTMLButtonElement|null} */ let btnGenerateAll = null;
/** @type {HTMLButtonElement|null} */ let btnCancel = null;
/** @type {HTMLButtonElement|null} */ let btnClose = null;
/** @type {HTMLElement|null} */ let statusEl = null;

let onNotesUpdatedForCurrentSlide = null;
let optionsLoaded = false;
let currentBatchRunId = '';
let batchInProgress = false;
let lastFocusedBeforeOpen = null;
let elapsedTimer = null;
const originalButtonLabels = new Map();

// ── Public API ──────────────────────────────────────────────────────

export function initNotesGenerator({ onCurrentSlideUpdated } = {}) {
  overlay = document.getElementById('notes-modal-overlay');
  modal = document.getElementById('notes-modal');
  personaSelect = document.getElementById('notes-ai-persona');
  modelSelect = document.getElementById('notes-ai-model');
  promptTextarea = document.getElementById('notes-ai-custom-prompt');
  overwriteCheckbox = document.getElementById('notes-ai-overwrite');
  btnGenerateOne = document.getElementById('btn-notes-generate-one');
  btnGenerateAll = document.getElementById('btn-notes-generate-all');
  btnCancel = document.getElementById('btn-notes-modal-cancel');
  btnClose = document.getElementById('notes-modal-close');
  statusEl = document.getElementById('notes-ai-status');

  if (!overlay || !modal || !personaSelect || !modelSelect) return;

  onNotesUpdatedForCurrentSlide = typeof onCurrentSlideUpdated === 'function'
    ? onCurrentSlideUpdated
    : null;

  bindLocalStateHandlers();
  btnGenerateOne.addEventListener('click', () => generateForOne().catch(() => {}));
  btnGenerateAll.addEventListener('click', () => generateForAll().catch(() => {}));
  btnCancel?.addEventListener('click', closeNotesModal);
  btnClose?.addEventListener('click', closeNotesModal);
  overlay.addEventListener('click', (e) => {
    if (e.target !== overlay) return;
    if (isGenerating()) return;
    closeNotesModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || overlay.hidden) return;
    if (isGenerating()) return;
    closeNotesModal();
  });
}

export async function openNotesModal() {
  if (!overlay) return;
  if (!optionsLoaded) {
    await loadPersonasAndModels();
    optionsLoaded = true;
  }
  lastFocusedBeforeOpen = document.activeElement;
  overlay.hidden = false;
  setStatus('');
  setTimeout(() => { personaSelect?.focus(); }, 0);
}

export function closeNotesModal() {
  if (!overlay || overlay.hidden) return;
  if (isGenerating()) return;
  overlay.hidden = true;
  stopElapsed();
  clearGenerateButtonsLoading();
  if (lastFocusedBeforeOpen && lastFocusedBeforeOpen.focus) {
    try { lastFocusedBeforeOpen.focus(); } catch { /* ignore */ }
  }
}

// ── Local state persistence ─────────────────────────────────────────

function bindLocalStateHandlers() {
  personaSelect.addEventListener('change', () => {
    if (personaSelect.value) localStorage.setItem(STORAGE_KEYS.persona, personaSelect.value);
  });
  modelSelect.addEventListener('change', () => {
    if (modelSelect.value) localStorage.setItem(STORAGE_KEYS.model, modelSelect.value);
  });
  if (promptTextarea) {
    promptTextarea.addEventListener('input', () => {
      localStorage.setItem(STORAGE_KEYS.prompt, promptTextarea.value || '');
    });
  }
  if (overwriteCheckbox) {
    overwriteCheckbox.addEventListener('change', () => {
      localStorage.setItem(STORAGE_KEYS.overwrite, overwriteCheckbox.checked ? '1' : '0');
    });
  }
}

async function loadPersonasAndModels() {
  try {
    const res = await fetch('/api/personas');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    fillPersonas(data.personas || []);
    fillModels(data.models || [], data.defaultModel);
    restoreSelectionsFromStorage();
  } catch (err) {
    setStatus(`페르소나 목록을 불러오지 못했습니다: ${err.message || err}`, 'error');
    setButtonsDisabled(true);
  }
}

function fillPersonas(personas) {
  if (personas.length === 0) {
    personaSelect.innerHTML = '<option value="">(페르소나 없음)</option>';
    personaSelect.disabled = true;
    return;
  }
  personaSelect.disabled = false;
  personaSelect.innerHTML = personas
    .map((p) => {
      const label = p.description ? `${p.name} — ${p.description}` : p.name;
      return `<option value="${escapeAttr(p.id)}">${escapeHtml(label)}</option>`;
    })
    .join('');
}

function fillModels(models, defaultModel) {
  if (!models || models.length === 0) {
    modelSelect.innerHTML = '<option value="">(모델 없음)</option>';
    modelSelect.disabled = true;
    return;
  }
  modelSelect.disabled = false;
  modelSelect.innerHTML = models
    .map((m) => `<option value="${escapeAttr(m)}">${escapeHtml(m)}</option>`)
    .join('');
  if (defaultModel) modelSelect.value = defaultModel;
}

function restoreSelectionsFromStorage() {
  const savedPersona = localStorage.getItem(STORAGE_KEYS.persona);
  if (savedPersona && hasOption(personaSelect, savedPersona)) personaSelect.value = savedPersona;
  const savedModel = localStorage.getItem(STORAGE_KEYS.model);
  if (savedModel && hasOption(modelSelect, savedModel)) modelSelect.value = savedModel;
  if (promptTextarea) {
    const savedPrompt = localStorage.getItem(STORAGE_KEYS.prompt) || '';
    if (savedPrompt) promptTextarea.value = savedPrompt;
  }
  if (overwriteCheckbox) {
    overwriteCheckbox.checked = localStorage.getItem(STORAGE_KEYS.overwrite) === '1';
  }
}

function hasOption(sel, value) {
  return Array.from(sel.options).some((o) => o.value === value);
}

function readInputs() {
  return {
    persona: personaSelect?.value || '',
    model: modelSelect?.value || '',
    customPrompt: promptTextarea?.value || '',
    overwrite: !!overwriteCheckbox?.checked,
  };
}

function setButtonsDisabled(disabled) {
  if (btnGenerateOne) btnGenerateOne.disabled = disabled;
  if (btnGenerateAll) btnGenerateAll.disabled = disabled;
}

function stopElapsed() {
  if (elapsedTimer != null) {
    clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
}

function resetStatusEl() {
  if (!statusEl) return;
  stopElapsed();
  statusEl.classList.remove('is-error', 'is-warn', 'is-success', 'is-loading');
  statusEl.textContent = '';
}

function setStatus(message, kind) {
  if (!statusEl) return;
  resetStatusEl();
  if (!message) {
    statusEl.hidden = true;
    return;
  }
  statusEl.hidden = false;
  if (kind === 'loading') {
    renderLoading(message);
    return;
  }
  statusEl.textContent = message;
  if (kind === 'error') statusEl.classList.add('is-error');
  else if (kind === 'warn') statusEl.classList.add('is-warn');
  else if (kind === 'success') statusEl.classList.add('is-success');
}

function renderLoading(message) {
  statusEl.classList.add('is-loading');

  const row = document.createElement('div');
  row.className = 'notes-modal-status-row';

  const spinner = document.createElement('span');
  spinner.className = 'notes-modal-spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'notes-modal-status-text';
  text.textContent = message;

  const elapsed = document.createElement('span');
  elapsed.className = 'notes-modal-status-elapsed';
  elapsed.textContent = '0s';

  row.append(spinner, text, elapsed);

  const bar = document.createElement('div');
  bar.className = 'notes-modal-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', message);
  const fill = document.createElement('div');
  fill.className = 'notes-modal-progress-bar';
  bar.appendChild(fill);

  statusEl.append(row, bar);

  const started = Date.now();
  elapsedTimer = setInterval(() => {
    elapsed.textContent = `${Math.floor((Date.now() - started) / 1000)}s`;
  }, 500);
}

function updateLoadingMessage(message) {
  if (!statusEl || !statusEl.classList.contains('is-loading')) {
    setStatus(message, 'loading');
    return;
  }
  const text = statusEl.querySelector('.notes-modal-status-text');
  if (text) text.textContent = message;
}

function rememberButtonLabel(btn) {
  if (!btn || originalButtonLabels.has(btn)) return;
  originalButtonLabels.set(btn, btn.textContent || '');
}

function restoreButtonLabel(btn) {
  if (!btn) return;
  const label = originalButtonLabels.get(btn);
  btn.classList.remove('is-loading');
  btn.textContent = label != null ? label : btn.textContent;
}

function setButtonLoading(btn, loadingText) {
  if (!btn) return;
  rememberButtonLabel(btn);
  btn.classList.add('is-loading');
  btn.textContent = '';
  const spinner = document.createElement('span');
  spinner.className = 'notes-modal-btn-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = loadingText;
  btn.append(spinner, label);
}

function setGenerateButtonsLoading(which) {
  setButtonsDisabled(true);
  if (which === 'one') setButtonLoading(btnGenerateOne, '생성 중…');
  else if (which === 'all') setButtonLoading(btnGenerateAll, '생성 중…');
}

function clearGenerateButtonsLoading() {
  restoreButtonLabel(btnGenerateOne);
  restoreButtonLabel(btnGenerateAll);
  setButtonsDisabled(false);
}

function isGenerating() {
  return batchInProgress
    || !!(btnGenerateOne?.classList.contains('is-loading'))
    || !!(btnGenerateAll?.classList.contains('is-loading'));
}

// ── Single-slide generation ─────────────────────────────────────────

async function generateForOne() {
  const slide = currentSlideFile();
  if (!slide) {
    setStatus('슬라이드가 선택되지 않았습니다.', 'warn');
    return;
  }
  const inputs = readInputs();
  if (!inputs.persona) {
    setStatus('페르소나를 선택하세요.', 'warn');
    return;
  }

  setGenerateButtonsLoading('one');
  setStatus(`${slide} 노트를 생성하는 중입니다`, 'loading');

  try {
    const res = await fetch(`/api/slides/${encodeURIComponent(slide)}/notes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    });

    if (res.status === 409) {
      setStatus(
        '이미 노트가 존재합니다. "덮어쓰기"를 체크한 뒤 다시 생성하세요.',
        'warn',
      );
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(data.error || `생성 실패 (HTTP ${res.status})`, 'error');
      return;
    }

    if (onNotesUpdatedForCurrentSlide && currentSlideFile() === slide) {
      onNotesUpdatedForCurrentSlide(data.notes || '');
    }
    setStatus(
      data.overwritten
        ? `${slide} 노트를 갱신했습니다. (원본은 .bak-* 로 백업됨)`
        : `${slide} 노트를 생성했습니다.`,
      'success',
    );
    closeNotesModal();
  } catch (err) {
    setStatus(`네트워크 오류: ${err.message || err}`, 'error');
  } finally {
    clearGenerateButtonsLoading();
  }
}

// ── All-slides batch (SSE) ──────────────────────────────────────────

async function generateForAll() {
  const inputs = readInputs();
  if (!inputs.persona) {
    setStatus('페르소나를 선택하세요.', 'warn');
    return;
  }
  if (batchInProgress) {
    setStatus('이미 배치 생성이 진행 중입니다.', 'warn');
    return;
  }
  if (!inputs.overwrite) {
    const ok = window.confirm(
      '덮어쓰기가 꺼져 있습니다. 기존 노트가 있는 슬라이드는 건너뜁니다. 진행할까요?',
    );
    if (!ok) return;
  }

  setGenerateButtonsLoading('all');
  setStatus('전체 생성 요청 중입니다', 'loading');

  try {
    const res = await fetch('/api/notes/generate-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(data.error || `배치 요청 실패 (HTTP ${res.status})`, 'error');
      clearGenerateButtonsLoading();
      return;
    }
    currentBatchRunId = data.runId || '';
    batchInProgress = true;
    updateLoadingMessage(`배치 생성 중 0 / ${data.total ?? '?'}`);
  } catch (err) {
    setStatus(`네트워크 오류: ${err.message || err}`, 'error');
    clearGenerateButtonsLoading();
  }
}

// ── SSE handlers ────────────────────────────────────────────────────

export function onNotesGenerateStarted(_payload) { /* reserved */ }

export function onNotesGenerateProgress(payload) {
  if (!payload?.runId || payload.runId !== currentBatchRunId) return;
  const { completed = 0, total = 0, slide, status } = payload;
  const short = status === 'skipped' ? '⤼' : status === 'failed' ? '⚠' : '✓';
  updateLoadingMessage(
    `배치 생성 중 ${completed} / ${total} ${short} ${slide || ''}`.trim(),
  );
  if (status === 'generated' && slide && slide === currentSlideFile()) {
    void refreshCurrentSlideNote(slide);
  }
}

export function onNotesGenerateFinished(payload) {
  if (!payload?.runId || payload.runId !== currentBatchRunId) return;
  batchInProgress = false;
  currentBatchRunId = '';
  clearGenerateButtonsLoading();

  const { total = 0, generated = 0, skipped = 0, failed = 0, error } = payload;
  if (error) {
    setStatus(`배치 실패: ${error}`, 'error');
    return;
  }
  const msg = `완료: 생성 ${generated} · 스킵 ${skipped} · 실패 ${failed} · 총 ${total}`;
  const kind = failed > 0 ? 'warn' : generated > 0 ? 'success' : 'warn';
  setStatus(msg, kind);

  const slide = currentSlideFile();
  if (slide) void refreshCurrentSlideNote(slide);

  if (failed === 0 && generated > 0) closeNotesModal();
}

async function refreshCurrentSlideNote(slide) {
  try {
    const res = await fetch(`/api/slides/${encodeURIComponent(slide)}/notes`);
    if (!res.ok) return;
    const data = await res.json();
    if (onNotesUpdatedForCurrentSlide && slide === currentSlideFile()) {
      onNotesUpdatedForCurrentSlide(data.notes || '');
    }
  } catch {
    /* non-critical */
  }
}

// ── Escape helpers ──────────────────────────────────────────────────

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
