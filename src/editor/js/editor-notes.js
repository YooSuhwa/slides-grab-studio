// editor-notes.js — Presenter notes dock: load, save, auto-save, drag-to-resize, collapse

import { currentSlideFile } from './editor-utils.js';
import { initNotesGenerator, openNotesModal } from './editor-notes-generator.js';

const STORAGE_KEYS = {
  height: 'sg-notes-dock-height',
  collapsed: 'sg-notes-dock-collapsed',
};

const MIN_HEIGHT = 100;
const MAX_HEIGHT_VH = 0.7;
const DEFAULT_HEIGHT = 200;

/** @type {HTMLTextAreaElement|null} */
let notesTextarea = null;
/** @type {HTMLElement|null} */
let dock = null;
/** @type {HTMLElement|null} */
let handle = null;
/** @type {HTMLElement|null} */
let collapseBtn = null;
/** @type {HTMLButtonElement|null} */
let openModalBtn = null;

let saveTimer = null;
let loadedForSlide = '';
let collapsed = false;

// ── Public API ──────────────────────────────────────────────────────

export function initNotesPanel() {
  notesTextarea = document.getElementById('notes-textarea');
  dock = document.getElementById('notes-dock');
  handle = document.getElementById('notes-dock-handle');
  collapseBtn = document.getElementById('notes-dock-collapse');
  openModalBtn = document.getElementById('btn-notes-open-modal');

  if (!notesTextarea || !dock || !handle) return;

  restoreDockState();
  bindTextareaHandlers();
  bindDragHandlers();
  bindCollapseHandlers();
  if (openModalBtn) openModalBtn.addEventListener('click', () => openNotesModal());

  initNotesGenerator({
    onCurrentSlideUpdated: (newNotes) => {
      if (!notesTextarea) return;
      notesTextarea.value = newNotes || '';
      clearTimeout(saveTimer);
      saveTimer = null;
    },
  });
}

export async function loadNotes(slideFile) {
  if (!notesTextarea) return;
  if (loadedForSlide && loadedForSlide !== slideFile) flushSave();
  loadedForSlide = slideFile;

  if (!slideFile) {
    notesTextarea.value = '';
    return;
  }
  try {
    const res = await fetch(`/api/slides/${encodeURIComponent(slideFile)}/notes`);
    if (res.ok) {
      const data = await res.json();
      if (loadedForSlide === slideFile) notesTextarea.value = data.notes || '';
    } else if (loadedForSlide === slideFile) {
      notesTextarea.value = '';
    }
  } catch {
    if (loadedForSlide === slideFile) notesTextarea.value = '';
  }
}

export async function saveNotes(slideFile, text) {
  if (!slideFile) return;
  try {
    await fetch(`/api/slides/${encodeURIComponent(slideFile)}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: text }),
    });
  } catch {
    /* non-critical */
  }
}

export function getCurrentNotesText() {
  return notesTextarea?.value || '';
}

// ── Textarea handlers ──────────────────────────────────────────────

function bindTextareaHandlers() {
  notesTextarea.addEventListener('blur', () => flushSave());
  notesTextarea.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 1000);
  });
}

function flushSave() {
  clearTimeout(saveTimer);
  saveTimer = null;
  const slide = loadedForSlide || currentSlideFile();
  if (!slide || !notesTextarea) return;
  saveNotes(slide, notesTextarea.value);
}

// ── Dock state: restore + persist ───────────────────────────────────

function restoreDockState() {
  const savedHeight = parseInt(localStorage.getItem(STORAGE_KEYS.height) || '', 10);
  const height = Number.isFinite(savedHeight) ? clampHeight(savedHeight) : DEFAULT_HEIGHT;
  dock.style.height = `${height}px`;

  collapsed = localStorage.getItem(STORAGE_KEYS.collapsed) === '1';
  dock.classList.toggle('is-collapsed', collapsed);
}

function persistHeight(h) {
  localStorage.setItem(STORAGE_KEYS.height, String(Math.round(h)));
}

function persistCollapsed(val) {
  localStorage.setItem(STORAGE_KEYS.collapsed, val ? '1' : '0');
}

function clampHeight(h) {
  const maxH = Math.max(MIN_HEIGHT, Math.floor(window.innerHeight * MAX_HEIGHT_VH));
  return Math.min(maxH, Math.max(MIN_HEIGHT, h));
}

// ── Drag-to-resize ──────────────────────────────────────────────────

function bindDragHandlers() {
  handle.addEventListener('mousedown', startDrag);
  handle.addEventListener('touchstart', startDrag, { passive: false });
  handle.addEventListener('dblclick', toggleCollapsed);
  handle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); nudgeHeight(16); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); nudgeHeight(-16); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCollapsed(); }
  });
}

function nudgeHeight(delta) {
  if (collapsed) setCollapsed(false);
  const current = dock.getBoundingClientRect().height;
  const next = clampHeight(current + delta);
  dock.style.height = `${next}px`;
  persistHeight(next);
}

function startDrag(e) {
  if (collapsed) setCollapsed(false);
  e.preventDefault();
  const startY = pointerY(e);
  const startHeight = dock.getBoundingClientRect().height;

  dock.classList.add('is-resizing');

  const onMove = (ev) => {
    const y = pointerY(ev);
    const delta = startY - y; // drag up → positive → grow
    const next = clampHeight(startHeight + delta);
    dock.style.height = `${next}px`;
  };
  const onEnd = () => {
    dock.classList.remove('is-resizing');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
    persistHeight(dock.getBoundingClientRect().height);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
}

function pointerY(e) {
  if (e.touches && e.touches.length > 0) return e.touches[0].clientY;
  if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientY;
  return e.clientY;
}

// ── Collapse toggle ─────────────────────────────────────────────────

function bindCollapseHandlers() {
  if (!collapseBtn) return;
  collapseBtn.addEventListener('click', toggleCollapsed);
}

function toggleCollapsed(e) {
  e?.preventDefault?.();
  setCollapsed(!collapsed);
}

function setCollapsed(val) {
  collapsed = !!val;
  dock.classList.toggle('is-collapsed', collapsed);
  persistCollapsed(collapsed);
}
