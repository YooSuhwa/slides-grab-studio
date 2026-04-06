# Architectural Blueprint Design Spec

## Identity

**Mood**: Precise, technical, professional
**Best For**: Architecture firms, urban planning, engineering presentations, technical proposals

Authentic blueprint aesthetic — white-cyan linework on deep blueprint-blue paper. A dual-grid system (fine + major) covers every slide. All text is strictly monospace. Content is annotated with dimension lines and measurement markers. A circular blueprint stamp in the corner completes the drafting-room authenticity. Zero decoration — only functional technical drawing elements.

---

## Signature Elements

- **Dual grid system**: Fine grid (#64B4FF @ 12%) at 20pt intervals and major grid (#64B4FF @ 22%) at 60pt intervals covering the full slide
- **Dimension lines with annotation**: Thin lines with arrow/tick endpoints and monospace measurement labels
- **Circular blueprint stamp**: A circle with inner ring and text, positioned bottom-right, containing project/author metadata
- **All monospace typography**: Space Mono exclusively — no serif, no sans-serif, no exceptions
- **Blueprint blue background**: Deep #0D2240 with all elements in cyan tones at varying opacities

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Space Mono', monospace;
  background: #0D2240;
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Fine Grid

```css
.grid-fine {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(100, 180, 255, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 180, 255, 0.12) 1px, transparent 1px);
  background-size: 20pt 20pt;
  pointer-events: none;
  z-index: 0;
}
```

### Major Grid

```css
.grid-major {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(100, 180, 255, 0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 180, 255, 0.22) 1px, transparent 1px);
  background-size: 60pt 60pt;
  pointer-events: none;
  z-index: 0;
}
```

### Dimension Line (Horizontal)

```css
.dimension-line {
  display: flex;
  align-items: center;
  gap: 4pt;
  position: relative;
  z-index: 1;
}
.dimension-line .line {
  flex: 1;
  height: 0.5pt;
  background: rgba(100, 200, 255, 0.60);
}
.dimension-line .tick {
  width: 0.5pt;
  height: 8pt;
  background: rgba(100, 200, 255, 0.60);
  flex-shrink: 0;
}
.dimension-line .label {
  font-family: 'Space Mono', monospace;
  font-size: 7pt;
  color: rgba(100, 200, 255, 0.60);
  white-space: nowrap;
}
```

### Blueprint Stamp

```css
.blueprint-stamp {
  position: absolute;
  bottom: 20pt;
  right: 24pt;
  width: 64pt;
  height: 64pt;
  border-radius: 50%;
  border: 1.5pt solid rgba(100, 200, 255, 0.40);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.blueprint-stamp::before {
  content: '';
  position: absolute;
  width: 54pt;
  height: 54pt;
  border-radius: 50%;
  border: 0.5pt solid rgba(100, 200, 255, 0.25);
}
.blueprint-stamp .stamp-text {
  font-family: 'Space Mono', monospace;
  font-size: 6pt;
  color: rgba(100, 200, 255, 0.50);
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 0.06em;
}
```

### Hero Title

```css
h1 {
  font-family: 'Space Mono', monospace;
  font-size: 13pt;
  font-weight: 700;
  color: rgba(150, 220, 255, 0.80);
  text-transform: uppercase;
  letter-spacing: 4pt;
  line-height: 1.4;
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
  color: rgba(100, 200, 255, 0.60);
  line-height: 1.6;
  position: relative;
  z-index: 1;
}
```

### Technical Annotation

```css
.annotation {
  font-family: 'Space Mono', monospace;
  font-size: 8pt;
  color: rgba(100, 200, 255, 0.45);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
```

---

## Font Pairing

- **Title**: Space Mono Bold, 11-13pt, weight 700, uppercase, letter-spacing 4pt
- **Body**: Space Mono, 8-10pt, weight 400, line-height 1.6
- **Annotation**: Space Mono, 8pt, weight 400, uppercase
- **Stamp**: Space Mono, 8pt, multiline, uppercase
- **KPI Numbers**: Space Mono Bold, 12-13pt, weight 700, uppercase

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0D2240` | Blueprint blue background |
| `--bg-secondary` | `#0A1A35` | Deeper blue for panels |
| `--bg-elevated` | `#112D50` | Slightly lighter elevated block |
| `--text-primary` | `rgba(150,220,255,0.80)` | Title text — bright cyan |
| `--text-secondary` | `rgba(100,200,255,0.60)` | Body text, line annotations |
| `--accent` | `#64C8FF` | Shape outlines, key highlights |
| `--border` | `rgba(100,180,255,0.22)` | Major grid lines, dividers |

---

## Layout Principles

- **Grid is ever-present**: Both fine and major grids visible on every slide
- **Monospace only**: No exceptions. Every character is Space Mono.
- **Content aligns to major grid**: Text and elements snap to the 60pt major grid where possible
- **Dimension lines for emphasis**: Use technical dimension annotations to highlight measurements or key data
- **Blueprint stamp on every slide**: The circular stamp in bottom-right grounds the technical aesthetic
- **Low opacity palette**: All elements use reduced opacity cyan — nothing is fully opaque except the background

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

---

## Avoid

- **No color or decorative elements** — strictly monochromatic blueprint cyan
- **No non-monospace fonts** — Space Mono only, zero exceptions
- **No photographs or illustrations** — only technical linework
- **No rounded corners on content blocks** — sharp technical edges
- **No high-opacity elements** — everything at 40-80% opacity for blueprint feel
- **No warm colors** — cyan/blue spectrum only
- **No large text** — maximum 13pt for titles; this is technical documentation, not marketing
