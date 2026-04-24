// pack-picker.js — shared pack picker modal
// Used by generate.html (pack selection) and editor.html (retheme).
// Requires pack-picker.css to be linked on the page.

const PACK_CATEGORIES = [
  { id: 'editorial', label: 'Editorial', keys: ['editorial', 'magazine', 'print', 'serif', 'paper', 'ink'] },
  { id: 'minimal',   label: 'Minimal',   keys: ['minimal', 'clean', 'simple', 'grid', 'swiss', 'quiet'] },
  { id: 'bold',      label: 'Bold',      keys: ['bold', 'brutalist', 'statement', 'heavy', 'loud', 'neon'] },
  { id: 'soft',      label: 'Soft',      keys: ['soft', 'warm', 'pastel', 'cozy', 'friendly', 'rounded', 'clay'] },
  { id: 'dark',      label: 'Dark',      keys: ['dark', 'noir', 'deep', 'night', 'midnight'] },
  { id: 'vibrant',   label: 'Vibrant',   keys: ['gradient', 'aurora', 'vivid', 'rainbow', 'pop'] },
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function packCategories(p) {
  const hay = [p.id, p.name, ...(p.tags || []), ...(p.mood || [])].join(' ').toLowerCase();
  const hits = PACK_CATEGORIES.filter((c) => c.keys.some((k) => hay.includes(k))).map((c) => c.id);
  return hits.length ? hits : ['other'];
}

// ─── module state ───
let _root = null;              // .pp-backdrop element (injected once)
let _els = null;               // cached child elements
let _opts = null;              // current open options
let _packs = [];
let _preview = null;           // currently highlighted pack id
let _filter = 'all';
let _cssLoaded = false;
let _defaultHighlightId = null;
let _keydownBound = false;

function buildDom() {
  const root = document.createElement('div');
  root.className = 'pp-backdrop';
  root.hidden = true;
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="pp-modal" role="dialog" aria-labelledby="pp-title">
      <div class="pp-head">
        <div class="pp-icon-cell">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div class="pp-h">
          <div class="pp-eyebrow" data-ref="eyebrow">apply pack</div>
          <h2 id="pp-title" data-ref="title">Pick a <em>design pack</em></h2>
        </div>
        <button class="pp-x" data-ref="close" aria-label="닫기" type="button">
          <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="pp-tabs" data-ref="tabs"></div>
      <div class="pp-body">
        <div class="pp-grid-wrap">
          <div class="pp-search-row">
            <input type="search" data-ref="search" class="pp-search" placeholder="팩 검색 — 이름·태그·무드" />
          </div>
          <div class="pp-grid" data-ref="grid"></div>
        </div>
        <aside class="pp-detail">
          <div class="pp-detail-content" data-ref="detail"></div>
        </aside>
      </div>
      <div class="pp-foot">
        <span class="pp-hint" data-ref="hint"></span>
        <span class="pp-sp"></span>
        <button class="btn ghost" data-ref="cancel" type="button">닫기</button>
        <button class="btn primary" data-ref="apply" type="button">Apply</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const q = (ref) => root.querySelector(`[data-ref="${ref}"]`);
  const els = {
    modal: root.querySelector('.pp-modal'),
    eyebrow: q('eyebrow'), title: q('title'), close: q('close'),
    tabs: q('tabs'), search: q('search'), grid: q('grid'),
    detail: q('detail'), hint: q('hint'),
    cancel: q('cancel'), apply: q('apply'),
  };

  root.addEventListener('click', (e) => { if (e.target === root) closePackPicker(); });
  els.close.addEventListener('click', closePackPicker);
  els.cancel.addEventListener('click', closePackPicker);
  els.apply.addEventListener('click', handleApply);
  els.search.addEventListener('input', renderPackGrid);
  els.search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && _preview) { e.preventDefault(); handleApply(); }
  });

  return { root, els };
}

function ensureDom() {
  if (_root) return;
  const built = buildDom();
  _root = built.root;
  _els = built.els;
}

function bindGlobalKeys() {
  if (_keydownBound) return;
  _keydownBound = true;
  document.addEventListener('keydown', (e) => {
    if (!_root || _root.hidden) return;
    if (e.key === 'Escape') closePackPicker();
    else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && _preview) {
      e.preventDefault();
      handleApply();
    }
  });
  window.addEventListener('resize', () => {
    if (!_root || _root.hidden) return;
    scalePreviews(_els.grid);
    scalePreviews(_els.detail);
  });
}

export async function ensurePreviewCss(packs) {
  if (_cssLoaded) return;
  _cssLoaded = true;
  let style = document.getElementById('pack-picker-preview-css');
  if (!style) {
    style = document.createElement('style');
    style.id = 'pack-picker-preview-css';
    document.head.appendChild(style);
  }
  const texts = await Promise.all(
    packs.map((p) => fetch(`/api/packs/${encodeURIComponent(p.id)}/preview.css`)
      .then((r) => (r.ok ? r.text() : ''))
      .catch(() => '')),
  );
  style.textContent = texts.filter(Boolean).join('\n');
}

function packCardHtml(p, isOn) {
  const cats = packCategories(p);
  const catLabel = (PACK_CATEGORIES.find((c) => c.id === cats[0])?.label || 'PACK').toUpperCase();
  const isDefault = _defaultHighlightId && p.id === _defaultHighlightId;
  return `<button type="button" class="pp-card${isOn ? ' on' : ''}" data-pack="${esc(p.id)}" data-cats="${esc(cats.join(' '))}">
    <div class="preview">
      <div class="preview-inner preview-${esc(p.id)}">
        <div class="el el-1"></div><div class="el el-2"></div><div class="el el-3"></div>
      </div>
    </div>
    <span class="check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-11"/></svg></span>
    <div class="meta">
      <div class="nm">${esc(p.name || p.id)}${isDefault ? ' <span class="star">★</span>' : ''}</div>
      <div class="ds">${esc(catLabel)}</div>
    </div>
  </button>`;
}

function scalePreviews(root) {
  root.querySelectorAll('.preview').forEach((box) => {
    const inner = box.querySelector('.preview-inner');
    if (!inner) return;
    const w = box.clientWidth;
    if (!w) return;
    inner.style.transform = `scale(${w / 280})`;
  });
  root.querySelectorAll('.big-pv').forEach((box) => {
    const inner = box.querySelector('.preview-inner');
    if (!inner) return;
    const w = box.clientWidth;
    if (!w) return;
    inner.style.transform = `scale(${w / 280})`;
  });
}

function renderPackDetail(p) {
  if (!p) { _els.detail.innerHTML = ''; return; }
  const c = p.colors || {};
  const chips = [...(p.tags || []), ...(p.mood || [])]
    .filter((t, i, arr) => t && arr.indexOf(t) === i).slice(0, 4);
  const fullName = (p.name || p.id).trim();
  const parts = fullName.split(/\s+/);
  const head = parts.length > 1 ? parts.slice(0, -1).join(' ') : fullName;
  const tail = parts.length > 1 ? parts[parts.length - 1] : '';
  const swatchKeys = ['bg-primary', 'accent', 'text-primary', 'text-secondary'];
  const swatches = swatchKeys.map((k) => c[k]
    ? `<span class="sw" title="${esc(k)} ${esc(c[k])}" style="background:${esc(c[k])}"></span>` : '').join('');
  _els.detail.innerHTML = `
    <div class="big-pv">
      <div class="preview-inner preview-${esc(p.id)}">
        <div class="el el-1"></div><div class="el el-2"></div><div class="el el-3"></div>
      </div>
    </div>
    <div class="pp-name-block">
      <h3>${esc(head)}${tail ? ` <em>${esc(tail)}</em>` : ''}</h3>
      ${p.description ? `<div class="ds">${esc(p.description)}</div>` : ''}
    </div>
    ${swatches ? `<div class="swatch-row">${swatches}</div>` : ''}
    ${chips.length ? `<div class="meta-row">${chips.map((t) => `<span class="ch">${esc(t)}</span>`).join('')}</div>` : ''}
  `;
  scalePreviews(_els.detail);
}

function filteredPacks() {
  const q = _els.search.value.trim().toLowerCase();
  return _packs.filter((p) => {
    if (_filter !== 'all' && !packCategories(p).includes(_filter)) return false;
    if (!q) return true;
    const hay = [p.id, p.name, p.description, p.bestFor, ...(p.tags || []), ...(p.mood || [])]
      .join(' ').toLowerCase();
    return hay.includes(q);
  });
}

function renderPackTabs() {
  const counts = { all: _packs.length };
  for (const p of _packs) for (const cid of packCategories(p)) counts[cid] = (counts[cid] || 0) + 1;
  const tabs = [{ id: 'all', label: 'All' }, ...PACK_CATEGORIES.filter((c) => counts[c.id])];
  _els.tabs.innerHTML = tabs.map((t) =>
    `<button type="button" class="${t.id === _filter ? 'on' : ''}" data-cat="${esc(t.id)}">${esc(t.label)} <span class="ct">${counts[t.id] || 0}</span></button>`,
  ).join('');
  _els.tabs.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
    _filter = btn.dataset.cat;
    renderPackTabs();
    renderPackGrid();
  }));
}

function renderPackGrid() {
  const list = filteredPacks();
  if (!list.length) {
    _els.grid.innerHTML = `<div style="grid-column:1/-1;padding:32px;text-align:center;font-size:12px;color:var(--muted)">일치하는 팩이 없습니다.</div>`;
    return;
  }
  _els.grid.innerHTML = list.map((p) => packCardHtml(p, p.id === _preview)).join('');
  _els.grid.querySelectorAll('.pp-card').forEach((card) => {
    card.addEventListener('click', () => packPickInModal(card.dataset.pack));
    card.addEventListener('dblclick', () => { packPickInModal(card.dataset.pack); handleApply(); });
  });
  scalePreviews(_els.grid);
  requestAnimationFrame(() => {
    scalePreviews(_els.grid);
    const sel = _els.grid.querySelector('.pp-card.on');
    if (sel) sel.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
}

function packPickInModal(id) {
  _preview = id;
  const p = _packs.find((x) => x.id === id);
  _els.grid.querySelectorAll('.pp-card').forEach((x) => x.classList.toggle('on', x.dataset.pack === id));
  renderPackDetail(p);
  _els.apply.disabled = false;
}

async function handleApply() {
  if (!_preview || !_opts?.onApply) { closePackPicker(); return; }
  try {
    await _opts.onApply(_preview);
  } catch (err) {
    console.error('[pack-picker] onApply failed:', err);
  }
}

export async function openPackPicker(opts) {
  _opts = opts || {};
  _packs = Array.isArray(opts.packs) ? opts.packs : [];
  _preview = opts.initialPackId || null;
  _filter = 'all';
  _defaultHighlightId = opts.defaultHighlightId ?? 'simple_light';

  ensureDom();
  bindGlobalKeys();

  _els.eyebrow.textContent = opts.eyebrow ?? 'apply pack';
  _els.title.innerHTML = opts.titleHtml ?? 'Pick a <em>design pack</em>';
  _els.hint.textContent = opts.hint ?? '선택한 팩의 디자인이 적용됩니다.';
  _els.apply.innerHTML = esc(opts.applyLabel ?? 'Apply');
  _els.apply.disabled = !_preview;
  _els.apply.style.display = opts.hideApply ? 'none' : '';
  _els.search.value = '';

  _root.hidden = false;
  _root.setAttribute('aria-hidden', 'false');

  await ensurePreviewCss(_packs);
  renderPackTabs();
  renderPackGrid();
  renderPackDetail(_packs.find((p) => p.id === _preview) || null);
  setTimeout(() => _els.search.focus(), 30);
}

export function closePackPicker() {
  if (!_root) return;
  _root.hidden = true;
  _root.setAttribute('aria-hidden', 'true');
  if (_opts?.onClose) {
    try { _opts.onClose(); } catch (err) { console.error('[pack-picker] onClose failed:', err); }
  }
}
