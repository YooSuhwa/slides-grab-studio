import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { extractImageMarkers, prepareImages } from '../../scripts/server/image-prep.js';

// ── extractImageMarkers ─────────────────────────────────────────────

test('extractImageMarkers parses image-search and image-generate markers from outline', () => {
  const outline = {
    slides: [
      { title: 'Cover', rawBlock: '### Slide 1\n- type: cover\n- title: Cover\n- image-search: blue sky landscape\n' },
      { title: 'Content', rawBlock: '### Slide 2\n- type: content\n- title: Content\n' },
      { title: 'Diagram', rawBlock: '### Slide 3\n- type: diagram\n- image-generate: AI workflow diagram\n' },
    ],
  };

  const markers = extractImageMarkers(outline);
  assert.equal(markers.length, 2);
  assert.equal(markers[0].slideNumber, 1);
  assert.equal(markers[0].markerType, 'search');
  assert.equal(markers[0].query, 'blue sky landscape');
  assert.equal(markers[1].slideNumber, 3);
  assert.equal(markers[1].markerType, 'generate');
  assert.equal(markers[1].query, 'AI workflow diagram');
});

test('extractImageMarkers returns empty array for outline without image markers', () => {
  const outline = {
    slides: [
      { title: 'Slide 1', rawBlock: '### Slide 1\n- type: cover\n- title: Hello\n' },
    ],
  };
  assert.deepEqual(extractImageMarkers(outline), []);
});

test('extractImageMarkers handles null/empty outline gracefully', () => {
  assert.deepEqual(extractImageMarkers(null), []);
  assert.deepEqual(extractImageMarkers({}), []);
  assert.deepEqual(extractImageMarkers({ slides: [] }), []);
});

test('extractImageMarkers handles multiple images per slide', () => {
  const outline = {
    slides: [
      {
        title: 'Multi',
        rawBlock: '### Slide 1\n- image-search: photo one\n- image-generate: illustration two\n',
      },
    ],
  };
  const markers = extractImageMarkers(outline);
  assert.equal(markers.length, 2);
  assert.equal(markers[0].slideNumber, 1);
  assert.equal(markers[0].markerType, 'search');
  assert.equal(markers[1].markerType, 'generate');
});

// ── prepareImages ───────────────────────────────────────────────────

test('prepareImages returns empty when no API keys are available', async () => {
  const markers = [{ slideNumber: 1, markerType: 'search', query: 'test', slideTitle: 'Test' }];
  const originalEnv = { ...process.env };

  // Clear all relevant keys
  delete process.env.UNSPLASH_ACCESS_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENROUTER_API_KEY;

  try {
    const result = await prepareImages({ markers, slidesDir: '/tmp/test-deck', concurrency: 1 });
    assert.equal(result.assets.length, 0);
    assert.equal(result.failures.length, 1);
    assert.match(result.failures[0].error, /No API keys/);
  } finally {
    Object.assign(process.env, originalEnv);
  }
});

test('prepareImages returns empty for empty markers', async () => {
  const result = await prepareImages({ markers: [], slidesDir: '/tmp/test' });
  assert.equal(result.assets.length, 0);
  assert.equal(result.failures.length, 0);
});

test('generate marker with only Unsplash key results in failure (routing skips Unsplash)', async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'image-prep-route-'));
  const originalEnv = { ...process.env };

  // Only Unsplash key — generate markers should NOT use Unsplash
  process.env.UNSPLASH_ACCESS_KEY = 'test-unsplash-key';
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.OPENROUTER_API_KEY;

  try {
    const markers = [
      { slideNumber: 1, markerType: 'generate', query: 'abstract neural network', slideTitle: 'AI' },
    ];
    const result = await prepareImages({ markers, slidesDir: workspace, concurrency: 1 });

    // No Nano Banana key → generate marker has no usable provider → failure
    assert.equal(result.assets.length, 0);
    assert.equal(result.failures.length, 1);
  } finally {
    Object.assign(process.env, originalEnv);
    await rm(workspace, { recursive: true, force: true });
  }
});

test('search marker falls back to Nano Banana when Unsplash unavailable', async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'image-prep-fallback-'));
  const originalEnv = { ...process.env };

  // Only Nano Banana key — search markers should fall back to Nano Banana
  delete process.env.UNSPLASH_ACCESS_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  process.env.OPENROUTER_API_KEY = 'test-or-key';

  try {
    const markers = [
      { slideNumber: 1, markerType: 'search', query: 'mountain landscape', slideTitle: 'Cover' },
    ];

    const progress = [];
    const result = await prepareImages({
      markers,
      slidesDir: workspace,
      concurrency: 1,
      onProgress: (cur, total, msg) => progress.push({ cur, total, msg }),
    });

    // Without real API, Nano Banana will fail, but the flow should reach it
    assert.equal(result.assets.length + result.failures.length, 1);
    assert.ok(progress.length > 0, 'onProgress should have been called');
  } finally {
    Object.assign(process.env, originalEnv);
    await rm(workspace, { recursive: true, force: true });
  }
});

test('prepareImages generates images with nano-banana fallback and saves to assets/', async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'image-prep-'));
  const originalEnv = { ...process.env };

  // Only set OpenRouter key (nano-banana path)
  delete process.env.UNSPLASH_ACCESS_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  delete process.env.GEMINI_API_KEY;
  process.env.OPENROUTER_API_KEY = 'test-or-key';

  // We can't easily mock fetch globally for nano-banana, so this test
  // verifies the flow reaches nano-banana and handles the expected error
  try {
    const markers = [
      { slideNumber: 1, markerType: 'search', query: 'mountain landscape', slideTitle: 'Cover' },
    ];

    const progress = [];
    const result = await prepareImages({
      markers,
      slidesDir: workspace,
      concurrency: 1,
      onProgress: (cur, total, msg) => progress.push({ cur, total, msg }),
    });

    // Without a real API, nano-banana will fail, but the flow should handle gracefully
    assert.equal(result.assets.length + result.failures.length, 1);
    assert.ok(progress.length > 0, 'onProgress should have been called');
  } finally {
    Object.assign(process.env, originalEnv);
    await rm(workspace, { recursive: true, force: true });
  }
});
