# Liquid Blob Design Spec

## Identity

**Mood**: Organic, fluid, living, bio-digital
**Best For**: Biotech, environmental tech, innovation labs, science presentations

A deep ocean-depth canvas with enormous blurred organic shapes drifting across the background like bioluminescent jellyfish. The blobs overlap and blend at low opacities, creating ethereal color fields. Text floats on top with a subtle colored halo glow, as if lit from within by the living background. The overall feel is simultaneously scientific and dreamlike.

---

## Signature Elements

- **Three overlapping blurred blobs**: Large (250-350pt) circles with heavy blur (80-120pt), each a different hue at 25-35% opacity
- **Ocean-depth dark background**: Multi-stop gradient from #0F2027 through #203A43 to #2C5364
- **Glowing text with colored halo**: Title text has a teal radial text-shadow, creating a bio-luminescent effect
- **Monospace technical accents**: DM Mono or Space Mono for labels and data, reinforcing the lab/tech context
- **Display sans-serif titles**: Bebas Neue at large sizes with wide letter-spacing for bold, clean headlines

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'DM Mono', 'Space Mono', monospace;
  background: linear-gradient(160deg, #0F2027 0%, #203A43 50%, #2C5364 100%);
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Blurred Blob

```css
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100pt);
  pointer-events: none;
  z-index: 0;
}
.blob-teal {
  width: 320pt;
  height: 320pt;
  background: rgba(0, 210, 190, 0.35);
}
.blob-blue {
  width: 280pt;
  height: 280pt;
  background: rgba(0, 120, 255, 0.30);
}
.blob-violet {
  width: 260pt;
  height: 260pt;
  background: rgba(120, 0, 255, 0.25);
}
```

### Glowing Hero Title

```css
h1 {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: 44pt;
  font-weight: 400;
  color: #F0FFFE;
  letter-spacing: 6pt;
  line-height: 1.1;
  text-transform: uppercase;
  text-shadow:
    0 0 24pt rgba(0, 210, 190, 0.5),
    0 0 60pt rgba(0, 210, 190, 0.2);
  position: relative;
  z-index: 1;
  margin: 0;
}
```

### Section Title

```css
h2 {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: 28pt;
  font-weight: 400;
  color: #F0FFFE;
  letter-spacing: 4pt;
  text-transform: uppercase;
  text-shadow: 0 0 16pt rgba(0, 210, 190, 0.35);
  position: relative;
  z-index: 1;
}
```

### Body Text

```css
.body-text {
  font-family: 'DM Mono', 'Space Mono', monospace;
  font-size: 13pt;
  font-weight: 400;
  color: rgba(240, 255, 254, 0.75);
  line-height: 1.65;
  position: relative;
  z-index: 1;
}
```

### Label / Data Point

```css
.label {
  font-family: 'Space Mono', monospace;
  font-size: 10pt;
  font-weight: 700;
  color: rgba(0, 210, 190, 0.8);
  text-transform: uppercase;
  letter-spacing: 3pt;
}
```

---

## Font Pairing

- **Title**: Bebas Neue, 36-48pt, weight 400, uppercase, letter-spacing 6pt
- **Body**: DM Mono / Space Mono, 12-14pt, weight 400, line-height 1.65
- **Caption/Label**: Space Mono, 10pt, weight 700, uppercase, letter-spacing 3pt
- **KPI Numbers**: Bebas Neue, 48-56pt, weight 400, letter-spacing 6pt, teal glow

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0F2027` | Deep ocean gradient start |
| `--bg-secondary` | `#203A43` | Gradient mid-tone |
| `--bg-elevated` | `#2C5364` | Gradient end, elevated surface |
| `--text-primary` | `#F0FFFE` | Title text — near-white with teal tint |
| `--text-secondary` | `rgba(240,255,254,0.75)` | Body text |
| `--accent` | `#00D2BE` | Teal glow, highlights, labels |
| `--border` | `rgba(0,210,190,0.25)` | Subtle teal border for panels |

**Blob palette**: Teal `rgba(0,210,190,0.35)`, Blue `rgba(0,120,255,0.30)`, Violet `rgba(120,0,255,0.25)`.

---

## Layout Principles

- **Blobs behind everything**: At least 2-3 blobs per slide, positioned to create ambient color fields behind content
- **Text above blobs**: All text content at z-index 1 or higher; blobs at z-index 0
- **Padding**: 48pt 56pt standard
- **Sparse content**: Max 4-5 text blocks per slide; the ambient background needs room to breathe
- **Vertical flow**: Top-to-bottom content flow with generous gaps (20-28pt)
- **Asymmetric blob placement**: Blobs should overlap but not center-stack; offset positions create movement

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

---

## Avoid

- **No sharp geometric shapes** — all background elements must be blurred organic forms
- **No bright or warm backgrounds** — the canvas must feel deep and oceanic
- **No dense text blocks** — keep content sparse so the blobs are visible
- **No flat design** — every slide needs depth from layered translucent elements
- **No hard edges on blobs** — minimum blur of 80pt
- **No fully opaque elements** (except text) — panels and blobs stay translucent
- **No serif fonts** — only sans-serif display and monospace body
