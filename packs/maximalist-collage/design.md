# Maximalist Collage Design Spec

## Identity

**Mood**: Chaotic energy, irreverent, advertising-bold
**Best For**: Advertising agencies, fashion brands, music labels, editorial presentations

A riot of overlapping, rotated content blocks stacked on antique cream. Every slide looks like a designer's mood board exploded — bold red blocks, near-black panels, and acid yellow accents collide at aggressive angles. Giant ghost numbers haunt the background. Vertical text climbs the edges. Circle outlines punctuate the chaos. Nothing is aligned, and that is the point.

---

## Signature Elements

- **3+ overlapping rotated blocks**: Solid-color rectangles at 2-8 degree rotations, layered on top of each other
- **Giant ghost number**: A massive (64-80pt) numeral at 8% opacity lurking behind content, suggesting hidden order
- **Circle outline accent**: An unfilled circle (2-3pt border) intersecting content blocks, adding tension
- **Vertical text**: Playfair Display Italic running vertically along one edge, creating depth
- **Antique cream background with diagonal texture**: #E8DDD0 with faint diagonal line pattern

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  background: #E8DDD0;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
/* Diagonal texture overlay */
body::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8pt,
    rgba(0, 0, 0, 0.03) 8pt,
    rgba(0, 0, 0, 0.03) 9pt
  );
  pointer-events: none;
  z-index: 0;
}
```

### Rotated Content Block

```css
.collage-block {
  position: absolute;
  padding: 20pt 24pt;
  z-index: 1;
}
.collage-block.red {
  background: #E83030;
  color: #FFFFFF;
  transform: rotate(-3deg);
}
.collage-block.dark {
  background: #1A1A1A;
  color: #FFFFFF;
  transform: rotate(2deg);
}
.collage-block.yellow {
  background: #F5D020;
  color: #1A1A1A;
  transform: rotate(5deg);
}
```

### Ghost Number

```css
.ghost-number {
  position: absolute;
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: 72pt;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.08);
  line-height: 1;
  pointer-events: none;
  z-index: 0;
}
```

### Circle Outline Accent

```css
.circle-accent {
  position: absolute;
  width: 120pt;
  height: 120pt;
  border-radius: 50%;
  border: 2.5pt solid #E83030;
  background: transparent;
  z-index: 2;
  pointer-events: none;
}
```

### Vertical Text

```css
.vertical-text {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-style: italic;
  font-size: 18pt;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.15);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 0.06em;
  position: absolute;
  z-index: 1;
}
```

### Hero Title

```css
h1 {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: 30pt;
  font-weight: 400;
  color: #FFFFFF;
  letter-spacing: 0.04em;
  line-height: 1.05;
  text-transform: uppercase;
  position: relative;
  z-index: 3;
  margin: 0;
}
```

### Body Text

```css
.body-text {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-style: italic;
  font-size: 14pt;
  font-weight: 400;
  color: #1A1A1A;
  line-height: 1.5;
  position: relative;
  z-index: 3;
}
```

### Caption

```css
.caption {
  font-family: 'Space Mono', monospace;
  font-size: 8pt;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.50);
  position: relative;
  z-index: 3;
}
```

---

## Font Pairing

- **Title**: Bebas Neue, 24-34pt, weight 400, uppercase, letter-spacing 0.04em
- **Accent/Editorial**: Playfair Display Italic, 16-22pt, weight 400, vertical writing-mode
- **Ghost Number**: Bebas Neue, 64-80pt, 8% opacity
- **Body**: Playfair Display Italic, 12-14pt, weight 400, line-height 1.5
- **Caption**: Space Mono, 8pt, weight 400
- **KPI Numbers**: Bebas Neue, 48-64pt, weight 400, uppercase

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#E8DDD0` | Antique cream background |
| `--bg-secondary` | `#D8CFC0` | Slightly darker cream for variation |
| `--bg-elevated` | `#1A1A1A` | Near-black content blocks |
| `--text-primary` | `#1A1A1A` | Text on light backgrounds |
| `--text-secondary` | `rgba(0,0,0,0.50)` | Ghost text, secondary captions |
| `--accent` | `#E83030` | Bold red — blocks, circles, highlights |
| `--border` | `#1A1A1A` | Block edges (implied by solid fills) |

**Block palette**: Bold red `#E83030`, Near-black `#1A1A1A`, Acid yellow `#F5D020`.

---

## Layout Principles

- **No alignment**: Blocks overlap, rotate, and break grid deliberately
- **Layer density**: Minimum 3 overlapping elements per slide
- **Ghost number anchoring**: One large ghost number per slide provides subliminal structure
- **Vertical text on edges**: At least one vertical text element per slide along left or right edge
- **Circle intersections**: The circle outline should cross at least one content block
- **Content blocks contain text**: The rotated blocks are not just decoration — they hold headlines, stats, or quotes

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

---

## Avoid

- **No symmetric compositions** — everything must feel deliberately off-balance
- **No clean aligned layouts** — if it looks organized, add more chaos
- **No muted or pastel backgrounds** — antique cream only, never grey or white
- **No thin typography** — all display text is bold or extra-bold
- **No single-element slides** — minimum 3 overlapping elements
- **No rounded corners** — all blocks have sharp edges
- **No subtle color choices** — red is red, black is black, yellow is yellow
