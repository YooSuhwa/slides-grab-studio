// editor-image-drag.js — Drag/resize handlers for images in the iframe

import { SLIDE_W, SLIDE_H } from './editor-state.js';
import { drawLayer, slideIframe } from './editor-dom.js';
import { scheduleDirectSave, serializeSlideDocument } from './editor-direct-edit.js';
import { pushSnapshot } from './editor-history.js';
import { currentSlideFile } from './editor-utils.js';

function slideScale() {
  const rect = drawLayer.getBoundingClientRect();
  if (!rect.width) return 1;
  return rect.width / SLIDE_W;
}

function parsePx(value) {
  if (!value) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Promote an image to position:absolute, anchored to <body>, with explicit px
 * rect taken from its current layout. Reparenting to <body> guarantees that
 * inline left/top values are interpreted against the slide's own coordinate
 * origin (not whichever positioned ancestor the image happened to live in).
 */
export function ensureAbsolutePositioning(img) {
  const doc = slideIframe.contentDocument;
  if (!doc || !img || !doc.body) return { x: 0, y: 0, w: 0, h: 0 };

  const bodyRect = doc.body.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();
  const x = imgRect.left - bodyRect.left;
  const y = imgRect.top - bodyRect.top;
  const w = imgRect.width;
  const h = imgRect.height;

  const frameWindow = slideIframe.contentWindow;
  const computed = frameWindow?.getComputedStyle(img);
  const alreadyAbsoluteOnBody = computed?.position === 'absolute' && img.parentElement === doc.body;

  if (!alreadyAbsoluteOnBody && img.parentElement !== doc.body) {
    doc.body.appendChild(img);
  }

  img.style.position = 'absolute';
  img.style.left = `${Math.round(x)}px`;
  img.style.top = `${Math.round(y)}px`;
  img.style.width = `${Math.round(w)}px`;
  img.style.height = `${Math.round(h)}px`;
  img.style.margin = '0';
  img.style.maxWidth = 'none';
  img.style.maxHeight = 'none';

  return { x, y, w, h };
}

export function readImageRect(img) {
  if (!img) return { x: 0, y: 0, w: 0, h: 0 };
  const doc = slideIframe.contentDocument;
  const imgRect = img.getBoundingClientRect();
  const bodyRect = doc?.body ? doc.body.getBoundingClientRect() : { left: 0, top: 0 };
  return {
    x: imgRect.left - bodyRect.left,
    y: imgRect.top - bodyRect.top,
    w: imgRect.width,
    h: imgRect.height,
  };
}

function clampRect(rect) {
  const x = Math.max(0, Math.min(rect.x, SLIDE_W - 10));
  const y = Math.max(0, Math.min(rect.y, SLIDE_H - 10));
  const w = Math.max(20, Math.min(rect.w, SLIDE_W - x));
  const h = Math.max(20, Math.min(rect.h, SLIDE_H - y));
  return { x, y, w, h };
}

function applyRect(img, rect) {
  const r = clampRect(rect);
  img.style.left = `${Math.round(r.x)}px`;
  img.style.top = `${Math.round(r.y)}px`;
  img.style.width = `${Math.round(r.w)}px`;
  img.style.height = `${Math.round(r.h)}px`;
}

/**
 * Begin a drag or resize operation.
 * @param {MouseEvent} startEvent
 * @param {HTMLImageElement} img
 * @param {'move'|'nw'|'ne'|'sw'|'se'} mode
 * @param {() => void} onUpdate — called on each mousemove (for re-sync of handles)
 */
export function beginImageInteraction(startEvent, img, mode, onUpdate) {
  if (!img) return;
  startEvent.preventDefault();
  startEvent.stopPropagation();

  ensureAbsolutePositioning(img);

  const scale = slideScale() || 1;
  const start = readImageRect(img);
  const aspect = start.w > 0 && start.h > 0 ? start.w / start.h : 1;
  const startX = startEvent.clientX;
  const startY = startEvent.clientY;
  const shiftHeld = () => !startEvent.shiftKey; // aspect locked by default; release with Shift

  const move = (event) => {
    const dx = (event.clientX - startX) / scale;
    const dy = (event.clientY - startY) / scale;

    if (mode === 'move') {
      applyRect(img, { x: start.x + dx, y: start.y + dy, w: start.w, h: start.h });
    } else {
      let { x, y, w, h } = start;
      if (mode === 'se') { w = start.w + dx; h = start.h + dy; }
      else if (mode === 'sw') { x = start.x + dx; w = start.w - dx; h = start.h + dy; }
      else if (mode === 'ne') { y = start.y + dy; w = start.w + dx; h = start.h - dy; }
      else if (mode === 'nw') { x = start.x + dx; y = start.y + dy; w = start.w - dx; h = start.h - dy; }

      if (shiftHeld() && !event.shiftKey) {
        // Keep aspect. Prefer dominant axis change.
        if (Math.abs(dx) > Math.abs(dy)) {
          const newH = w / aspect;
          if (mode === 'nw' || mode === 'ne') y = start.y + (start.h - newH);
          h = newH;
        } else {
          const newW = h * aspect;
          if (mode === 'nw' || mode === 'sw') x = start.x + (start.w - newW);
          w = newW;
        }
      }
      applyRect(img, { x, y, w, h });
    }
    if (onUpdate) onUpdate();
  };

  const up = () => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    const slide = currentSlideFile();
    const html = serializeSlideDocument(slideIframe.contentDocument);
    if (slide && html) pushSnapshot(slide, html);
    scheduleDirectSave(0, 'Image position/size updated and saved.');
    if (onUpdate) onUpdate();
  };

  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
}
