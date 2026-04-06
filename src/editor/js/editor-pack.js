// editor-pack.js — Template pack selector for creation mode (CSS art preview)

import { creationState } from './editor-state.js';

let packsData = [];
let selectedPackId = 'simple_light';
let previewCssLoaded = false;

/** Sort by order from pack.json, simple_light first */
function sortPacks(packs) {
  return [...packs].sort((a, b) => {
    if (a.id === 'simple_light') return -1;
    if (b.id === 'simple_light') return 1;
    return (a.order || 999) - (b.order || 999);
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

  // Load all preview CSS once
  if (!previewCssLoaded) {
    const cssPromises = packsData.map(p =>
      fetch(`/api/packs/${encodeURIComponent(p.id)}/preview.css`)
        .then(r => r.ok ? r.text() : '')
        .catch(() => '')
    );
    const cssTexts = await Promise.all(cssPromises);
    const styleEl = document.createElement('style');
    styleEl.textContent = cssTexts.filter(Boolean).join('\n');
    document.head.appendChild(styleEl);
    previewCssLoaded = true;
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
}

/** Update the collapsible toggle text with current pack name. */
function updateToggleText() {
  const el = document.getElementById('pack-toggle-current');
  if (!el) return;
  const pack = packsData.find(p => p.id === selectedPackId);
  el.textContent = pack?.name || selectedPackId;
}

/** Create a pack card with CSS art preview. */
function createPackCard(pack) {
  const card = document.createElement('button');
  card.className = 'pack-card' + (pack.id === selectedPackId ? ' selected' : '');
  card.dataset.packId = pack.id;
  card.type = 'button';

  // CSS art preview
  const preview = document.createElement('div');
  preview.className = `pack-preview preview preview-${pack.id}`;
  preview.innerHTML = '<div class="el el-1"></div><div class="el el-2"></div><div class="el el-3"></div>';

  // Info
  const info = document.createElement('div');
  info.className = 'pack-info';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'pack-name';
  nameSpan.textContent = pack.name || pack.id;

  info.append(nameSpan);

  // Mood as comma-separated text
  if (pack.mood?.length) {
    const moodText = document.createElement('span');
    moodText.className = 'pack-mood-text';
    moodText.textContent = pack.mood.slice(0, 3).join(', ');
    info.appendChild(moodText);
  }

  card.append(preview, info);
  return card;
}

function renderPackGrid() {
  const grid = document.getElementById('pack-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // Remove existing browse link if present
  const existingLink = grid.parentNode?.querySelector('.pack-browse-all');
  if (existingLink) existingLink.remove();

  // All packs in one grid (no custom/skin separation — all have design.md now)
  const packGrid = document.createElement('div');
  packGrid.className = 'pack-grid-all';

  for (const pack of packsData) {
    const card = createPackCard(pack);
    card.addEventListener('click', () => {
      selectedPackId = pack.id;
      creationState.packId = pack.id;
      updatePackSelection();
      updateToggleText();
    });
    packGrid.appendChild(card);
  }
  grid.appendChild(packGrid);

  // "Browse all packs" link
  const browseLink = document.createElement('a');
  browseLink.className = 'pack-browse-all';
  browseLink.href = '/packs-gallery';
  browseLink.target = '_blank';
  browseLink.rel = 'noopener';
  browseLink.textContent = '전체 팩 갤러리 보기 \u2192';
  grid.parentNode.insertBefore(browseLink, grid.nextSibling);
}

function updatePackSelection() {
  const grid = document.getElementById('pack-grid');
  if (!grid) return;

  for (const card of grid.querySelectorAll('.pack-card')) {
    const isSelected = card.dataset.packId === selectedPackId;
    card.classList.toggle('selected', isSelected);
  }
}

// ── Modal handlers (simplified — no iframe preview) ──
const modalCloseBtn = document.getElementById('pack-modal-close');
const modalBackdrop = document.getElementById('pack-modal-backdrop');

function closePackModal() {
  if (modalBackdrop) modalBackdrop.hidden = true;
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closePackModal);
}
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closePackModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBackdrop && !modalBackdrop.hidden) {
    closePackModal();
  }
});
