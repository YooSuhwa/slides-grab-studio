// editor-figma-export.js — Figma export pane (coordinator-driven)

import { currentSlideFile, parsePagesInput } from './editor-utils.js';
import {
  btnFigmaExport, figmaConnDot, figmaConfirmDesc,
  figmaProgress, figmaProgressFill, figmaProgressText, figmaToast,
} from './editor-dom.js';

let figmaConnected = false;
let figmaExporting = false;
let onBusyChange = null;
export function registerFigmaExportBusy(cb) { onBusyChange = cb; }

// ── Connection status ─────────────────────────────────────────────

export function onFigmaConnected(data) {
  figmaConnected = true;
  figmaConnDot.classList.add('connected');
  btnFigmaExport.disabled = false;
  btnFigmaExport.title = `Send to Figma (${data.clients || 1} plugin connected)`;
}

export function onFigmaDisconnected(data) {
  const clients = data.clients || 0;
  figmaConnected = clients > 0;
  if (figmaConnected) {
    figmaConnDot.classList.add('connected');
    btnFigmaExport.disabled = false;
    btnFigmaExport.title = `Send to Figma (${clients} plugin connected)`;
  } else {
    figmaConnDot.classList.remove('connected');
    btnFigmaExport.disabled = true;
    btnFigmaExport.title = 'Send to Figma (plugin not connected)';
  }
}

// ── Toast ─────────────────────────────────────────────────────────

let toastTimer = null;
function showToast(message, type = '') {
  clearTimeout(toastTimer);
  figmaToast.textContent = message;
  figmaToast.className = 'figma-toast visible' + (type ? ` ${type}` : '');
  toastTimer = setTimeout(() => { figmaToast.classList.remove('visible'); }, 4000);
}

// ── Viewport from SVG pane ────────────────────────────────────────

function getViewportParams() {
  const presetSelect = document.querySelector('#svg-export-preset');
  const widthInput = document.querySelector('#svg-export-width');
  const heightInput = document.querySelector('#svg-export-height');
  const scaleInput = document.querySelector('#svg-export-scale');

  let width = 1920, height = 1080;
  if (presetSelect) {
    if (presetSelect.value === 'custom') {
      width = Number(widthInput?.value) || 1920;
      height = Number(heightInput?.value) || 1080;
    } else {
      const [w, h] = presetSelect.value.split('x').map(Number);
      width = w || 1920; height = h || 1080;
    }
  }
  const scale = Number(scaleInput?.value) || 1;
  return { width, height, scale };
}

// ── Pane state ────────────────────────────────────────────────────

export function resetFigmaExport() {
  figmaProgress?.classList.remove('active');
  if (figmaProgressFill) figmaProgressFill.style.width = '0%';
  if (figmaProgressText) figmaProgressText.textContent = '';
  if (onBusyChange) onBusyChange(false);
  figmaExporting = false;
}

export function openFigmaExportPane() {
  resetFigmaExport();
  const slide = currentSlideFile();
  if (figmaConfirmDesc) {
    figmaConfirmDesc.textContent = slide
      ? `현재 슬라이드: ${slide}`
      : 'Figma로 슬라이드를 전송합니다.';
  }
}

// Backwards-compat for nav bar button binding.
export function openFigmaModal() {
  if (!figmaConnected) return;
  import('./editor-export-modal.js').then((m) => m.openExportModal('figma'));
}

export async function runFigmaExport(closeFn) {
  if (figmaExporting) return;
  if (!figmaConnected) {
    showToast('Figma 플러그인이 연결되어 있지 않습니다.', 'error');
    return;
  }
  const scope = document.querySelector('input[name="figma-export-scope"]:checked')?.value || 'current';

  figmaExporting = true;
  if (onBusyChange) onBusyChange(true);

  const { width, height, scale } = getViewportParams();
  const includeNotes = document.querySelector('#figma-include-notes')?.checked !== false;
  const body = { scope, width, height, scale, includeNotes };
  if (scope === 'current') body.slide = currentSlideFile();
  if (scope === 'specific') {
    const pagesInput = document.querySelector('.ex-pages-input[data-pages-for="figma"]');
    body.slides = parsePagesInput(pagesInput?.value || '');
  }

  figmaProgress?.classList.add('active');
  if (figmaProgressText) figmaProgressText.textContent = 'Starting...';
  if (figmaProgressFill) figmaProgressFill.style.width = '0%';

  try {
    const res = await fetch('/api/figma-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Export failed');
    }
    const data = await res.json();
    if (figmaProgressText) figmaProgressText.textContent = `0 / ${data.total}`;
    void closeFn;
  } catch (err) {
    if (figmaProgressText) figmaProgressText.textContent = `Error: ${err.message}`;
    showToast(err.message, 'error');
    if (onBusyChange) onBusyChange(false);
    figmaExporting = false;
  }
}

export function isFigmaExporting() { return figmaExporting; }

// ── SSE event handlers ────────────────────────────────────────────

export function onFigmaExportProgress(data) {
  const pct = Math.round((data.current / data.total) * 100);
  if (figmaProgressFill) figmaProgressFill.style.width = `${pct}%`;
  if (figmaProgressText) figmaProgressText.textContent =
    `${data.current} / ${data.total} — ${data.file}`;
}

export function onFigmaExportFinished(data) {
  if (figmaProgressFill) figmaProgressFill.style.width = '100%';
  if (data.success) {
    if (figmaProgressText) figmaProgressText.textContent = data.message || 'Done!';
    showToast(data.message || `Sent ${data.total} slides to Figma.`, 'success');
    setTimeout(() => {
      import('./editor-export-modal.js').then((m) => m.closeExportModal());
    }, 1500);
  } else {
    if (figmaProgressText) figmaProgressText.textContent = data.message || 'Export failed.';
    showToast(data.message || 'Figma export failed.', 'error');
    if (onBusyChange) onBusyChange(false);
  }
  figmaExporting = false;
}
