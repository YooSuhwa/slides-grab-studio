# Typographic Bold Design Spec

## Identity

**Mood**: Editorial, impactful, design-driven
**Best For**: Brand statements, manifestos, headline announcements

Type IS the visual. No images, no icons, no decoration — just oversized letterforms
commanding the entire slide. A single accent-colored word breaks the monochrome
monotony like a red pen mark on a proof sheet.

---

## Signature Elements

- **Oversized type as main visual**: Titles at 80-120pt fill the slide, functioning as both content and graphic
- **Single accent color word**: Exactly one word per slide in signal red #E63030 — never more
- **Almost no margins**: 16-24pt padding maximum; type bleeds to the edge of comfort
- **Tight tracking**: Tight negative tracking on display type (`letter-spacing: -2pt;`) matching original spec
- **Tiny monospace footnote**: Space Mono 9pt wide spacing bottom-right corner
- **KPI/number sizes**: 64-96pt Bebas Neue for oversized metrics (original 80-120pt reduced ~20%)
- **Two-mode backgrounds**: Off-white #F0EDE8 (default) or pure black #0A0A0A (inverted)

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  background: var(--bg-primary);
  padding: 20pt 24pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Hero Title (Oversized)

```css
h1 {
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  font-size: 96pt;
  font-weight: 400; /* Bebas Neue only has 400 */
  letter-spacing: -2pt;
  line-height: 0.92;
  color: var(--text-primary);
  text-transform: uppercase;
  margin: 0;
}
h1 .accent {
  color: var(--accent); /* #E63030 signal red */
}
```

### Dark Inverted Variant

```css
body.dark {
  background: #0A0A0A;
  color: #F0EDE8;
}
body.dark h1 {
  color: #F0EDE8;
}
body.dark h1 .accent {
  color: #E63030;
}
```

### Body Text (Minimal)

```css
.body-text {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
  max-width: 280pt;
}
```

### Footnote / Caption

```css
.footnote {
  font-family: 'Space Mono', monospace;
  font-size: 8pt;
  color: #AAAAAA;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  position: absolute;
  bottom: 16pt;
}
```

---

## Font Pairing

- **Title**: Bebas Neue / Anton, 80-120pt (oversized 60pt+ reduce ~20% → 64-96pt), weight 400, letter-spacing -2pt, line-height 0.9-0.95
- **KPI/Numbers**: Bebas Neue, 64-96pt, weight 400, letter-spacing -2pt
- **Body**: Space Mono, 9pt, weight 400, line-height 1.5, wide spacing

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#F0EDE8` | Off-white warm background (default mode) |
| `--bg-secondary` | `#0A0A0A` | Black background (inverted mode) |
| `--bg-elevated` | `#E8E4DE` | Subtle card or block fill |
| `--text-primary` | `#1A1A1A` | Main headline text |
| `--text-secondary` | `#AAAAAA` | Footnotes, captions, supporting text |
| `--accent` | `#E63030` | Single accent word — signal red |
| `--border` | `#D0CCC6` | Minimal divider lines |

---

## Layout Principles

- **Type dominance**: The title occupies 60-80% of the slide area. It is the design.
- **Vertical centering**: Content centers vertically by default; slight bottom-bias for cover slides.
- **Minimal padding**: 16-24pt edges. The type itself creates breathing room through tracking and line-height.
- **One idea per slide**: Maximum 1 headline + 1 line of body text. If you need more, split the slide.
- **No grid**: Free-form placement. The type weight and size create structure.
- **Accent discipline**: Only one word per slide gets the red treatment. Zero is also acceptable.

---

## Avoid

- **No images or icons** — type is the only visual element
- **No more than 3 lines** of display text per slide
- **No mixing font families** — Bebas Neue for display, Space Mono for body, nothing else
- **No gradients** — flat solid colors only
- **No shadows or glows** — no text-shadow, no box-shadow
- **No decorative elements** — no rules, no shapes, no ornaments
- **No lightweight type** — display text must never be thin or light weight
- **No centered body text** — body text stays left-aligned at small size
- **No multiple accent colors** — only #E63030, only one word

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```
