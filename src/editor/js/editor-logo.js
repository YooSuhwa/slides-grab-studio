// editor-logo.js — Logo settings modal with visual drag/resize on slide preview

const SLIDE_W_IN = 10;
const SLIDE_H_IN = 5.625;
const IFRAME_W = 960;
const DEFAULT_LOGO_W_IN = 1.1;
const DEFAULT_LOGO_H_IN = 0.5;
const MARGIN = 0.2;
const MARGIN_Y = 0.15;

// DOM refs
const modal = document.querySelector('#logo-settings-modal');
const container = document.querySelector('#logo-preview-container');
const iframe = document.querySelector('#logo-preview-iframe');
const overlay = document.querySelector('#logo-overlay');
const overlayImg = document.querySelector('#logo-overlay-img');
const resizeHandle = document.querySelector('#logo-resize-handle');
const dropzone = document.querySelector('#logo-upload-dropzone');
const fileInput = document.querySelector('#logo-file-input');
const logoThumb = document.querySelector('#logo-thumb');
const uploadLabel = document.querySelector('#logo-upload-label');
const uploadHint = document.querySelector('#logo-upload-hint');
const removeBtnEl = document.querySelector('#logo-remove-btn');
const positionGrid = document.querySelector('#logo-position-grid');
const slideStrip = document.querySelector('#logo-slide-strip');
const btnSave = document.querySelector('#logo-settings-save');
const btnCancel = document.querySelector('#logo-settings-cancel');

// State
let slides = [];
let currentSlideIdx = 0;
let excludeSet = new Set();
let logoPath = null;
let logoObjectUrl = null;
let pendingFile = null;
let aspectRatio = DEFAULT_LOGO_W_IN / DEFAULT_LOGO_H_IN;
let logoX = SLIDE_W_IN - DEFAULT_LOGO_W_IN - MARGIN;
let logoY = MARGIN_Y;
let logoW = DEFAULT_LOGO_W_IN;
let logoH = DEFAULT_LOGO_H_IN;

// ── Coordinate helpers ─────────────────────────────────────────────────────

function cW() { return container?.clientWidth || 480; }
function cH() { return container?.clientHeight || 270; }
function inToPxX(v) { return (v / SLIDE_W_IN) * cW(); }
function inToPxY(v) { return (v / SLIDE_H_IN) * cH(); }
function pxToInX(v) { return (v / cW()) * SLIDE_W_IN; }
function pxToInY(v) { return (v / cH()) * SLIDE_H_IN; }

// ── Iframe scaling ─────────────────────────────────────────────────────────

function scaleIframe() {
  if (!iframe || !container) return;
  iframe.style.transform = `scale(${cW() / IFRAME_W})`;
}

function loadSlide(idx) {
  if (!iframe || !slides[idx]) return;
  currentSlideIdx = idx;
  // ?nologo prevents server from injecting logo into the preview (we overlay it ourselves)
  iframe.src = `/slides/${slides[idx]}?nologo`;
  highlightStrip();
}

// ── Logo overlay ───────────────────────────────────────────────────────────

function syncOverlay() {
  if (!overlay) return;
  overlay.style.left = inToPxX(logoX) + 'px';
  overlay.style.top = inToPxY(logoY) + 'px';
  overlay.style.width = inToPxX(logoW) + 'px';
  overlay.style.height = inToPxY(logoH) + 'px';
}

function readOverlay() {
  if (!overlay) return;
  logoX = pxToInX(parseFloat(overlay.style.left) || 0);
  logoY = pxToInY(parseFloat(overlay.style.top) || 0);
  logoW = pxToInX(parseFloat(overlay.style.width) || 50);
  logoH = pxToInY(parseFloat(overlay.style.height) || 25);
}

function showLogoOnPreview(src, { preserveSize = false } = {}) {
  if (!overlay || !overlayImg) return;
  overlayImg.src = src;
  overlay.hidden = excludeSet.has(currentSlideIdx + 1);
  overlayImg.onload = () => {
    if (overlayImg.naturalWidth && overlayImg.naturalHeight) {
      aspectRatio = overlayImg.naturalWidth / overlayImg.naturalHeight;
      if (!preserveSize) {
        // Target: max 20% of slide width, keep aspect ratio
        logoW = Math.min(SLIDE_W_IN * 0.2, DEFAULT_LOGO_W_IN);
        logoH = logoW / aspectRatio;
        // If still too tall, fit by height
        if (logoH > SLIDE_H_IN * 0.2) {
          logoH = SLIDE_H_IN * 0.2;
          logoW = logoH * aspectRatio;
        }
        // Apply default preset (top-right)
        PRESETS['top-right']();
      }
      clampPosition();
    }
    syncOverlay();
  };
  syncOverlay();
}

/** Ensure logo stays within slide bounds */
function clampPosition() {
  logoW = Math.min(logoW, SLIDE_W_IN - MARGIN * 2);
  logoH = Math.min(logoH, SLIDE_H_IN - MARGIN_Y * 2);
  logoX = Math.max(0, Math.min(logoX, SLIDE_W_IN - logoW));
  logoY = Math.max(0, Math.min(logoY, SLIDE_H_IN - logoH));
}

function hideLogoOnPreview() {
  if (overlay) overlay.hidden = true;
}

// ── Dropzone UI ────────────────────────────────────────────────────────────

function updateDropzoneUI() {
  const hasLogo = !!(logoPath || pendingFile);
  if (logoThumb) logoThumb.style.display = hasLogo ? 'block' : 'none';
  if (uploadHint) uploadHint.style.display = hasLogo ? 'none' : '';
  if (removeBtnEl) removeBtnEl.style.display = hasLogo ? '' : 'none';
  if (uploadLabel && !hasLogo) uploadLabel.textContent = 'Click or drag logo image';
}

function setDropzoneLogo(src, filename) {
  if (logoThumb) { logoThumb.src = src; logoThumb.style.display = 'block'; }
  if (uploadLabel) uploadLabel.textContent = filename || 'logo';
  if (uploadHint) uploadHint.style.display = 'none';
  if (removeBtnEl) removeBtnEl.style.display = '';
}

// ── File handling ──────────────────────────────────────────────────────────

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  pendingFile = file;
  if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
  logoObjectUrl = URL.createObjectURL(file);
  showLogoOnPreview(logoObjectUrl);
  setDropzoneLogo(logoObjectUrl, file.name);
}

function removeLogo() {
  logoPath = null;
  pendingFile = null;
  if (logoObjectUrl) { URL.revokeObjectURL(logoObjectUrl); logoObjectUrl = null; }
  hideLogoOnPreview();
  updateDropzoneUI();
}

async function uploadFile(file) {
  const res = await fetch('/api/logo/upload', {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'image/png' },
    body: await file.arrayBuffer(),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Upload failed');
  return res.json();
}

// ── Presets ─────────────────────────────────────────────────────────────────

const PRESETS = {
  'top-left':     () => { logoX = MARGIN; logoY = MARGIN_Y; },
  'top-right':    () => { logoX = SLIDE_W_IN - logoW - MARGIN; logoY = MARGIN_Y; },
  'bottom-left':  () => { logoX = MARGIN; logoY = SLIDE_H_IN - logoH - MARGIN_Y; },
  'bottom-right': () => { logoX = SLIDE_W_IN - logoW - MARGIN; logoY = SLIDE_H_IN - logoH - MARGIN_Y; },
};

function setActivePreset(pos) {
  if (!positionGrid) return;
  for (const btn of positionGrid.querySelectorAll('.logo-pos-btn')) {
    btn.classList.toggle('active', btn.dataset.pos === pos);
  }
}

function detectPreset() {
  const eps = 0.3;
  for (const [name, fn] of Object.entries(PRESETS)) {
    const sx = logoX, sy = logoY;
    fn();
    const match = Math.abs(logoX - sx) < eps && Math.abs(logoY - sy) < eps;
    logoX = sx; logoY = sy;
    if (match) return name;
  }
  return null;
}

// ── Slide strip ────────────────────────────────────────────────────────────

function buildStrip() {
  if (!slideStrip) return;
  slideStrip.innerHTML = '';
  for (let i = 0; i < slides.length; i++) {
    const chip = document.createElement('div');
    chip.className = 'logo-slide-chip';
    chip.dataset.idx = i;
    if (excludeSet.has(i + 1)) chip.classList.add('excluded');
    if (i === currentSlideIdx) chip.classList.add('viewing');

    // Mini preview iframe
    const preview = document.createElement('iframe');
    preview.src = `/slides/${slides[i]}`;
    preview.tabIndex = -1;
    preview.setAttribute('aria-hidden', 'true');
    preview.loading = 'lazy';
    Object.assign(preview.style, {
      position: 'absolute', top: '0', left: '0',
      width: '960px', height: '540px',
      transform: 'scale(0.08333)', transformOrigin: 'top left',
      pointerEvents: 'none', border: 'none', display: 'block',
    });
    chip.appendChild(preview);

    const check = document.createElement('span');
    check.className = 'chip-check';
    check.textContent = '\u2713';
    chip.appendChild(check);

    const num = document.createElement('span');
    num.className = 'chip-num';
    num.textContent = String(i + 1);
    chip.appendChild(num);

    slideStrip.appendChild(chip);
  }
}

function highlightStrip() {
  if (!slideStrip) return;
  for (const c of slideStrip.querySelectorAll('.logo-slide-chip')) {
    const i = parseInt(c.dataset.idx, 10);
    c.classList.toggle('viewing', i === currentSlideIdx);
    c.classList.toggle('excluded', excludeSet.has(i + 1));
  }
  // Hide/show logo overlay based on whether current slide is excluded
  if (overlay && (logoPath || pendingFile)) {
    overlay.hidden = excludeSet.has(currentSlideIdx + 1);
  }
}

// ── Drag ───────────────────────────────────────────────────────────────────

function setupDrag() {
  if (!overlay || !container) return;
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === resizeHandle) return;
    e.preventDefault();
    const mx = e.clientX, my = e.clientY;
    const sl = parseFloat(overlay.style.left) || 0;
    const st = parseFloat(overlay.style.top) || 0;
    const ow = overlay.offsetWidth, oh = overlay.offsetHeight;

    const move = (e) => {
      let x = sl + e.clientX - mx, y = st + e.clientY - my;
      x = Math.max(0, Math.min(x, cW() - ow));
      y = Math.max(0, Math.min(y, cH() - oh));
      overlay.style.left = x + 'px';
      overlay.style.top = y + 'px';
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      readOverlay();
      setActivePreset(detectPreset());
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
}

// ── Resize (aspect-ratio locked) ───────────────────────────────────────────

function setupResize() {
  if (!resizeHandle || !overlay) return;
  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const mx = e.clientX, sw = overlay.offsetWidth;

    const move = (e) => {
      let w = sw + e.clientX - mx;
      w = Math.max(20, Math.min(w, cW() * 0.8));
      const h = w / aspectRatio;
      const l = parseFloat(overlay.style.left) || 0;
      const t = parseFloat(overlay.style.top) || 0;
      if (l + w > cW() || t + h > cH()) return;
      overlay.style.width = w + 'px';
      overlay.style.height = h + 'px';
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      readOverlay();
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
}

// ── Open / Close ───────────────────────────────────────────────────────────

export async function openLogoSettingsModal() {
  if (!modal) return;

  // Reset
  excludeSet.clear();
  logoPath = null; pendingFile = null;
  currentSlideIdx = 0;
  logoX = SLIDE_W_IN - DEFAULT_LOGO_W_IN - MARGIN;
  logoY = MARGIN_Y;
  logoW = DEFAULT_LOGO_W_IN;
  logoH = DEFAULT_LOGO_H_IN;
  hideLogoOnPreview();
  updateDropzoneUI();

  // Load slides
  try { const r = await fetch('/api/slides'); slides = r.ok ? await r.json() : []; } catch { slides = []; }

  // Load config
  try {
    const r = await fetch('/api/logo');
    if (r.ok) {
      const { logo } = await r.json();
      if (logo) {
        logoPath = logo.path;
        if (logo.width) logoW = logo.width;
        if (logo.height) logoH = logo.height;
        if (logo.x != null) logoX = logo.x;
        else if (logo.position && PRESETS[logo.position]) PRESETS[logo.position]();
        if (logo.y != null) logoY = logo.y;
        if (logo.exclude) logo.exclude.forEach(n => excludeSet.add(n));
        aspectRatio = logoW / logoH;
        setActivePreset(detectPreset());
      }
    }
  } catch { /* ignore */ }

  modal.hidden = false;
  scaleIframe();
  buildStrip();
  if (slides.length) loadSlide(0);

  // Load logo image
  if (logoPath) {
    try {
      const r = await fetch('/api/logo/image');
      if (r.ok) {
        const blob = await r.blob();
        if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
        logoObjectUrl = URL.createObjectURL(blob);
        showLogoOnPreview(logoObjectUrl, { preserveSize: true });
        setDropzoneLogo(logoObjectUrl, logoPath.split('/').pop());
      }
    } catch { /* ignore */ }
  }
}

export function closeLogoSettingsModal() {
  if (!modal) return;
  modal.hidden = true;
  if (logoObjectUrl) { URL.revokeObjectURL(logoObjectUrl); logoObjectUrl = null; }
}

// ── Save ───────────────────────────────────────────────────────────────────

async function save() {
  if (!btnSave) return;
  btnSave.disabled = true;
  try {
    if (pendingFile) {
      const r = await uploadFile(pendingFile);
      logoPath = r.path;
      pendingFile = null;
    }
    if (!logoPath) {
      await fetch('/api/logo', { method: 'DELETE' });
      reload(); closeLogoSettingsModal(); return;
    }
    const exclude = [...excludeSet].sort((a, b) => a - b);
    const logo = {
      path: logoPath,
      x: Math.round(logoX * 100) / 100,
      y: Math.round(logoY * 100) / 100,
      width: Math.round(logoW * 100) / 100,
      height: Math.round(logoH * 100) / 100,
    };
    if (exclude.length) logo.exclude = exclude;
    const r = await fetch('/api/logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logo),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Save failed');
    reload(); closeLogoSettingsModal();
  } catch (err) {
    alert(`Logo save failed: ${err.message}`);
  } finally {
    if (btnSave) btnSave.disabled = false;
  }
}

function reload() {
  const f = document.querySelector('#slide-iframe');
  if (f) f.src = f.src;
}

// ── Event bindings ─────────────────────────────────────────────────────────

btnSave?.addEventListener('click', save);
btnCancel?.addEventListener('click', closeLogoSettingsModal);
removeBtnEl?.addEventListener('click', removeLogo);

// Dropzone
if (dropzone) {
  dropzone.addEventListener('click', (e) => {
    if (e.target === removeBtnEl) return;
    fileInput?.click();
  });
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault(); dropzone.classList.remove('dragover');
    handleFile(e.dataTransfer?.files?.[0]);
  });
}
fileInput?.addEventListener('change', () => { handleFile(fileInput.files?.[0]); fileInput.value = ''; });

// Slide strip — click check = toggle exclude, click number = navigate
slideStrip?.addEventListener('click', (e) => {
  const chip = e.target.closest('.logo-slide-chip');
  if (!chip) return;
  const idx = parseInt(chip.dataset.idx, 10);
  const num = idx + 1;

  // Click on the check icon → toggle exclude
  if (e.target.closest('.chip-check')) {
    excludeSet.has(num) ? excludeSet.delete(num) : excludeSet.add(num);
    highlightStrip();
    return;
  }

  // Click anywhere else on chip → navigate to that slide
  loadSlide(idx);
  highlightStrip();
});

// Presets
positionGrid?.addEventListener('click', (e) => {
  const btn = e.target.closest('.logo-pos-btn');
  if (!btn || !PRESETS[btn.dataset.pos]) return;
  PRESETS[btn.dataset.pos]();
  clampPosition();
  setActivePreset(btn.dataset.pos);
  syncOverlay();
});

// Keyboard
document.addEventListener('keydown', (e) => {
  if (!modal || modal.hidden) return;
  if (e.key === 'Escape') { closeLogoSettingsModal(); return; }
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && currentSlideIdx > 0) { e.preventDefault(); loadSlide(currentSlideIdx - 1); }
  if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && currentSlideIdx < slides.length - 1) { e.preventDefault(); loadSlide(currentSlideIdx + 1); }
  // Spacebar toggles exclude for current slide
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    const num = currentSlideIdx + 1;
    excludeSet.has(num) ? excludeSet.delete(num) : excludeSet.add(num);
    highlightStrip();
  }
});

// Backdrop
modal?.addEventListener('click', (e) => { if (e.target === modal) closeLogoSettingsModal(); });

// Window resize
window.addEventListener('resize', () => { if (modal && !modal.hidden) { scaleIframe(); syncOverlay(); } });

// Init drag/resize
setupDrag();
setupResize();
