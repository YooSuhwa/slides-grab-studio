// editor-command-palette.js — ⌘K command palette.
// Decoupled from the rest of the editor: actions fire via button clicks or
// public export helpers, so this module has no imports into editor internals.

import { openExportModal } from './editor-export-modal.js';

// ── Action registry ───────────────────────────────────────────────
// { id, name, hint, group, kbd?, run() }
const ACTIONS = [
  {
    id: 'export-pptx', group: 'Export',
    name: 'Export deck · PPTX', hint: 'PowerPoint', kbd: '',
    run: () => openExportModal('pptx'),
  },
  {
    id: 'export-pdf', group: 'Export',
    name: 'Export deck · PDF', hint: 'Fixed print · share', kbd: '',
    run: () => openExportModal('pdf'),
  },
  {
    id: 'export-svg', group: 'Export',
    name: 'Export deck · SVG / PNG', hint: 'Vector · image extract', kbd: '',
    run: () => openExportModal('svg'),
  },
  {
    id: 'export-figma', group: 'Export',
    name: 'Send to Figma', hint: 'Requires plugin', kbd: '',
    run: () => openExportModal('figma'),
  },
  {
    id: 'present', group: 'Actions',
    name: 'Enter presentation mode', hint: '전체 화면 발표', kbd: 'F5',
    run: () => document.querySelector('#btn-present')?.click(),
  },
  {
    id: 'review-outline', group: 'Actions',
    name: 'Review outline', hint: 'AI 아웃라인 리뷰', kbd: '',
    run: () => document.querySelector('#btn-review-outline')?.click(),
  },
  {
    id: 'review-deck', group: 'Actions',
    name: 'Review deck', hint: 'AI 덱 리뷰', kbd: '',
    run: () => document.querySelector('#btn-review-deck')?.click(),
  },
  {
    id: 'retheme', group: 'Actions',
    name: 'Retheme deck', hint: '다른 팩으로 리디자인', kbd: '',
    run: () => document.querySelector('#btn-retheme')?.click(),
  },
  {
    id: 'restore-version', group: 'Actions',
    name: 'Restore previous version', hint: '이전 버전으로 되돌리기', kbd: '',
    run: () => import('./editor-restore.js').then((m) => m.openRestoreVersionModal()),
  },
  {
    id: 'duplicate', group: 'Slide',
    name: 'Duplicate slide', hint: '현재 슬라이드 복제', kbd: '⌘⇧D',
    run: () => document.querySelector('#btn-duplicate-slide')?.click(),
  },
  {
    id: 'delete', group: 'Slide',
    name: 'Delete slide', hint: '현재 슬라이드 삭제', kbd: '',
    run: () => document.querySelector('#btn-delete-slide')?.click(),
  },
  {
    id: 'next', group: 'Slide',
    name: 'Next slide', hint: '', kbd: '↓',
    run: () => document.querySelector('#btn-next')?.click(),
  },
  {
    id: 'prev', group: 'Slide',
    name: 'Previous slide', hint: '', kbd: '↑',
    run: () => document.querySelector('#btn-prev')?.click(),
  },
  {
    id: 'toggle-notes', group: 'View',
    name: 'Toggle notes dock', hint: '', kbd: 'N',
    run: () => {
      // Simulate 'N' key press
      const evt = new KeyboardEvent('keydown', { key: 'n', code: 'KeyN', bubbles: true });
      document.dispatchEvent(evt);
    },
  },
  {
    id: 'toggle-theme', group: 'View',
    name: 'Toggle theme (light · dark)', hint: '', kbd: '',
    run: () => document.querySelector('#theme-toggle')?.click(),
  },
  {
    id: 'ai-notes', group: 'AI',
    name: 'Draft presenter notes with AI', hint: 'Persona + slide context', kbd: '',
    run: () => document.querySelector('#btn-notes-open-modal')?.click(),
  },
  {
    id: 'logo', group: 'Brand',
    name: 'Logo settings', hint: 'Overlay logo on slides', kbd: '',
    run: () => {
      // Logo button has no fixed id — fall back to event-based open.
      const btn = document.querySelector('[data-action="open-logo-settings"]')
        || document.querySelector('#btn-logo-settings');
      btn?.click();
    },
  },
  {
    id: 'shortcuts', group: 'Help',
    name: 'Keyboard shortcuts', hint: 'View all shortcuts', kbd: '?',
    run: () => document.querySelector('#btn-shortcuts')?.click(),
  },
];

// ── Recent decks (fetched lazily) ─────────────────────────────────
let recentDecks = null; // cache
async function loadRecentDecks() {
  if (recentDecks !== null) return recentDecks;
  try {
    const res = await fetch('/api/decks');
    if (!res.ok) { recentDecks = []; return recentDecks; }
    const decks = await res.json();
    recentDecks = (decks || [])
      .slice()
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 5)
      .map((d) => ({
        id: `deck-${d.name}`,
        group: 'Recent decks',
        name: d.name,
        hint: `${d.slideCount || 0} slides`,
        run: () => { window.location.href = `/editor?slidesDir=decks/${encodeURIComponent(d.name)}`; },
      }));
    return recentDecks;
  } catch {
    recentDecks = [];
    return recentDecks;
  }
}

// ── Fuzzy match (substring + prefix/word-start scoring) ───────────
function scoreMatch(text, q) {
  if (!q) return 0;
  const t = text.toLowerCase();
  const i = t.indexOf(q);
  if (i === -1) return -1;
  if (i === 0) return 0; // prefix
  if (/\s|·|-|\//.test(t[i - 1])) return 1; // word start
  return 2; // substring
}

function filterActions(items, q) {
  if (!q) return items.map((a) => ({ a, s: 10 })); // keep order
  const Q = q.trim().toLowerCase();
  const matches = [];
  for (const a of items) {
    const s1 = scoreMatch(a.name, Q);
    const s2 = scoreMatch(a.hint || '', Q);
    const s3 = scoreMatch(a.group || '', Q);
    const best = [s1, s2, s3].filter((x) => x >= 0).sort((a, b) => a - b)[0];
    if (best !== undefined) matches.push({ a, s: best });
  }
  matches.sort((x, y) => x.s - y.s);
  return matches;
}

// ── DOM + rendering ───────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const overlay = () => $('#cmd-palette-overlay');
const input   = () => $('#cmd-palette-input');
const listEl  = () => $('#cmd-palette-list');

let selectedIndex = 0;
let renderedRows = []; // array of { action }

function iconMark() {
  // neutral dot mark
  return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
}

function render(q) {
  const el = listEl();
  if (!el) return;

  const actionMatches = filterActions(ACTIONS, q);
  const deckMatches = filterActions(recentDecks || [], q);
  const all = [...actionMatches, ...deckMatches];

  if (all.length === 0) {
    el.innerHTML = '<div class="cmd-empty">No matches.</div>';
    renderedRows = [];
    return;
  }

  renderedRows = all.map(({ a }) => ({ action: a }));

  // Group rows by .group
  const groups = new Map();
  if (q) {
    // Top match: place best across all groups first
    const top = renderedRows[0];
    if (top) groups.set('Top match', [top]);
    for (const r of renderedRows.slice(1)) {
      const g = r.action.group || 'Other';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(r);
    }
  } else {
    for (const r of renderedRows) {
      const g = r.action.group || 'Other';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(r);
    }
  }

  // Build HTML
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let flatIndex = 0;
  let html = '';
  for (const [groupName, rows] of groups) {
    html += `<div class="cmd-grp"><div class="glbl">${esc(groupName)}</div>`;
    for (const r of rows) {
      const a = r.action;
      const kbd = a.kbd ? `<span class="kc">${esc(a.kbd)}</span>` : '';
      html += `<div class="cmd-row" data-index="${flatIndex}">
        <span class="ic">${iconMark()}</span>
        <span class="lbl">
          <span class="nm">${esc(a.name)}</span>
          ${a.hint ? `<span class="ds">— ${esc(a.hint)}</span>` : ''}
        </span>
        ${kbd}
      </div>`;
      flatIndex += 1;
    }
    html += `</div>`;
  }
  el.innerHTML = html;
  selectedIndex = 0;
  highlightSelected();

  // Click dispatch
  el.querySelectorAll('.cmd-row').forEach((row) => {
    row.addEventListener('click', () => {
      const idx = Number(row.dataset.index);
      selectedIndex = idx;
      runAt(idx);
    });
    row.addEventListener('mouseenter', () => {
      selectedIndex = Number(row.dataset.index);
      highlightSelected();
    });
  });
}

function highlightSelected() {
  const el = listEl();
  if (!el) return;
  el.querySelectorAll('.cmd-row').forEach((r) => r.classList.remove('on'));
  const sel = el.querySelector(`.cmd-row[data-index="${selectedIndex}"]`);
  if (sel) {
    sel.classList.add('on');
    sel.scrollIntoView({ block: 'nearest' });
  }
}

function runAt(idx) {
  const row = renderedRows[idx];
  if (!row) return;
  closeCommandPalette();
  setTimeout(() => { try { row.action.run(); } catch (e) { console.error(e); } }, 20);
}

// ── Open / close ──────────────────────────────────────────────────
export function openCommandPalette() {
  const o = overlay();
  if (!o) return;
  o.hidden = false;
  const inp = input();
  if (inp) { inp.value = ''; setTimeout(() => inp.focus(), 20); }
  // Kick off recent decks lazy load
  loadRecentDecks().then(() => render(input()?.value || ''));
  render('');
}

export function closeCommandPalette() {
  const o = overlay();
  if (!o) return;
  o.hidden = true;
}

// ── Wire ──────────────────────────────────────────────────────────
function wire() {
  const o = overlay();
  if (!o || o.dataset.wired === '1') return;
  o.dataset.wired = '1';

  const inp = input();
  inp?.addEventListener('input', () => render(inp.value));
  inp?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, renderedRows.length - 1);
      highlightSelected();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      highlightSelected();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  });

  o.addEventListener('click', (e) => {
    if (e.target === o) closeCommandPalette();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wire);
} else {
  wire();
}
