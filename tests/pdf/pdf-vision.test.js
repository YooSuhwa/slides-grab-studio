import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { PDFDocument, rgb } from 'pdf-lib';

import { renderPdfPages } from '../../src/pdf-vision.js';
import { parsePdfWithVision } from '../../src/parsers.js';

/** Create a minimal multi-page PDF with text for testing. */
async function createTestPdf(pageCount = 3) {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([612, 792]); // Letter size
    page.drawText(`Page ${i} content`, { x: 50, y: 700, size: 24, color: rgb(0, 0, 0) });
    page.drawRectangle({ x: 100, y: 400, width: 200, height: 100, color: rgb(0.2, 0.4, 0.8) });
  }
  return Buffer.from(await doc.save());
}

test('renderPdfPages produces PNG files for each page', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'pdf-vision-test-'));
  try {
    const pdfBuffer = await createTestPdf(3);
    const result = await renderPdfPages(pdfBuffer, tmpDir);

    assert.equal(result.totalPages, 3);
    assert.equal(result.renderedPages, 3);
    assert.equal(result.pageImages.length, 3);

    // Verify files exist and are non-empty PNGs
    for (const imgPath of result.pageImages) {
      const s = await stat(imgPath);
      assert.ok(s.size > 0, `Image file ${imgPath} should be non-empty`);
      assert.ok(imgPath.endsWith('.png'), `Image file should be PNG: ${imgPath}`);
    }

    // Verify naming convention
    const files = await readdir(tmpDir);
    assert.ok(files.includes('page-01.png'));
    assert.ok(files.includes('page-02.png'));
    assert.ok(files.includes('page-03.png'));
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('renderPdfPages respects maxPages limit', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'pdf-vision-test-'));
  try {
    const pdfBuffer = await createTestPdf(5);
    const result = await renderPdfPages(pdfBuffer, tmpDir, { maxPages: 2 });

    assert.equal(result.totalPages, 5);
    assert.equal(result.renderedPages, 2);
    assert.equal(result.pageImages.length, 2);

    const files = await readdir(tmpDir);
    assert.equal(files.length, 2);
    assert.ok(files.includes('page-01.png'));
    assert.ok(files.includes('page-02.png'));
    assert.ok(!files.includes('page-03.png'));
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('parsePdfWithVision returns both text and page images', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'pdf-vision-test-'));
  try {
    const pdfBuffer = await createTestPdf(2);
    const result = await parsePdfWithVision(pdfBuffer, tmpDir);

    // Text extraction
    assert.ok(typeof result.text === 'string');
    assert.equal(result.pages, 2);

    // Vision rendering
    assert.equal(result.pageImages.length, 2);
    assert.equal(result.totalPages, 2);
    assert.equal(result.renderedPages, 2);

    for (const imgPath of result.pageImages) {
      const s = await stat(imgPath);
      assert.ok(s.size > 0);
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('renderPdfPages with single page PDF', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'pdf-vision-test-'));
  try {
    const pdfBuffer = await createTestPdf(1);
    const result = await renderPdfPages(pdfBuffer, tmpDir);

    assert.equal(result.totalPages, 1);
    assert.equal(result.renderedPages, 1);
    assert.equal(result.pageImages.length, 1);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});
