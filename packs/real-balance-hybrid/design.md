# Real Balance Hybrid Design Spec

## Identity

**Mood**: Playful, modern, warm, balanced
**Best For**: Marketing decks, startup pitches, creative agency portfolios, product launches, brand presentations

A warm, approachable presentation style that balances playfulness with professionalism. The golden yellow accent color brings energy without overwhelming, while rounded "squircle" cards with soft shadows create a tactile, layered feel. The deck uses a checkerboard pattern of light, yellow, and dark cards that gives visual variety without chaos. Large soft gradient circles as decorative motifs add a sense of motion and warmth. This is a deck that says "we're creative and we mean business."

---

## Signature Elements

- **Squircle cards**: Rounded rectangles with large border-radius (26pt+) and soft box-shadows — the primary content container
- **Three card tones**: White (#FAF9F5), golden yellow (#F4D53D), and dark (#202020) cards used in alternating patterns
- **Yellow gradient orb decorations**: Large soft concentric gradient circles as background accents, never overlapping text
- **Pill-shaped tags/badges**: Dark background (#2C2C2C) with rounded ends for labels and categories
- **3-dot section marker**: Three dots (●●○) as a subtle section divider/progress indicator
- **Footer bar**: "20/25" year stack + "Real Balance Presentation" + page number at bottom
- **Arrow icons in rounded squares**: Small → arrows in rounded square containers as CTA indicators

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Cover Slide — Yellow Background

```css
body.cover {
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-orb {
  position: absolute;
  width: 350pt;
  height: 350pt;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 225, 80, 0.5) 0%, rgba(244, 213, 61, 0.15) 50%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
/* Add 2-3 concentric orbs at different sizes for depth */
```

### Dark Variant Slide

```css
body.dark-variant {
  background: var(--surface-dark);
  color: var(--text-on-dark);
}
```

### Squircle Card — Light

```css
.card-light {
  background: var(--bg-secondary);
  border-radius: 26pt;
  padding: 28pt 30pt;
  box-shadow: var(--shadow-card);
}
```

### Squircle Card — Yellow

```css
.card-yellow {
  background: var(--accent);
  border-radius: 26pt;
  padding: 28pt 30pt;
  box-shadow: var(--shadow-glow);
}
```

### Squircle Card — Dark

```css
.card-dark {
  background: var(--surface-dark);
  border-radius: 26pt;
  padding: 28pt 30pt;
  color: var(--text-on-dark);
  box-shadow: var(--shadow-card);
}
```

### Checkerboard Card Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14pt;
}
/* Alternate: light → yellow → dark → light → dark → yellow
   No two adjacent cards of the same tone. */
```

### Pill Tag / Badge

```css
.pill-tag {
  display: inline-block;
  background: var(--text-primary);
  color: var(--bg-secondary);
  font-size: 9pt;
  font-weight: 500;
  padding: 4pt 14pt;
  border-radius: 20pt;
  letter-spacing: 0.02em;
}
```

### 3-Dot Section Marker

```css
.dot-marker {
  display: flex;
  gap: 5pt;
  margin: 12pt 0;
}
.dot-marker span {
  width: 6pt;
  height: 6pt;
  border-radius: 50%;
  background: var(--text-primary);
}
.dot-marker span:last-child {
  opacity: 0.25;
}
```

### Yellow Gradient Orb (Decorative)

```css
.yellow-orb {
  position: absolute;
  width: 280pt;
  height: 280pt;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 213, 61, 0.35) 0%, rgba(244, 213, 61, 0.08) 50%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
/* Place at bottom-left or top-right corners, partially off-screen */
```

### White Soft Circle Decoration

```css
.soft-circle {
  position: absolute;
  width: 320pt;
  height: 320pt;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  pointer-events: none;
  z-index: 0;
}
/* Subtle large white circle in bottom-left of light slides */
```

### Progress Bar

```css
.progress-bar {
  height: 6pt;
  background: var(--border);
  border-radius: 3pt;
  overflow: hidden;
}
.progress-bar .fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3pt;
}
```

### Arrow CTA Button

```css
.arrow-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28pt;
  height: 28pt;
  background: var(--text-primary);
  color: var(--bg-secondary);
  border-radius: 8pt;
  font-size: 14pt;
}
/* Content: → */
```

### Hero Title

```css
h1 {
  font-size: 60pt;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.05;
  letter-spacing: -0.03em;
}
```

### Section Title

```css
h2 {
  font-size: 44pt;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}
```

### Body Text

```css
p {
  font-size: 14.5pt;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 1.6;
}
```

### Footer Bar

```css
.footer-bar {
  position: absolute;
  bottom: 16pt;
  left: 48pt;
  right: 48pt;
  display: flex;
  align-items: center;
  gap: 10pt;
  font-size: 8pt;
  color: var(--text-secondary);
  z-index: 3;
}
.footer-bar .year-stack {
  font-size: 7pt;
  line-height: 1.1;
  font-weight: 600;
  color: var(--text-primary);
}
.footer-bar .page {
  margin-left: auto;
  font-weight: 500;
}
```

### Pricing Table (3-Column)

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14pt;
}
.pricing-card {
  border-radius: 26pt;
  padding: 28pt 24pt;
  display: flex;
  flex-direction: column;
  gap: 12pt;
}
.pricing-card--featured {
  background: var(--accent);
  box-shadow: var(--shadow-glow);
}
.pricing-card--default {
  background: var(--bg-secondary);
  box-shadow: var(--shadow-card);
}
```

---

## Font Pairing

- **Hero/Display**: Pretendard, 52-64pt, weight 500, letter-spacing -0.03em, line-height 1.05
- **Section Title**: Pretendard, 40-48pt, weight 500, letter-spacing -0.02em, line-height 1.1
- **Slide Title**: Pretendard, 28-34pt, weight 500, letter-spacing -0.015em
- **Body**: Pretendard, 14-15pt, weight 400, line-height 1.6
- **Caption**: Pretendard, 10-11pt, weight 400
- **Label/Tag**: Pretendard, 9-10pt, weight 500, letter-spacing 0.02em
- **Footer**: Pretendard, 7-8pt, weight 400-500

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
| `--bg-primary` | `#efefef` | Light off-white warm gray — main slide background |
| `--bg-secondary` | `#faf9f5` | Warm white — light card fills |
| `--bg-elevated` | `#f4d53d` | Golden yellow — accent card backgrounds |
| `--text-primary` | `#2c2c2c` | Dark charcoal — headings, titles, pill-tag bg |
| `--text-secondary` | `#7b7b7b` | Medium gray — body text, captions |
| `--accent` | `#f2d033` | Golden yellow — brand color, progress bars, highlights |
| `--border` | `#dddcd6` | Warm gray — dividers, progress bar track |
| `--surface-dark` | `#202020` | Dark card and dark-variant slide background |
| `--surface-dark-soft` | `#2b2b2b` | Softer dark for nested elements on dark cards |
| `--text-on-dark` | `#f3f0e6` | Warm white text on dark surfaces |
| `--accent-dark` | `#d2b126` | Darker yellow for text on yellow backgrounds |

**Three-card palette**: Light (#FAF9F5) + Yellow (#F4D53D) + Dark (#202020). Always use at least 2 of the 3 tones on any multi-card slide. No two adjacent cards of the same tone.

---

## Layout Principles

- **Card-first design**: Almost all content lives inside squircle cards; very little free-floating text
- **Checkerboard rhythm**: Alternate light, yellow, and dark cards — variety within consistency
- **Decorative orbs behind, not above**: Yellow gradient circles and white soft circles are always z-index 0, behind content
- **Generous card padding**: 28pt 30pt inside cards; cards need breathing room
- **Maximum 3 cards per row**: Grid columns never exceed 3; use 2-column for emphasis
- **Soft shadows everywhere**: Every card has box-shadow; flat unshadowed cards feel broken in this pack
- **Yellow as accent, not dominant**: Yellow cards should be 1 in 3 at most; overuse makes the deck feel cheap
- **Dark cards for emphasis**: Use dark (#202020) cards for key metrics, quotes, or featured items
- **Footer on every slide**: Year stack + title + page number provides navigation anchoring
- **Cover uses solid yellow**: The cover slide is the only place where yellow fills the entire background

---

## Avoid

- **No sharp corners** — minimum border-radius 26pt on cards, 20pt on pills, 8pt on small elements
- **No grey shadows** — shadows are always warm: `rgba(0,0,0,0.10)` for neutral, `rgba(242,208,51,0.30)` for yellow cards
- **No flat cards without shadow** — every card needs box-shadow to create depth
- **No more than 1 yellow card per row** — too much yellow overwhelms; use it strategically
- **No thin borders on cards** — depth comes from shadows, not strokes; avoid `border: 1px solid`
- **No pure black text** — use dark charcoal (#2C2C2C) instead of #000000
- **No linear gradients as backgrounds** — gradients are radial, used only for decorative orbs
- **No text directly on background without card** — body text always lives inside a card container
- **No small border-radius** — 4pt corners violate the squircle identity; everything is generously rounded
- **No all-same-tone card grids** — a grid of 3 white cards is monotonous; mix tones

---

## Webfont CDN

```html
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
```

Note: Pretendard is the sole font for this pack. The variable font covers weights 100-900. All typographic hierarchy is achieved through size, weight, and color variation rather than font-family mixing. This keeps the visual system unified and the squircle card layouts clean.
