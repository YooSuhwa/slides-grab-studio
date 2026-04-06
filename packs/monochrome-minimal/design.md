# Monochrome Minimal Design Spec

## Identity

**Mood**: Restrained, luxury, precise, gallery-like
**Best For**: Luxury brands, portfolio showcases, art direction presentations

A whisper, not a shout. This pack strips away everything until only the essential
remains: thin type, vast whitespace, and the quietest possible visual hierarchy.
Every element is placed with the precision of a museum label.

---

## Signature Elements

- **Thin circle outline**: A single centered circle with 1pt stroke, no fill — the pack's icon
- **Descending-width bars**: Horizontal lines that get progressively shorter, creating a visual taper
- **Monospace captions with extreme spacing**: Space Mono at 9pt with wide letter-spacing for a gallery label feel
- **Extreme letter-spacing on titles**: Helvetica Neue Thin / Futura Light with 8-12pt tracking (`letter-spacing: 8pt;` to `12pt;`)
- **Pure grayscale palette**: No color at all, only black, white, and calculated grays
- **KPI/number sizes**: Helvetica Neue Light 28-36pt with 8pt letter-spacing

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Helvetica Neue', 'Arial', sans-serif;
  background: var(--bg-primary);
  padding: 56pt 64pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Title (Thin, Tracked)

```css
h1 {
  font-family: 'Futura', 'DM Sans', 'Helvetica Neue', 'Arial', sans-serif;
  font-size: 32pt;
  font-weight: 200; /* Thin / Light */
  letter-spacing: 10pt; /* Original: 8-12pt extreme letter-spacing */
  line-height: 1.4;
  color: var(--text-primary);
  text-transform: uppercase;
  text-align: center;
}
```

### Thin Circle Outline

```css
.circle-outline {
  width: 180pt;
  height: 180pt;
  border: 1pt solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
```

### Descending-Width Bars (120pt, 80pt, 40pt per original)

```css
.descending-bars {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6pt;
}
.descending-bars .bar {
  height: 1pt;
  background: var(--text-primary);
}
.descending-bars .bar:nth-child(1) { width: 120pt; }
.descending-bars .bar:nth-child(2) { width: 80pt; }
.descending-bars .bar:nth-child(3) { width: 40pt; }
```

### Body Text

```css
.body-text {
  font-family: 'Helvetica Neue', 'Arial', sans-serif;
  font-size: 12pt;
  font-weight: 300;
  line-height: 150%; /* Original: 150% line-height */
  letter-spacing: 0.02em;
  color: var(--text-primary);
}
```

### Gallery Caption

```css
.caption {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  font-weight: 400;
  letter-spacing: 0.3em;
  color: var(--text-secondary);
  text-transform: uppercase;
  text-align: center;
}
```

### Dark Mode Variant

```css
body.dark {
  background: #0A0A0A;
}
body.dark h1 {
  color: #FAFAFA;
}
body.dark .circle-outline {
  border-color: #333333;
}
body.dark .caption {
  color: #888888;
}
```

---

## Font Pairing

- **Title**: Helvetica Neue Thin / Futura Light, 24-36pt, weight 200, letter-spacing 8-12pt, line-height 1.4, uppercase
- **Body**: Helvetica Neue, 11-13pt, weight 300, line-height 150%, letter-spacing 0.02em
- **Caption**: Space Mono, 9pt, weight 400, wide letter-spacing, uppercase
- **KPI/Numbers**: Helvetica Neue Light, 28-36pt, weight 200, letter-spacing 8pt

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FAFAFA` | Near-white background |
| `--bg-secondary` | `#0A0A0A` | Dark mode background |
| `--bg-elevated` | `#F0F0F0` | Subtle card or section fill |
| `--text-primary` | `#1A1A1A` | Headlines and main text |
| `--text-secondary` | `#888888` | Mid-gray body text |
| `--accent` | `#1A1A1A` | No separate accent — emphasis through weight/size only |
| `--border` | `#E0E0E0` | Thin rules, circle outlines, dividers |

**Footnote gray**: `#CCCCCC` for the lightest captions and page numbers.

---

## Layout Principles

- **Centered by default**: All content gravitates to center. This pack is centered-first.
- **Extreme whitespace**: 56-64pt padding minimum. Content occupies the inner 50-60% of the slide.
- **Vertical rhythm**: 32pt between major sections, 16pt between elements, 8pt between text blocks.
- **One focal point**: Each slide has exactly one visual anchor (circle, bars, or a single word).
- **Thin rules as structure**: 1pt lines create invisible grids and separations.
- **Scale contrast**: Huge tracking on titles vs. tight body text creates hierarchy without weight.

---

## Avoid

- **No color at all** — pure grayscale only, no accent hues
- **No decorative illustration** — only geometric primitives (circles, lines)
- **No crowded layouts** — maximum 3 elements per slide
- **No bold or black weights** — heaviest allowed is weight 400 for body
- **No drop shadows or glows** — flat, precise, gallery aesthetic
- **No rounded rectangles** — only circles and straight lines
- **No gradients** — solid fills only
- **No large body text** — body text stays small and quiet (11-13pt)

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap">
```

Note: Helvetica Neue is a system font (`'Helvetica Neue', 'Arial', sans-serif`). Futura uses fallback: `'Futura', 'DM Sans', sans-serif`.
