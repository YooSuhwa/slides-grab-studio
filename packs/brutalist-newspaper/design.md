# Brutalist Newspaper Design Spec

## Identity

**Mood**: Editorial authority, raw journalism, broadsheet heritage
**Best For**: Media companies, research institutes, data journalism, policy briefings

Slides that feel torn from the front page of a serious broadsheet. A heavy dark masthead bar anchors every slide, double rules separate sections, and the body is set in tight newspaper columns. The typography is exclusively serif and monospace — no sans-serif anywhere. Ink-on-aged-paper texture creates gravitas and trustworthiness.

---

## Signature Elements

- **Dark masthead bar**: Full-width dark bar (#1A1208) across the top 48-56pt of every slide, containing the title in light text
- **Double rule below masthead**: Two horizontal lines (3pt + 1pt with 3pt gap) separating the masthead from body content
- **Two-column layout with vertical divider**: Body content split into two columns with a thin vertical rule
- **Aged paper background**: Warm off-white #F2EFE8 that feels like newsprint
- **Monospace datelines**: Small monospace text for dates, labels, and metadata

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Georgia', 'Times New Roman', serif;
  background: #F2EFE8;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Masthead Bar

```css
.masthead {
  width: 100%;
  background: #1A1208;
  padding: 12pt 40pt;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.masthead h1 {
  font-family: 'Space Mono', monospace;
  font-size: 13pt;
  font-weight: 700;
  color: #F2EFE8;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0;
}
```

### Double Rule

```css
.double-rule {
  width: 100%;
  padding: 0 40pt;
  margin: 0;
  flex-shrink: 0;
}
.double-rule::before,
.double-rule::after {
  content: '';
  display: block;
  width: 100%;
  background: #1A1208;
}
.double-rule::before {
  height: 3pt;
  margin-bottom: 3pt;
}
.double-rule::after {
  height: 1pt;
}
```

### Two-Column Body

```css
.columns {
  display: flex;
  gap: 0;
  padding: 20pt 40pt 24pt;
  flex: 1;
}
.column {
  flex: 1;
  padding: 0 16pt;
}
.column + .column {
  border-left: 0.5pt solid #1A1208;
}
```

### Headline

```css
h2 {
  font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
  font-size: 24pt;
  font-weight: 700;
  color: #1A1208;
  line-height: 1.15;
  margin: 0 0 8pt;
}
```

### Body Text

```css
.body-text {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 10pt;
  font-weight: 400;
  color: #3A3020;
  line-height: 1.5;
  text-align: justify;
}
```

### Dateline / Label

```css
.dateline {
  font-family: 'Space Mono', monospace;
  font-size: 8pt;
  font-weight: 700;
  color: #3A3020;
  text-transform: uppercase;
  letter-spacing: 1pt;
  margin-bottom: 6pt;
}
```

---

## Font Pairing

- **Masthead**: Space Mono Bold, 12-14pt, uppercase, tight letter-spacing
- **Headline**: Georgia Bold / Playfair Display Bold, 20-28pt, weight 700, line-height 1.15
- **Body**: Georgia, 9-11pt, weight 400, line-height 1.5, justified
- **Dateline**: Space Mono, 7-9pt, weight 700, uppercase, letter-spacing 1pt
- **KPI Numbers**: Georgia Bold, 36-48pt, weight 700

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#F2EFE8` | Aged paper background |
| `--bg-secondary` | `#E8E2D8` | Alternate section background |
| `--bg-elevated` | `#1A1208` | Masthead bar, inverted blocks |
| `--text-primary` | `#1A1208` | Headlines, masthead on light bg |
| `--text-secondary` | `#3A3020` | Body text, datelines |
| `--accent` | `#1A1208` | Rules, dividers — same as text-primary |
| `--border` | `#1A1208` | Column dividers, horizontal rules |

---

## Layout Principles

- **Masthead-first**: Every slide starts with the dark masthead bar at the top
- **Column-based**: Body content in 2 columns with a vertical divider; 3 columns for data-heavy slides
- **Justified text**: Body copy is always justified for newspaper authenticity
- **Tight spacing**: 16-20pt gaps between elements; newsprint is dense
- **Padding**: 40pt horizontal throughout; content never touches the masthead bar edges
- **Hierarchy through weight**: Bold headlines, regular body, monospace metadata

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

---

## Avoid

- **No modern sans-serif fonts** — only serif (Georgia, Playfair Display) and monospace (Space Mono)
- **No colorful elements** — strictly monochromatic: dark brown on aged paper
- **No clean white backgrounds** — background must be warm/aged paper tone
- **No rounded corners** — all elements are sharp-edged
- **No images or illustrations** — text and rules only
- **No wide letter-spacing on body text** — tight, newspaper-dense setting
- **No centered body text** — headlines can center, body text is justified
- **No gradients or shadows** — flat, ink-on-paper aesthetic
