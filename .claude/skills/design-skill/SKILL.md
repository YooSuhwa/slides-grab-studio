---
name: design-skill
description: Design presentation slides as polished HTML. Use when generating slide HTML, visual design, or layout composition is needed.
---

# Design Skill - Professional Presentation Design System

A skill for designing HTML slides for top-tier business presentations.
Delivers minimal, refined design based on existing templates and theme system.

---

## Core Style Principles

- **Font**: Pretendard (CDN link below); if the pack's theme.css specifies a different font, follow the pack
- **Slide Size**: 720pt x 405pt (16:9, fixed)
- **Style**: Determined by the selected template pack

### Default Style
- Default pack: `simple_light`
- Run `slides-grab show-theme simple_light` to see current colors

### Pretendard Webfont CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
```

### Typography Priority (Pack-Guided Rule)

When deciding font sizes for a slide:

1. **Pack has the template** → 해당 템플릿의 타이포그래피 스케일을 **기본값으로 사용**
2. **Pack doesn't have the template** → 팩의 theme.css와 기존 템플릿의 스케일을 참고하여 매칭
3. **No pack specified or empty pack** → `references/design-system-full.md`의 스케일 사용

단, 콘텐츠의 특성(긴 한글 제목, 대형 숫자 강조, 다크 배경 등)에 따라
스케일을 자연스럽게 조정할 수 있다. 팩의 스케일은 "범위"이지 "고정값"이 아니다.

---

## Template Pack System

Templates are organized into **packs** in the `packs/` directory. Each pack provides a different visual design.

All packs share a common set of template type names defined in `packs/common-types.json`.

### How to use packs

1. **Check available packs**: `slides-grab list-packs`
2. **View pack details**: `slides-grab show-pack <pack-id>` (colors, owned templates, missing types)
3. **View a template**: `slides-grab show-template <type> --pack <pack-id>`
4. **Follow the pack's design language** consistently across all slides.

### Pack Resolution (2-tier)

1. **Pack has the template** -> use it directly via `show-template <type> --pack <pack-id>`
2. **Pack doesn't have the template** -> design from scratch using the pack's `theme.css` colors
   - Do NOT fall back to simple_light HTML structure
   - Use `slides-grab show-theme <pack-id>` to get CSS variables
   - Create a layout that fits the pack's visual language

---

## Template-Guided Design Rule

팩에 해당 type 템플릿이 있으면, **색상 체계와 레이아웃 패턴을 참고**한다.
단, 템플릿을 그대로 복사하지 말고 콘텐츠에 맞게 자유롭게 변형한다:

- 아웃라인에 스타일 힌트("배경은 어둡게", "대형 숫자 중심" 등)가 있으면 우선 적용
- accent 색상(--accent)을 적극 활용: 섹션 라벨, 핵심 수치, 강조 문구
- 슬라이드마다 콘텐츠에 최적화된 레이아웃을 선택. 같은 패턴을 3장 이상 반복하지 않기
- 팩에 없는 type은 theme.css 색상으로 자유롭게 디자인

**핵심: 팩은 "색상+분위기 가이드"이지, "레이아웃 강제"가 아니다.**

### Theme CSS Variables

Each pack has a `theme.css` with CSS variables (`:root { --bg-primary, --text-primary, --accent, ... }`).

- View: `slides-grab show-theme <pack-id>`
- Templates include `:root` block inline for standalone rendering
- Use `var()` references instead of hardcoded colors

---

## Reference Files

For detailed rules, examples, and patterns, consult:

- **`references/design-rules.md`** — slide spec, asset rules, pack system, review loop
- **`references/detailed-design-rules.md`** — image/text usage rules, workflow constraints
- **`references/beautiful-slide-defaults.md`** — art direction: visual thesis, narrative sequence, review litmus
- **`references/design-system-full.md`** — typography scale, layout system, design components, chart/diagram/icon library
- **`references/charts-icons-library.md`** — Chart.js, Mermaid, SVG icon snippets (arrow, check, star, etc.)

These files are located at `skills/slides-grab-design/references/`.

---

## Output and File Structure

### File Save Rules
```
<slides-dir>/
  slide-01.html  (Cover)
  slide-02.html  (Contents)
  slide-03.html  (Section Divider)
  slide-04.html  (Content)
  ...
  slide-XX.html  (Closing)
```

### File Naming Rules
- Use 2-digit numbers: `slide-01.html`, `slide-02.html`
- Name sequentially
- No special characters or spaces

---

## Workflow (Stage 2: Design + Human Review)

This skill is **Stage 2**. It works from the `slide-outline.md` approved by the user in Stage 1 (plan-skill).

### Prerequisites
- `slide-outline.md` must exist and be approved by the user.

### Steps

1. **Analyze + Design**: Read `slide-outline.md`, decide theme/layout, generate HTML slides
2. **Validate**: After generation or edits, run:
   ```bash
   slides-grab validate --slides-dir <path>
   ```
   If validation fails, fix the source slide HTML/CSS and re-run until it passes.
3. **Revision loop**: When the user requests changes to specific slides:
   - Edit only the relevant HTML file
   - Re-run `slides-grab validate --slides-dir <path>`
   - Guide user to review again
4. **Completion**: Repeat the revision loop until the user signals approval for conversion

### Absolute Rules
- **Never start conversion without approval** -- Conversion is the responsibility of `pptx-skill` and requires explicit user approval.
- **Never skip validation** -- Run `slides-grab validate` after every generation/edit pass.
- **Run the review litmus** from `references/beautiful-slide-defaults.md` before presenting the deck.

---

## Important Notes

1. **CSS gradients**: Not supported in PowerPoint conversion -- replace with background images
2. **Webfonts**: Always include the Pretendard CDN link (unless pack specifies a different font)
3. **Image contract**: Store local assets in `<slides-dir>/assets/` and reference as `./assets/<file>`. Download remote images before saving. Allow `data:` URLs for self-contained slides. Never use absolute filesystem paths.
4. **Colors**: Always include `#` prefix in CSS
5. **Text rules**: Never place text directly in div/span
6. **SVG export**: Emoji/special characters are auto-rasterized to PNG in SVG export — quality is sufficient for slides. Use emoji freely for visual richness. Only use inline SVG icons from `references/charts-icons-library.md` when precise color control or large hero icons (24pt+) are needed.
