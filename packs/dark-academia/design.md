# Dark Academia Design Spec

## Identity

**Mood**: Scholarly, vintage, refined, literary
**Best For**: Education, historical research, book presentations, academic lectures, literary analysis

The aesthetic of a centuries-old library at midnight — dark wood tones, antique gold accents, and serif typography that recalls printed manuscripts. Every slide feels like a page from a leather-bound volume illuminated by candlelight.

---

## Signature Elements

- **Double inset gold border**: A distinctive framing element — two nested thin gold lines with padding between them
- **Italic serif titles**: Playfair Display Italic or Georgia Italic for all major headings
- **Monospace footnotes**: Muted gold monospace text for annotations, citations, and metadata
- **Antique gold color system**: All accents and highlights use warm gold tones, never bright or cold colors
- **Parchment-toned body text**: Body text in warm cream (#D4BF9A), not pure white

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  color: var(--text-secondary);
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Double Inset Gold Border

```css
.academia-frame {
  position: absolute;
  inset: 20pt;
  border: 1pt solid rgba(201, 168, 76, 0.5);
  pointer-events: none;
}
.academia-frame::after {
  content: '';
  position: absolute;
  inset: 6pt;
  border: 1pt solid rgba(201, 168, 76, 0.3);
}
/* Place as first child of body, behind all content */
```

### Hero Title (Italic Serif)

```css
h1 {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-style: italic;
  font-size: 44pt;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.15;
  letter-spacing: 6pt;
  text-align: center;
}
```

### Section Divider

```css
.divider {
  width: 60pt;
  height: 1pt;
  background: var(--accent);
  opacity: 0.5;
  margin: 16pt 0;
}
```

### Monospace Footnote / Label

```css
.footnote {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  color: rgba(201, 168, 76, 0.5);
  letter-spacing: 3pt;
  position: absolute;
  bottom: 28pt;
  left: 56pt;
}
.label {
  font-family: 'Space Mono', monospace;
  font-size: 10pt;
  color: #8A7340;
  letter-spacing: 4pt;
  text-transform: uppercase;
}
```

### Dark Card (Parchment Panel)

```css
.dark-card {
  background: rgba(61, 46, 16, 0.4);
  border: 1pt solid rgba(201, 168, 76, 0.2);
  border-radius: 4pt;
  padding: 20pt 24pt;
}
```

### Pull Quote

```css
.pull-quote {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-style: italic;
  font-size: 24pt;
  color: var(--accent);
  line-height: 1.4;
  border-left: 2pt solid rgba(201, 168, 76, 0.4);
  padding-left: 20pt;
}
```

---

## Font Pairing

- **Title**: Playfair Display Italic / Georgia Italic, 36-48pt, weight 700, line-height 1.15, centered with letter-spacing 6-10pt
- **Body**: EB Garamond / Georgia, 13-16pt, weight 400, line-height 1.7 (leading 1.6-1.8)
- **Label / Footnote**: Space Mono, 9-11pt, weight 400, color muted gold, letter-spacing 3-4pt

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#1A1208` | Deep dark brown — aged leather background |
| `--bg-secondary` | `#0E0A05` | Darker variant for alternate slides |
| `--bg-elevated` | `rgba(61,46,16,0.4)` | Card/panel backgrounds — translucent amber |
| `--text-primary` | `#C9A84C` | Antique gold — titles and highlights |
| `--text-secondary` | `#D4BF9A` | Warm parchment — body text |
| `--accent` | `#C9A84C` | Gold accent — borders, decorative elements |
| `--border` | `#3D2E10` | Dark warm brown — subtle structural borders |

**Muted gold**: `#8A7340` for less prominent accents, footnotes, and secondary decorative elements.

---

## Layout Principles

- **Frame everything**: The double inset gold border should appear on most slides
- **Generous margins**: 48-56pt padding minimum — the dark space around content creates gravitas
- **Vertical rhythm**: Content flows top-to-bottom with clear section breaks (gold dividers)
- **Left-aligned default**: Center-aligned only for cover slides and pull quotes
- **Sparse content**: 2-4 elements per slide maximum; dense text defeats the aesthetic
- **Footnote position**: Always bottom-left, monospace, very small and muted

---

## Avoid

- **No modern sans-serif fonts** — this pack lives in serif and monospace only
- **No bright colors** — no blues, greens, reds, or anything outside the gold/brown palette
- **No clean minimal layouts** — every slide needs texture (borders, dividers, framing)
- **No large border-radius** — max 4pt; this is classical, not modern
- **No drop shadows** — the depth comes from dark tones and border layering
- **No white or light backgrounds** — always dark, always warm-toned
- **No emoji or modern iconography** — use typographic ornaments or nothing

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```
