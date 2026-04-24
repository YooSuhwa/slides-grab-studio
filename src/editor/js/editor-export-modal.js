// editor-export-modal.js — Unified export modal coordinator.
// Owns #export-modal shell: tab switching, open/close, submit/cancel dispatch,
// dynamic eyebrow + ex-summary card + per-pane subtitle totals.

import { state } from './editor-state.js';
import {
  openSvgExportPane, runSvgExport, resetSvgExport,
  registerSvgExportBusy,
} from './editor-svg-export.js';
import {
  openPdfExportPane, runPdfExport, resetPdfExport,
  registerPdfExportBusy,
} from './editor-pdf-export.js';
import {
  openPptxExportPane, runPptxExport, resetPptxExport,
  registerPptxExportBusy,
} from './editor-pptx-export.js';
import {
  openFigmaExportPane, runFigmaExport, resetFigmaExport, isFigmaExporting,
  registerFigmaExportBusy,
} from './editor-figma-export.js';

const TABS = ['pptx', 'pdf', 'svg', 'figma'];
const LABELS = {
  pptx: 'Export PPTX',
  pdf:  'Export PDF',
  svg:  'Export SVG',
  figma: 'Send to Figma',
};
const BADGES = { pptx: 'PPTX', pdf: 'PDF', svg: 'SVG', figma: 'FIG' };
const EXTS   = { pptx: 'pptx', pdf: 'pdf', svg: 'svg' };

const $ = (sel) => document.querySelector(sel);
const modal      = () => $('#export-modal');
const tabsEl     = () => $('#export-modal .ex-tabs');
const eyebrow    = () => $('#export-eyebrow');
const submitBtn  = () => $('#export-submit');
const submitLbl  = () => $('#export-submit-label');
const cancelBtn  = () => $('#export-cancel');
const closeBtn   = () => $('#export-modal-close');
const hintEl     = () => $('#export-hint');
const sumBadge   = () => $('#export-summary-badge');
const sumName    = () => $('#export-summary-filename');
const sumMeta    = () => $('#export-summary-meta');

let activeTab = 'pptx';

function deckName() {
  return (state && state.deckName) ? state.deckName : 'deck';
}
function slideCount() {
  return (state && Array.isArray(state.slides)) ? state.slides.length : 0;
}
function slideFiles() {
  return (state && Array.isArray(state.slides)) ? state.slides : [];
}

/** Parse "1, 2, 5, 10" into an ordered list of slide filenames (deduped, clamped). */
export function parsePagesInput(text) {
  const files = slideFiles();
  if (!text || !files.length) return [];
  const nums = text
    .split(/[,\s]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= files.length);
  const unique = [...new Set(nums)].sort((a, b) => a - b);
  return unique.map((n) => files[n - 1]);
}

/** Return the current scope + resolved slide list for a given tab. */
export function readScope(tab) {
  const scope = document.querySelector(`input[name="${tab}-export-scope"]:checked`)?.value || 'all';
  if (scope === 'specific') {
    const input = document.querySelector(`.ex-pages-input[data-pages-for="${tab}"]`);
    const slides = parsePagesInput(input?.value || '');
    return { scope, slides };
  }
  return { scope, slides: [] };
}

function eyebrowFor(tab) {
  const n = slideCount();
  const deck = deckName();
  return n > 0
    ? `export · ${deck} · ${n} slides`
    : `export · ${deck}`;
}

// ── Busy (submit disabled) state ──────────────────────────────────
function setBusy(busy) {
  const btn = submitBtn();
  if (!btn) return;
  btn.disabled = !!busy;
  btn.style.opacity = busy ? '0.6' : '';
  btn.style.cursor = busy ? 'progress' : '';
  const hint = hintEl();
  if (hint) hint.textContent = busy ? 'Working…' : 'Ready';
}

function busyHook(tab) {
  return (busy) => { if (activeTab === tab) setBusy(busy); };
}
registerSvgExportBusy(busyHook('svg'));
registerPdfExportBusy(busyHook('pdf'));
registerPptxExportBusy(busyHook('pptx'));
registerFigmaExportBusy(busyHook('figma'));

// ── Summary + totals ──────────────────────────────────────────────
/** Compute the "count" portion of the summary for a given tab based on scope. */
function scopeCount(tab) {
  const { scope, slides } = readScope(tab);
  const n = slideCount();
  if (scope === 'current') return { countLabel: '1 slide', scope };
  if (scope === 'specific') {
    return {
      countLabel: slides.length === 0 ? 'no pages selected' : `${slides.length} slide${slides.length === 1 ? '' : 's'}`,
      scope,
    };
  }
  return { countLabel: `${n} slides`, scope };
}

function subMeta(tab) {
  if (tab === 'pptx') {
    const { countLabel } = scopeCount('pptx');
    const mode = document.querySelector('input[name="pptx-export-mode"]:checked')?.value || 'image';
    const notes = document.querySelector('#pptx-include-notes')?.checked ? ' · with notes' : '';
    return `${countLabel} · ${mode === 'structured' ? 'editable mode' : 'image mode'}${notes}`;
  }
  if (tab === 'pdf') {
    const { countLabel, scope } = scopeCount('pdf');
    if (scope === 'current') return `${countLabel} · current only`;
    if (scope === 'specific') return `${countLabel} · specific`;
    return `${countLabel} · all`;
  }
  if (tab === 'svg') {
    const { countLabel } = scopeCount('svg');
    const fmt = document.querySelector('input[name="svg-format-choice"]:checked')?.value || 'svg';
    const preset = document.querySelector('#svg-export-preset')?.value || '1920x1080';
    const fmtLabel = fmt === 'svg-outline' ? 'svg-outline' : fmt;
    const presetLabel = preset === 'custom' ? 'custom' : preset.replace('x', '×');
    return `${countLabel} · ${presetLabel} · ${fmtLabel}`;
  }
  if (tab === 'figma') {
    const { countLabel, scope } = scopeCount('figma');
    const notes = document.querySelector('#figma-include-notes')?.checked ? ' · with notes' : '';
    if (scope === 'current') return `${countLabel} · current only${notes}`;
    if (scope === 'specific') return `${countLabel} · specific${notes}`;
    return `${countLabel} · all${notes}`;
  }
  return '';
}

/** Enable/disable submit based on specific-pages validity for the active tab. */
function syncSubmitEnable() {
  const { scope, slides } = readScope(activeTab);
  if (scope === 'specific' && slides.length === 0) {
    setBusy(true);
    const hint = hintEl();
    if (hint) hint.textContent = 'Enter page numbers (e.g. 1, 2, 5)';
  } else {
    setBusy(false);
  }
}

/** Show/hide the pages input based on scope selection for the active tab. */
function syncPagesInputVisibility() {
  const tab = activeTab;
  const { scope } = readScope(tab);
  const input = document.querySelector(`.ex-pages-input[data-pages-for="${tab}"]`);
  if (input) input.hidden = scope !== 'specific';
}

function updateSummary() {
  const tab = activeTab;
  const deck = deckName();
  const badge = sumBadge();
  const name = sumName();
  const meta = sumMeta();
  if (badge) badge.textContent = BADGES[tab];
  if (name) {
    // Figma is streamed to the connected plugin — not a file download, so
    // show the destination instead of a fake ".figma" filename.
    name.textContent = tab === 'figma'
      ? `${deck} → Figma plugin`
      : `${deck}.${EXTS[tab]}`;
  }
  if (meta)  meta.textContent  = subMeta(tab);

  // Populate ex-total slide count placeholders + pptx-slide-count
  const n = slideCount();
  document.querySelectorAll('#export-modal [data-total-slides]').forEach((el) => {
    el.textContent = n > 0 ? String(n) : '—';
  });
  const pptxCount = document.querySelector('#pptx-slide-count');
  if (pptxCount) pptxCount.textContent = n > 0 ? String(n) : '—';
}

// ── SVG format seg ⇄ hidden select sync ──────────────────────────
function syncSvgFormatFromSeg() {
  const fmt = document.querySelector('input[name="svg-format-choice"]:checked')?.value || 'svg';
  const sel = document.querySelector('#svg-export-format');
  if (sel) sel.value = fmt;
}

// ── Tab switching ─────────────────────────────────────────────────
export function setActiveTab(tab) {
  if (!TABS.includes(tab)) tab = 'pptx';
  activeTab = tab;
  const m = modal();
  if (!m) return;

  m.querySelectorAll('.ex-tab').forEach((btn) => {
    const on = btn.dataset.exTab === tab;
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  m.querySelectorAll('.ex-pane').forEach((pane) => {
    pane.hidden = pane.dataset.exPane !== tab;
  });

  const eb = eyebrow();
  if (eb) eb.textContent = eyebrowFor(tab);
  const lbl = submitLbl();
  if (lbl) lbl.textContent = LABELS[tab];
  const s = submitBtn();
  if (s) s.dataset.exActive = tab;

  setBusy(false);
  syncPagesInputVisibility();
  updateSummary();
  syncSubmitEnable();

  switch (tab) {
    case 'pptx': openPptxExportPane(); break;
    case 'pdf':  openPdfExportPane(); break;
    case 'svg':  openSvgExportPane(); break;
    case 'figma': openFigmaExportPane(); break;
  }
}

// ── Open / close ──────────────────────────────────────────────────
export function openExportModal(tab = 'pptx') {
  const m = modal();
  if (!m) return;
  setActiveTab(tab);
  m.hidden = false;
  document.getElementById('export-dropdown')?.classList.remove('open');
  setTimeout(() => submitBtn()?.focus(), 50);
}

export function closeExportModal() {
  const m = modal();
  if (!m) return;
  m.hidden = true;
  resetSvgExport();
  resetPdfExport();
  resetPptxExport();
  resetFigmaExport();
  setBusy(false);
}

function onSubmit() {
  switch (activeTab) {
    case 'pptx':  void runPptxExport(closeExportModal); break;
    case 'pdf':   void runPdfExport(closeExportModal); break;
    case 'svg':   void runSvgExport(closeExportModal); break;
    case 'figma': void runFigmaExport(closeExportModal); break;
  }
}

// ── Wire handlers once DOM is ready ───────────────────────────────
function wire() {
  const m = modal();
  if (!m || m.dataset.wired === '1') return;
  m.dataset.wired = '1';

  tabsEl()?.querySelectorAll('.ex-tab').forEach((btn) => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.exTab));
  });

  // Keep seg labels `on` class in sync with radio selection.
  // Also trigger updateSummary() + pages-input visibility on any change.
  m.querySelectorAll('.ex-seg').forEach((seg) => {
    if (seg.dataset.readonly === '1') return;
    seg.querySelectorAll('label').forEach((lbl) => {
      lbl.addEventListener('click', () => {
        setTimeout(() => {
          seg.querySelectorAll('label').forEach((x) => {
            const r = x.querySelector('input[type="radio"]');
            x.classList.toggle('on', !!r?.checked);
          });
          if (seg.id === 'svg-format-seg') syncSvgFormatFromSeg();
          if (seg.classList.contains('ex-scope-seg')) {
            syncPagesInputVisibility();
            syncSubmitEnable();
          }
          updateSummary();
        }, 0);
      });
    });
  });

  // Pages input changes update summary + submit-enable
  m.querySelectorAll('.ex-pages-input').forEach((input) => {
    input.addEventListener('input', () => {
      const { slides } = readScope(input.dataset.pagesFor);
      input.classList.toggle('is-invalid', input.value.trim().length > 0 && slides.length === 0);
      updateSummary();
      syncSubmitEnable();
    });
  });

  // Scale / viewport inputs also affect summary
  document.querySelector('#svg-export-scale')?.addEventListener('input', updateSummary);
  document.querySelector('#svg-export-preset')?.addEventListener('change', updateSummary);

  // Include-notes toggles (PPTX, Figma) reflect into the summary line.
  document.querySelector('#pptx-include-notes')?.addEventListener('change', updateSummary);
  document.querySelector('#figma-include-notes')?.addEventListener('change', updateSummary);

  submitBtn()?.addEventListener('click', onSubmit);
  cancelBtn()?.addEventListener('click', closeExportModal);
  closeBtn()?.addEventListener('click', closeExportModal);

  m.addEventListener('click', (e) => {
    if (e.target === m && !isFigmaExporting()) closeExportModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !m.hidden && !isFigmaExporting()) closeExportModal();
  });
  document.addEventListener('keydown', (e) => {
    if (m.hidden) return;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wire);
} else {
  wire();
}
