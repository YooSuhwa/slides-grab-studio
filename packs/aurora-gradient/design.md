# Aurora Gradient Design Spec

## Identity

**Mood**: Modern, gradient, tech, polished
**Best For**: Product reviews, strategy presentations, design concepts, tech launches, UX case studies

A sophisticated hybrid deck that alternates between two visual worlds. Cover and section divider slides live in a dark universe of aurora gradient noise — multi-color radial gradients with grain texture emanating from edges on a near-black canvas. Content slides flip to clean white backgrounds with meticulous typography and gray placeholder panels. The contrast between immersive dark aurora moments and crisp white reading surfaces creates a cinematic rhythm that keeps the audience engaged.

---

## Signature Elements

- **Dual background system**: Dark aurora gradient slides (cover, section dividers, closing) alternate with clean white (#FEFEFE) content slides — this contrast IS the identity
- **Aurora gradient noise**: 2-3 overlapping radial gradients with grain/noise texture on near-black (#030405) backgrounds, colors emanating from edges (not centered)
- **Thin diagonal accent line**: A subtle white line at ~45deg from top-left corner on dark slides, opacity 0.15-0.25
- **Massive condensed display titles on dark**: Weight 600, letter-spacing -0.055em, line-height 0.92 — extremely tight/condensed, cinematic feel
- **Gray rounded placeholder panels**: #ECECEB panels with border-radius 8pt used as image/content placeholders on white slides
- **Footer breadcrumb bar**: Small rounded gray square mark + breadcrumb path + date + section name + page number, always at bottom

---

## CSS Patterns

### Base Slide — Content (White)

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Base Slide — Dark Aurora (Cover / Section)

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: #030405;
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Aurora Gradient Background Layer

```css
.aurora-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
/* Cover variant: blue + amber */
.aurora-bg--cover {
  background:
    radial-gradient(ellipse at 0% 80%, #2f95ff 0%, transparent 50%),
    radial-gradient(ellipse at 100% 20%, #ae8464 0%, transparent 45%),
    radial-gradient(ellipse at 60% 90%, #7e5cff 0%, transparent 40%);
  filter: contrast(1.1) brightness(0.9);
}
/* Section variant: green + teal */
.aurora-bg--green {
  background:
    radial-gradient(ellipse at 10% 70%, #31a06d 0%, transparent 50%),
    radial-gradient(ellipse at 80% 30%, #20d6c9 0%, transparent 45%),
    radial-gradient(ellipse at 50% 90%, #c2db78 0%, transparent 35%);
  filter: contrast(1.1) brightness(0.9);
}
/* Section variant: violet + magenta */
.aurora-bg--violet {
  background:
    radial-gradient(ellipse at 20% 20%, #7e5cff 0%, transparent 50%),
    radial-gradient(ellipse at 90% 80%, #d65db1 0%, transparent 45%);
  filter: contrast(1.1) brightness(0.9);
}
```

### Grain Noise Texture Overlay

```css
.aurora-grain {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
  background-size: 128pt;
  opacity: 0.35;
  pointer-events: none;
}
```

### Thin Diagonal Accent Line

```css
.diagonal-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 1px;
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(45deg);
  transform-origin: 0 0;
  z-index: 2;
}
```

### Hero Title — Dark Slide

```css
h1.hero-dark {
  font-size: 66pt;
  font-weight: 600;
  color: #ffffff;
  line-height: 0.92;
  letter-spacing: -0.055em;
  position: relative;
  z-index: 3;
}
```

### Hero Title — White Slide

```css
h1.hero-white {
  font-size: 32pt;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.15;
  letter-spacing: -0.02em;
}
```

### Body Text — White Slide

```css
p {
  font-size: 14pt;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 1.65;
}
```

### Gray Placeholder Panel

```css
.placeholder-panel {
  background: var(--bg-secondary);
  border-radius: 8pt;
  padding: 20pt 24pt;
}
/* Used for image placeholders, content blocks, card grids */
```

### 3-Column Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12pt;
}
.card-grid .card {
  background: var(--bg-secondary);
  border-radius: 8pt;
  padding: 18pt 20pt;
}
```

### Left-Right Split Layout

```css
.split-layout {
  display: flex;
  gap: 40pt;
  align-items: flex-start;
}
.split-layout .left {
  flex: 0 0 280pt;
}
.split-layout .right {
  flex: 1;
}
/* Big title on left + body text on right */
```

### Bento Grid Layout

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10pt;
}
.bento-grid .item--wide {
  grid-column: span 2;
}
.bento-grid .item--tall {
  grid-row: span 2;
}
.bento-grid .item {
  background: var(--bg-secondary);
  border-radius: 8pt;
  padding: 16pt;
}
```

### Footer Breadcrumb Bar

```css
.footer-bar {
  position: absolute;
  bottom: 14pt;
  left: 56pt;
  right: 56pt;
  display: flex;
  align-items: center;
  gap: 8pt;
  font-size: 7pt;
  color: var(--text-secondary);
  z-index: 3;
}
.footer-bar .mark {
  width: 6pt;
  height: 6pt;
  background: var(--bg-secondary);
  border-radius: 2pt;
}
.footer-bar .page {
  margin-left: auto;
}
```

---

## Font Pairing

- **Display (dark slides)**: Pretendard, 56-72pt, weight 600, letter-spacing -0.055em, line-height 0.92 — massive and condensed
- **Title (white slides)**: Pretendard, 28-36pt, weight 500, letter-spacing -0.02em, line-height 1.15
- **Body**: Pretendard, 13-15pt, weight 400, color #7A7A78, line-height 1.65
- **Caption/Label**: Pretendard, 8-11pt, weight 400, color #7A7A78
- **Footer**: Pretendard, 7-8pt, weight 400

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
| `--bg-primary` | `#fefefe` | Clean white — content slide background |
| `--bg-secondary` | `#ececeb` | Light warm gray — placeholder panels, cards |
| `--bg-elevated` | `#e4e4e2` | Slightly darker gray — elevated card fills |
| `--text-primary` | `#111111` | Near-black — titles and headings on white slides |
| `--text-secondary` | `#7a7a78` | Medium gray — body text, captions, labels |
| `--accent` | `#2da7ff` | Aurora blue — links, active states, highlights |
| `--border` | `#dededb` | Subtle warm gray — dividers, card borders |
| `--aurora-dark` | `#030405` | Near-black base for dark aurora slides |

**Aurora gradient palette** (dark slides only):
- `#2f95ff` (blue) + `#ae8464` (amber) + `#7e5cff` (violet) — cover
- `#31a06d` (green) + `#20d6c9` (teal) + `#c2db78` (lime) — goals/strategy sections
- `#7e5cff` (violet) + `#d65db1` (magenta) — design/creative sections
- `#d65db1` (magenta) dominant — closing

Each section uses a different aurora color combination to give a sense of progression through the deck.

---

## Layout Principles

- **Dual-world rhythm**: Alternate dark aurora slides (cover, section dividers) with white content slides — never use aurora gradients on content-heavy slides
- **Dark slides = cinematic, few words**: 3-8 word massive titles, no body paragraphs on aurora backgrounds
- **White slides = information-dense**: Left-right splits, card grids, bento layouts — structured and readable
- **Generous padding**: 48pt 56pt on all slides; content never touches edges
- **Gray panel placeholders**: Use #ECECEB rounded panels (8pt radius) wherever images or media would go
- **Footer on every white slide**: Breadcrumb bar at bottom with small square mark, section path, date, page number
- **Left-aligned default on white slides**: Title left + body right in split layout; center only on dark slides
- **3-column max**: Card grids use 2-3 columns; never exceed 3
- **Bento for overviews**: Use varied-size grid items (wide, tall) for dashboard/overview slides

---

## Avoid

- **No aurora gradients on content slides** — content slides are always clean white; gradients are reserved for cover/section/closing only
- **No bold body text on white slides** — body text is weight 400, color #7A7A78; it should feel quiet and secondary
- **No colored backgrounds on content slides** — white (#FEFEFE) only; gray (#ECECEB) only inside panels
- **No small text on dark slides** — dark aurora slides have massive display titles only; no body paragraphs
- **No sharp corners on panels** — minimum border-radius 8pt on all placeholder panels
- **No saturated accent colors on white slides** — everything stays neutral gray; accent blue is used sparingly for links only
- **No more than 2 gradient color points per aurora section** — each section has its own 2-3 color combination; don't mix all colors together
- **No solid-color dark slides** — dark slides must always have the aurora radial gradient effect, never flat black
- **No decorative elements on white slides** — white slides are purely informational; decoration belongs on aurora slides only

---

## Webfont CDN

```html
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
```

Note: Pretendard is the sole font for this pack. All hierarchy is expressed through size, weight, and letter-spacing rather than font-family variation. The variable font supports weights 100-900, enabling the dramatic contrast between massive thin display titles on dark slides and medium-weight headings on white slides.
