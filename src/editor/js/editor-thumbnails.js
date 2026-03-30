// editor-thumbnails.js — Slide thumbnail strip rendering + drag-and-drop reorder

import { state } from './editor-state.js';
import { slideStrip } from './editor-dom.js';
import { goToSlide } from './editor-navigation.js';

export function renderThumbnailStrip() {
  if (!slideStrip) return;
  slideStrip.innerHTML = '';

  state.slides.forEach((slide, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'slide-thumb' + (i === state.currentIndex ? ' active' : '');
    thumb.setAttribute('role', 'tab');
    thumb.setAttribute('aria-selected', i === state.currentIndex ? 'true' : 'false');
    thumb.setAttribute('aria-label', `Slide ${i + 1}`);
    thumb.title = slide;
    thumb.dataset.index = i;

    // Mini preview iframe (scaled down)
    const preview = document.createElement('iframe');
    preview.className = 'slide-thumb-preview';
    preview.src = `/slides/${slide}`;
    preview.tabIndex = -1;
    preview.setAttribute('aria-hidden', 'true');
    preview.loading = 'lazy';
    thumb.appendChild(preview);

    // Number label overlay
    const num = document.createElement('span');
    num.className = 'slide-thumb-num';
    num.textContent = i + 1;
    thumb.appendChild(num);

    // Drag-and-drop attributes and handlers
    thumb.draggable = true;
    thumb.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(i));
      thumb.classList.add('dragging');
    });
    thumb.addEventListener('dragend', () => {
      thumb.classList.remove('dragging');
    });
    thumb.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      thumb.classList.add('drag-over');
    });
    thumb.addEventListener('dragleave', () => {
      thumb.classList.remove('drag-over');
    });
    thumb.addEventListener('drop', async (e) => {
      e.preventDefault();
      thumb.classList.remove('drag-over');
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const toIndex = i;
      if (fromIndex === toIndex || isNaN(fromIndex)) return;
      await reorderSlides(fromIndex, toIndex);
    });

    slideStrip.appendChild(thumb);
  });
}

async function reorderSlides(fromIndex, toIndex) {
  const newOrder = [...state.slides];
  const [moved] = newOrder.splice(fromIndex, 1);
  newOrder.splice(toIndex, 0, moved);

  try {
    const res = await fetch('/api/slides/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder }),
    });
    const data = await res.json();
    if (data.slides) {
      state.slides = data.slides;
      // Navigate to the moved slide's new position
      const newIndex = data.slides.indexOf(moved);
      state.currentIndex = newIndex >= 0 ? newIndex : toIndex;
      renderThumbnailStrip();
      goToSlide(state.currentIndex);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Reorder failed:', err);
  }
}

export function updateActiveThumbnail(index) {
  if (!slideStrip) return;

  const thumbs = slideStrip.querySelectorAll('.slide-thumb');
  thumbs.forEach((thumb, i) => {
    const isActive = i === index;
    thumb.classList.toggle('active', isActive);
    thumb.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Scroll active thumb into view
  const active = slideStrip.querySelector('.slide-thumb.active');
  if (active) {
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}
