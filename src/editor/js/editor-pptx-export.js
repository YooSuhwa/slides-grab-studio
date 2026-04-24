// editor-pptx-export.js — PPTX export pane (coordinator-driven)

import { state } from './editor-state.js';
import { currentSlideFile } from './editor-utils.js';

const $ = (sel) => document.querySelector(sel);
const get = {
  get progressDiv() { return $('#pptx-export-progress'); },
  get progressFill() { return $('#pptx-export-progress-fill'); },
  get progressText() { return $('#pptx-export-progress-text'); },
};

let activeExportId = null;
let onBusyChange = null;
export function registerPptxExportBusy(cb) { onBusyChange = cb; }

export function resetPptxExport() {
  get.progressDiv?.classList.remove('active');
  if (get.progressFill) get.progressFill.style.width = '0%';
  if (get.progressText) get.progressText.textContent = '';
  if (onBusyChange) onBusyChange(false);
  activeExportId = null;
}

export function openPptxExportPane() { resetPptxExport(); }

// Backwards-compat for editor-init.js import.
export function openPptxExportModal() {
  import('./editor-export-modal.js').then((m) => m.openExportModal('pptx'));
}

export async function runPptxExport(closeFn) {
  if (onBusyChange) onBusyChange(true);
  get.progressDiv?.classList.add('active');
  if (get.progressText) get.progressText.textContent = 'Generating PPTX...';
  if (get.progressFill) get.progressFill.style.width = '10%';

  try {
    const mode = document.querySelector('input[name="pptx-export-mode"]:checked')?.value || 'image';
    const { readScope } = await import('./editor-export-modal.js');
    const { scope, slides } = readScope('pptx');
    const includeNotes = document.querySelector('#pptx-include-notes')?.checked !== false;
    const body = { mode, scope, includeNotes };
    if (scope === 'current') body.slide = currentSlideFile();
    if (scope === 'specific') body.slides = slides;

    const res = await fetch('/api/pptx-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'PPTX export failed');
    }
    const { exportId, total } = await res.json();
    activeExportId = exportId;
    if (get.progressText) get.progressText.textContent = `0 / ${total}`;
    void closeFn; // caller closes on finished event
  } catch (err) {
    if (get.progressText) get.progressText.textContent = `Error: ${err.message}`;
    if (onBusyChange) onBusyChange(false);
  }
}

export function onPptxExportProgress(data) {
  if (data.exportId !== activeExportId) return;
  const pct = Math.round((data.current / data.total) * 100);
  if (get.progressFill) get.progressFill.style.width = `${pct}%`;
  if (get.progressText) get.progressText.textContent =
    `${data.current} / ${data.total} — ${data.file}`;
}

export function onPptxExportFinished(data) {
  if (data.exportId !== activeExportId) return;

  if (data.success && data.downloadUrl) {
    if (get.progressFill) get.progressFill.style.width = '100%';
    if (get.progressText) get.progressText.textContent = 'Downloading PPTX...';
    const a = document.createElement('a');
    a.href = data.downloadUrl;
    a.download = `${state.deckName || 'slides'}.pptx`;
    document.body.appendChild(a); a.click(); a.remove();
    if (get.progressText) get.progressText.textContent = data.message || 'PPTX export complete.';
    setTimeout(() => {
      import('./editor-export-modal.js').then((m) => m.closeExportModal());
    }, 1500);
  } else {
    if (get.progressText) get.progressText.textContent = data.message || 'PPTX export failed.';
    if (onBusyChange) onBusyChange(false);
  }
  activeExportId = null;
}
