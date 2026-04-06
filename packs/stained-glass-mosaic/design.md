# Stained Glass Mosaic Design Spec

## Identity

**Mood**: Vibrant, artistic, cathedral richness
**Best For**: Cultural institutions, museums, arts organizations, heritage presentations

Slides that evoke the transcendent beauty of cathedral rose windows. A dark grout grid divides the canvas into irregular cells of saturated jewel-toned color. Text floats on dark translucent overlays, readable against the visual complexity. The overall effect is sacred geometry meeting contemporary presentation design.

---

## Signature Elements

- **Dark grout gaps**: 2pt dark lines (#0A0A12) separating every colored cell, simulating lead caming between glass panes
- **Jewel-toned cells**: Five core colors — royal blue #1A3A6E, crimson #E63030, golden #F5D020, forest green #2A6E1A, purple #6E1A4E — never adjacent same colors
- **Translucent text overlay**: Dark semi-transparent panel (rgba(0,0,0,0.65-0.75)) behind all text for readability
- **No adjacent same colors**: Adjacent mosaic cells must always differ in hue
- **Wide-spaced serif headings**: Cormorant Garamond Bold with generous tracking

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Cormorant Garamond', 'Trajan', 'Georgia', serif;
  background: #0A0A12;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Mosaic Grid Background

```css
.mosaic-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 2pt;
  background: #0A0A12; /* grout color */
  z-index: 0;
}
.mosaic-cell {
  border-radius: 1pt;
}
.mosaic-cell.blue   { background: #1A3A6E; }
.mosaic-cell.red    { background: #E63030; }
.mosaic-cell.gold   { background: #F5D020; }
.mosaic-cell.green  { background: #2A6E1A; }
.mosaic-cell.purple { background: #6E1A4E; }
```

### Translucent Text Overlay

```css
.text-overlay {
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.70);
  padding: 32pt 48pt;
  border-radius: 2pt;
  max-width: 560pt;
}
```

### Dark Overlay (Full Slide)

```css
.dark-wash {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.30);
  z-index: 1;
  pointer-events: none;
}
```

### Hero Title

```css
h1 {
  font-family: 'Cormorant Garamond', 'Trajan', 'Georgia', serif;
  font-size: 22pt;
  font-weight: 700;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  line-height: 1.35;
  text-align: center;
  margin: 0;
}
```

### Body Text

```css
.body-text {
  font-family: 'Georgia', serif;
  font-size: 14pt;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.6;
  text-align: center;
}
```

### Caption

```css
.caption {
  font-family: 'Georgia', serif;
  font-size: 10pt;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.04em;
  text-align: center;
}
```

---

## Font Pairing

- **Title**: Cormorant Garamond Bold / Trajan, 16-22pt, weight 700, ALL CAPS, wide letter-spacing
- **Body**: Georgia, 13-15pt, weight 400, line-height 1.6
- **Caption**: Georgia, 10pt, weight 400, letter-spacing 0.04em
- **KPI Numbers**: Cormorant Garamond Bold, 28-36pt, weight 700, ALL CAPS

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0A0A12` | Grout/gap color, slide background |
| `--bg-secondary` | `#1A3A6E` | Royal blue — dominant mosaic cell |
| `--bg-elevated` | `rgba(0,0,0,0.70)` | Text overlay panel |
| `--text-primary` | `#FFFFFF` | Headings on overlay |
| `--text-secondary` | `rgba(255,255,255,0.88)` | Body text on overlay |
| `--accent` | `#F5D020` | Golden highlights, accent elements |
| `--border` | `#0A0A12` | Grout lines between cells |

**Mosaic palette**: `#1A3A6E` (blue), `#E63030` (crimson), `#F5D020` (golden), `#2A6E1A` (green), `#6E1A4E` (purple).

---

## Layout Principles

- **Mosaic fills the background**: The colored grid always covers the full slide, visible behind/around the text overlay
- **Text on overlay only**: Never place text directly on mosaic cells — always use the dark translucent overlay
- **Centered composition**: Text overlays center horizontally and vertically
- **Padding**: 32-48pt inside the text overlay panel
- **Color adjacency rule**: No two adjacent cells share the same color — alternate thoughtfully
- **Sparse text**: Keep text minimal; the mosaic is the star, text is the message

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&display=swap">
```

---

## Avoid

- **No pastel cells** — all mosaic colors must be fully saturated jewel tones
- **No large empty cells** — cells should be roughly uniform in size within the grid
- **No sans-serif overlay text** — only serif fonts on the overlays
- **No text directly on mosaic** without an overlay — readability is non-negotiable
- **No adjacent same colors** — every neighboring cell must differ
- **No white or light backgrounds** — the grout/background is always near-black
- **No rounded mosaic cells** — maximum 1-2pt radius to keep the stained-glass feel
- **No more than 5 colors** in the mosaic palette
