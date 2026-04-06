# Duotone Split Design Spec

## Identity

**Mood**: Dramatic, comparative, energetic
**Best For**: Strategy decks, before/after, compare/contrast presentations

The slide is cleaved exactly in half — searing orange-red on the left, deep navy on
the right. A thin white divider separates the two worlds. Content mirrors across
the divide with cross-panel color echoing: left-side text is white, right-side
accents borrow the orange-red from the left.

---

## Signature Elements

- **Exact 50/50 vertical split**: Left panel #FF4500 orange-red, right panel #1A1A2E navy — always equal halves
- **White divider line**: 2pt solid white vertical line at the center seam
- **Cross-panel color echo**: Text on navy side uses #FF4500 for emphasis, creating visual continuity
- **Bold condensed type**: Bebas Neue at 40-56pt, vertical writing-mode optional, for maximum impact in tight panels
- **High contrast text**: White on orange-red, white + orange accents on navy
- **KPI/number sizes**: Bebas Neue 48-56pt for metrics within panels

---

## CSS Patterns

### Base Slide (Split Layout)

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Bebas Neue', sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Left Panel (Orange-Red)

```css
.panel-left {
  flex: 0 0 50%;
  background: #FF4500;
  padding: 40pt 36pt 40pt 40pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #FFFFFF;
  border-right: 2pt solid #FFFFFF; /* 2-4pt per original */
}
.panel-left h2 {
  font-size: 48pt;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.05;
  text-transform: uppercase;
  color: #FFFFFF;
}
```

### Right Panel (Navy)

```css
.panel-right {
  flex: 0 0 50%;
  background: #1A1A2E;
  padding: 40pt 40pt 40pt 36pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #FFFFFF;
}
.panel-right h2 {
  font-size: 48pt;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.05;
  text-transform: uppercase;
  color: #FFFFFF;
}
.panel-right .accent {
  color: #FF4500; /* Cross-panel echo */
}
```

### Caption / Body Text

```css
.caption {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 16pt;
}
```

### Single-Side Variant (Hero)

```css
body.hero-left {
  background: #FF4500;
  padding: 48pt 56pt;
  color: #FFFFFF;
}
body.hero-right {
  background: #1A1A2E;
  padding: 48pt 56pt;
  color: #FFFFFF;
}
```

---

## Font Pairing

- **Title**: Bebas Neue, 40-56pt, weight 400, letter-spacing 0.02em, line-height 1.05, uppercase, vertical writing-mode optional
- **KPI/Numbers**: Bebas Neue, 48-56pt, weight 400
- **Body/Caption**: Space Mono, 9pt, weight 400, line-height 1.5

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FF4500` | Left panel background (orange-red) |
| `--bg-secondary` | `#1A1A2E` | Right panel background (navy) |
| `--bg-elevated` | `#2A2A4E` | Lighter navy for cards on dark side |
| `--text-primary` | `#FFFFFF` | All heading text on both panels |
| `--text-secondary` | `rgba(255,255,255,0.75)` | Body/caption text |
| `--accent` | `#FF4500` | Cross-panel echo on navy side |
| `--border` | `#FFFFFF` | Center divider line |

---

## Layout Principles

- **Always 50/50**: The split is sacred. Never 60/40 or 70/30.
- **Symmetry in structure, contrast in color**: Both panels use the same layout grid, mirrored.
- **Vertical centering**: Content within each panel is vertically centered.
- **Panel padding**: 40pt on outer edges, 36pt on divider-adjacent edges.
- **Content parity**: Similar amount of content on each side. One side heavy, one light is disorienting.
- **Divider always visible**: The 2pt white line never disappears, even on single-focus slides.

---

## Avoid

- **No three or more panels** — always exactly two
- **No similar hues on both sides** — the panels must have maximum color contrast
- **No busy content** — each panel gets one headline + 2-3 supporting lines max
- **No images** — color and type only
- **No gradients within panels** — solid flat fills
- **No rounded corners** — panels are hard-edged, full-bleed
- **No drop shadows** — flat graphic aesthetic
- **No small type for headlines** — minimum 40pt display text

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```
