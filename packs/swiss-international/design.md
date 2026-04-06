# Swiss International Design Spec

## Identity

**Mood**: Functional, authoritative, timeless, corporate
**Best For**: Consulting, finance, government, institutional presentations, annual reports

The International Typographic Style applied to slides. Strict grid alignment, Helvetica typography, and a single accent color (signal red) used with surgical precision. Every element exists for a functional reason. The design communicates competence and clarity above all else.

---

## Signature Elements

- **Left-edge vertical red bar**: A 4-8pt-wide red strip on the left margin — the pack's signature mark
- **Horizontal rule divider**: A 1pt line separating title area from content area
- **Grid-aligned text**: All text snaps to a strict baseline grid; no free-floating elements
- **Signal red accent**: One color only (#E8000D), used for the vertical bar, key numbers, and nothing else
- **Monospace captions**: Small, utilitarian metadata in Space Mono

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 48pt 56pt 48pt 64pt;
  display: flex;
  flex-direction: column;
  position: relative;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Vertical Red Bar

```css
.red-bar {
  position: absolute;
  left: 0;
  top: 48pt;
  bottom: 48pt;
  width: 4pt;
  background: #E8000D;
}
/* Anchored to left edge of slide, within vertical padding bounds */
```

### Horizontal Divider

```css
.divider {
  width: 100%;
  height: 1pt;
  background: var(--border);
  margin: 16pt 0 20pt 0;
}
```

### Title Block

```css
h1 {
  font-size: 40pt;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 4pt;
}
.subtitle {
  font-size: 14pt;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 1.4;
}
/* Title block sits above the horizontal divider */
```

### Content Grid

```css
.content-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24pt;
  flex: 1;
  align-content: start;
}
/* Strict columnar layout, no overlapping */
```

### Monospace Caption

```css
.caption {
  font-family: 'Space Mono', 'Courier New', monospace;
  font-size: 9pt;
  font-weight: 400;
  color: var(--text-secondary);
  letter-spacing: 3pt;
  text-transform: uppercase;
}
```

### Red Accent Number

```css
.metric-red {
  font-size: 48pt;
  font-weight: 700;
  color: #E8000D;
  line-height: 1.0;
  letter-spacing: -0.03em;
}
```

### Minimal Card

```css
.swiss-card {
  border-top: 1pt solid var(--border);
  padding-top: 16pt;
}
/* No background, no border-radius. Just a top border to separate sections. */
```

---

## Font Pairing

- **Title**: Helvetica Neue Bold / Arial Bold, 32-44pt, weight 700, tight leading, letter-spacing -0.02em
- **Body**: Helvetica Neue / Arial, 12-14pt, weight 400, line-height 1.6
- **Caption / Label**: Space Mono, 9-10pt, weight 400, uppercase, letter-spacing 3-4pt

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Pure white background |
| `--bg-secondary` | `#F5F5F5` | Alternate section background |
| `--bg-elevated` | `#FFFFFF` | Cards are white — no fill, border-top only |
| `--text-primary` | `#111111` | Near-black headings and body |
| `--text-secondary` | `#444444` | Captions, supporting text |
| `--accent` | `#E8000D` | Signal red — vertical bar, key metrics only |
| `--border` | `#DDDDDD` | Horizontal rules, card borders |

**Rule**: Red is used in exactly 2 places — the vertical bar and key metric numbers. Nowhere else.

---

## Layout Principles

- **Grid discipline**: Strict 5-column (or 12-column) grid — all elements snap to columns, no free-floating items
- **Title-divider-content**: Standard slide structure is title block > horizontal rule > content area
- **Vertical red bar**: Present on every slide, always left edge
- **Asymmetric left padding**: 64pt left (to clear the red bar), 56pt right
- **Whitespace as structure**: Sections separated by space, not decorative elements
- **Single-column for text-heavy slides**: Do not force multi-column on paragraphs
- **Bottom caption**: Slide number or source in monospace, bottom-right

---

## Avoid

- **No decorative elements** — no shapes, icons, illustrations, or ornaments
- **No rounded corners** — border-radius: 0 on everything
- **No more than 2 fonts** — Helvetica Neue + Space Mono only
- **No gradients** — flat solid colors only
- **No colored backgrounds** — white or near-white only
- **No red text in body copy** — red is reserved for the bar and key metrics
- **No shadows** — zero box-shadow or text-shadow
- **No bold body text** — body is always weight 400; bold is reserved for titles

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

Note: Helvetica Neue is a system font — fallback: `'Helvetica Neue', 'Arial', sans-serif`
