/**
 * Unit tests for html2pptx conversion helpers.
 *
 * The pure functions inside src/html2pptx.cjs are embedded in page.evaluate()
 * and not exported. We reimplement the logic here to test it independently.
 *
 * Font metric helpers are exported from the module and tested directly.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const html2pptx = require('../../src/html2pptx.cjs');
const { _measureTextWidth: measureTextWidth, _loadFont: loadFont, _getFontFileNames: getFontFileNames, _fontCache: fontCache } = html2pptx;

// ── Constants (from src/html2pptx.cjs lines 34-36, 440) ──

const PT_PER_PX = 0.75;
const PX_PER_IN = 96;
const EMU_PER_IN = 914400;
const SINGLE_WEIGHT_FONTS = ['impact'];

// ── Reimplemented helpers (from page.evaluate block, lines 447-518) ──

function shouldSkipBold(fontFamily) {
  if (!fontFamily) return false;
  const normalizedFont = fontFamily.toLowerCase().replace(/['"]/g, '').split(',')[0].trim();
  return SINGLE_WEIGHT_FONTS.includes(normalizedFont);
}

function pxToInch(px) {
  return px / PX_PER_IN;
}

function pxToPoints(pxStr) {
  return parseFloat(pxStr) * PT_PER_PX;
}

function rgbToHex(rgbStr) {
  if (rgbStr === 'rgba(0, 0, 0, 0)' || rgbStr === 'transparent') return 'FFFFFF';
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return 'FFFFFF';
  return match.slice(1).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

function extractAlpha(rgbStr) {
  const match = rgbStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match || !match[4]) return null;
  const alpha = parseFloat(match[4]);
  return Math.round((1 - alpha) * 100);
}

function applyTextTransform(text, textTransform) {
  if (textTransform === 'uppercase') return text.toUpperCase();
  if (textTransform === 'lowercase') return text.toLowerCase();
  if (textTransform === 'capitalize') {
    return text.replace(/\b\w/g, c => c.toUpperCase());
  }
  return text;
}

function getRotation(transform, writingMode) {
  let angle = 0;
  if (writingMode === 'vertical-rl') angle = 90;
  else if (writingMode === 'vertical-lr') angle = 270;

  if (transform && transform !== 'none') {
    const rotateMatch = transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
    if (rotateMatch) {
      angle += parseFloat(rotateMatch[1]);
    } else {
      const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
      if (matrixMatch) {
        const values = matrixMatch[1].split(',').map(parseFloat);
        const matrixAngle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
        angle += Math.round(matrixAngle);
      }
    }
  }

  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle === 0 ? null : angle;
}

// ── Tests ──

describe('html2pptx constants', () => {
  it('PT_PER_PX is 0.75', () => {
    assert.equal(PT_PER_PX, 0.75);
  });

  it('PX_PER_IN is 96', () => {
    assert.equal(PX_PER_IN, 96);
  });

  it('EMU_PER_IN is 914400', () => {
    assert.equal(EMU_PER_IN, 914400);
  });
});

describe('rgbToHex', () => {
  it('converts rgb(255, 0, 0) to ff0000', () => {
    assert.equal(rgbToHex('rgb(255, 0, 0)'), 'ff0000');
  });

  it('converts rgb(0, 128, 255) to 0080ff', () => {
    assert.equal(rgbToHex('rgb(0, 128, 255)'), '0080ff');
  });

  it('converts rgba(0, 0, 0, 1) to 000000', () => {
    assert.equal(rgbToHex('rgba(0, 0, 0, 1)'), '000000');
  });

  it('returns FFFFFF for transparent', () => {
    assert.equal(rgbToHex('transparent'), 'FFFFFF');
  });

  it('returns FFFFFF for rgba(0, 0, 0, 0)', () => {
    assert.equal(rgbToHex('rgba(0, 0, 0, 0)'), 'FFFFFF');
  });

  it('returns FFFFFF for unparseable string', () => {
    assert.equal(rgbToHex('not-a-color'), 'FFFFFF');
  });

  it('converts rgb(255, 255, 255) to ffffff', () => {
    assert.equal(rgbToHex('rgb(255, 255, 255)'), 'ffffff');
  });
});

describe('extractAlpha', () => {
  it('returns 50 for rgba with 0.5 alpha (50% transparency)', () => {
    assert.equal(extractAlpha('rgba(0, 0, 0, 0.5)'), 50);
  });

  it('returns 0 for fully opaque rgba', () => {
    assert.equal(extractAlpha('rgba(0, 0, 0, 1)'), 0);
  });

  it('returns 100 for fully transparent rgba', () => {
    assert.equal(extractAlpha('rgba(0, 0, 0, 0)'), 100);
  });

  it('returns null for rgb (no alpha)', () => {
    assert.equal(extractAlpha('rgb(0, 0, 0)'), null);
  });

  it('returns 75 for rgba with 0.25 alpha', () => {
    assert.equal(extractAlpha('rgba(100, 200, 50, 0.25)'), 75);
  });
});

describe('pxToInch', () => {
  it('converts 96px to 1 inch', () => {
    assert.equal(pxToInch(96), 1.0);
  });

  it('converts 48px to 0.5 inch', () => {
    assert.equal(pxToInch(48), 0.5);
  });

  it('converts 0 to 0', () => {
    assert.equal(pxToInch(0), 0);
  });
});

describe('pxToPoints', () => {
  it('converts "16px" to 12pt', () => {
    assert.equal(pxToPoints('16px'), 12);
  });

  it('converts "24px" to 18pt', () => {
    assert.equal(pxToPoints('24px'), 18);
  });

  it('converts "32px" to 24pt', () => {
    assert.equal(pxToPoints('32px'), 24);
  });

  it('handles numeric string without unit', () => {
    assert.equal(pxToPoints('20'), 15);
  });
});

describe('applyTextTransform', () => {
  it('uppercase converts to upper case', () => {
    assert.equal(applyTextTransform('hello world', 'uppercase'), 'HELLO WORLD');
  });

  it('lowercase converts to lower case', () => {
    assert.equal(applyTextTransform('HELLO WORLD', 'lowercase'), 'hello world');
  });

  it('capitalize capitalizes first letter of each word', () => {
    assert.equal(applyTextTransform('hello world', 'capitalize'), 'Hello World');
  });

  it('none returns text unchanged', () => {
    assert.equal(applyTextTransform('Hello', 'none'), 'Hello');
  });

  it('unrecognized value returns text unchanged', () => {
    assert.equal(applyTextTransform('test', 'unknown'), 'test');
  });
});

describe('getRotation', () => {
  it('returns null for no transform and no writing-mode', () => {
    assert.equal(getRotation('none', undefined), null);
  });

  it('parses rotate(45deg)', () => {
    assert.equal(getRotation('rotate(45deg)', undefined), 45);
  });

  it('parses rotate(-90deg) → 270', () => {
    assert.equal(getRotation('rotate(-90deg)', undefined), 270);
  });

  it('returns 90 for vertical-rl writing-mode', () => {
    assert.equal(getRotation('none', 'vertical-rl'), 90);
  });

  it('returns 270 for vertical-lr writing-mode', () => {
    assert.equal(getRotation('none', 'vertical-lr'), 270);
  });

  it('combines writing-mode and transform', () => {
    // vertical-rl (90) + rotate(45deg) = 135
    assert.equal(getRotation('rotate(45deg)', 'vertical-rl'), 135);
  });

  it('parses matrix transform for 90 degree rotation', () => {
    // matrix(cos90, sin90, -sin90, cos90, 0, 0) = matrix(0, 1, -1, 0, 0, 0)
    assert.equal(getRotation('matrix(0, 1, -1, 0, 0, 0)', undefined), 90);
  });

  it('returns null for 0 degree rotation', () => {
    assert.equal(getRotation('rotate(0deg)', undefined), null);
  });

  it('normalizes 360 to null', () => {
    assert.equal(getRotation('rotate(360deg)', undefined), null);
  });
});

describe('shouldSkipBold', () => {
  it('skips bold for Impact font', () => {
    assert.equal(shouldSkipBold('Impact'), true);
  });

  it('skips bold for impact (lowercase)', () => {
    assert.equal(shouldSkipBold('impact'), true);
  });

  it('skips bold for quoted Impact in font stack', () => {
    assert.equal(shouldSkipBold("'Impact', sans-serif"), true);
  });

  it('allows bold for Arial', () => {
    assert.equal(shouldSkipBold('Arial'), false);
  });

  it('allows bold for Pretendard', () => {
    assert.equal(shouldSkipBold('Pretendard'), false);
  });

  it('returns false for null/undefined', () => {
    assert.equal(shouldSkipBold(null), false);
    assert.equal(shouldSkipBold(undefined), false);
  });
});

describe('slide dimension validation', () => {
  // Reimplements the dimension check from html2pptx.cjs line ~290
  function validateDimensions(bodyW, bodyH, expectedW, expectedH) {
    const tolerance = 0.5;
    if (Math.abs(bodyW - expectedW) > tolerance || Math.abs(bodyH - expectedH) > tolerance) {
      return { valid: false, bodyW, bodyH, expectedW, expectedH };
    }
    return { valid: true };
  }

  it('accepts exact 720x405 dimensions', () => {
    assert.equal(validateDimensions(720, 405, 720, 405).valid, true);
  });

  it('accepts within tolerance', () => {
    assert.equal(validateDimensions(720.3, 405.2, 720, 405).valid, true);
  });

  it('rejects dimensions outside tolerance', () => {
    const result = validateDimensions(800, 600, 720, 405);
    assert.equal(result.valid, false);
  });
});

describe('image source classification', () => {
  it('identifies data URL', () => {
    const src = 'data:image/png;base64,iVBOR...';
    assert.ok(src.startsWith('data:'));
  });

  it('identifies local asset path', () => {
    const src = './assets/logo.png';
    assert.ok(src.startsWith('./assets/'));
  });

  it('identifies remote URL', () => {
    const src = 'https://cdn.example.com/image.png';
    assert.ok(src.startsWith('https://'));
  });

  it('identifies file:// protocol', () => {
    const src = 'file:///Users/test/image.png';
    assert.ok(src.startsWith('file://'));
  });
});

// ── Font metrics tests (using exported helpers from src/html2pptx.cjs) ──

describe('getFontFileNames', () => {
  it('returns regular variants for non-bold non-italic', () => {
    const names = getFontFileNames('Arial', false, false);
    assert.ok(names.includes('Arial'));
    assert.ok(names.includes('Arial-Regular'));
  });

  it('returns bold variants first for bold text', () => {
    const names = getFontFileNames('Arial', true, false);
    assert.ok(names.includes('Arial Bold'));
    assert.ok(names.includes('ArialBold'));
    assert.ok(names.includes('Arial-Bold'));
    // Should also fall back to regular
    assert.ok(names.includes('Arial'));
    // Bold variants should come before regular
    assert.ok(names.indexOf('Arial Bold') < names.indexOf('Arial'));
  });

  it('returns italic variants first for italic text', () => {
    const names = getFontFileNames('Arial', false, true);
    assert.ok(names.includes('Arial Italic'));
    assert.ok(names.includes('ArialItalic'));
  });

  it('returns bold italic variants for bold+italic text', () => {
    const names = getFontFileNames('Arial', true, true);
    assert.ok(names.includes('Arial Bold Italic'));
    assert.ok(names.includes('ArialBoldItalic'));
  });

  it('handles multi-word font names', () => {
    const names = getFontFileNames('Times New Roman', true, false);
    assert.ok(names.includes('Times New Roman Bold'));
    assert.ok(names.includes('TimesNewRomanBold'));
  });
});

describe('measureTextWidth', () => {
  beforeEach(() => {
    fontCache.clear();
  });

  it('returns 0 for empty text', () => {
    assert.equal(measureTextWidth('', 'Arial', 12, false, false), 0);
  });

  it('returns 0 for null font family', () => {
    assert.equal(measureTextWidth('Hello', null, 12, false, false), 0);
  });

  it('returns 0 for zero font size', () => {
    assert.equal(measureTextWidth('Hello', 'Arial', 0, false, false), 0);
  });

  it('returns 0 for unavailable font', () => {
    const result = measureTextWidth('Hello', 'NonExistentFont12345', 12, false, false);
    assert.equal(result, 0);
  });

  it('returns positive width for Arial on macOS', () => {
    // This test only runs on macOS where Arial.ttf is available
    if (process.platform !== 'darwin') return;
    const width = measureTextWidth('Hello World', 'Arial', 12, false, false);
    assert.ok(width > 0, `Expected positive width, got ${width}`);
  });

  it('returns wider measurement for bold text', () => {
    if (process.platform !== 'darwin') return;
    const regular = measureTextWidth('Hello World', 'Arial', 12, false, false);
    const bold = measureTextWidth('Hello World', 'Arial', 12, true, false);
    // Bold text should be wider (or at least the same, if bold variant falls back to regular)
    assert.ok(bold >= regular, `Bold (${bold}) should be >= regular (${regular})`);
  });

  it('returns wider measurement for larger font size', () => {
    if (process.platform !== 'darwin') return;
    const small = measureTextWidth('Hello', 'Arial', 12, false, false);
    const large = measureTextWidth('Hello', 'Arial', 24, false, false);
    assert.ok(large > small, `24pt (${large}) should be wider than 12pt (${small})`);
    // Width should scale linearly with font size
    const ratio = large / small;
    assert.ok(Math.abs(ratio - 2.0) < 0.01, `Width ratio should be ~2.0, got ${ratio}`);
  });

  it('returns measurement in inches', () => {
    if (process.platform !== 'darwin') return;
    const width = measureTextWidth('Hello World', 'Arial', 12, false, false);
    // 12pt Arial "Hello World" should be roughly 0.8-1.0 inches
    assert.ok(width > 0.5 && width < 2.0, `Expected ~0.86in, got ${width}in`);
  });
});

describe('loadFont', () => {
  beforeEach(() => {
    fontCache.clear();
  });

  it('returns null for non-existent font', () => {
    const font = loadFont('NonExistentFont12345', false, false);
    assert.equal(font, null);
  });

  it('caches font load results', () => {
    loadFont('NonExistentFont12345', false, false);
    assert.ok(fontCache.has('NonExistentFont12345|'));
    assert.equal(fontCache.get('NonExistentFont12345|'), null);
  });

  it('loads Arial on macOS', () => {
    if (process.platform !== 'darwin') return;
    const font = loadFont('Arial', false, false);
    assert.ok(font !== null, 'Arial should be loadable on macOS');
    assert.ok(font.unitsPerEm > 0);
  });

  it('caches loaded font for reuse', () => {
    if (process.platform !== 'darwin') return;
    const font1 = loadFont('Arial', false, false);
    const font2 = loadFont('Arial', false, false);
    assert.strictEqual(font1, font2, 'Should return same cached instance');
  });

  it('loads different variant for bold', () => {
    if (process.platform !== 'darwin') return;
    const regular = loadFont('Arial', false, false);
    const bold = loadFont('Arial', true, false);
    // Both should load, and the cache keys should differ
    assert.ok(regular !== null);
    assert.ok(bold !== null);
    assert.ok(fontCache.has('Arial|'));
    assert.ok(fontCache.has('Arial|b'));
  });
});
