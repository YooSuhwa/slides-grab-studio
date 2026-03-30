// editor-pack.js — Template pack gallery for creation mode

import { creationState } from './editor-state.js';

let packsData = [];
let selectedPackId = 'simple_light';
let activePreviewType = '';

/** Pack descriptions — client-side lookup */
const PACK_DESC = {
  'simple_light': 'Clean white + orange accent',
  'simple_dark': 'Dark minimal monochrome',
  'midnight': 'Deep navy + gold premium dark',
  'corporate': 'White + navy blue business',
  'creative': 'Gradient pink/indigo creative',
  'grab': 'Modern business inline style',
  'mobile_strategy': 'Dark rose + pink mobile strategy',
  'black_rainbow': 'Black with rainbow accents',
};

/** Sort order: simple_light first, then alphabetical */
function sortPacks(packs) {
  return [...packs].sort((a, b) => {
    if (a.id === 'simple_light') return -1;
    if (b.id === 'simple_light') return 1;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Load packs from server and render the gallery.
 */
export async function loadPacks() {
  try {
    const res = await fetch('/api/packs');
    if (!res.ok) return;
    packsData = sortPacks(await res.json());
  } catch {
    packsData = [];
  }

  renderPackGrid();
  updateToggleText();
}

/**
 * Get the currently selected pack ID.
 */
export function getSelectedPack() {
  return selectedPackId;
}

/**
 * Set the selected pack by ID.
 */
export function setSelectedPack(packId) {
  selectedPackId = packId;
  creationState.packId = packId;
  updatePackSelection();
  updateToggleText();
  // Don't open modal — just sync selection state
}

/** Sanitize a CSS color value to prevent injection. */
function safeColor(v, fallback) {
  const s = typeof v === 'string' ? v.trim() : '';
  return /^#[0-9a-fA-F]{3,8}$/.test(s) ? s : fallback;
}

/** Update the collapsible toggle text with current pack name. */
function updateToggleText() {
  const el = document.getElementById('pack-toggle-current');
  if (!el) return;
  const pack = packsData.find(p => p.id === selectedPackId);
  el.textContent = pack?.name || selectedPackId;
}

function renderPackGrid() {
  const grid = document.getElementById('pack-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // Remove existing browse link if present
  const existingLink = grid.parentNode?.querySelector('.pack-browse-all');
  if (existingLink) existingLink.remove();

  for (const pack of packsData) {
    const card = document.createElement('button');
    card.className = 'pack-card' + (pack.id === selectedPackId ? ' selected' : '');
    card.dataset.packId = pack.id;
    card.type = 'button';

    const colors = pack.colors || {};
    const bg = safeColor(colors['bg-primary'], '#333');
    const bgSec = safeColor(colors['bg-secondary'], '#444');
    const accent = safeColor(colors.accent, '#666');
    const textPrimary = safeColor(colors['text-primary'], '#fff');
    const textSecondary = safeColor(colors['text-secondary'], '#aaa');
    const templates = pack.templates || [];

    // Color swatch bar
    const swatches = document.createElement('div');
    swatches.className = 'pack-swatches';
    for (const c of [bg, bgSec, accent, textPrimary, textSecondary]) {
      const swatch = document.createElement('div');
      swatch.style.background = c;
      swatches.appendChild(swatch);
    }

    // Stylized slide preview
    const preview = document.createElement('div');
    preview.className = 'pack-preview';
    preview.style.background = bg;

    const title = document.createElement('div');
    title.className = 'pack-slide-title';
    title.style.background = textPrimary;

    const accentBar = document.createElement('div');
    accentBar.className = 'pack-slide-accent';
    accentBar.style.background = accent;

    const body = document.createElement('div');
    body.className = 'pack-slide-body';
    body.style.background = textSecondary;

    const bodySm = document.createElement('div');
    bodySm.className = 'pack-slide-body-sm';
    bodySm.style.background = textSecondary;

    preview.append(title, accentBar, body, bodySm);

    // Info section
    const info = document.createElement('div');
    info.className = 'pack-info';

    const infoRow = document.createElement('div');
    infoRow.className = 'pack-info-row';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'pack-name';
    nameSpan.textContent = pack.name || pack.id;

    const countSpan = document.createElement('span');
    countSpan.className = 'pack-template-count';
    countSpan.textContent = `${templates.length}`;

    infoRow.append(nameSpan, countSpan);

    const descSpan = document.createElement('span');
    descSpan.className = 'pack-desc';
    descSpan.textContent = PACK_DESC[pack.id] || '';

    info.append(infoRow);
    if (descSpan.textContent) info.append(descSpan);

    card.append(swatches, preview, info);

    card.addEventListener('click', () => {
      selectedPackId = pack.id;
      creationState.packId = pack.id;
      updatePackSelection();
      updateToggleText();
      renderPackDetail();
    });

    grid.appendChild(card);
  }

  // "Browse all packs" link to full gallery
  const browseLink = document.createElement('a');
  browseLink.className = 'pack-browse-all';
  browseLink.href = '/packs-gallery';
  browseLink.target = '_blank';
  browseLink.rel = 'noopener';
  browseLink.textContent = 'Browse all packs \u2192';
  grid.parentNode.insertBefore(browseLink, grid.nextSibling);
}

function updatePackSelection() {
  const grid = document.getElementById('pack-grid');
  if (!grid) return;

  for (const card of grid.querySelectorAll('.pack-card')) {
    card.classList.toggle('selected', card.dataset.packId === selectedPackId);
  }
}

/** Open the modal showing template types and live preview. */
function renderPackDetail() {
  const backdrop = document.getElementById('pack-modal-backdrop');
  if (!backdrop) return;

  const pack = packsData.find(p => p.id === selectedPackId);
  if (!pack || !pack.templates?.length) return;

  backdrop.hidden = false;

  const nameEl = document.getElementById('pack-detail-name');
  if (nameEl) nameEl.textContent = pack.name || pack.id;

  const templates = pack.templates || [];

  // Reset preview type if current selection isn't in this pack
  if (!templates.includes(activePreviewType)) {
    activePreviewType = templates.includes('cover') ? 'cover' : templates[0];
  }

  const typesEl = document.getElementById('pack-detail-types');
  if (typesEl) {
    typesEl.innerHTML = '';

    for (const tmpl of templates) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'template-chip' + (tmpl === activePreviewType ? ' active' : '');
      chip.textContent = tmpl;
      chip.dataset.template = tmpl;

      chip.addEventListener('click', () => {
        activePreviewType = tmpl;
        for (const c of typesEl.querySelectorAll('.template-chip')) {
          c.classList.toggle('active', c.dataset.template === tmpl);
        }
        loadTemplatePreview(pack.id, tmpl);
      });

      typesEl.appendChild(chip);
    }
  }

  // Load preview for the active type
  loadTemplatePreview(pack.id, activePreviewType);
}

function closePackModal() {
  const backdrop = document.getElementById('pack-modal-backdrop');
  if (backdrop) backdrop.hidden = true;
}

/** Detect the actual content dimensions inside an iframe. */
function detectIframeContentSize(iframe) {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    // Check for .slide element first (used by packs with base.css)
    const slide = doc.querySelector('.slide');
    if (slide) {
      const rect = slide.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return { w: rect.width, h: rect.height };
    }
    // Fall back to body computed size
    const body = doc.body;
    if (body) {
      const cs = iframe.contentWindow.getComputedStyle(body);
      const w = parseFloat(cs.width);
      const h = parseFloat(cs.height);
      if (w > 0 && h > 0) return { w, h };
    }
  } catch (_) { /* cross-origin fallback */ }
  return { w: 960, h: 540 };
}

/** Apply correct scale to preview iframe based on content size. */
function applyPreviewScale(iframe, wrapper) {
  const { w, h } = detectIframeContentSize(iframe);
  iframe.style.width = w + 'px';
  iframe.style.height = h + 'px';
  const wrapperWidth = wrapper.clientWidth || wrapper.offsetWidth || 600;
  const scale = wrapperWidth / w;
  iframe.style.transform = `scale(${scale})`;
}

/** Load a template into the preview iframe. */
function loadTemplatePreview(packId, templateName) {
  const iframe = document.getElementById('pack-preview-iframe');
  const skeleton = document.getElementById('pack-preview-skeleton');
  const wrapper = document.getElementById('pack-preview-wrapper');
  if (!iframe || !wrapper) return;

  // Hide iframe until loaded; use default 960 scale as initial guess
  const wrapperWidth = wrapper.clientWidth || wrapper.offsetWidth || 600;
  iframe.style.width = '960px';
  iframe.style.height = '540px';
  iframe.style.transform = `scale(${wrapperWidth / 960})`;

  // Show loading state
  if (skeleton) skeleton.style.display = 'flex';
  iframe.style.opacity = '0';

  const src = `/packs-preview/${encodeURIComponent(packId)}/templates/${encodeURIComponent(templateName)}.html`;
  iframe.src = src;

  iframe.onload = () => {
    applyPreviewScale(iframe, wrapper);
    iframe.style.opacity = '1';
    if (skeleton) skeleton.style.display = 'none';
  };

  // Fallback: show after 2s even if onload didn't fire
  setTimeout(() => {
    if (iframe.style.opacity === '0') {
      applyPreviewScale(iframe, wrapper);
      iframe.style.opacity = '1';
      if (skeleton) skeleton.style.display = 'none';
    }
  }, 2000);
}

// ── Modal close handlers ──
const modalCloseBtn = document.getElementById('pack-modal-close');
const modalBackdrop = document.getElementById('pack-modal-backdrop');

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closePackModal);
}
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e) => {
    // Close only when clicking the backdrop itself, not the modal content
    if (e.target === modalBackdrop) closePackModal();
  });
}
// Escape key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop && !modalBackdrop.hidden) {
    closePackModal();
  }
});
