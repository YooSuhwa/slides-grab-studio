// editor-pdf-export.js — PDF export pane (coordinator-driven)

import { currentSlideFile } from './editor-utils.js';
import { state } from './editor-state.js';

const $ = (sel) => document.querySelector(sel);
const get = {
  get progressDiv() { return $('#pdf-export-progress'); },
  get progressFill() { return $('#pdf-export-progress-fill'); },
  get progressText() { return $('#pdf-export-progress-text'); },
};

let activeExportId = null;
let onBusyChange = null;
export function registerPdfExportBusy(cb) { onBusyChange = cb; }

export function resetPdfExport() {
  get.progressDiv?.classList.remove('active');
  if (get.progressFill) get.progressFill.style.width = '0%';
  if (get.progressText) get.progressText.textContent = '';
  if (onBusyChange) onBusyChange(false);
  activeExportId = null;
}

export function openPdfExportPane() { resetPdfExport(); }

// Backwards-compat for editor-init.js import.
export function openPdfExportModal() {
  import('./editor-export-modal.js').then((m) => m.openExportModal('pdf'));
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

export async function runPdfExport(closeFn) {
  const { readScope } = await import('./editor-export-modal.js');
  const { scope, slides } = readScope('pdf');
  const slide = currentSlideFile();

  if (onBusyChange) onBusyChange(true);
  get.progressDiv?.classList.add('active');
  if (get.progressText) get.progressText.textContent = 'Generating PDF...';
  if (get.progressFill) get.progressFill.style.width = '10%';

  try {
    if (scope === 'current') {
      const res = await fetch('/api/pdf-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, slide }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'PDF export failed');
      }
      const blob = await res.blob();
      const filename = `${state.deckName || 'slide'}.pdf`;
      triggerDownload(blob, filename);
      if (get.progressFill) get.progressFill.style.width = '100%';
      if (get.progressText) get.progressText.textContent = `Downloaded: ${filename}`;
      setTimeout(() => closeFn?.(), 1500);
    } else {
      const body = { scope };
      if (scope === 'specific') body.slides = slides;
      const res = await fetch('/api/pdf-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'PDF export failed');
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

export function onPdfExportProgress(data) {
  if (data.exportId !== activeExportId) return;
  const pct = Math.round((data.current / data.total) * 100);
  if (get.progressFill) get.progressFill.style.width = `${pct}%`;
  if (get.progressText) get.progressText.textContent =
    `${data.current} / ${data.total} — ${data.file}`;
}

export async function onPdfExportFinished(data) {
  if (data.exportId !== activeExportId) return;

  if (data.success && data.downloadUrl) {
    if (get.progressFill) get.progressFill.style.width = '100%';
    if (get.progressText) get.progressText.textContent = 'Downloading PDF...';
    const a = document.createElement('a');
    a.href = data.downloadUrl;
    a.download = `${state.deckName || 'slides'}.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    if (get.progressText) get.progressText.textContent = data.message || 'PDF export complete.';
    setTimeout(() => {
      import('./editor-export-modal.js').then((m) => m.closeExportModal());
    }, 1500);
  } else {
    if (get.progressText) get.progressText.textContent = data.message || 'PDF export failed.';
    if (onBusyChange) onBusyChange(false);
  }
  activeExportId = null;
}
