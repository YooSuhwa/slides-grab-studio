# Typographic Bold Design Spec

## Identity

**Mood**: Editorial, impactful, design-driven, authoritative
**Best For**: Brand statements, manifestos, headline announcements

Type IS the visual. No images, no icons, no decoration — just oversized letterforms
commanding the entire slide. A single accent-colored word breaks the monochrome
monotony like a red pen mark on a proof sheet.

---

## Signature Elements

- **Oversized type as main visual**: Titles at 80-120pt fill the slide, functioning as both content and graphic
- **Single accent color word**: Exactly one word per slide in signal red #E63030 — never more
- **Almost no margins**: 16pt padding maximum; type bleeds toward edges
- **Tight tracking**: Negative tracking on display type (`letter-spacing: -2pt;`)
- **Tiny monospace footnote**: Space Mono 9pt, uppercase, wide spacing, bottom-right corner
- **Two-mode backgrounds**: Off-white #F0EDE8 (default) or pure black #0A0A0A (inverted)
- **2-3 lines maximum**: Massive scale text only. No paragraphs, no bullet points on display slides

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Bebas Neue', 'Anton', sans-serif;
  background: var(--bg-primary);
  padding: 16pt;
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
  font-family: var(--font-mono, 'Space Mono'), monospace;
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
  font-family: var(--font-mono, 'Space Mono'), monospace;
  font-size: 8pt;
  color: #AAAAAA;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  position: absolute;
  bottom: 16pt;
  right: 16pt;
}
```

---

## Slide Type Layouts

### Cover

```
┌──────────────────────────────────────┐
│                                      │
│  MASSIVE                             │
│  HEADLINE <accent>HERE</accent>      │  ← 96-120pt, 1-2 lines
│                                      │
│                          LABEL 2026  │  ← footnote, bottom-right
└──────────────────────────────────────┘
```
- Title: 96-120pt, vertically centered, slight bottom-bias
- No subtitle. If context needed, use 9pt monospace footnote bottom-right
- Dark mode (`body.dark`) preferred for impact

### Section Divider

```
┌──────────────────────────────────────┐
│                                      │
│  SECTION                             │
│  <accent>TITLE</accent>              │  ← 88-96pt, 1-2 lines
│                                      │
│                           01 / 05    │  ← footnote with section number
└──────────────────────────────────────┘
```
- Title: 88-96pt, centered vertically
- Section number as footnote bottom-right (e.g., "01 / 05")
- Alternate light/dark backgrounds for rhythm

### Content (Minimal)

```
┌──────────────────────────────────────┐
│                                      │
│  SHORT <accent>HEADLINE</accent>     │  ← 72-80pt
│                                      │
│  Supporting line in monospace        │  ← 9pt Space Mono, 1-2 lines max
│                                      │
│                          SOURCE      │  ← footnote
└──────────────────────────────────────┘
```
- Title: 72-80pt, takes 40-60% of slide
- Body: Space Mono 9pt, 1-2 lines maximum. Left-aligned, not centered
- No bullet points — if listing, split into separate slides

### Big Metric / KPI

```
┌──────────────────────────────────────┐
│                                      │
│  <accent>247%</accent>               │  ← 80-96pt Bebas Neue, accent color
│  GROWTH IN Q4                        │  ← 36-48pt Bebas Neue, text-primary
│                                      │
│                          YOY 2025    │  ← footnote
└──────────────────────────────────────┘
```
- Number: 80-96pt in accent color (#E63030)
- Label: 36-48pt in text-primary, same font
- Footnote: context/source bottom-right

### Quote

```
┌──────────────────────────────────────┐
│                                      │
│  "THE BEST WAY TO                    │
│  <accent>PREDICT</accent> THE        │  ← 64-80pt
│  FUTURE IS TO CREATE IT"            │
│                                      │
│                     — PETER DRUCKER  │  ← footnote
└──────────────────────────────────────┘
```
- Quote text: 64-80pt, uppercase, same display font
- Attribution as footnote bottom-right
- One accent word allowed within quote

---

## Font Pairing

- **Display (titles, headlines)**: Bebas Neue / Anton, 80-120pt, weight 400, letter-spacing -2pt, line-height 0.9-0.95
- **KPI/Numbers**: Bebas Neue, 80-96pt, weight 400, letter-spacing -2pt
- **Body**: Space Mono, 9pt, weight 400, line-height 1.5, letter-spacing 0.02em
- **Footnote**: Space Mono, 8pt, uppercase, letter-spacing 0.03em

### Korean Text Wrapping

`word-break: keep-all`만으로는 자연스러운 한국어 줄바꿈이 보장되지 않는다.
끊기면 부자연스러운 구절은 `&nbsp;`로 묶어서 한 단위로 유지한다:

| 패턴 | 예시 | 처리 |
|------|------|------|
| 용언 + 보조용언 | 전달하지 않는다, 할 수 있다 | 전달하지\&nbsp;않는다 |
| 부사 + 서술어 | 항상 나빠진다, 정말 중요하다 | 항상\&nbsp;나빠진다 |
| 짧은 단어 연결 | 왜 그 값인지, 할 수 없다 | 왜\&nbsp;그\&nbsp;값인지 |
| 부정 표현 | 아니라, 없다, 못한다 | 창작이\&nbsp;아니라 |

**원칙**: 쉼표(,)나 마침표(.) 뒤에서 끊기는 건 자연스럽다. 의미 단위 중간에서 끊기는 것만 방지한다.

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
- **Minimal padding**: 16pt edges. The type itself creates breathing room through tracking and line-height.
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
