// editor-pack.js — Template pack gallery for creation mode

import { creationState } from './editor-state.js';

let packsData = [];
let selectedPackId = 'figma-default';

/**
 * Load packs from server and render the gallery.
 */
export async function loadPacks() {
  try {
    const res = await fetch('/api/packs');
    if (!res.ok) return;
    packsData = await res.json();
  } catch {
    packsData = [];
  }

  renderPackGrid();
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
}

/** Sanitize a CSS color value to prevent injection. */
function safeColor(v, fallback) {
  const s = typeof v === 'string' ? v.trim() : '';
  return /^#[0-9a-fA-F]{3,8}$/.test(s) ? s : fallback;
}

function renderPackGrid() {
  const grid = document.getElementById('pack-grid');
  if (!grid) return;

  grid.innerHTML = '';

  for (const pack of packsData) {
    const card = document.createElement('button');
    card.className = 'pack-card' + (pack.id === selectedPackId ? ' selected' : '');
    card.dataset.packId = pack.id;
    card.type = 'button';

    const colors = pack.colors || {};
    const bg = safeColor(colors['bg-primary'], '#333');
    const accent = safeColor(colors.accent, '#666');
    const textPrimary = safeColor(colors['text-primary'], '#fff');

    // Build DOM safely instead of innerHTML
    const preview = document.createElement('div');
    preview.className = 'pack-preview';

    const img = document.createElement('img');
    img.src = `/api/packs/${encodeURIComponent(pack.id)}/preview`;
    img.loading = 'lazy';
    img.alt = pack.name || '';
    img.addEventListener('error', () => {
      img.style.display = 'none';
      fallbackEl.style.display = 'flex';
    });

    const fallbackEl = document.createElement('div');
    fallbackEl.className = 'pack-preview-fallback';
    fallbackEl.style.cssText = `display:none;background:${bg}`;
    const accentBar = document.createElement('div');
    accentBar.className = 'pack-preview-accent';
    accentBar.style.background = accent;
    const linesEl = document.createElement('div');
    linesEl.className = 'pack-preview-lines';
    const line1 = document.createElement('div');
    line1.style.cssText = `background:${textPrimary};opacity:0.5;width:60%;height:3px;border-radius:1px`;
    const line2 = document.createElement('div');
    line2.style.cssText = `background:${textPrimary};opacity:0.25;width:40%;height:2px;border-radius:1px;margin-top:4px`;
    linesEl.append(line1, line2);
    fallbackEl.append(accentBar, linesEl);
    preview.append(img, fallbackEl);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'pack-name';
    nameSpan.textContent = pack.name || pack.id;

    card.append(preview, nameSpan);

    card.addEventListener('click', () => {
      selectedPackId = pack.id;
      creationState.packId = pack.id;
      updatePackSelection();
    });

    grid.appendChild(card);
  }
}

function updatePackSelection() {
  const grid = document.getElementById('pack-grid');
  if (!grid) return;

  for (const card of grid.querySelectorAll('.pack-card')) {
    card.classList.toggle('selected', card.dataset.packId === selectedPackId);
  }
}
