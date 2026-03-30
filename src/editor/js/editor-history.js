// editor-history.js — Per-slide HTML snapshot history for undo/redo

const MAX_HISTORY = 50;

/** @type {Map<string, { stack: string[], index: number }>} */
const historyBySlide = new Map();

function getHistory(slide) {
  if (!historyBySlide.has(slide)) {
    historyBySlide.set(slide, { stack: [], index: -1 });
  }
  return historyBySlide.get(slide);
}

/**
 * Push a new HTML snapshot for the given slide.
 * Truncates any redo entries beyond the current index.
 * @param {string} slide
 * @param {string} html
 */
export function pushSnapshot(slide, html) {
  if (!slide || !html) return;
  const h = getHistory(slide);
  // Drop any forward history
  h.stack = h.stack.slice(0, h.index + 1);
  h.stack.push(html);
  // Trim to max
  if (h.stack.length > MAX_HISTORY) {
    h.stack = h.stack.slice(h.stack.length - MAX_HISTORY);
  }
  h.index = h.stack.length - 1;
}

/**
 * Undo: move back one snapshot.
 * @param {string} slide
 * @returns {string|null} the HTML to restore, or null if nothing to undo
 */
export function undo(slide) {
  if (!slide) return null;
  const h = getHistory(slide);
  if (h.index <= 0) return null;
  h.index -= 1;
  return h.stack[h.index];
}

/**
 * Redo: move forward one snapshot.
 * @param {string} slide
 * @returns {string|null} the HTML to restore, or null if nothing to redo
 */
export function redo(slide) {
  if (!slide) return null;
  const h = getHistory(slide);
  if (h.index >= h.stack.length - 1) return null;
  h.index += 1;
  return h.stack[h.index];
}

/**
 * @param {string} slide
 * @returns {boolean}
 */
export function canUndo(slide) {
  if (!slide) return false;
  const h = getHistory(slide);
  return h.index > 0;
}

/**
 * @param {string} slide
 * @returns {boolean}
 */
export function canRedo(slide) {
  if (!slide) return false;
  const h = getHistory(slide);
  return h.index < h.stack.length - 1;
}

/**
 * Clear history for a slide (e.g. after navigation).
 * @param {string} slide
 */
export function clearHistory(slide) {
  historyBySlide.delete(slide);
}
