# Cyberpunk Outline Design Spec

## Identity

**Mood**: HUD interface, sci-fi, dark tech
**Best For**: Gaming presentations, AI infrastructure, cybersecurity briefings

A heads-up display from a near-future command center. Text exists only as
outlines — hollow strokes of neon cyan against an almost-black void. Corner
brackets frame the viewport. A faint grid pulses underneath everything,
suggesting a digital substrate.

---

## Signature Elements

- **Outline stroke-only text**: Titles rendered with transparent fill and 1.5pt neon cyan stroke
- **Four corner bracket markers**: L-shaped brackets (20pt) in each corner of the slide, framing the viewport
- **Grid overlay background**: Faint cyan grid lines at ~6% opacity covering the entire slide
- **Neon glow effects**: Cyan glow on key elements via text-shadow and box-shadow
- **Monospace data readout**: Space Mono for all body text, evoking terminal output

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Space Mono', monospace;
  background: #0D0D0D;
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Grid Overlay

```css
body::before {
  content: '';
  position: absolute;
  inset: 0;
  /* Dot-grid background at 6% opacity per original */
  background-image:
    linear-gradient(rgba(0, 255, 200, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 200, 0.06) 1px, transparent 1px);
  background-size: 24pt 24pt;
  pointer-events: none;
  z-index: 0;
}
```

### Outline Text (Stroke Only)

```css
h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 52pt;
  font-weight: 400;
  letter-spacing: 7pt; /* Original: 6-8pt letter-spacing */
  line-height: 1.1;
  color: transparent;
  -webkit-text-stroke: 1.5pt #00FFC8;
  text-shadow: 0 0 20pt rgba(0, 255, 200, 0.5);
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}
```

### Corner Bracket Markers

```css
.corner-brackets::before,
.corner-brackets::after {
  content: '';
  position: absolute;
  width: 20pt; /* Original: 20pt L-shaped neon */
  height: 20pt;
  border-color: #00FFC8;
  border-style: solid;
  z-index: 2;
}
.corner-brackets::before {
  top: 16pt;
  left: 16pt;
  border-width: 2pt 0 0 2pt; /* top-left bracket */
}
.corner-brackets::after {
  top: 16pt;
  right: 16pt;
  border-width: 2pt 2pt 0 0; /* top-right bracket */
}
.corner-brackets .bottom-left,
.corner-brackets .bottom-right {
  position: absolute;
  width: 20pt;
  height: 20pt;
  border-color: #00FFC8;
  border-style: solid;
}
.corner-brackets .bottom-left {
  bottom: 16pt;
  left: 16pt;
  border-width: 0 0 2pt 2pt;
}
.corner-brackets .bottom-right {
  bottom: 16pt;
  right: 16pt;
  border-width: 0 2pt 2pt 0;
}
```

### Neon Glow Box

```css
.glow-box {
  border: 1pt solid rgba(0, 255, 200, 0.4);
  padding: 16pt 20pt;
  position: relative;
  z-index: 1;
  box-shadow:
    0 0 8pt rgba(0, 255, 200, 0.15),
    inset 0 0 8pt rgba(0, 255, 200, 0.05);
}
```

### Body Text (Terminal)

```css
.body-text {
  font-family: 'Space Mono', monospace;
  font-size: 10pt;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(0, 255, 200, 0.8);
  letter-spacing: 0.02em;
  position: relative;
  z-index: 1;
}
```

---

## Font Pairing

- **Title**: Bebas Neue, 44-60pt, weight 400, letter-spacing 6-8pt, outline stroke `#00FFC8` 1.5pt
- **Body**: Space Mono, 9-11pt, weight 400, line-height 1.6, letter-spacing 0.02em
- **Data Labels**: Space Mono, 8pt, wider spacing
- **KPI/Numbers**: Bebas Neue, 44-52pt, outline stroke, letter-spacing 6pt

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0D0D0D` | Near-black void background |
| `--bg-secondary` | `#141414` | Slightly lighter panels |
| `--bg-elevated` | `#1A1A1A` | Card or data block backgrounds |
| `--text-primary` | `#00FFC8` | Neon cyan — all headlines and key text |
| `--text-secondary` | `rgba(0, 255, 200, 0.6)` | Dimmed cyan for body text |
| `--accent` | `#00FFC8` | Glow effects, outlines, brackets |
| `--border` | `rgba(0, 255, 200, 0.3)` | Box outlines, dividers |

**Grid opacity**: `rgba(0, 255, 200, 0.06)` for background grid lines.
**Glow**: `rgba(0, 255, 200, 0.5)` for text-shadow on titles.

---

## Layout Principles

- **Grid always present**: The background grid overlay is on every slide, providing spatial reference
- **Corner brackets always present**: All four corners are bracketed on every slide
- **Padding**: 40pt 48pt standard; content floats inside the bracket frame
- **Left-aligned by default**: Terminal output reads left-to-right
- **Sparse content**: Maximum 4-5 data points per slide. HUD displays are clean.
- **Z-ordering**: Grid (z:0) > Content (z:1) > Brackets (z:2)

---

## Avoid

- **No white backgrounds** — always dark (#0D0D0D or darker)
- **No filled title text** — titles must be outline/stroke only, never solid fill
- **No bright warm colors** — no red, orange, yellow; only cyan and its darker shades
- **No rounded corners** — sharp edges only, matching the HUD aesthetic
- **No serif or decorative fonts** — condensed sans-serif and monospace only
- **No images or photos** — data visualization and type only
- **No soft shadows** — only neon glow effects (cyan-tinted)

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```
