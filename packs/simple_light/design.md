# simple_light Design Spec

## Identity

**Mood**: monochrome, typographic, bold, confident, editorial
**Best For**: business report, internal presentation, pitch deck, data-driven storytelling

This pack is pure black-on-white typography. No color, no decoration, no distraction.
The hierarchy comes entirely from font size and weight. Nothing else is needed.

---

## Signature Elements

- **Black and white only**: No accent colors in the core design. All visual hierarchy through size and weight alone.
- **Extra-bold titles**: Titles use weight 900 (Black). The heaviest available. This is the pack's identity.
- **Content sits low**: On hero slides (cover, section), content anchors to the lower-left area — not dead center. The whitespace above is deliberate tension.
- **Generous whitespace**: 60-80pt padding. The empty space IS the design.
- **Left-aligned by default**: Right-aligned or centered only as intentional variants.
- **Flat surfaces**: no shadows, no gradients, no glows. Cards use quiet gray fill only.

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 48pt 64pt;
  display: flex;
  flex-direction: column;
  word-break: keep-all;        /* 한국어 단어 중간에서 줄바꿈 방지 */
  overflow-wrap: break-word;   /* 긴 영문 단어 안전장치 */
}
```

### Hero Slide (Cover, Section Title)

```css
body {
  justify-content: center;     /* 콘텐츠를 세로 가운데 배치 */
  padding: 64pt 80pt;
}
h1 {
  font-size: 52pt;             /* 원본: 매우 큼 */
  font-weight: 900;            /* Black — 이 팩의 정체성 */
  letter-spacing: -0.03em;     /* 매우 타이트 */
  line-height: 1.2;
}
/* 콘텐츠가 세로 가운데, 좌측 정렬. 우측과 상하에 넓은 여백. */
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

### Card

```css
.card {
  background: var(--bg-elevated);   /* #c8c8c8 — 원본은 꽤 진한 회색 */
  border-radius: 16pt;
  padding: 24pt;
}
/* No border. No shadow. Just a gray fill. */
```

### Metric Display

```css
.metric {
  font-size: 56pt;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  line-height: 1.0;
}
/* Big number, left-aligned, with supporting text below. */
```

---

## Font Pairing

- **Font**: Pretendard (single family, no mixing)
- **Title (hero)**: 56pt, weight 900, letter-spacing -0.03em, line-height 1.1
- **Title (section/slide)**: 32-40pt, weight 900, letter-spacing -0.02em
- **Subtitle**: 16-18pt, weight 500, letter-spacing -0.01em
- **Body**: 12-13pt, weight 400, line-height 1.6, color: `--text-secondary` — 원본은 본문이 상당히 작고 가벼움
- **Caption/Link**: 10-11pt, weight 400

Weight progression: **900** (titles) → 500 (subtitles) → 400 (body). 극단적 대비가 핵심.

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
| `--bg-secondary` | `#f5f5f5` | Secondary areas (rarely used). |
| `--bg-elevated` | `#d0d0d0` | Card/principle backgrounds. 원본은 꽤 진한 회색. |
| `--text-primary` | `#000000` | Headings AND body text. Pure black throughout. |
| `--text-secondary` | `#444444` | 보조 텍스트. 원본은 #6b6b6b보다 훨씬 진함. |
| `--accent` | `#FC5E20` | **거의 사용하지 않음**. 원본 템플릿에는 없는 색. 링크/CTA에만 최소한 사용 가능. |
| `--border` | `#e0e0e0` | Timeline lines, dividers. |

**Rule**: 기본적으로 흑백만 사용. Accent는 optional — 없어도 슬라이드가 완성되어야 한다.

---

## Layout Principles

### 3가지 기본 레이아웃 패턴

**Pattern A — Hero (세로 가운데, 좌측 정렬)**
커버, 섹션 디바이더, 콘텐츠 등 텍스트 중심 슬라이드.
```
[                                    ]
[                                    ]
[   Big Bold Title                   ]   ← 세로 가운데, 좌측 정렬
[   Subtitle or description          ]   ← 우측 절반 이상은 여백
[                                    ]
[                                    ]
```

**Pattern B — Left-Right Split (35:65)**
하이라이트, 심플리스트, 투컬럼, 키메트릭 등.
```
[                                    ]
[                                    ]
[   Title        | Content area      ]   ← 35% : 65%
[   (left)       | (items/grid)      ]
[                                    ]
[                                    ]
```

**Pattern C — Top-Down Grid**
프린시플, 이미지 갤러리, 통계 등.
```
[   Title                            ]
[                                    ]
[   [item]    [item]    [item]       ]   ← 균등 분배 그리드
[                                    ]
[                                    ]
```

### 공통 규칙

- **Content density**: 3-5 points per slide. If more, split into two slides.
- **Padding**: 48pt 64pt (standard), 64pt 80pt (hero slides).
- **Gap rhythm**: 32pt between sections, 16pt between elements, 6-8pt between text blocks.
- **Split ratio**: 35% left, 65% right. Never 50:50.
- **Vertical gravity**: Hero content sits at vertical center, left-aligned. `justify-content: center`.

### Layout Variants (원본에 있는 변형)

- **Center-aligned section**: 일부 섹션 디바이더는 중앙 정렬 (title + subtitle 모두 center)
- **Bottom-anchored inverted**: subtitle 위, title 아래 (역순 배치) — 시선 흐름 변화용
- **Full-bleed image**: 이미지가 슬라이드 우측 절반을 padding 없이 채움

---

## Avoid

- **No accent color on titles** — accent는 원본 디자인에 없음. 사용하더라도 작은 링크/CTA에만.
- **No gradients** — not on backgrounds, not on text, not anywhere
- **No shadows** — no box-shadow, no text-shadow, no drop shadows
- **No border on cards** — use gray fill instead
- **No decorative shapes** — no circles, lines, or geometric ornaments
- **No icons** — use text hierarchy, not icons, to organize information
- **No centering by default** — left-align first. Center only as intentional variant.
- **No lightweight titles** — titles must be weight 900. Never 600 or 700 for main headings.
- **No background images on slides** — pure white background only
- **No rounded corners > 16pt** — cards use 16pt max
- **No medium gray for body text** — body text should be near-black (#444444), not light gray (#6b6b6b)
