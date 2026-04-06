# Risograph Print Design Spec

## Identity

**Mood**: Indie, artisanal printing, CMYK overlap, analog warmth
**Best For**: Independent publishers, music labels, art zines, gallery openings, creative studios

The tactile warmth of a risograph print shop. Three large color circles overlap on aged paper, their intersections creating secondary colors through multiply blending. The offset ghost title — a shifted duplicate at low opacity — mimics the imperfect registration of real riso printing. Everything feels handmade, slightly imprecise, and artistically deliberate.

---

## Signature Elements

- **Three overlapping multiply-blend circles**: Large circles in riso red, riso blue, and riso yellow that overlap to create secondary hues
- **Offset ghost title**: A duplicate of the title text shifted 3px right and 3px down at 25% opacity in riso red, simulating print misregistration
- **Warm paper background**: #F7F2E8 — aged, warm, slightly textured-looking paper
- **Wide-spaced display type**: Bebas Neue with 4pt letter-spacing for bold, poster-like headlines
- **Monospace captions**: Space Mono for metadata, dates, and small supporting text

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  background: #F7F2E8;
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Riso Circle (Multiply Blend)

```css
.riso-circle {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 0;
}
.riso-circle.red {
  width: 260pt;
  height: 260pt;
  background: #E8344A;
  opacity: 0.75;
}
.riso-circle.blue {
  width: 240pt;
  height: 240pt;
  background: #0D5C9E;
  opacity: 0.70;
}
.riso-circle.yellow {
  width: 220pt;
  height: 220pt;
  background: #F5D020;
  opacity: 0.65;
}
```

### Ghost Title (Offset Misregistration)

```css
.title-wrapper {
  position: relative;
  z-index: 1;
}
.title-wrapper::before {
  content: attr(data-text);
  position: absolute;
  top: 3pt;
  left: 3pt;
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: rgba(232, 52, 74, 0.25);
  pointer-events: none;
  z-index: -1;
}
```

### Hero Title

```css
h1 {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: 40pt;
  font-weight: 400;
  color: #1A1A1A;
  letter-spacing: 4pt;
  line-height: 1.05;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
  margin: 0;
}
```

### Body Text

```css
.body-text {
  font-family: 'Space Mono', monospace;
  font-size: 10pt;
  font-weight: 400;
  color: #3A3530;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}
```

### Caption

```css
.caption {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  color: #8A8070;
  letter-spacing: 1pt;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}
```

### Riso Card

```css
.riso-card {
  background: rgba(255, 255, 255, 0.6);
  border: 1.5pt solid #1A1A1A;
  padding: 20pt 24pt;
  position: relative;
  z-index: 1;
}
```

---

## Font Pairing

- **Title**: Bebas Neue, 34-44pt, weight 400, uppercase, letter-spacing 4pt
- **Body**: Space Mono, 9-11pt, weight 400, line-height 1.6
- **Caption**: Space Mono, 9pt, weight 400, uppercase
- **KPI Numbers**: Bebas Neue, 48-56pt, weight 400, letter-spacing 4pt
- **Ghost Title**: Bebas Neue, same size as title, #E8344A @ 25%, shifted 3px right + 3px down

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#F7F2E8` | Warm aged paper background |
| `--bg-secondary` | `#EDE8DC` | Slightly darker paper variant |
| `--bg-elevated` | `rgba(255,255,255,0.60)` | Card overlay on paper |
| `--text-primary` | `#1A1A1A` | Headlines, primary text |
| `--text-secondary` | `#3A3530` | Body text |
| `--accent` | `#E8344A` | Riso red — primary accent, ghost text |
| `--border` | `#1A1A1A` | Card borders |

**Riso palette**: Red `#E8344A`, Blue `#0D5C9E`, Yellow `#F5D020`. Overlaps via multiply blend create secondary colors naturally.

---

## Layout Principles

- **Circles set the scene**: The three overlapping riso circles establish the visual identity; they should be large and prominent
- **Text over circles**: Content floats above the blended circles, reading against the warm paper
- **Ghost offset on all titles**: Every major title gets the 3pt offset ghost duplicate in riso red @ 25%
- **Multiply blend only**: Color overlaps use `mix-blend-mode: multiply` exclusively
- **Padding**: 40pt 48pt standard
- **Sparse composition**: Max 2-3 text blocks per slide; the riso circles are the main visual

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

---

## Avoid

- **No digital-crisp shapes** — edges should feel slightly organic, not pixel-perfect
- **No dark backgrounds** — always warm paper tones
- **No screen-blend mode** — only multiply blend for color overlaps
- **No more than 3 color circles** — red, blue, yellow only
- **No fully opaque circles** — always 65-75% opacity for proper blending
- **No gradients** — flat solid circle fills with multiply blending
- **No serif fonts** — sans-serif display (Bebas Neue) and monospace (Space Mono) only
- **No cold white paper** — background must be warm (#F7F2E8 or similar)
