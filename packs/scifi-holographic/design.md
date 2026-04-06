# Sci-Fi Holographic Design Spec

## Identity

**Mood**: Military HUD, quantum computing, absolute precision
**Best For**: Defense tech, AI research, quantum computing, data engineering, cybersecurity

A deep-space black canvas with a strictly monochromatic cyan HUD overlay. Concentric circles form targeting reticles. Scan lines sweep across the field. Every element — text, shapes, data — is rendered in a single hue: cyan #00C8FF at varying opacities. The discipline of one color creates an unmistakable command-center aesthetic that feels classified and precise.

---

## Signature Elements

- **3 concentric circles (one rotated 30 degrees)**: Thin ring outlines centered on the slide, with the middle ring tilted to suggest 3D holographic projection
- **Scan line**: A single horizontal line sweeping across the slide at low opacity, simulating a radar sweep
- **Strictly monochromatic cyan**: Every visible element uses #00C8FF at opacities between 15-60% — no other hue
- **All monospace typography**: Space Mono exclusively, at small sizes (8-11pt), with wide letter-spacing
- **Deep space background**: #03050D — nearly pure black with a faint blue tint

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Space Mono', monospace;
  background: #03050D;
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Concentric Rings

```css
.hud-ring {
  position: absolute;
  border-radius: 50%;
  border: 0.5pt solid rgba(0, 200, 255, 0.25);
  background: transparent;
  pointer-events: none;
  z-index: 0;
}
.hud-ring.outer {
  width: 340pt;
  height: 340pt;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.hud-ring.mid {
  width: 240pt;
  height: 240pt;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(30deg);
  border-style: dashed;
}
.hud-ring.inner {
  width: 140pt;
  height: 140pt;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### Center Dot

```css
.hud-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4pt;
  height: 4pt;
  border-radius: 50%;
  background: rgba(0, 200, 255, 0.60);
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
}
```

### Scan Line

```css
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1pt;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 200, 255, 0.30) 20%,
    rgba(0, 200, 255, 0.50) 50%,
    rgba(0, 200, 255, 0.30) 80%,
    transparent 100%
  );
  z-index: 0;
  pointer-events: none;
}
```

### Bar Element

```css
.hud-bar {
  height: 3pt;
  background: rgba(0, 200, 255, 0.35);
  border-radius: 0;
}
.hud-bar.short { width: 40pt; }
.hud-bar.medium { width: 80pt; }
.hud-bar.long { width: 140pt; }
```

### Hero Title

```css
h1 {
  font-family: 'Space Mono', monospace;
  font-size: 11pt;
  font-weight: 700;
  color: rgba(0, 200, 255, 0.60);
  text-transform: uppercase;
  letter-spacing: 3pt;
  line-height: 1.5;
  position: relative;
  z-index: 1;
  margin: 0;
}
```

### Body Text

```css
.body-text {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  font-weight: 400;
  color: rgba(0, 200, 255, 0.45);
  line-height: 1.7;
  letter-spacing: 1pt;
  position: relative;
  z-index: 1;
}
```

### Data Label

```css
.data-label {
  font-family: 'Space Mono', monospace;
  font-size: 8pt;
  color: rgba(0, 200, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 1pt;
}
```

---

## Font Pairing

- **Title/Label**: Space Mono Bold, 10-11pt, weight 700, uppercase, letter-spacing 3pt
- **Body**: Space Mono, 9-11pt, weight 400, line-height 1.7
- **Coordinates/Data**: Space Mono, 8pt, weight 400, uppercase, letter-spacing 1pt
- **KPI Numbers**: Space Mono Bold, 11pt, weight 700, cyan @ 60%

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#03050D` | Deep space background |
| `--bg-secondary` | `#060A14` | Slightly lighter panel |
| `--bg-elevated` | `rgba(0,200,255,0.08)` | Faint cyan highlight panel |
| `--text-primary` | `rgba(0,200,255,0.60)` | Title text |
| `--text-secondary` | `rgba(0,200,255,0.45)` | Body text |
| `--accent` | `#00C8FF` | Base cyan hue (used at varying opacities) |
| `--border` | `rgba(0,200,255,0.25)` | Ring outlines, dividers |

---

## Layout Principles

- **Concentric rings are the anchor**: The three rings center the visual composition; content flows around them
- **Text in corners and edges**: HUD data naturally sits at screen edges, not center
- **Scan line positioning**: One horizontal scan line per slide, positioned to create visual tension
- **Monochromatic discipline**: If it is not cyan #00C8FF at some opacity, it does not belong
- **Small text, wide spacing**: All text is deliberately undersized with generous letter-spacing — precision over readability
- **Sparse content**: Maximum 3-4 text elements per slide; the HUD elements are the composition

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

---

## Avoid

- **No multiple hue accents** — cyan only, at varying opacities
- **No warm colors** — zero reds, oranges, yellows, greens
- **No decorative illustration** — only geometric HUD elements
- **No large text** — maximum 11pt; HUD displays are information-dense but visually small
- **No filled shapes** — use outlines and strokes only (except center dot and bars)
- **No serif or sans-serif fonts** — Space Mono monospace exclusively
- **No high opacity text** — maximum 60% opacity on any text element
- **No blur or glow effects** — all edges are crisp and precise
