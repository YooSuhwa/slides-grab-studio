# slides-grab 디자인 품질 개선 제안

> **출처**: Anthropic의 Claude Design 시스템 프롬프트(`/Users/usuhwa/Downloads/Claude-Design-Sys-Prompt.txt`) 분석에서 도출.
> **작성일**: 2026-04-20
> **상태**: 분석 및 제안만 완료. 실제 적용은 보류 — 추후 이 문서만 보고도 수정 가능하도록 self-contained 작성.

---

## 1. 배경 & 핵심 철학

### 왜 이 문서가 존재하는가
Anthropic이 자사의 디자인/슬라이드 AI에게 적용하는 시스템 프롬프트를 분석한 결과, slides-grab에 적용 가능한 개선 지점을 도출함. 이 문서는 각 제안의 **우선순위·효과·수정 난이도·정확한 수정 위치·추가할 텍스트**를 담아, 나중에 이 문서만 보고도 바로 적용 가능하도록 설계됨.

### 핵심 철학
> "디자인은 맥락에 뿌리를 둬야 한다 (Good hi-fi designs do not start from scratch — they are rooted in existing design context)."

slides-grab은 이미 `packs/{id}/design.md + theme.css` 아키텍처로 이 철학을 구현 중. 이 문서의 제안들은 **이 기반을 무너뜨리지 않고 그 위에 누적되는** 개선안.

---

## 2. 적용 우선순위 요약

| # | 개선 항목 | 우선순위 | 효과 | 수정도 | 예상 시간 |
|---|----------|----------|------|--------|----------|
| 1 | AI Slop 체크리스트 | 🔥 High | 즉각 품질 상승 | S | 20분 |
| 2 | Content Guidelines | 🔥 High | Filler 억제 | S | 20분 |
| 3 | 덱당 1회 Think Out Loud | 🟡 Medium | 팩 해석 일관성 | XS | 10분 |
| 4 | Typography 최소치 | 🟡 Medium | 가독성 보장 | XS | 5분 |
| 5 | Visual rhythm 원칙 | 🟡 Medium | 덱 리듬감 | S | 20분 |
| 6 | 1-indexed slide labeling | 🟢 Low | 편집 UX | S | 30분 |
| 7 | Variations 다양성 전략 | 🟢 Low | regenerate 품질 | XS | 10분 |

수정도 범례: `XS`(한 줄) / `S`(한 섹션) / `M`(여러 파일) / `L`(구조 변경)

---

## 3. High Priority

### 🔥 1. AI Slop 체크리스트

**What** — Claude가 기본적으로 생성하기 쉬운 "AI 슬롭" 패턴을 명시적 금지 리스트에 추가.

**Why** — 원문 "Avoid AI slop tropes" 섹션 그대로. 이 패턴들은 Claude가 학습 데이터로 인해 자동 재생산하는 경향이 있고, 현재 design-skill에는 명시적 금지가 없음.

**Where** — `.claude/skills/design-skill/SKILL.md` 의 "Core Production Principles" 다음, 또는 Avoid 관련 섹션 내부.

**How** — 아래 섹션 추가:

````markdown
## AI Slop Avoidance

아래 패턴은 AI가 자동으로 생성하기 쉬운 "슬롭 트롭"이다. 팩의 design.md가 명시적으로 허용하지 않는 한 피할 것:

- **공격적 그라데이션 배경** — 팩의 theme.css가 그라디언트를 signature로 정의한 경우에만 사용
- **이모지 남용** — 팩의 design.md가 브랜드 요소로 이모지를 지정한 경우에만 사용. 그 외에는 SVG 아이콘 또는 placeholder 사용
- **좌측 border-accent rounded 박스** — "colored left border + rounded corner + gray background" 콤보는 전형적 웹 UI 트로프. 슬라이드에서 사용 금지
- **SVG로 이미지 흉내내기** — 복잡한 일러스트/사진/제품 이미지를 SVG로 그리지 말 것. placeholder 배치 후 실제 자료를 요청하거나 `slides-grab image`로 생성
- **과용 폰트 사용 금지** — Inter, Roboto, Arial, Fraunces, 시스템 폰트는 팩이 명시적으로 지정한 경우에만 사용
````

**Effect** — 덱마다 반복되는 low-quality 패턴 즉시 차단. 시각적 "AI 티"가 크게 감소.

---

### 🔥 2. Content Guidelines

**What** — "빈 공간을 콘텐츠로 채우지 말라"는 원칙을 design-skill에 명시.

**Why** — 원문 "One thousand no's for every yes" / "Do not add filler content" 섹션. AI는 슬라이드가 비어보이면 placeholder text, dummy section, 의미 없는 통계·아이콘으로 채우려는 성향이 강함.

**Where** — `.claude/skills/design-skill/SKILL.md` 의 Design Principles 섹션 내부.

**How** — 아래 섹션 추가:

````markdown
## Content Guidelines

### Filler 금지
- 빈 공간을 채우기 위한 placeholder text, dummy section, 의미 없는 정보 추가 금지
- 섹션이 비어보이면 **콘텐츠가 아닌 레이아웃으로** 해결 (여백, 타이포그래피 스케일, 공간 리듬)
- 모든 요소는 자기 자리를 증명해야 함 ("earn its place")

### 추가 콘텐츠는 먼저 물어보기
- outline에 없는 섹션/페이지/카피/이미지를 자의적으로 추가하지 말 것
- 부족하다고 판단되면 사용자에게 확인 후 추가

### Data slop 회피
- "이럴 것 같은" 숫자·통계·퍼센트·아이콘 나열 금지
- 출처 없는 수치는 차라리 qualitative 표현으로 대체
- 아이콘은 의미를 전달할 때만 — 장식용 아이콘 나열 금지
````

**Effect** — AI가 빈 슬라이드에 가짜 통계를 넣는 행동 차단. 간결한 슬라이드가 "덜 만들어진 슬라이드"가 아니라 "의도된 디자인"으로 인식되도록 규범화.

---

## 4. Medium Priority

### 🟡 3. 덱당 1회 Think Out Loud

**What** — design-skill이 HTML을 생성하기 전에, 팩×콘텐츠 해석을 `slide-outline.md` 상단에 한 문단 기록하도록 요구.

**Why** — 현재 워크플로우는 AI에게 "내면화하라"고 지시하지만, **실제로 해석했다는 증거**가 출력물에 남지 않음. Claude가 design.md를 읽기만 하고 형식적으로 따라갈 위험이 있음. 덱당 **단 1회만** 언어화하면 이 갭이 닫힘 (매 슬라이드마다가 아님).

**Where** — 
- `.claude/skills/design-skill/SKILL.md` 의 "Workflow (Stage 2)" Step 1
- `.claude/skills/plan-skill/SKILL.md` 의 slide-outline.md 포맷 안내 섹션

**How** — design-skill의 Step 1을 아래처럼 변경:

````markdown
1. **Analyze + Design**:
   a. Read `slide-outline.md`
   b. Read `packs/<pack-id>/design.md` — mood, signature, avoid 파악
   c. **Pack Interpretation (덱당 1회)**: `slide-outline.md` 상단에 다음 형식으로 한 문단 기록:
      ```
      ## Pack Interpretation
      - Mood 해석: <pack의 mood를 이 덱 주제/청중에 맞게 어떻게 해석하는지>
      - Signature 변주: <signature element를 이 덱에서 어떻게 사용/조정할지>
      - 이번 덱에서 특히 주의할 Avoid: <콘텐츠와 긴장관계가 있는 avoid 항목>
      ```
   d. Generate HTML slides per the outline
````

**Effect** — 팩 해석의 일관성 강제. 덱 전체가 "같은 사람이 디자인한" 느낌 유지. 오버헤드는 토큰 수십 개 수준.

---

### 🟡 4. Typography 최소치 명시

**What** — 현재 design-skill은 "팩의 스케일은 범위이지 고정값이 아니다"만 명시하고 **하한선이 없음**. 가독성 최소치를 추가.

**Why** — 원문은 1920×1080 기준 "24px 미만 금지"를 제시. slides-grab은 720×405pt이므로 환산 필요하지만, 절대 가독성 하한은 반드시 설정.

**Where** — `.claude/skills/design-skill/SKILL.md` 의 "Typography Priority" 섹션 아래.

**How** — 아래 서브섹션 추가:

````markdown
### Typography Floors (가독성 하한선)

슬라이드 사이즈 720×405pt 기준, 아래 하한선을 절대 지킬 것:

- **본문 텍스트**: 14pt 이상 (11pt 미만 절대 금지)
- **캡션/레이블**: 10pt 이상
- **핵심 타이틀**: 28pt 이상 권장, 최소 22pt
- **숫자 강조(hero number)**: 48pt 이상

팩의 Font Pairing이 더 큰 값을 제시하면 그 값을 따르고, 하한선보다 작은 값을 제시하면 하한선으로 올릴 것. (하한선은 "팩 지정값"보다 우선)
````

**Effect** — "팩이 작게 지정했다고 슬라이드에서 글자가 안 보이는" 최악의 경우 차단.

---

### 🟡 5. Visual Rhythm 원칙

**What** — 덱 전체의 리듬감을 의도적으로 설계하도록 가이드.

**Why** — 원문 "use 1-2 different background colors for a deck, max" / "use different background colors for section starters". 이는 덱의 "숨쉬기"를 만드는 원칙. 현재 design-skill에 명시 없음.

**Where** — `.claude/skills/design-skill/SKILL.md` 의 Design Principles 섹션 또는 신규 "Deck Rhythm" 섹션.

**How** — 아래 섹션 추가:

````markdown
## Deck Rhythm (덱 전체 리듬감)

덱은 슬라이드들의 합이 아니라 **하나의 흐름**이다. 의도적으로 리듬을 만들 것:

- **배경색은 덱 전체에서 1~2개 max** — 너무 많은 배경색은 시선을 흩뜨림. 기본 배경 + 섹션 divider용 1개 정도
- **Section divider에서 배경 변주** — 섹션이 바뀌는 슬라이드는 배경/레이아웃을 명확히 다르게 해 챕터 구분
- **이미지 중심 슬라이드는 full-bleed 고려** — 사진/일러스트가 주인공이면 여백 없이 화면 전체 사용
- **같은 레이아웃 3장 이상 반복 금지** — 콘텐츠 타입이 같아도 시각적 변주 유지 (비율 조정, 요소 재배치 등)
- **텍스트 헤비 슬라이드에는 반드시 시각 요소 commitment** — 이미지, 도형, 컬러 블록 중 하나는 반드시 포함 (기존 Core Production Principle #2와 연결)
````

**Effect** — 덱이 "흐름 있는 presentation"으로 느껴짐. 단순 슬라이드 나열이 아닌 의도된 시퀀스.

---

## 5. Low Priority

### 🟢 6. 1-indexed slide labeling

**What** — 각 슬라이드 HTML의 루트 요소에 `data-screen-label="01 Title"` 같은 1-indexed 라벨 부여.

**Why** — 원문 "Slide numbers are 1-indexed. When a user says 'slide 5', they mean the 5th slide (label '05'), never array position [4] — humans don't speak 0-indexed."
사용자가 "5번 슬라이드 수정해줘"라고 말했을 때 AI가 0-index 혼동 없이 정확히 식별. 에디터의 inline edit 기능과 조합하면 더 유용.

**Where** — `.claude/skills/design-skill/SKILL.md` 의 File Save Rules 또는 출력 규칙 섹션. 실제 HTML 템플릿에도 반영 필요.

**How**:
1. design-skill의 File Save Rules 아래에 명시:
   ```markdown
   - 각 슬라이드의 최상위 `<section>` 또는 루트 요소에 `data-screen-label="NN <제목>"` 속성 추가 (1-indexed, 2-digit)
   - 예: `data-screen-label="01 Cover"`, `data-screen-label="05 Results"`
   ```
2. `slides-grab validate`에 라벨 체크 추가 (선택)

**Effect** — 편집 UX 개선. 덱이 클수록 / 부분 수정이 많을수록 효과 큼.

---

### 🟢 7. Variations 다양성 전략

**What** — Slide regenerate 시 "by-the-book + novel 혼합" 전략 명시.

**Why** — 원문 "Start your variations basic and get more advanced and creative as you go!" 현재는 재생성해도 유사한 결과가 나올 가능성 있음. 다양성 강제 필요.

**Where** — Editor의 regenerate 프롬프트 (`src/editor/` 하위) 또는 design-skill 내 Variations 섹션.

**How** — 아래 지침 추가:

````markdown
## Regenerate Strategy (재생성 전략)

슬라이드를 재생성할 때:
- 이전 버전과 **최소 2가지 차원**에서 다른 결과 생산. 차원 예: 레이아웃, 색 조합, 타이포 비중, 시각 요소(도형/이미지/아이콘) 비중
- 첫 번째 재생성은 "by-the-book"(정석 레이아웃 변주), 두 번째는 "novel"(과감한 변주) 순서로
- 팩의 signature는 **유지**하되, 적용 방식은 **변경** (팩 아이덴티티가 깨지면 안 됨)
````

**Effect** — 재생성이 "같은 결과를 다시 뽑기"가 아니라 "새로운 탐색"이 됨.

---

## 6. ❌ 적용 불필요 (분석 결론)

아래 인사이트들은 원문에는 있지만 slides-grab에 적용하면 오버헤드만 증가하거나, 이미 충분히 구현됨.

### A. "처음에 질문 10개 모달" — 적용 불필요
**원문**: "Use questions_v2 tool when starting something new... one round of focused questions is usually right."
**왜 불필요**: slides-grab은 이미 plan-skill의 outline 승인 루프가 이 역할 수행. 추가 모달은 depth만 늘리고 체감 대기시간 증가. 현재 플로우 유지 권장.

### B. "파일 early preview + 수락 후 실제 제작" — 적용 불필요
**원문**: "begin your html file with some assumptions + context + design reasoning. add placeholders. show file to the user early."
**왜 불필요**: 원문의 의미는 HTML 안에 reasoning을 주석/placeholder로 기록해 일찍 공유하라는 것이지, 별도 승인 단계를 의미하지 않음. slides-grab의 outline이 이미 assumption/context 역할을 수행.

### C. "Think Out Loud 전면 도입" — 90% 구현됨
**원문**: "think out loud about what you observe."
**왜 불필요**: `packs/{id}/design.md` 구조 자체가 "AI가 언어화해야 할 내용"을 사전에 박제해둔 것. 팩 시스템이 think out loud의 **결과물을 파일로 고정**했음. 미세 보완은 #3(덱당 1회 해석)으로 충분.

### D. Speaker notes default off — 현행 유지
**원문**: "NEVER add speaker notes unless told explicitly."
**왜 불필요**: slides-grab은 이미 AI 발표 노트를 별도 기능(`slide_notes/` 폴더, 독립 UI)으로 분리. 원문 원칙과 부합.

### E. 질문을 많이 하라는 원칙의 "빈도" 해석 오류 주의
**주의사항**: 원문을 "매 단계마다 물어봐라"로 오해하면 사용자 경험 악화. 실제는 "시작 시점에 한 폼으로 10+ 질문을 묶어서"이고, 이조차 slides-grab은 outline 루프로 대체 중.

---

## 7. 추천 실행 순서

### Phase 1: Quick Wins (30~60분)
- [ ] #1 AI Slop 체크리스트
- [ ] #2 Content Guidelines

→ design-skill에 섹션 2개 추가. 즉각 품질 상승 체감. **하나의 PR로 묶어 처리**.

### Phase 2: 품질 방법론 강화 (1~2시간)
- [ ] #3 덱당 1회 Think Out Loud
- [ ] #4 Typography 최소치
- [ ] #5 Visual Rhythm

→ 방법론 보강. 디자인 일관성·가독성·리듬 확보. **이 셋도 하나의 PR**.

### Phase 3: 관찰 후 필요시 (각 30분)
- [ ] #6 1-indexed labeling (에디터 편집 시 0-index 혼동이 발견되면)
- [ ] #7 Variations 전략 (재생성 결과가 단조롭다는 피드백 나오면)

→ 실제 사용 중 문제 인식될 때 개별 PR.

---

## 8. 검증 방법

수정 후 확인해야 할 항목:

1. **Skill 파일 문법**: YAML frontmatter 유지, 섹션 구조 깨지지 않음
2. **기존 테스트**: `slides-grab validate --slides-dir <sample>` 통과
3. **샘플 덱 생성**: 수정 전후로 같은 outline으로 덱 생성 → 결과 비교
   - AI slop 패턴이 실제로 감소했는지 (eyeballing)
   - Typography 하한이 지켜지는지
   - 덱당 1회 Pack Interpretation 블록이 slide-outline.md에 기록되는지

---

## 9. 참고

### 원문 분석 파일
`/Users/usuhwa/Downloads/Claude-Design-Sys-Prompt.txt` — Anthropic의 디자인/슬라이드 아티팩트 환경 시스템 프롬프트

### 현재 slides-grab 수정 대상 파일
- `.claude/skills/plan-skill/SKILL.md` — #3 보조 수정
- `.claude/skills/design-skill/SKILL.md` — **주요 수정 대상** (#1, #2, #3, #4, #5, #6)
- `src/editor/` 하위 regenerate 관련 파일 — #7
- `packs/*/design.md` — 영향 없음 (공통 규칙은 design-skill에서 오버라이드)
- `packs/common-types.json` — 영향 없음

### 현재 design-skill의 관련 섹션 (수정 시 참조)
- `Core Style Principles` (L14)
- `Typography Priority (Pack-Guided Rule)` (L28)
- `Design Knowledge System (design.md + Type Skills)` (L41)
- `Core Production Principles` (L123)
- `Design Principles` (L136)
- `Workflow (Stage 2: Design + Human Review)` (L205)

### 작성 컨텍스트
- 분석 일자: 2026-04-20
- slides-grab 당시 브랜치: main
- 관련 최근 커밋: e8313bb (editor 쉘/단축키 정리), 15281fa (이미지 ops)
