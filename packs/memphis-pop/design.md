# Memphis Pop Design Spec

## Identity

**Mood**: Energetic, retro-contemporary, anti-minimalist
**Best For**: Fashion, lifestyle, retail, youth marketing, product launches

A celebration of the Memphis Group design movement — bold geometric shapes scattered playfully across warm off-white backgrounds. Triangles, circles, dots, and zigzags in saturated primary colors create controlled chaos. The layout is intentionally unbalanced but visually weighted, making every slide feel like a party invitation designed by a geometry teacher.

---

## Signature Elements

- **Scattered geometric shapes**: Triangles, circle outlines, dots, stars, and zigzag lines distributed across the background
- **Warm off-white background**: #FFF5E0 — never cold white, always warm cream
- **Intentionally balanced asymmetry**: Shapes cluster and scatter with visual weight considered but symmetry deliberately broken
- **Bold display type**: Bebas Neue or Futura ExtraBold for headlines at 32-44pt
- **Primary color palette**: Crimson, royal blue, mint, gold — always saturated, never muted

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Futura', 'DM Sans', sans-serif;
  background: #FFF5E0;
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Scattered Triangle

```css
.memphis-triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 20pt solid transparent;
  border-right: 20pt solid transparent;
  border-bottom: 36pt solid #E8344A;
  z-index: 0;
  pointer-events: none;
}
.memphis-triangle.rotated {
  transform: rotate(25deg);
}
```

### Circle Outline

```css
.memphis-circle {
  position: absolute;
  width: 50pt;
  height: 50pt;
  border-radius: 50%;
  border: 4pt solid #1E90FF;
  background: transparent;
  z-index: 0;
  pointer-events: none;
}
```

### Dot Pattern

```css
.memphis-dot {
  position: absolute;
  width: 12pt;
  height: 12pt;
  border-radius: 50%;
  background: #22BB88;
  z-index: 0;
  pointer-events: none;
}
```

### Zigzag Line

```css
.memphis-zigzag {
  position: absolute;
  width: 80pt;
  height: 20pt;
  background: repeating-linear-gradient(
    90deg,
    transparent 0pt,
    transparent 8pt,
    #FFD700 8pt,
    #FFD700 10pt
  );
  clip-path: polygon(
    0% 100%, 10% 0%, 20% 100%, 30% 0%, 40% 100%,
    50% 0%, 60% 100%, 70% 0%, 80% 100%, 90% 0%, 100% 100%
  );
  z-index: 0;
  pointer-events: none;
}
```

### Hero Title

```css
h1 {
  font-family: 'Bebas Neue', 'Futura', 'DM Sans', sans-serif;
  font-size: 40pt;
  font-weight: 400;
  color: #1A1A1A;
  letter-spacing: 0.04em;
  line-height: 1.05;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
  margin: 0;
}
```

### Accent Word

```css
h1 .accent {
  color: #E8344A;
}
```

### Body Text

```css
.body-text {
  font-family: 'DM Sans', 'Futura', sans-serif;
  font-size: 13pt;
  font-weight: 400;
  color: #3A3530;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}
```

### Memphis Card

```css
.memphis-card {
  background: #FFFFFF;
  border: 3pt solid #1A1A1A;
  padding: 20pt 24pt;
  position: relative;
  z-index: 1;
}
```

---

## Font Pairing

- **Title**: Bebas Neue / Futura ExtraBold, 32-44pt, weight 400-800, uppercase, letter-spacing 0.04em
- **Body**: Futura / DM Sans, 12-14pt, weight 400, line-height 1.6
- **Caption**: DM Sans, 10pt, weight 500, letter-spacing 0.02em
- **KPI Numbers**: Bebas Neue, 48-56pt, weight 400, uppercase
- **Futura fallback**: `'Futura', 'DM Sans', sans-serif` (Futura is system font; falls back to DM Sans)

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FFF5E0` | Warm off-white background |
| `--bg-secondary` | `#FFFFFF` | Card backgrounds |
| `--bg-elevated` | `#1A1A1A` | Dark inverted blocks |
| `--text-primary` | `#1A1A1A` | Headlines, primary text |
| `--text-secondary` | `#3A3530` | Body text, descriptions |
| `--accent` | `#E8344A` | Crimson — triangles, accent words |
| `--border` | `#1A1A1A` | Card borders |

**Shape palette**: Crimson `#E8344A` (triangles), Royal blue `#1E90FF` (circles), Mint `#22BB88` (dots), Gold `#FFD700` (stars/zigzags).

---

## Layout Principles

- **Shapes surround content**: Geometric elements orbit the text area, never obscuring it
- **Balanced asymmetry**: Scatter shapes unevenly but maintain visual weight balance (heavy corner counterweighted)
- **Padding**: 40pt 48pt standard; shapes can extend into padding zone
- **Shape density**: 5-8 decorative shapes per slide; not cluttered, not sparse
- **Text z-index above shapes**: Content always above decorative elements
- **Rotation variety**: Shapes at various angles (15deg, -30deg, 45deg) for dynamism

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap">
```

Note: Futura is a system/licensed font. Use fallback: `'Futura', 'DM Sans', sans-serif`.

---

## Avoid

- **No minimalist compositions** — every slide needs geometric decoration
- **No monochromatic palettes** — minimum 3 colors of shapes per slide
- **No modern/clean sans-serif without character** — use bold, chunky display fonts
- **No pastel or muted shapes** — all colors at full saturation
- **No symmetric grid arrangements** — shapes must feel scattered, not ordered
- **No gradients on shapes** — flat solid fills and outlines only
- **No serif fonts** — Memphis is geometric sans-serif territory
- **No dark backgrounds** — keep it warm and bright
