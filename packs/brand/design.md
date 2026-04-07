# brand Design Spec

## Identity

**Mood**: corporate, professional, structured, clean
**Best For**: company introduction, business proposal, IR material, partnership deck

A polished corporate presentation built on white space and orange accent discipline.
Every slide starts from a clean white canvas. Structure comes from a strict system:
an orange vertical bar marks section headers, orange header bands crown content cards,
and key metrics shine in large orange numerals. The charcoal-on-white typography is
formal but never stiff. This is the template a company uses when credibility and
clarity matter more than flair.

---

## Signature Elements

- **Orange vertical bar (4pt)**: A thin, solid `#FC5E20` bar sits left of every section title. This is the pack's most iconic marker — it signals hierarchy instantly.
- **Card with orange header band**: Cards have a rounded-top orange banner containing white text, followed by a white/light-gray body below. 3-4 column grid layout.
- **Charcoal heading text**: Titles use `#373742` at weight 700-800 — dark and assertive but not pure black.
- **Key metric in accent orange**: Important numbers (revenue, KPI, percentage) rendered in large `#FC5E20` type to draw the eye.
- **Gray footer strip**: A subtle footer area with copyright text and page numbers in `--text-secondary`.
- **Left-aligned hierarchy**: Content anchors left. Orange bar + title + subtitle stack vertically in a clear reading order.
- **Clean card grid**: 3-4 equal-width columns for comparison layouts, each card with consistent structure.

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 40pt 52pt;
  display: flex;
  flex-direction: column;
  position: relative;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Section Title with Orange Bar

```css
.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16pt;
  margin-bottom: 32pt;
}
.section-header::before {
  content: '';
  display: block;
  width: 4pt;
  min-height: 48pt;
  background: var(--accent);        /* #FC5E20 */
  border-radius: 1pt;
  flex-shrink: 0;
}
.section-header h1 {
  font-size: 40pt;
  font-weight: 800;
  color: var(--text-primary);       /* #373742 */
  letter-spacing: -0.02em;
  line-height: 1.2;
}
```

### Orange Header Card

```css
.card {
  display: flex;
  flex-direction: column;
  border-radius: 8pt;
  overflow: hidden;
}
.card-header {
  background: var(--accent);        /* #FC5E20 */
  color: #ffffff;
  padding: 12pt 16pt;
  font-size: 14pt;
  font-weight: 700;
}
.card-body {
  background: var(--bg-secondary);  /* #f3f3f3 */
  padding: 16pt;
  flex: 1;
}
/* No shadow. No border. Structure comes from the color band. */
```

### Card Grid (3-4 columns)

```css
.card-grid {
  display: flex;
  gap: 16pt;
  flex: 1;
}
.card-grid .card {
  flex: 1;
  min-width: 0;
}
```

### Key Metric Display

```css
.metric {
  font-size: 48pt;
  font-weight: 800;
  color: var(--accent);             /* #FC5E20 — orange for emphasis */
  letter-spacing: -0.02em;
  line-height: 1.0;
}
.metric-label {
  font-size: 12pt;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 6pt;
}
```

### Dark Banner (Elevated Header)

```css
.dark-banner {
  background: var(--bg-elevated);   /* #4B4B4B */
  color: #ffffff;
  padding: 24pt 32pt;
  border-radius: 8pt;
}
.dark-banner h2 {
  font-size: 28pt;
  font-weight: 700;
}
```

### Footer

```css
.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24pt;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 52pt;
  font-size: 8pt;
  color: var(--text-secondary);
}
```

---

## Font Pairing

- **Font**: Pretendard (single family throughout)
- **Title (hero)**: 56pt, weight 800, letter-spacing -0.02em, line-height 1.15
- **Title (section)**: 40pt, weight 800, letter-spacing -0.02em
- **Title (slide)**: 30pt, weight 700, letter-spacing -0.01em
- **Subtitle**: 18pt, weight 500, letter-spacing -0.01em, color: `--text-secondary`
- **Body**: 15pt, weight 400, line-height 1.65, color: `--text-secondary`
- **Caption/Label**: 10-11pt, weight 400

Weight progression: **800** (titles) → 700 (slide titles) → 500 (subtitles) → 400 (body). Formal but not extreme.

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
| `--bg-primary` | `#ffffff` | Slide background. Always white. |
| `--bg-secondary` | `#f3f3f3` | Card body background, footer strip. |
| `--bg-elevated` | `#4B4B4B` | Dark banner headers, emphasis blocks. |
| `--text-primary` | `#373742` | Headings, titles. Dark charcoal — not pure black. |
| `--text-secondary` | `#5A5A65` | Body text, descriptions, captions. |
| `--accent` | `#FC5E20` | Orange accent — vertical bars, card headers, key metrics, highlighted text. The pack's signature color. |
| `--border` | `#eeeeee` | Subtle dividers, table borders. |

**Color discipline**: White canvas + charcoal text + orange accents. No other colors enter the palette. The orange is used structurally (bars, bands, metrics), never decoratively (backgrounds, gradients).

---

## Layout Principles

### 3 Core Layout Patterns

**Pattern A — Section Header (Left-aligned with bar)**
Cover, section dividers, chapter opens.
```
[                                    ]
[   |  Section Title                 ]   ← orange bar (4pt) + bold title
[   |  Subtitle text here            ]   ← lighter weight below
[                                    ]
[   [card] [card] [card]             ]   ← optional card grid below
[                          [footer]  ]
```

**Pattern B — Card Grid (3-4 columns)**
Service overview, comparison, feature list.
```
[   |  Title                         ]
[                                    ]
[   [orange hdr] [orange hdr] [hdr] ]   ← orange band tops
[   [card body ] [card body ] [body]]   ← light gray card bodies
[   [          ] [          ] [    ]]
[                          [footer]  ]
```

**Pattern C — Key Metric + Detail**
KPI slides, financial highlights, statistics.
```
[   |  Title                         ]
[                                    ]
[   FC5E20                           ]
[   87.3%        Description text    ]   ← large orange number + supporting text
[   metric       in secondary color  ]
[                          [footer]  ]
```

### Common Rules

- **Content density**: 3-5 points per slide. Cards limited to 3-4 per row.
- **Padding**: 40pt 52pt standard. Generous but not excessive — corporate density.
- **Gap rhythm**: 32pt between major sections, 16pt between cards, 8pt between text lines.
- **Orange bar consistency**: Every section title slide MUST have the 4pt orange vertical bar.
- **Card alignment**: All cards in a row share equal width. Headers share the same orange.
- **Footer presence**: Most slides carry the footer strip with copyright and page number.

---

## Avoid

- **No gradients** — backgrounds, text, and accents are all flat solid colors
- **No shadows** — no box-shadow on cards; structure comes from color banding
- **No rounded corners > 8pt** — corporate restraint; 8pt max on cards
- **No pure black text** — use `#373742` charcoal, never `#000000`
- **No accent on backgrounds** — orange is for bars, bands, metrics, and text highlights only. Never an orange background fill for entire slides
- **No decorative shapes or icons** — if illustration is needed, use photo or structured diagrams
- **No centered hero titles** — section headers are left-aligned with the orange bar marker
- **No lightweight titles** — headings are weight 700-800, never 400 or 500
- **No more than 2 font weights per slide** — keep it disciplined (e.g., 800 + 400, or 700 + 500)
- **No missing footer** — the footer is part of the brand system; omit only on full-bleed cover slides
