import assert from 'node:assert/strict';
import test from 'node:test';

import {
  pushSnapshot,
  undo,
  redo,
  canUndo,
  canRedo,
  clearHistory,
  setRestoring,
  isRestoring,
} from '../../src/editor/js/editor-history.js';

const SLIDE = 'test-slide.html';

// Helper to reset history between tests
function reset() {
  clearHistory(SLIDE);
}

test('canUndo and canRedo return false for empty history', () => {
  reset();
  assert.equal(canUndo(SLIDE), false);
  assert.equal(canRedo(SLIDE), false);
});

test('undo and redo return null for empty history', () => {
  reset();
  assert.equal(undo(SLIDE), null);
  assert.equal(redo(SLIDE), null);
});

test('pushSnapshot enables canUndo after two pushes', () => {
  reset();
  pushSnapshot(SLIDE, '<html>state1</html>');
  assert.equal(canUndo(SLIDE), false, 'only one snapshot, cannot undo');
  pushSnapshot(SLIDE, '<html>state2</html>');
  assert.equal(canUndo(SLIDE), true);
});

test('undo returns previous snapshot', () => {
  reset();
  pushSnapshot(SLIDE, '<html>state1</html>');
  pushSnapshot(SLIDE, '<html>state2</html>');
  const prev = undo(SLIDE);
  assert.equal(prev, '<html>state1</html>');
});

test('redo returns next snapshot after undo', () => {
  reset();
  pushSnapshot(SLIDE, '<html>state1</html>');
  pushSnapshot(SLIDE, '<html>state2</html>');
  undo(SLIDE);
  assert.equal(canRedo(SLIDE), true);
  const next = redo(SLIDE);
  assert.equal(next, '<html>state2</html>');
});

test('undo at oldest entry returns null', () => {
  reset();
  pushSnapshot(SLIDE, '<html>state1</html>');
  pushSnapshot(SLIDE, '<html>state2</html>');
  undo(SLIDE);
  assert.equal(undo(SLIDE), null);
});

test('redo at newest entry returns null', () => {
  reset();
  pushSnapshot(SLIDE, '<html>state1</html>');
  pushSnapshot(SLIDE, '<html>state2</html>');
  assert.equal(redo(SLIDE), null);
});

test('pushSnapshot after undo clears redo history', () => {
  reset();
  pushSnapshot(SLIDE, '<html>state1</html>');
  pushSnapshot(SLIDE, '<html>state2</html>');
  undo(SLIDE);
  pushSnapshot(SLIDE, '<html>state3</html>');
  assert.equal(canRedo(SLIDE), false);
  // undo should bring back state1
  const prev = undo(SLIDE);
  assert.equal(prev, '<html>state1</html>');
});

test('history is per-slide and independent', () => {
  const slide2 = 'other-slide.html';
  clearHistory(SLIDE);
  clearHistory(slide2);

  pushSnapshot(SLIDE, '<html>A1</html>');
  pushSnapshot(SLIDE, '<html>A2</html>');
  pushSnapshot(slide2, '<html>B1</html>');

  assert.equal(canUndo(SLIDE), true);
  assert.equal(canUndo(slide2), false);

  const undoneA = undo(SLIDE);
  assert.equal(undoneA, '<html>A1</html>');
  assert.equal(undo(slide2), null);

  clearHistory(slide2);
});

test('handles null/empty slide gracefully', () => {
  assert.equal(pushSnapshot(null, '<html>x</html>'), undefined);
  assert.equal(undo(null), null);
  assert.equal(redo(null), null);
  assert.equal(canUndo(null), false);
  assert.equal(canRedo(null), false);
});

test('handles empty html gracefully', () => {
  reset();
  pushSnapshot(SLIDE, '');
  // Nothing pushed — still no undo available
  assert.equal(canUndo(SLIDE), false);
});

test('MAX_HISTORY cap: only keeps last 50 snapshots', () => {
  reset();
  for (let i = 0; i < 55; i++) {
    pushSnapshot(SLIDE, `<html>state${i}</html>`);
  }
  // Should be able to undo 49 times (50 snapshots, index at 49)
  let undoCount = 0;
  while (canUndo(SLIDE)) {
    undo(SLIDE);
    undoCount += 1;
  }
  assert.equal(undoCount, 49);
});

test('clearHistory resets state', () => {
  reset();
  pushSnapshot(SLIDE, '<html>state1</html>');
  pushSnapshot(SLIDE, '<html>state2</html>');
  clearHistory(SLIDE);
  assert.equal(canUndo(SLIDE), false);
  assert.equal(canRedo(SLIDE), false);
  assert.equal(undo(SLIDE), null);
});

test('pushSnapshot is suppressed while restoring', () => {
  reset();
  pushSnapshot(SLIDE, '<html>state1</html>');
  pushSnapshot(SLIDE, '<html>state2</html>');
  assert.equal(canUndo(SLIDE), true);

  setRestoring(true);
  assert.equal(isRestoring(), true);
  pushSnapshot(SLIDE, '<html>should-be-ignored</html>');
  setRestoring(false);

  // Only state1 and state2 should be in the stack
  const prev = undo(SLIDE);
  assert.equal(prev, '<html>state1</html>');
  assert.equal(undo(SLIDE), null);
});
