# simple-dark Design Spec

## Identity

**Mood**: minimal, stark, bold, amoled
**Best For**: all-hands meeting, internal presentation, startup pitching, tech keynote

Pure black. White text. Nothing else. This is the most stripped-down pack in the
collection — an AMOLED-black canvas with heavy white typography floating in the void.
There are no decorations, no colors, no borders, no gradients, no shadows. The
hierarchy comes entirely from font size and weight. The boldness of the type against
the infinite black creates the drama. If simple_light is "black ink on white paper,"
this is the inverse: white light carved into darkness.

---

## Signature Elements

- **AMOLED black background**: Pure `#000000` everywhere. Not dark gray — true black.
- **Extra-bold white titles**: Weight 800-900. The heaviest available. White on black creates maximum contrast.
- **Zero decoration**: No shadows, no borders, no gradients, no background fills on elements. Nothing.
- **Dark gray cards**: Where grouping is needed, use `#1a1a1a` — barely distinguishable from black. Subtle.
- **Left-aligned content**: Default layout is left-aligned with generous left padding. Right side stays empty.
- **Large type scale**: Hero titles at 64pt, section titles at 44pt — bigger than most packs because the empty black absorbs size.
- **Light gray body text**: Body uses `rgba(255,255,255,0.7)` or `#999999` — deliberately softer than titles.

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);   /* #000000 */
  color: var(--text-primary);      /* #ffffff */
  padding: 56pt 72pt;
  display: flex;
  flex-direction: column;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Hero Slide (Cover, Section Title)

```css
body {
  justify-content: center;
  padding: 64pt 80pt;
}
h1 {
  font-size: 64pt;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #ffffff;
}
/* Content vertically centered, left-aligned. The right side is void. */
```

### Center-Aligned Section Variant

```css
body {
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 64pt 80pt;
}
h1 {
  font-size: 44pt;
  font-weight: 900;
  letter-spacing: -0.02em;
}
p {
  font-size: 18pt;
  font-weight: 400;
  color: var(--text-secondary);
  margin-top: 12pt;
}
/* Some section dividers center everything. Use sparingly. */
```

### Bottom-Anchored Inverted

```css
body {
  justify-content: flex-end;
  padding: 64pt 80pt;
}
.subtitle {
  font-size: 18pt;
  font-weight: 400;
  color: var(--text-secondary);
  margin-bottom: 8pt;
}
h1 {
  font-size: 48pt;
  font-weight: 900;
  letter-spacing: -0.03em;
}
/* Subtitle above, title below — inverted order. Content sits at bottom. */
```

### Left-Right Split (35:65)

```css
body {
  flex-direction: row;
  align-items: center;
}
.left {
  flex: 0 0 35%;
  padding-right: 32pt;
}
.right {
  flex: 1;
}
/* Title on left, content on right. Asymmetric. */
```

### Dark Card

```css
.card {
  background: var(--bg-elevated);   /* #1a1a1a — barely visible */
  border-radius: 12pt;
  padding: 24pt;
}
/* No border. No shadow. Just a whisper of lighter dark. */
```

### Principle/Grid Card

```css
.principle-card {
  background: #444444;
  border-radius: 12pt;
  padding: 24pt 28pt;
}
.principle-card h3 {
  font-size: 18pt;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8pt;
}
.principle-card p {
  font-size: 13pt;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}
/* Slightly brighter gray for principle/feature cards. Still no border. */
```

### Metric Display

```css
.metric {
  font-size: 64pt;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1.0;
}
.metric-label {
  font-size: 14pt;
  font-weight: 400;
  color: var(--text-secondary);
  margin-top: 8pt;
}
/* White number on black. The size IS the emphasis. */
```

---

## Font Pairing

- **Font**: Pretendard (single family, no mixing)
- **Title (hero)**: 64pt, weight 900, letter-spacing -0.03em, line-height 1.15
- **Title (section)**: 44pt, weight 900, letter-spacing -0.02em
- **Title (slide)**: 32pt, weight 800, letter-spacing -0.02em
- **Subtitle**: 18-20pt, weight 400, letter-spacing -0.01em, color: `--text-secondary`
- **Body**: 14-16pt, weight 400, line-height 1.65, color: `rgba(255,255,255,0.7)` — softer than titles
- **Caption/Label**: 10-11pt, weight 400, color: `#666666`

Weight progression: **900** (hero) → 800 (slide title) → 400 (everything else). Extreme binary contrast.

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
|-------|-------|-------|
| `--bg-primary` | `#000000` | Slide background. Pure AMOLED black. Always. |
| `--bg-secondary` | `#111111` | Rarely used. Alternative dark area. |
| `--bg-elevated` | `#1a1a1a` | Card backgrounds — barely visible against black. |
| `--text-primary` | `#ffffff` | Headings, titles. Pure white. |
| `--text-secondary` | `#999999` | Subtitles, descriptions. |
| `--accent` | `#ffffff` | White IS the accent in this monochrome pack. No color. |
| `--border` | `#333333` | Dividers (rarely used — prefer whitespace). |

**Additional grays**: `#444444` or `#555555` for principle/feature cards that need slightly more presence. `rgba(255,255,255,0.7)` for body text that should feel lighter than headlines.

**Rule**: Only black, white, and grays. Zero chromatic color. If something needs emphasis, make it bigger and bolder — not colored.

---

## Layout Principles

### 3 Core Layout Patterns

**Pattern A — Hero (Vertically centered, left-aligned)**
Cover, section divider, statement slides.
```
[                                    ]
[                                    ]
[   Bold White Title                 ]   ← vertically centered, left-aligned
[   Subtitle in gray                 ]   ← the right side is empty black void
[                                    ]
[                                    ]
```

**Pattern B — Left-Right Split (35:65)**
Highlights, lists, two-column, key metrics.
```
[                                    ]
[                                    ]
[   Title        | Content area      ]   ← 35% : 65%
[   (left)       | (items/grid)      ]
[                                    ]
[                                    ]
```

**Pattern C — Top-Down Grid**
Principles, features, image gallery.
```
[   Title                            ]
[                                    ]
[   [dark card]  [dark card]  [card] ]   ← dark gray cards on black
[                                    ]
[                                    ]
```

### Common Rules

- **Content density**: 3-5 points per slide. The black space is the design.
- **Padding**: 56pt 72pt (standard), 64pt 80pt (hero slides). More generous than light packs — the void absorbs it.
- **Gap rhythm**: 40pt between major sections, 20pt between elements, 8pt between text blocks.
- **Split ratio**: 35% left, 65% right. Never 50:50.
- **Vertical gravity**: Hero content sits at vertical center, left-aligned. `justify-content: center`.
- **No footer**: This pack has no footer system. Clean edge-to-edge black.

### Layout Variants (from reference)

- **Center-aligned section**: Some section dividers center title + subtitle. Use sparingly — left-aligned is default.
- **Bottom-anchored inverted**: Subtitle above, title below — content anchored to bottom of slide. Creates a different visual rhythm.
- **Image placeholder**: Checkered pattern placeholder occupying right 50% of split layout. In production, photo fills edge-to-edge with no padding.

---

## Avoid

- **No colors** — zero chromatic hues. No blue, no red, no orange, nothing. Black + white + grays only.
- **No gradients** — not on backgrounds, not on text, not anywhere
- **No shadows** — no box-shadow, no text-shadow, no drop shadows of any kind
- **No borders on cards** — use gray fill to distinguish from background
- **No decorative shapes** — no circles, no lines, no geometric ornaments
- **No background images** — pure black background only
- **No dark gray backgrounds (#222, #333) as primary** — `--bg-primary` is always `#000000`
- **No lightweight titles** — titles must be weight 800-900. Never 500 or 600 for main headings.
- **No icons** — hierarchy through size and weight, not symbols
- **No borders as separators** — use whitespace to separate sections
- **No rounded corners > 12pt** — cards use 12pt max; the aesthetic is clean, not bubbly
- **No body text in pure white** — body is `rgba(255,255,255,0.7)` or `#999999`, not `#ffffff`. Only titles get pure white.
