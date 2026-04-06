# Editorial Magazine Design Spec

## Identity

**Mood**: Journalistic, narrative, sophisticated
**Best For**: Annual reports, brand stories, long-form narrative content

A spread from a premium print magazine, translated to screen. The tension between
a crisp white column and a dark editorial block creates drama. Playfair Display
italics whisper elegance, while a short red rule anchors the eye. Every slide
reads like a carefully art-directed page.

---

## Signature Elements

- **Asymmetric white/dark split (55/45)**: Left 55% white, right 45% dark (#1A1A1A) — never centered
- **Short red rule under title**: A 60pt wide, 2pt thick #E63030 line directly beneath the headline
- **Rotated vertical label**: A monospace label rotated -90deg, placed along the left edge
- **Italic serif display**: Playfair Display Italic for all headlines — the editorial signature
- **Monospace subheads**: Space Mono in all-caps for section labels and categories

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Georgia', serif;
  background: #FFFFFF;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Asymmetric Split

```css
.column-white {
  flex: 0 0 55%;
  background: #FFFFFF;
  padding: 48pt 40pt 48pt 56pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.column-dark {
  flex: 0 0 45%;
  background: #1A1A1A;
  padding: 48pt 40pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #FFFFFF;
}
```

### Editorial Title with Red Rule

```css
h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: 40pt;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.15;
  color: var(--text-primary);
  margin-bottom: 12pt;
}
h1::after {
  content: '';
  display: block;
  width: 60pt; /* Original: 60pt wide */
  height: 2pt; /* Original: thin red rule 2pt */
  background: #E63030;
  margin-top: 12pt;
}
```

### Rotated Vertical Label (rotated 90° in dark zone per original)

```css
.vertical-label {
  font-family: 'Space Mono', monospace;
  font-size: 8pt;
  font-weight: 400;
  letter-spacing: 2.5pt; /* Original: 2-3pt letter-spacing */
  text-transform: uppercase;
  color: var(--text-secondary);
  position: absolute;
  left: 16pt;
  top: 50%;
  transform: rotate(-90deg) translateX(-50%);
  transform-origin: left center;
  white-space: nowrap;
}
```

### Monospace Subhead

```css
.subhead {
  font-family: 'Space Mono', monospace;
  font-size: 8pt;
  font-weight: 400;
  letter-spacing: 2.5pt; /* Original: 2-3pt letter-spacing */
  text-transform: uppercase;
  color: #BBBBBB;
  margin-bottom: 8pt;
}
```

### Body Text

```css
.body-text {
  font-family: 'Georgia', serif;
  font-size: 12pt;
  font-weight: 400;
  line-height: 1.7;
  color: var(--text-primary);
}
```

---

## Font Pairing

- **Title**: Playfair Display Italic, 34-48pt, weight 700, letter-spacing -0.01em, line-height 1.15
- **Subhead**: Space Mono, 8-9pt, weight 400, letter-spacing 2-3pt, uppercase
- **Body**: Georgia, 11-13pt, weight 400, line-height 1.7
- **KPI/Numbers**: Playfair Display, 40-48pt, weight 700

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | White editorial column |
| `--bg-secondary` | `#1A1A1A` | Dark editorial block |
| `--bg-elevated` | `#F5F5F0` | Warm off-white for pull quotes or insets |
| `--text-primary` | `#1A1A1A` | Headlines, body text on white |
| `--text-secondary` | `#BBBBBB` | Captions, labels, subheads |
| `--accent` | `#E63030` | Red rule line only — never on text |
| `--border` | `#E0E0E0` | Subtle dividers |

---

## Layout Principles

- **Asymmetry is mandatory**: 55/45 split. Never 50/50. The tension drives the editorial feel.
- **Red rule discipline**: One short red line per slide, always directly under the headline.
- **Vertical label on every slide**: The rotated label anchors the left gutter like a magazine folio.
- **Content on white side**: Primary reading content lives on the white column. Dark side holds supporting visuals or pull quotes.
- **Generous line-height**: Body text at 1.7 line-height for readability.
- **Padding**: 48pt 56pt on white side, 48pt 40pt on dark side.

---

## Avoid

- **No symmetric layouts** — the asymmetric split is the identity
- **No sans-serif display type** — headlines must be Playfair Display Italic
- **No full-bleed solid colors** — always maintain the white/dark column structure
- **No heavy body text** — body stays at 11-13pt Georgia, never bold
- **No multiple accent colors** — only #E63030, only as the rule line
- **No drop shadows** — clean print aesthetic
- **No rounded corners** — sharp editorial edges
- **No centered text** — left-aligned within each column

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

Note: Georgia is a system font (`'Georgia', serif`).
