import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  generateNanoBananaImage,
  resolveNanoBananaApiKey,
  sanitizeAssetName,
  getExtensionFromMimeType,
} from '../../src/nano-banana.js';

// ── Constants ────────────────────────────────────────────────────────

const IMAGE_MARKER_RE = /^-\s*image-(search|generate):\s*(.+)/im;
const PROVIDER_TIMEOUT = 15_000; // 15s per provider
const TOTAL_TIMEOUT = 120_000;
const MIN_IMAGE_SIZE = 1024;

// ── Marker Parsing ───────────────────────────────────────────────────

export function extractImageMarkers(outline) {
  const markers = [];
  if (!outline?.slides) return markers;

  for (let i = 0; i < outline.slides.length; i++) {
    const slide = outline.slides[i];
    const lines = (slide.rawBlock || '').split('\n');
    for (const line of lines) {
      const match = line.match(IMAGE_MARKER_RE);
      if (!match) continue;
      markers.push({
        slideNumber: i + 1,
        markerType: match[1],
        query: match[2].trim(),
        slideTitle: slide.title || `Slide ${i + 1}`,
      });
    }
  }
  return markers;
}

// ── Asset Name ───────────────────────────────────────────────────────

function buildAssetName(slideNumber, query) {
  return `slide-${String(slideNumber).padStart(2, '0')}-${sanitizeAssetName(query, 60)}`;
}

// ── Fetch with timeout helper ────────────────────────────────────────

async function fetchWithTimeout(url, options = {}, timeout = PROVIDER_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ── 1) Unsplash Search ──────────────────────────────────────────────

async function searchUnsplash(query, accessKey) {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('orientation', 'landscape');

  const res = await fetchWithTimeout(url.toString(), {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const photo = data?.results?.[0];
  if (!photo?.urls?.regular) return null;

  const imgRes = await fetchWithTimeout(photo.urls.regular);
  if (!imgRes.ok) return null;

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  if (buffer.length < MIN_IMAGE_SIZE) return null;

  return { bytes: buffer, mimeType: 'image/jpeg', source: 'unsplash' };
}

// ── 2) Nano Banana (AI Generation) ──────────────────────────────────

async function generateWithNanoBanana(query, markerType, apiKey, provider) {
  const promptPrefix = markerType === 'search'
    ? 'Realistic high-quality photograph for a presentation slide: '
    : '';

  const generated = await generateNanoBananaImage({
    prompt: promptPrefix + query,
    apiKey,
    provider,
    aspectRatio: '16:9',
    imageSize: '2K',
  });

  return { bytes: generated.bytes, mimeType: generated.mimeType, source: 'nano-banana', usage: generated.usage };
}

// ── Single Image Acquisition (marker-driven routing) ────────────────

async function acquireOneImage({ marker, keys, tracker }) {
  const errors = [];

  // Route A: search markers try Unsplash first
  if (marker.markerType === 'search' && keys.unsplash) {
    try {
      const result = await searchUnsplash(marker.query, keys.unsplash);
      if (result) return { ...result, marker, errors };
    } catch (err) {
      errors.push(`unsplash: ${err.message}`);
    }
  }

  // Both routes fall through to Nano Banana (realistic prefix for search, raw for generate)
  if (keys.nanoBanana) {
    const model = 'gemini-3-pro-image-preview';
    const callId = tracker?.startCall('image', model, { promptChars: marker.query.length });
    try {
      const result = await generateWithNanoBanana(
        marker.query, marker.markerType,
        keys.nanoBanana.apiKey, keys.nanoBanana.provider,
      );
      tracker?.finishCall(callId, {
        inputTokens: result.usage?.inputTokens ?? null,
        outputTokens: result.usage?.outputTokens ?? null,
        promptChars: marker.query.length,
        success: true,
      });
      if (result) return { ...result, marker, errors };
    } catch (err) {
      tracker?.finishCall(callId, { success: false });
      errors.push(`nano-banana: ${err.message}`);
    }
  }

  return null;
}

// ── Concurrency Limiter ─────────────────────────────────────────────

async function runWithConcurrency(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = task().then(
      (r) => { executing.delete(p); return { status: 'fulfilled', value: r }; },
      (e) => { executing.delete(p); return { status: 'rejected', reason: e }; },
    );
    executing.add(p);
    results.push(p);
    if (executing.size >= limit) await Promise.race(executing);
  }

  return Promise.all(results);
}

// ── Main: Prepare All Images ────────────────────────────────────────

export async function prepareImages({ markers, slidesDir, onProgress, concurrency = 3, tracker }) {
  if (!markers || markers.length === 0) return { assets: [], failures: [] };

  const keys = {
    unsplash: (process.env.UNSPLASH_ACCESS_KEY || '').trim() || null,
    nanoBanana: null,
  };
  const nbKey = resolveNanoBananaApiKey();
  if (nbKey.apiKey) keys.nanoBanana = nbKey;

  if (!keys.unsplash && !keys.nanoBanana) {
    return { assets: [], failures: markers.map((m) => ({ ...m, error: 'No API keys available' })) };
  }

  const resolvedSlidesDir = resolve(slidesDir);
  const assetsDir = join(resolvedSlidesDir, 'assets');
  await mkdir(assetsDir, { recursive: true });

  // Build all tasks, collect results after completion
  const globalTimer = setTimeout(() => {}, TOTAL_TIMEOUT);
  const globalStart = Date.now();
  let completed = 0;

  const tasks = markers.map((marker, idx) => async () => {
    if (Date.now() - globalStart > TOTAL_TIMEOUT) return null;

    onProgress?.(idx + 1, markers.length, marker.query);

    const result = await acquireOneImage({ marker, keys, tracker });
    completed++;

    if (!result) {
      onProgress?.(completed, markers.length, `Failed: ${marker.query}`);
      return { type: 'failure', marker, error: 'All providers failed' };
    }

    const ext = getExtensionFromMimeType(result.mimeType);
    const filename = `${buildAssetName(marker.slideNumber, marker.query)}${ext}`;
    const outputPath = join(assetsDir, filename);
    await writeFile(outputPath, result.bytes);

    const asset = {
      slideNumber: marker.slideNumber,
      query: marker.query,
      relativeRef: `./assets/${filename}`,
      filename,
      source: result.source,
    };
    onProgress?.(completed, markers.length, `Done: ${marker.query} (${result.source})`);
    return { type: 'asset', value: asset };
  });

  const settled = await runWithConcurrency(tasks, concurrency);
  clearTimeout(globalTimer);

  const assets = [];
  const failures = [];
  for (const r of settled) {
    if (r.status !== 'fulfilled' || !r.value) continue;
    if (r.value.type === 'asset') assets.push(r.value.value);
    else if (r.value.type === 'failure') failures.push({ ...r.value.marker, error: r.value.error });
  }

  return { assets, failures };
}
