// editor-svg-export.js — SVG/PNG export pane logic (coordinator-driven)

import { currentSlideFile, parsePagesInput } from './editor-utils.js';
import { state } from './editor-state.js';

const $ = (sel) => document.querySelector(sel);

// All DOM refs are lazy because the coordinator owns the modal shell;
// these fields live inside the unified #export-modal.
const get = {
  get preset() { return $('#svg-export-preset'); },
  get customSizeDiv() { return $('#svg-export-custom-size'); },
  get width() { return $('#svg-export-width'); },
  get height() { return $('#svg-export-height'); },
  get scale() { return $('#svg-export-scale'); },
  get format() { return $('#svg-export-format'); },
  get progressDiv() { return $('#svg-export-progress'); },
  get progressFill() { return $('#svg-export-progress-fill'); },
  get progressText() { return $('#svg-export-progress-text'); },
};

let activeExportId = null;
let onBusyChange = null; // coordinator sets this to reflect submit button state

export function registerSvgExportBusy(cb) { onBusyChange = cb; }

function syncSizeFromPreset() {
  const preset = get.preset;
  if (!preset) return;
  if (preset.value === 'custom') return;
  const [w, h] = preset.value.split('x').map(Number);
  if (get.width) get.width.value = w;
  if (get.height) get.height.value = h;
}

// Wire preset sync once the DOM has the node
document.addEventListener('DOMContentLoaded', () => {
  const preset = get.preset;
  if (preset) preset.addEventListener('change', syncSizeFromPreset);
  syncSizeFromPreset();
});
// Also run immediately (module may load after DOMContentLoaded)
if (document.readyState !== 'loading') {
  const preset = get.preset;
  if (preset) preset.addEventListener('change', syncSizeFromPreset);
  syncSizeFromPreset();
}

function getExportParams() {
  const scopeRadio = document.querySelector('input[name="svg-export-scope"]:checked');
  const scope = scopeRadio ? scopeRadio.value : 'all';

  const preset = get.preset;
  let width, height;
  if (preset && preset.value === 'custom') {
    width = Number(get.width?.value) || 1280;
    height = Number(get.height?.value) || 720;
  } else if (preset) {
    const [w, h] = preset.value.split('x').map(Number);
    width = w; height = h;
  } else {
    width = 1920; height = 1080;
  }

  // Prefer new ex-seg radio, fall back to legacy hidden select for safety
  const segChoice = document.querySelector('input[name="svg-format-choice"]:checked')?.value;
  const rawFormat = segChoice || get.format?.value || 'svg';
  const outline = rawFormat === 'svg-outline';
  const format = outline ? 'svg' : rawFormat;

  const params = {
    scope, slide: currentSlideFile(), format, outline,
    scale: Number(get.scale?.value) || 1, width, height,
  };
  if (scope === 'specific') {
    const pagesInput = document.querySelector('.ex-pages-input[data-pages-for="svg"]');
    params.slides = parsePagesInput(pagesInput?.value || '');
  }
  return params;
}

export function resetSvgExport() {
  get.progressDiv?.classList.remove('active');
  if (get.progressFill) get.progressFill.style.width = '0%';
  if (get.progressText) get.progressText.textContent = '';
  if (onBusyChange) onBusyChange(false);
  activeExportId = null;
}

export function openSvgExportPane() { resetSvgExport(); }

// Kept for backwards compat with editor-init.js import (now opens unified modal).
export function openExportModal() {
  import('./editor-export-modal.js').then((m) => m.openExportModal('svg'));
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

export async function runSvgExport(closeFn) {
  const params = getExportParams();
  if (onBusyChange) onBusyChange(true);

  try {
    if (params.scope === 'current') {
      get.progressDiv?.classList.add('active');
      if (get.progressText) get.progressText.textContent = 'Exporting...';
      if (get.progressFill) get.progressFill.style.width = '50%';

      const res = await fetch('/api/svg-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Export failed');
      }
      const disposition = res.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+?)"/);
      const filename = filenameMatch ? filenameMatch[1]
        : `${state.deckName || 'slide'}.${params.format}`;
      const blob = await res.blob();
      triggerDownload(blob, filename);

      if (get.progressFill) get.progressFill.style.width = '100%';
      if (get.progressText) get.progressText.textContent = `Downloaded: ${filename}`;
      setTimeout(() => closeFn?.(), 1500);
    } else {
      get.progressDiv?.classList.add('active');
      if (get.progressText) get.progressText.textContent = 'Starting export...';
      if (get.progressFill) get.progressFill.style.width = '0%';

      const res = await fetch('/api/svg-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Export failed');
      }
      const { exportId, total } = await res.json();
      activeExportId = exportId;
      if (get.progressText) get.progressText.textContent = `0 / ${total}`;
    }
  } catch (err) {
    if (get.progressText) get.progressText.textContent = `Error: ${err.message}`;
    if (onBusyChange) onBusyChange(false);
  }
}

export function onSvgExportProgress(data) {
  if (data.exportId !== activeExportId) return;
  const pct = Math.round((data.current / data.total) * 100);
  if (get.progressFill) get.progressFill.style.width = `${pct}%`;
  if (get.progressText) get.progressText.textContent =
    `${data.current} / ${data.total} — ${data.file}`;
}

export async function onSvgExportFinished(data) {
  if (data.exportId !== activeExportId) return;

  if (data.success && data.files && data.files.length > 0) {
    if (get.progressFill) get.progressFill.style.width = '100%';
    if (data.zipUrl) {
      if (get.progressText) get.progressText.textContent =
        `Downloading ZIP (${data.files.length} files)...`;
      const a = document.createElement('a');
      a.href = data.zipUrl;
      a.download = `${state.deckName || 'slides'}-export.zip`;
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      if (get.progressText) get.progressText.textContent =
        `Downloading ${data.files.length} files...`;
      for (const file of data.files) {
        try {
          const res = await fetch(`/api/svg-export/${data.exportId}/${file}`);
          if (res.ok) {
            const blob = await res.blob();
            triggerDownload(blob, file);
            await new Promise((r) => setTimeout(r, 300));
          }
        } catch (err) {
          console.error('[svg-export] individual download error:', err);
        }
      }
    }
    if (get.progressText) get.progressText.textContent = data.message || 'Export complete.';
    setTimeout(() => {
      import('./editor-export-modal.js').then((m) => m.closeExportModal());
    }, 1500);
  } else {
    if (get.progressText) get.progressText.textContent = data.message || 'Export failed.';
    if (onBusyChange) onBusyChange(false);
  }
  activeExportId = null;
}
