# Dark Wave Design Spec

## Identity

**Mood**: Dramatic, glossy, corporate-dark, premium
**Best For**: Executive strategy, business plans, investor pitches, C-suite reports

A boardroom at midnight. Glossy 3D wave ribbons ripple across a deep black canvas,
catching highlights like polished obsidian. Orange glows punctuate the darkness — not
playful, but commanding. Every number demands attention. Every section announces itself
with a burning dot. This is the language of power presentations: controlled drama,
corporate confidence, and the kind of dark elegance that makes fluorescent-lit slide
decks feel like relics.

---

## Signature Elements

- **Glossy 3D wave/ribbon**: Dark wave shapes as background decoration, created with CSS gradients and pseudo-elements — the pack's hero visual
- **Vivid orange accent**: `#FC5E20` for highlights, numbers, section markers, and interactive states
- **Orange glow dot**: Small circle with radial box-shadow glow effect, placed beside Roman numeral section indicators
- **Red-to-orange gradient line**: Horizontal line spanning full width at the top of content slides (`linear-gradient(90deg, #FF3D00, #FC5E20)`)
- **Roman numeral section markers**: I, II, III with orange glow dots — for TOC and section dividers
- **Light content cards on dark**: `#F5F5F5` rounded cards floating on `#1a1a1a` background for data-heavy slides
- **Bold white sans-serif titles**: Inter at weight 700-800, no-nonsense readability
- **Staircase/step layout**: Ascending cards from left to right for roadmaps and timelines
- **Page number footer**: Positioned bottom-right in `5/29` format, muted color

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Inter', 'Pretendard', -apple-system, sans-serif;
  background: var(--bg-primary);       /* #1a1a1a */
  color: var(--text-primary);          /* #ffffff */
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Glossy Wave Background

```css
.wave-bg::before {
  content: '';
  position: absolute;
  bottom: -60pt;
  right: -40pt;
  width: 480pt;
  height: 320pt;
  background: radial-gradient(ellipse at 30% 70%, var(--bg-secondary) 0%, transparent 60%); /* #2a2a2a */
  border-radius: 40% 0 0 0;
  z-index: 0;
}
.wave-bg::after {
  content: '';
  position: absolute;
  bottom: -80pt;
  right: 40pt;
  width: 360pt;
  height: 240pt;
  background: radial-gradient(ellipse at 50% 60%, #222222 0%, transparent 55%); /* wave depth layer — not a token */
  border-radius: 50% 10% 0 0;
  z-index: 0;
}
```

### Wave Glossy Highlight

```css
.wave-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.04) 0%,
    transparent 40%
  );
  pointer-events: none;
  z-index: 1;
}
```

### Gradient Line Divider (Top)

```css
.gradient-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3pt;
  background: linear-gradient(90deg, #FF3D00 0%, var(--accent) 50%, #FF3D00 100%); /* #FF3D00 = gradient red component */
}
```

### Title (Bold White)

```css
h1 {
  font-family: 'Inter', 'Pretendard', -apple-system, sans-serif;
  font-size: 28pt;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--text-primary);          /* #ffffff */
  position: relative;
  z-index: 2;
}
```

### Hero Title (Cover Slide)

```css
.hero-title {
  font-family: 'Inter', 'Pretendard', -apple-system, sans-serif;
  font-size: 52pt;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-primary);          /* #ffffff */
}
.hero-title .accent {
  color: var(--accent);                /* #FC5E20 */
}
```

### Body Text

```css
.body-text {
  font-family: 'Inter', 'Pretendard', -apple-system, sans-serif;
  font-size: 14pt;
  font-weight: 400;
  line-height: 1.65;
  color: var(--text-secondary);        /* rgba(255,255,255,0.55) */
  position: relative;
  z-index: 2;
}
```

### Orange Glow Dot

```css
.glow-dot {
  width: 10pt;
  height: 10pt;
  border-radius: 50%;
  background: var(--accent);           /* #FC5E20 */
  box-shadow:
    0 0 8pt rgba(252, 94, 32, 0.6),
    0 0 20pt rgba(252, 94, 32, 0.3),
    0 0 40pt rgba(252, 94, 32, 0.1);
}
```

### Section Header (with Breadcrumb)

```css
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24pt;
}
.section-title {
  font-family: 'Inter', 'Pretendard', sans-serif;
  font-size: 11pt;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);        /* rgba(255,255,255,0.55) */
}
.breadcrumb {
  font-family: 'Inter', 'Pretendard', sans-serif;
  font-size: 10pt;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
}
```

### Roman Numeral TOC Item

```css
.toc-item {
  display: flex;
  align-items: center;
  gap: 16pt;
  margin-bottom: 20pt;
}
.toc-numeral {
  font-family: 'Inter', 'Pretendard', sans-serif;
  font-size: 20pt;
  font-weight: 700;
  color: var(--accent);                /* #FC5E20 */
  min-width: 36pt;
}
.toc-label {
  font-family: 'Inter', 'Pretendard', sans-serif;
  font-size: 16pt;
  font-weight: 600;
  color: var(--text-primary);          /* #ffffff */
}
```

### Light Content Card

```css
.content-card {
  background: #F5F5F5;                 /* light card surface — pattern-level color */
  border-radius: 8pt;
  padding: 24pt 28pt;
  color: var(--bg-primary);            /* #1a1a1a — dark text on light card */
  position: relative;
  z-index: 2;
}
.content-card h3 {
  font-size: 16pt;
  font-weight: 700;
  color: var(--bg-primary);            /* #1a1a1a */
  margin-bottom: 8pt;
}
.content-card p {
  font-size: 12pt;
  font-weight: 400;
  line-height: 1.6;
  color: #555555;                      /* light card body text — pattern-level color */
}
```

### Staircase / Step Layout (Roadmap)

```css
.staircase {
  display: flex;
  align-items: flex-end;
  gap: 12pt;
  padding-top: 40pt;
}
.staircase .step {
  flex: 1;
  background: #F5F5F5;                /* light card surface — pattern-level color */
  border-radius: 8pt;
  padding: 16pt;
  color: var(--bg-primary);            /* #1a1a1a — dark text on light card */
}
.staircase .step:nth-child(1) { margin-top: 80pt; }
.staircase .step:nth-child(2) { margin-top: 50pt; }
.staircase .step:nth-child(3) { margin-top: 20pt; }
.staircase .step:nth-child(4) { margin-top: 0; }
```

### Footer / Page Number

```css
.page-number {
  position: absolute;
  bottom: 16pt;
  right: 24pt;
  font-family: 'Inter', 'Pretendard', sans-serif;
  font-size: 10pt;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.3);
  z-index: 2;
}
```

### Accent Number (KPI)

```css
.kpi-value {
  font-family: 'Inter', 'Pretendard', sans-serif;
  font-size: 40pt;
  font-weight: 800;
  color: var(--accent);                /* #FC5E20 */
  letter-spacing: -0.02em;
  line-height: 1;
}
.kpi-label {
  font-family: 'Inter', 'Pretendard', sans-serif;
  font-size: 11pt;
  font-weight: 500;
  color: var(--text-secondary);        /* rgba(255,255,255,0.55) */
  margin-top: 6pt;
}
```

---

## Font Pairing

- **Hero Title**: Inter, 48-52pt, weight 800, letter-spacing -0.02em, line-height 1.1
- **Title**: Inter, 28-40pt, weight 700, letter-spacing -0.01em, line-height 1.25
- **Body**: Inter, 13-15pt, weight 400, line-height 1.65
- **Label**: Inter, 10-11pt, weight 600, letter-spacing 0.04em, uppercase
- **KPI/Numbers**: Inter, 36-44pt, weight 800, letter-spacing -0.02em
- **TOC Numeral**: Inter, 20pt, weight 700, orange colored

### Korean Text Wrapping (Critical)

`word-break: keep-all`만으로는 자연스러운 한국어 줄바꿈이 보장되지 않는다.
끊기면 부자연스러운 구절은 `&nbsp;`로 묶어서 한 단위로 유지한다:

| 패턴 | 예시 | 처리 |
|------|------|------|
| 용언 + 보조용언 | 전달하지 않는다, 할 수 있다 | 전달하지\&nbsp;않는다 |
| 동사 + 보조 | 만들어야 하는지, 해야 해 | 만들어야\&nbsp;하는지 |
| 부사 + 서술어 | 항상 나빠진다, 정말 중요하다 | 항상\&nbsp;나빠진다 |
| 짧은 단어 연결 | 왜 그 값인지, 할 수 없다 | 왜\&nbsp;그\&nbsp;값인지 |
| 부정 표현 | 아니라, 없다, 못한다 | 창작이\&nbsp;아니라 |

**원칙**: 쉼표(,)나 마침표(.) 뒤에서 끊기는 건 자연스럽다. 의미 단위 중간에서 끊기는 것만 방지한다.

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#1a1a1a` | Main deep charcoal background |
| `--bg-secondary` | `#2a2a2a` | Secondary panels, wave fill |
| `--bg-elevated` | `#333333` | Elevated card backgrounds |
| `--bg-dark` | `#111111` | Deepest black for cover/section slides |
| `--text-primary` | `#ffffff` | Bold white headlines |
| `--text-secondary` | `rgba(255,255,255,0.55)` | Body text, descriptions |
| `--accent` | `#FC5E20` | Vivid orange — highlights, KPIs, markers |
| `--accent-glow` | `rgba(252,94,32,0.5)` | Strong orange glow |
| `--accent-glow-soft` | `rgba(252,94,32,0.15)` | Ambient orange glow |
| `--line-color` | `rgba(252,94,32,0.5)` | Gradient line divider |
| `--border` | `rgba(255,255,255,0.1)` | Subtle white borders |

**Light card surface**: `#F5F5F5` for content cards floating on dark background.
**Card text**: `#1a1a1a` (dark) for text inside light cards, `#555555` for body.

---

## Layout Principles

- **Wave as ambient backdrop**: The glossy wave fills the bottom-right quadrant at low opacity — never competes with content
- **Content above the wave**: All text and cards sit at z-index 2, above the wave decoration
- **Gradient line as page structure**: The red-to-orange gradient line at the top anchors every content slide
- **Left-aligned for readability**: Titles and body text left-align; only cover/section slides center
- **Orange as the sole accent**: No secondary color — orange does all the work for emphasis
- **Light cards for density**: When a slide has lots of data, use light `#F5F5F5` cards to create contrast and legibility
- **Section label + breadcrumb**: Top-left section title, top-right topic breadcrumb, establishes navigation context
- **Ascending stairs for progression**: Roadmap/timeline slides use staircase layout ascending left-to-right
- **Padding**: 40pt 48pt standard, with wave elements extending beyond the padding into absolute positioning
- **Footer page numbers**: Every slide has a `5/29` style page counter at bottom-right in muted text

---

## Avoid

- **No bright or colored backgrounds** — always dark (`#111111` to `#1a1a1a`); the drama comes from light-on-dark contrast
- **No multiple accent colors** — orange `#FC5E20` is the only accent; do not add blue, green, or purple
- **No flat matte surfaces** — every background element should suggest depth via gradients, even subtle ones
- **No thin/light title weights** — titles are always weight 700-800; authority requires boldness
- **No visible grid lines** — structure comes from cards and spacing, not visible grids
- **No text on top of wave highlights** — ensure wave shapes do not overlap readable content areas
- **No rounded corners larger than 8pt** — cards use 8pt radius; no pill shapes or full-round rectangles
- **No decorative borders** — borders are either invisible (`rgba(255,255,255,0.1)`) or replaced by the gradient line
- **No light mode variant** — this pack is always dark; light backgrounds break the premium feel

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
```

Note: Inter provides the geometric sans-serif for English text. Pretendard handles Korean glyphs as fallback with full variable weight support.
