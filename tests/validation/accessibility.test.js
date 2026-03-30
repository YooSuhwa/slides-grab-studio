import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseRgbColor,
  linearize,
  relativeLuminance,
  contrastRatio,
  isLargeText,
} from '../../src/validation/core.js';

describe('parseRgbColor', () => {
  it('parses rgb()', () => {
    assert.deepEqual(parseRgbColor('rgb(255, 0, 0)'), { r: 255, g: 0, b: 0 });
  });

  it('parses rgba()', () => {
    assert.deepEqual(parseRgbColor('rgba(0, 128, 255, 0.5)'), { r: 0, g: 128, b: 255 });
  });

  it('parses rgb() without spaces', () => {
    assert.deepEqual(parseRgbColor('rgb(10,20,30)'), { r: 10, g: 20, b: 30 });
  });

  it('returns null for hex colors', () => {
    assert.equal(parseRgbColor('#ff0000'), null);
  });

  it('returns null for color names', () => {
    assert.equal(parseRgbColor('red'), null);
  });

  it('returns null for empty string', () => {
    assert.equal(parseRgbColor(''), null);
  });
});

describe('linearize', () => {
  it('returns 0 for black channel (0)', () => {
    assert.equal(linearize(0), 0);
  });

  it('returns ~1 for white channel (255)', () => {
    assert.ok(Math.abs(linearize(255) - 1) < 0.001);
  });

  it('uses linear segment for low values (<=0.04045 threshold)', () => {
    // channel 10 → s = 10/255 ≈ 0.0392, which is <= 0.04045
    const result = linearize(10);
    const expected = (10 / 255) / 12.92;
    assert.ok(Math.abs(result - expected) < 0.0001);
  });

  it('uses gamma curve for high values', () => {
    // channel 200 → s = 200/255 ≈ 0.784, which is > 0.04045
    const result = linearize(200);
    const s = 200 / 255;
    const expected = Math.pow((s + 0.055) / 1.055, 2.4);
    assert.ok(Math.abs(result - expected) < 0.0001);
  });
});

describe('relativeLuminance', () => {
  it('returns 0 for black', () => {
    assert.equal(relativeLuminance({ r: 0, g: 0, b: 0 }), 0);
  });

  it('returns ~1 for white', () => {
    assert.ok(Math.abs(relativeLuminance({ r: 255, g: 255, b: 255 }) - 1) < 0.001);
  });

  it('returns a value between 0 and 1 for mid-gray', () => {
    const lum = relativeLuminance({ r: 128, g: 128, b: 128 });
    assert.ok(lum > 0 && lum < 1);
  });
});

describe('contrastRatio', () => {
  it('returns 1 for identical luminances (white on white)', () => {
    const wL = relativeLuminance({ r: 255, g: 255, b: 255 });
    assert.equal(contrastRatio(wL, wL), 1);
  });

  it('returns 1 for black on black', () => {
    const bL = relativeLuminance({ r: 0, g: 0, b: 0 });
    assert.equal(contrastRatio(bL, bL), 1);
  });

  it('returns ~21 for black on white', () => {
    const wL = relativeLuminance({ r: 255, g: 255, b: 255 });
    const bL = relativeLuminance({ r: 0, g: 0, b: 0 });
    assert.ok(Math.abs(contrastRatio(wL, bL) - 21) < 0.1);
  });

  it('is symmetric — order of arguments does not matter', () => {
    const l1 = relativeLuminance({ r: 100, g: 100, b: 100 });
    const l2 = relativeLuminance({ r: 200, g: 200, b: 200 });
    assert.equal(contrastRatio(l1, l2), contrastRatio(l2, l1));
  });

  it('returns a value >= 1 always', () => {
    const l1 = relativeLuminance({ r: 50, g: 100, b: 150 });
    const l2 = relativeLuminance({ r: 200, g: 220, b: 240 });
    assert.ok(contrastRatio(l1, l2) >= 1);
  });
});

describe('isLargeText', () => {
  it('returns true for 24px normal weight text', () => {
    assert.equal(isLargeText(24, '400'), true);
  });

  it('returns false for 23px normal weight text', () => {
    assert.equal(isLargeText(23, '400'), false);
  });

  it('returns true for 18.67px bold (700) text', () => {
    assert.equal(isLargeText(18.67, '700'), true);
  });

  it('returns false for 18px normal weight text', () => {
    assert.equal(isLargeText(18, '400'), false);
  });

  it('returns true for large bold text', () => {
    assert.equal(isLargeText(32, '900'), true);
  });

  it('returns false for 18.66px bold text (just under threshold)', () => {
    assert.equal(isLargeText(18.66, '700'), false);
  });

  it('treats numeric fontWeight 700 as bold', () => {
    assert.equal(isLargeText(18.67, 700), true);
  });

  it('treats fontWeight "bold" string as non-bold (NaN < 700)', () => {
    // "bold" → Number("bold") = NaN → NaN >= 700 is false
    assert.equal(isLargeText(18.67, 'bold'), false);
  });
});
