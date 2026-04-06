# Isometric 3D Flat Design Spec

## Identity

**Mood**: Technical clarity, structured, architectural
**Best For**: IT architecture, data flow diagrams, system design presentations

Flat-colored cubes and blocks arranged at strict 30-degree isometric angles on
a dark navy canvas. Each face of a block gets a different shade — top lightest,
right mid, left darkest — creating dimensionality without any perspective
distortion. Labels float in monospace. Technical precision meets visual order.

---

## Signature Elements

- **Strict isometric 30-degree angles**: All 3D elements follow true isometric projection (no perspective)
- **Three-face shading system**: Top face #7C6FFF (light), right face #6254E8 (mid), left face #4A3FCC (dark)
- **Dark navy contrast**: Deep #1E1E2E background makes the purple blocks pop
- **Monospace labels**: Space Mono 10-12pt white labels for all body text, reinforcing the technical/blueprint feel
- **Condensed title**: Bebas Neue / Barlow Condensed 28-40pt white title
- **Highlight accents**: Soft purple #A594FF for connectors, arrows, and emphasis
- **KPI/number sizes**: Bebas Neue 40-48pt for metrics, #A594FF highlight

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Space Mono', monospace;
  background: #1E1E2E;
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Isometric Block (CSS)

```css
.iso-block {
  position: relative;
  width: 80pt;
  height: 80pt;
}
/* Top face */
.iso-block .top {
  position: absolute;
  width: 80pt;
  height: 46pt;
  background: #7C6FFF;
  transform: rotate(-30deg) skewX(-30deg) translateY(-40pt);
}
/* Left face */
.iso-block .left {
  position: absolute;
  width: 80pt;
  height: 80pt;
  background: #4A3FCC;
  transform: rotate(0deg) skewY(-30deg);
  transform-origin: bottom left;
}
/* Right face */
.iso-block .right {
  position: absolute;
  width: 80pt;
  height: 80pt;
  background: #6254E8;
  transform: rotate(0deg) skewY(30deg);
  transform-origin: bottom right;
  left: 80pt;
}
```

### Title

```css
h1 {
  font-family: 'Bebas Neue', 'Barlow Condensed', sans-serif;
  font-size: 36pt;
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.15;
  color: #FFFFFF;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}
```

### Label Tag

```css
.label-tag {
  font-family: 'Space Mono', monospace;
  font-size: 10pt;
  font-weight: 400;
  color: #FFFFFF;
  background: rgba(124, 111, 255, 0.3);
  border: 1pt solid rgba(124, 111, 255, 0.5);
  padding: 4pt 10pt;
  letter-spacing: 0.02em;
}
```

### Connector Line

```css
.connector {
  border-top: 1.5pt solid #A594FF;
  position: absolute;
}
.connector.dashed {
  border-top-style: dashed;
}
```

### Body Text

```css
.body-text {
  font-family: 'Space Mono', monospace;
  font-size: 11pt;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}
```

### Metric / Number Display

```css
.metric {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48pt;
  font-weight: 400;
  color: #A594FF;
  letter-spacing: 0.02em;
  line-height: 1.0;
}
```

---

## Font Pairing

- **Title**: Bebas Neue / Barlow Condensed, 28-40pt, weight 400, letter-spacing 0.06em, line-height 1.15, uppercase, white
- **Body/Labels**: Space Mono, 10-12pt, weight 400, line-height 1.6, white
- **KPI/Numbers**: Bebas Neue, 40-48pt, weight 400, #A594FF

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#1E1E2E` | Dark navy background |
| `--bg-secondary` | `#282840` | Slightly lighter panels |
| `--bg-elevated` | `#32325A` | Card or highlighted regions |
| `--text-primary` | `#FFFFFF` | All headline and body text |
| `--text-secondary` | `rgba(255, 255, 255, 0.65)` | Dimmed labels, captions |
| `--accent` | `#A594FF` | Highlight purple — connectors, metrics, emphasis |
| `--border` | `rgba(124, 111, 255, 0.4)` | Block outlines, grid lines |

**Block top face**: `#7C6FFF`
**Block right face**: `#6254E8`
**Block left face**: `#4A3FCC`

---

## Layout Principles

- **Isometric grid alignment**: All 3D elements snap to a 30-degree isometric grid
- **Content in upper half**: Titles and text occupy the upper portion; isometric blocks fill the lower area
- **Left-aligned text**: Technical content reads left-to-right, top-to-bottom
- **Label proximity**: Labels sit directly adjacent to their block, connected by short lines
- **Padding**: 40pt 48pt standard, giving blocks room to breathe against the dark background
- **Sparse composition**: Maximum 4-5 blocks per slide with clear spacing

---

## Avoid

- **No perspective 3D** — strict isometric only (parallel lines never converge)
- **No rounded shapes** — cubes, rectangles, and angular forms only
- **No light backgrounds** — always dark navy (#1E1E2E or darker)
- **No serif fonts** — monospace and condensed sans-serif only
- **No warm colors** — stay in the cool purple/blue spectrum
- **No organic/curved illustrations** — only geometric, architectural forms
- **No gradients on blocks** — each face is a flat solid color

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;800&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```
