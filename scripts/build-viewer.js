#!/usr/bin/env node

/**
 * build-viewer.js
 *
 * Builds a single viewer.html from slides/slide-*.html files.
 * Works with file:// protocol — all slides are inlined into one HTML.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SLIDES_DIR = join(process.cwd(), 'slides');
const OUTPUT = join(SLIDES_DIR, 'viewer.html');

// 슬라이드 파일 목록 (숫자순 정렬)
const slideFiles = readdirSync(SLIDES_DIR)
  .filter(f => /^slide-\d+\.html$/.test(f))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0], 10);
    const numB = parseInt(b.match(/\d+/)[0], 10);
    return numA - numB;
  });

if (slideFiles.length === 0) {
  console.error('No slide-*.html files found in slides/');
  process.exit(1);
}

console.log(`Found ${slideFiles.length} slides`);

/**
 * HTML에서 <style> 블록 내용을 추출
 */
function extractStyleContent(html) {
  const match = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return match ? match[1] : '';
}

/**
 * <body> 태그의 inline style 속성을 추출
 */
function extractBodyInlineStyle(html) {
  const match = html.match(/<body\s+style="([^"]*)"/i);
  return match ? match[1] : '';
}

/**
 * CSS body {} 규칙에서 스타일 프로퍼티를 추출하여 inline style 문자열로 변환
 */
function extractBodyCssStyle(css) {
  const match = css.match(/body\s*\{([^}]*)\}/i);
  if (!match) return '';
  // CSS 프로퍼티들을 inline style 문자열로 변환
  return match[1]
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .join('; ') + ';';
}

/**
 * <body> 태그의 innerHTML을 추출
 */
function extractBodyInner(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : '';
}

/**
 * body style에서 width/height/font-family 제거 (뷰어 프레임에서 통일)
 */
function removeSlideSize(style) {
  return style
    .replace(/\s*width:\s*720pt;?\s*/gi, ' ')
    .replace(/\s*height:\s*405pt;?\s*/gi, ' ')
    .replace(/\s*font-family:\s*[^;]+;?\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * <style> 블록에서 body {} 규칙 제거, * {} 리셋을 슬라이드별로 스코핑
 */
function scopeStyles(css, slideIndex) {
  const selector = `.slide-frame[data-slide="${slideIndex}"]`;
  let scoped = '';

  // body {} 규칙 제거
  css = css.replace(/body\s*\{[^}]*\}/gi, '');

  // * { ... } 리셋을 스코핑
  css = css.replace(/\*\s*\{([^}]*)\}/gi, (match, rules) => {
    scoped += `${selector} * {${rules}}\n`;
    return '';
  });

  // 나머지 CSS가 있으면 스코핑
  const remaining = css.trim();
  if (remaining) {
    scoped += remaining
      .replace(/([^\s{]+)\s*\{/g, (match, sel) => `${selector} ${sel.trim()} {`);
  }

  return scoped;
}

// 슬라이드 데이터 추출
const slides = slideFiles.map((file, i) => {
  const html = readFileSync(join(SLIDES_DIR, file), 'utf-8');
  const styleContent = extractStyleContent(html);

  // body 스타일: CSS body {} 규칙 + inline style 속성 합산
  const cssBodyStyle = extractBodyCssStyle(styleContent);
  const inlineBodyStyle = extractBodyInlineStyle(html);
  const combinedBodyStyle = removeSlideSize(
    [cssBodyStyle, inlineBodyStyle].filter(Boolean).join(' ')
  );

  const bodyInner = extractBodyInner(html);
  const scopedCss = scopeStyles(styleContent, i + 1);

  return { file, bodyStyle: combinedBodyStyle, bodyInner, scopedCss };
});

// 뷰어 HTML 생성
const viewerHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slide Viewer</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    /* === Viewer Chrome === */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #111;
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .viewer-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* Navigation bar */
    .nav-bar {
      height: 48px;
      background: #1a1a1a;
      border-bottom: 1px solid #333;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-shrink: 0;
      z-index: 100;
    }

    .nav-bar button {
      background: #333;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 6px 16px;
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .nav-bar button:hover {
      background: #555;
    }

    .nav-bar button:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .slide-counter {
      color: #aaa;
      font-size: 14px;
      font-weight: 500;
      min-width: 60px;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .btn-fullscreen {
      position: absolute;
      right: 16px;
      background: transparent !important;
      font-size: 18px;
      padding: 6px 10px !important;
    }

    /* Slide viewport */
    .slide-viewport {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    .slide-scaler {
      width: 720pt;
      height: 405pt;
      position: relative;
      transform-origin: center center;
    }

    /* Slide frames */
    .slide-frame {
      position: absolute;
      inset: 0;
      width: 720pt;
      height: 405pt;
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    .slide-frame.active {
      opacity: 1;
      pointer-events: auto;
    }

    /* === Scoped Slide Styles === */
${slides.map(s => s.scopedCss).join('\n')}
  </style>
</head>
<body>
  <div class="viewer-container">
    <!-- Navigation -->
    <div class="nav-bar">
      <button id="btn-prev" title="Previous (←)">Prev</button>
      <span class="slide-counter" id="counter">1 / ${slides.length}</span>
      <button id="btn-next" title="Next (→)">Next</button>
      <button class="btn-fullscreen" id="btn-fs" title="Fullscreen (F)">&#x26F6;</button>
    </div>

    <!-- Slide viewport -->
    <div class="slide-viewport" id="viewport">
      <div class="slide-scaler" id="scaler">
${slides.map((s, i) => `        <div class="slide-frame${i === 0 ? ' active' : ''}" data-slide="${i + 1}" style="${s.bodyStyle}">
${s.bodyInner}
        </div>`).join('\n')}
      </div>
    </div>
  </div>

  <script>
    const TOTAL = ${slides.length};
    let current = 1;

    const frames = document.querySelectorAll('.slide-frame');
    const counter = document.getElementById('counter');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const scaler = document.getElementById('scaler');
    const viewport = document.getElementById('viewport');

    function goTo(n) {
      n = Math.max(1, Math.min(TOTAL, n));
      if (n === current) return;
      frames[current - 1].classList.remove('active');
      current = n;
      frames[current - 1].classList.add('active');
      counter.textContent = current + ' / ' + TOTAL;
      btnPrev.disabled = current === 1;
      btnNext.disabled = current === TOTAL;
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);
    btnPrev.disabled = true;

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(1); }
      else if (e.key === 'End') { e.preventDefault(); goTo(TOTAL); }
      else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    });

    // Fullscreen
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    }
    document.getElementById('btn-fs').addEventListener('click', toggleFullscreen);

    // Auto-scale to fit viewport (95% fit)
    function rescale() {
      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      // 720pt ≈ 960px, 405pt ≈ 540px at 96dpi (but pt in CSS = 1.333px)
      const slideW = scaler.offsetWidth;
      const slideH = scaler.offsetHeight;
      const scale = Math.min(vw / slideW, vh / slideH) * 0.95;
      scaler.style.transform = 'scale(' + scale + ')';
    }

    window.addEventListener('resize', rescale);
    document.addEventListener('fullscreenchange', () => setTimeout(rescale, 100));
    rescale();
  </script>
</body>
</html>`;

writeFileSync(OUTPUT, viewerHtml, 'utf-8');
console.log(`Built viewer: ${OUTPUT}`);
