# Eigengrau Dark Gray Design Spec

## Identity

**Mood**: Dark, structured, intellectual, precise
**Best For**: Tech presentations, design reviews, product analysis, data storytelling

Eigengrau is the dark gray your eyes see in perfect darkness. Not pure black, but a warm
navy-tinged void that feels alive and considered. This pack turns that concept into a visual
system: content lives in precise left-right splits separated by dashed dividers, labels
whisper in muted uppercase, and pastel accents punctuate the darkness like data points on
a chart. It is the design language of someone who reads the fine print.

---

## Signature Elements

- **Vertical dashed center divider**: A `1pt dashed` line at 50% width splitting left/right content — the pack's defining motif
- **Horizontal dashed dividers**: Same dashed treatment for top-section separation
- **Muted uppercase labels**: "SECTION NAME" in `#87878e`, weight 650, `letter-spacing: 0.08em`, positioned top-left
- **Steel-blue accent**: `#9ed7f4` for quotes, large quote marks ("66"), highlighted labels (BEFORE/AFTER, PROS/CONS)
- **Pastel trio for data**: Mint `#a9ebcc` (positive/check), Yellow `#fde4a3` (timeline/progress), Pink `#ffd3d1` (tertiary/alert)
- **Ghost white text**: `#f8f8ff` with a subtle lavender tint — never harsh pure white
- **Dark navy-purple panels**: `#29293d` for placeholder fills and content cards
- **Large thin titles**: Pretendard at weight 400-500, tight letter-spacing, clean and understated
- **Bold metric numbers**: White numbers like +330K, +103%, -18% in large weight 700
- **Green circle checkmarks**: Mint-filled circles for checklist items

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: var(--bg-primary);       /* #16161d */
  color: var(--text-primary);          /* #f8f8ff */
  padding: 36pt 44pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Vertical Dashed Divider (Center)

```css
.divider-v {
  position: absolute;
  top: 36pt;
  bottom: 36pt;
  left: 50%;
  border-left: 1pt dashed var(--border);  /* #4e4e61 */
}
```

### Horizontal Dashed Divider (Top)

```css
.divider-h {
  position: absolute;
  top: 72pt;
  left: 44pt;
  right: 44pt;
  border-top: 1pt dashed var(--border);  /* #4e4e61 */
}
```

### Section Label (Muted Uppercase)

```css
.section-label {
  font-family: 'Pretendard', sans-serif;
  font-size: 10pt;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);         /* #87878e */
}
```

### Title (Large Thin Sans-Serif)

```css
h1 {
  font-family: 'Pretendard', -apple-system, sans-serif;
  font-size: 32pt;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--text-primary);            /* #f8f8ff */
}
```

### Body Text

```css
.body-text {
  font-family: 'Pretendard', -apple-system, sans-serif;
  font-size: 15pt;
  font-weight: 400;
  line-height: 1.65;
  color: rgba(248, 248, 255, 0.72);
}
```

### Panel / Card

```css
.panel {
  background: var(--bg-secondary);      /* #29293d */
  border-radius: 6pt;
  padding: 20pt 24pt;
}
```

### Quote Slide

```css
.quote-mark {
  font-family: 'Pretendard', sans-serif;
  font-size: 64pt;
  font-weight: 700;
  color: rgba(158, 215, 244, 0.35);
  line-height: 1;
}
.quote-text {
  font-family: 'Pretendard', sans-serif;
  font-size: 20pt;
  font-weight: 500;
  line-height: 1.5;
  color: var(--accent);                  /* #9ed7f4 */
}
.quote-attribution {
  font-family: 'Pretendard', sans-serif;
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);         /* #87878e */
}
```

### Metric Number

```css
.metric-value {
  font-family: 'Pretendard', sans-serif;
  font-size: 36pt;
  font-weight: 700;
  color: var(--text-primary);            /* #f8f8ff */
  letter-spacing: -0.01em;
}
.metric-label {
  font-family: 'Pretendard', sans-serif;
  font-size: 10pt;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);         /* #87878e */
}
```

### Timeline Bar

```css
.timeline-bar {
  height: 8pt;
  border-radius: 4pt;
}
.timeline-bar.blue   { background: var(--accent);        /* #9ed7f4 */ }
.timeline-bar.yellow { background: var(--accent-yellow);  /* #fde4a3 */ }
.timeline-bar.pink   { background: var(--accent-pink);    /* #ffd3d1 */ }
```

### Checklist Item

```css
.check-icon {
  width: 18pt;
  height: 18pt;
  border-radius: 50%;
  background: var(--accent-mint);        /* #a9ebcc */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);             /* #16161d */
  font-size: 11pt;
  font-weight: 700;
}
```

### Left-Right Split Layout

```css
.split {
  display: flex;
  gap: 0;
  height: 100%;
}
.split-left, .split-right {
  flex: 1;
  padding: 0 28pt;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.split-left {
  padding-left: 0;
}
.split-right {
  padding-right: 0;
}
```

---

## Font Pairing

- **Title**: Pretendard, 32-68pt, weight 400-500, letter-spacing -0.02em, line-height 1.25
- **Body**: Pretendard, 14-16pt, weight 400, line-height 1.65
- **Label**: Pretendard, 10pt, weight 650, letter-spacing 0.08em, uppercase
- **Metric**: Pretendard, 32-44pt, weight 700, letter-spacing -0.01em
- **Quote**: Pretendard, 20pt, weight 500, line-height 1.5

---

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
| `--bg-primary` | `#16161d` | Eigengrau background — warm dark gray |
| `--bg-secondary` | `#29293d` | Navy-purple panels and cards |
| `--bg-elevated` | `#2f2f45` | Elevated panels — slightly lighter than secondary |
| `--panel-soft` | `#1d1d27` | Subtle background variation |
| `--text-primary` | `#f8f8ff` | Ghost white headlines |
| `--text-secondary` | `#87878e` | Body text, descriptions |
| `--text-soft` | `#d2d2ff` | Soft lavender secondary text |
| `--accent` | `#9ed7f4` | Steel-blue — quotes, highlights, key labels |
| `--accent-mint` | `#a9ebcc` | Checkmarks, positive indicators, success |
| `--accent-yellow` | `#fde4a3` | Timeline bars, in-progress indicators |
| `--accent-pink` | `#ffd3d1` | Tertiary accents, soft warnings |
| `--border` | `#4e4e61` | Dashed divider lines |

**Body text opacity**: `rgba(248, 248, 255, 0.72)` for readable-but-quiet body text.

---

## Layout Principles

- **Left-right split as default**: 50:50 two-column with vertical dashed divider at center is the primary layout
- **Dashed lines as structure**: All structural separators are `1pt dashed`, never solid — the dashes create a blueprint/wireframe quality
- **Labels anchor context**: Every slide starts with a muted uppercase label at top-left naming the section
- **Generous horizontal padding**: 44pt left/right, 36pt top/bottom — content breathes
- **Content stays left-aligned**: Within each half of a split, text is left-aligned for readability
- **Data visualized with color bars**: Timeline and comparison data use the pastel trio (blue, yellow, pink) as horizontal bars
- **Metrics displayed large**: KPI numbers are 32-44pt bold white, with muted labels below
- **Quote slides center-weighted**: Large quote marks top-left, quote text in accent blue, attribution below in bold uppercase
- **Panel fills for placeholders**: Image areas use `#29293d` filled rectangles, never empty space

---

## Avoid

- **No pure black backgrounds** — always use eigengrau `#16161d`, never `#000000`
- **No pure white text** — use ghost white `#f8f8ff` with its subtle lavender warmth
- **No solid line dividers** — all structural lines are dashed (`border-style: dashed`)
- **No saturated primary colors** — accents are always muted/pastel (steel-blue, mint, soft yellow, soft pink)
- **No heavy decorative elements** — no gradients, no glows, no shadows; structure comes from layout and lines
- **No rounded corners larger than 6pt** — panels use subtle rounding, not pill shapes
- **No centered title layouts** — titles are left-aligned; this is an editorial/analytical pack, not a presentation-show pack
- **No drop shadows** — depth comes from color difference between `#16161d` and `#29293d`, not shadows

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
```

Note: Pretendard includes full Korean glyph support and variable weight axis (100-900).
