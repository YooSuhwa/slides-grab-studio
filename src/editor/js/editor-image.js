// editor-image.js — Image selection UI: replace, regenerate, delete, insert, drag/resize

import { slideIframe } from './editor-dom.js';
import { currentSlideFile, setStatus } from './editor-utils.js';
import { getSelectedObjectElement, setSelectedObjectXPath, setEditorHintForMode } from './editor-select.js';
import { getXPath } from './editor-bbox.js';
import { mutateSelectedObject, scheduleDirectSave } from './editor-direct-edit.js';
import { SLIDE_W, SLIDE_H } from './editor-state.js';
import { beginImageInteraction, ensureAbsolutePositioning, readImageRect } from './editor-image-drag.js';
import { getSelectedPack, getPackMeta } from './editor-pack.js';

const $ = (sel) => document.querySelector(sel);

const btnReplace = $('#img-replace-btn');
const btnRegenerate = $('#img-regenerate-btn');
const btnDelete = $('#img-delete-btn');
const btnInsertImage = $('#btn-insert-image');
const btnInsertAIImage = $('#btn-insert-ai-image');
const fileInput = $('#img-replace-input');
const insertFileInput = $('#img-insert-input');
const handlesLayer = $('#image-handles');

const promptModal = $('#image-prompt-modal');
const promptInput = $('#image-prompt-input');
const promptCancel = $('#image-prompt-cancel');
const promptSubmit = $('#image-prompt-submit');
const promptStatus = $('#image-prompt-status');
const promptTitle = $('#image-prompt-title');
const promptSubtitle = $('#image-prompt-subtitle');
const promptClose = $('#image-prompt-close');

const PROMPT_SUBTITLE_DEFAULT =
  '원하는 이미지를 자연어로 설명하면 Nano Banana Pro가 슬라이드에 어울리는 이미지를 만들어 줍니다.';

const PROMPT_SUBMIT_LABEL = '이미지 생성';

const PLACEHOLDER_FALLBACK =
  '예: 따뜻한 조명의 도자기 화분에 담긴 다육식물 수채화 일러스트…';

function getCurrentSlideTitle() {
  try {
    const doc = slideIframe?.contentDocument;
    if (!doc) return '';
    const h = doc.querySelector('h1, h2, h3');
    const text = (h?.textContent || '').trim();
    return text.length > 40 ? text.slice(0, 40).trim() + '…' : text;
  } catch { return ''; }
}

function buildDynamicPlaceholder() {
  const title = getCurrentSlideTitle();
  const meta = getPackMeta(getSelectedPack());
  const mood = Array.isArray(meta?.mood) && meta.mood.length
    ? meta.mood.slice(0, 2).join(', ')
    : '';

  if (title && mood) return `예: "${title}"을(를) 표현하는 ${mood} 분위기의 일러스트…`;
  if (title)        return `예: "${title}"을(를) 표현하는 일러스트…`;
  if (mood)         return `예: ${mood} 분위기의 일러스트…`;
  return PLACEHOLDER_FALLBACK;
}
let promptElapsedTimer = null;

function stopPromptElapsed() {
  if (promptElapsedTimer != null) {
    clearInterval(promptElapsedTimer);
    promptElapsedTimer = null;
  }
}

function resetPromptStatus() {
  if (!promptStatus) return;
  stopPromptElapsed();
  promptStatus.classList.remove('is-error', 'is-warn', 'is-success', 'is-loading');
  promptStatus.textContent = '';
}

function setPromptStatus(message, variant) {
  if (!promptStatus) return;
  resetPromptStatus();
  if (!message) {
    promptStatus.hidden = true;
    return;
  }
  promptStatus.hidden = false;
  if (variant === 'loading') {
    renderPromptLoading(message);
    return;
  }
  promptStatus.textContent = message;
  if (variant) promptStatus.classList.add(`is-${variant}`);
}

function renderPromptLoading(message) {
  promptStatus.classList.add('is-loading');
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

  promptStatus.append(row, bar);

  const started = Date.now();
  promptElapsedTimer = setInterval(() => {
    elapsed.textContent = `${Math.floor((Date.now() - started) / 1000)}s`;
  }, 500);
}

function setSubmitLoading(isLoading) {
  if (!promptSubmit) return;
  promptSubmit.disabled = isLoading;
  promptSubmit.classList.toggle('is-loading', isLoading);
  promptSubmit.textContent = '';
  if (isLoading) {
    const spinner = document.createElement('span');
    spinner.className = 'notes-modal-btn-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = '생성 중…';
    promptSubmit.append(spinner, label);
  } else {
    promptSubmit.textContent = PROMPT_SUBMIT_LABEL;
  }
}

const HANDLE_CORNERS = ['nw', 'ne', 'sw', 'se'];

export function isImageElement(el) {
  return !!el && el.nodeType === Node.ELEMENT_NODE && el.tagName && el.tagName.toLowerCase() === 'img';
}

function getSelectedImage() {
  const el = getSelectedObjectElement();
  return isImageElement(el) ? el : null;
}

function hideHandles() {
  if (handlesLayer) handlesLayer.style.display = 'none';
}

function syncHandlesFor(img) {
  if (!handlesLayer || !img) { hideHandles(); return; }
  const rect = readImageRect(img);
  if (!rect.w || !rect.h) { hideHandles(); return; }

  handlesLayer.style.display = 'block';
  handlesLayer.style.left = `${rect.x}px`;
  handlesLayer.style.top = `${rect.y}px`;
  handlesLayer.style.width = `${rect.w}px`;
  handlesLayer.style.height = `${rect.h}px`;
}

/** Called from editor-select.js updateObjectEditorControls */
export function maybeUpdateImageUI() {
  const img = getSelectedImage();
  const hasImage = !!img;
  if (btnReplace) btnReplace.disabled = !hasImage;
  if (btnRegenerate) btnRegenerate.disabled = !hasImage;
  if (btnDelete) btnDelete.disabled = !hasImage;
  if (hasImage) {
    syncHandlesFor(img);
    setStatus('Drag corners to resize (Shift = free) \u00b7 Drag body to move');
  } else {
    hideHandles();
    setEditorHintForMode();
  }
}

function setupHandles() {
  if (!handlesLayer) return;
  handlesLayer.addEventListener('mousedown', (event) => {
    const img = getSelectedImage();
    if (!img) return;
    // Reparent to body + set position:absolute once, then refresh selection xpath.
    ensureAbsolutePositioning(img);
    setSelectedObjectXPath(getXPath(img), null);

    const target = event.target;
    const corner = target?.dataset?.corner;
    const mode = corner && HANDLE_CORNERS.includes(corner) ? corner : 'move';
    beginImageInteraction(event, img, mode, () => syncHandlesFor(img));
  });
}

setupHandles();

async function uploadFile(file) {
  const buf = await file.arrayBuffer();
  const res = await fetch('/api/image-ops/upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'image/png',
      'X-Filename': file.name || 'upload.png',
    },
    body: buf,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (HTTP ${res.status})`);
  }
  return res.json();
}

function replaceSelectedSrc(newSrc) {
  mutateSelectedObject((el) => {
    if (!isImageElement(el)) return;
    el.setAttribute('src', newSrc);
  }, 'Image replaced and saved.');
}

function handleReplaceClick() {
  if (!getSelectedImage()) return;
  if (fileInput) fileInput.click();
}

async function handleFilePicked(event, onDone) {
  const file = event.target?.files?.[0];
  event.target.value = '';
  if (!file) return;
  setStatus(`Uploading ${file.name}...`);
  try {
    const { path } = await uploadFile(file);
    onDone(path);
  } catch (err) {
    setStatus(`Upload failed: ${err.message}`);
  }
}

function openPromptModal({ title, subtitle, initial = '', onSubmit }) {
  if (!promptModal) return;
  if (promptTitle) promptTitle.textContent = title || 'AI로 이미지 생성하기';
  if (promptSubtitle) promptSubtitle.textContent = subtitle || PROMPT_SUBTITLE_DEFAULT;
  if (promptInput) {
    promptInput.value = initial;
    promptInput.placeholder = buildDynamicPlaceholder();
  }
  setPromptStatus('');
  setSubmitLoading(false);
  promptModal.hidden = false;
  promptInput?.focus();

  const submit = async () => {
    const prompt = (promptInput?.value || '').trim();
    if (!prompt) { setPromptStatus('프롬프트를 입력해 주세요.', 'warn'); return; }
    setPromptStatus('이미지를 생성하는 중입니다', 'loading');
    setSubmitLoading(true);
    try {
      await onSubmit(prompt);
      promptModal.hidden = true;
      cleanup();
    } catch (err) {
      setPromptStatus(err.message, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };
  const cancel = () => {
    promptModal.hidden = true;
    cleanup();
  };
  const onKey = (e) => { if (e.key === 'Escape') cancel(); };
  function cleanup() {
    stopPromptElapsed();
    promptSubmit?.removeEventListener('click', submit);
    promptCancel?.removeEventListener('click', cancel);
    promptClose?.removeEventListener('click', cancel);
    document.removeEventListener('keydown', onKey);
  }
  promptSubmit?.addEventListener('click', submit);
  promptCancel?.addEventListener('click', cancel);
  promptClose?.addEventListener('click', cancel);
  document.addEventListener('keydown', onKey);
}

async function generateImage(prompt) {
  const res = await fetch('/api/image-ops/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Generate failed (HTTP ${res.status})`);
  }
  return res.json();
}

function handleRegenerateClick() {
  const img = getSelectedImage();
  if (!img) return;
  const existingPrompt = img.getAttribute('data-image-prompt') || '';
  openPromptModal({
    title: 'AI로 이미지 다시 생성',
    subtitle: '현재 프롬프트를 수정하면 동일한 슬롯에 새 이미지를 다시 생성합니다.',
    initial: existingPrompt,
    onSubmit: async (prompt) => {
      const { path } = await generateImage(prompt);
      mutateSelectedObject((el) => {
        if (!isImageElement(el)) return;
        el.setAttribute('src', path);
        el.setAttribute('data-image-prompt', prompt);
        el.setAttribute('data-image-slot', 'ai-generated');
      }, 'Image regenerated with AI.');
    },
  });
}

export function deleteSelectedImageIfAny() {
  const img = getSelectedImage();
  if (!img) return false;
  mutateSelectedObject((el) => { if (isImageElement(el)) el.remove(); }, 'Image deleted.');
  setSelectedObjectXPath('', 'Image deleted.');
  hideHandles();
  return true;
}

function handleDeleteClick() {
  deleteSelectedImageIfAny();
}

function insertImageElement(src, prompt = '') {
  const doc = slideIframe.contentDocument;
  if (!doc || !doc.body) return;
  const img = doc.createElement('img');
  img.setAttribute('src', src);
  const w = Math.round(SLIDE_W * 0.3);
  const h = Math.round(SLIDE_H * 0.3);
  const x = Math.round((SLIDE_W - w) / 2);
  const y = Math.round((SLIDE_H - h) / 2);
  img.setAttribute('style', `position:absolute; left:${x}px; top:${y}px; width:${w}px; height:${h}px;`);
  if (prompt) {
    img.setAttribute('data-image-prompt', prompt);
    img.setAttribute('data-image-slot', 'ai-generated');
  }
  doc.body.appendChild(img);

  const xpath = getXPath(img);
  setSelectedObjectXPath(xpath, 'Image inserted.');
  scheduleDirectSave(0, 'Image inserted and saved.');
  setTimeout(() => syncHandlesFor(img), 50);
}

function handleInsertUploadClick() {
  if (!currentSlideFile()) return;
  insertFileInput?.click();
}

function handleInsertAIClick() {
  if (!currentSlideFile()) return;
  openPromptModal({
    title: 'AI로 이미지 생성하기',
    initial: '',
    onSubmit: async (prompt) => {
      const { path } = await generateImage(prompt);
      insertImageElement(path, prompt);
    },
  });
}

// Event bindings
btnReplace?.addEventListener('click', handleReplaceClick);
btnRegenerate?.addEventListener('click', handleRegenerateClick);
btnDelete?.addEventListener('click', handleDeleteClick);
btnInsertImage?.addEventListener('click', handleInsertUploadClick);
btnInsertAIImage?.addEventListener('click', handleInsertAIClick);

fileInput?.addEventListener('change', (e) => handleFilePicked(e, (path) => replaceSelectedSrc(path)));
insertFileInput?.addEventListener('change', (e) => handleFilePicked(e, (path) => insertImageElement(path)));

promptModal?.addEventListener('click', (e) => {
  if (e.target !== promptModal) return;
  if (promptSubmit?.classList.contains('is-loading')) return; // 생성 중에는 배경 클릭으로 닫지 않음
  promptClose?.click();
});

// Re-sync handles on window resize or scroll inside the iframe
window.addEventListener('resize', () => {
  const img = getSelectedImage();
  if (img) syncHandlesFor(img);
});

// Initial sync once selection changes happen
if (slideIframe) {
  slideIframe.addEventListener('load', () => {
    hideHandles();
  });
}

// Expose scale helper for external hooks if needed (noop for now)
export function refreshImageHandles() {
  const img = getSelectedImage();
  if (img) syncHandlesFor(img);
}
