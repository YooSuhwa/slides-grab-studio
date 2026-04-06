# Bento Grid Design Spec

## Identity

**Mood**: Modular, informational, Apple-inspired
**Best For**: Feature comparisons, product overviews, data summaries, keynote-style reveals

Information organized into asymmetric, color-coded cells of varying sizes — like a bento box. Each cell is a self-contained module with its own background color and content type. The grid itself IS the design; there are no decorative elements outside of it.

---

## Signature Elements

- **Asymmetric multi-size grid**: Cells span different row/column counts — never equal-sized
- **One dark anchor cell**: Each slide has one dominant navy/dark cell that anchors visual weight
- **Color-coded cells**: Each cell gets a distinct background from the palette — no two adjacent cells share a color
- **Bold stat numbers**: Key metrics displayed at 48-64pt bold inside cells
- **Tight cell gaps**: 8-10pt gap between cells, creating a cohesive mosaic

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 24pt;
  display: flex;
  flex-direction: column;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Bento Grid Container

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8pt;
  flex: 1;
}
/* Cells span different areas using grid-column/grid-row */
```

### Dark Anchor Cell

```css
.cell-dark {
  background: #1A1A2E;
  color: #FFFFFF;
  border-radius: 12pt;
  padding: 20pt 24pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
```

### Colored Cells

```css
.cell-yellow {
  background: #E8FF3B;
  color: #1A1A2E;
  border-radius: 12pt;
  padding: 20pt 24pt;
}
.cell-coral {
  background: #FF6B6B;
  color: #FFFFFF;
  border-radius: 12pt;
  padding: 20pt 24pt;
}
.cell-teal {
  background: #4ECDC4;
  color: #1A1A2E;
  border-radius: 12pt;
  padding: 20pt 24pt;
}
.cell-warm {
  background: #FFE66D;
  color: #1A1A2E;
  border-radius: 12pt;
  padding: 20pt 24pt;
}
```

### Stat Number

```css
.stat {
  font-size: 56pt;
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -0.03em;
}
.stat-label {
  font-size: 11pt;
  font-weight: 500;
  margin-top: 6pt;
  opacity: 0.8;
}
```

### Cell Title

```css
.cell-title {
  font-size: 18pt;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 8pt;
}
```

---

## Font Pairing

- **Title / Cell Title**: SF Pro Display / Inter, 18-24pt, weight 600, letter-spacing -0.01em
- **Body**: Inter, 12-14pt, weight 400, line-height 1.5
- **Stat Number**: SF Pro Display / Inter, 48-64pt, weight 700, letter-spacing -0.03em
- **Caption**: Inter, 10-11pt, weight 400

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#F8F8F2` | Slide background — warm off-white |
| `--bg-secondary` | `#1A1A2E` | Dark anchor cell |
| `--bg-elevated` | `#E8FF3B` | Highlight cell — electric yellow |
| `--text-primary` | `#1A1A2E` | Dark text on light cells |
| `--text-secondary` | `#555555` | Supporting text, descriptions |
| `--accent` | `#FF6B6B` | Coral accent cell / highlight |
| `--border` | `transparent` | No visible borders — color separation only |

**Cell palette**: `#1A1A2E` (navy), `#E8FF3B` (yellow), `#FF6B6B` (coral), `#4ECDC4` (teal), `#FFE66D` (warm yellow). Use 3-4 per slide.

---

## Layout Principles

- **Asymmetry is mandatory**: At least one cell must span 2 columns or 2 rows
- **Dark anchor**: Every slide has exactly one dark navy cell that visually grounds the grid
- **Cell content density**: One idea per cell — a stat, a title+subtitle, or a short list (max 3 items)
- **Grid gap**: 8-10pt consistent gap; the gap color (slide bg) creates the grid lines
- **Padding**: 24pt outer padding around the entire grid
- **Border-radius**: 12pt on all cells, consistent throughout
- **Color adjacency**: Avoid placing two cells of similar brightness next to each other

---

## Avoid

- **No equal-sized cells** — the grid must be asymmetric
- **No more than 5 colors per slide** — pick 3-4 from the palette
- **No dense text in cells** — cells are visual modules, not paragraphs
- **No borders on cells** — color differentiation only, no strokes
- **No white cells** — use the off-white slide background as negative space instead
- **No full-slide text layouts** — this pack is always grid-based
- **No drop shadows on cells** — flat colored surfaces only

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Note: SF Pro Display is an Apple system font — fallback: `-apple-system, 'Inter', sans-serif`
