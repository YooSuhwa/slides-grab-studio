# Pack Template 규격화 프롬프트

> 이 프롬프트를 새 세션에서 사용하여 팩 템플릿을 표준 타이포그래피 스케일에 맞게 수정합니다.
> 한 번에 1개 팩씩 진행하세요.

---

## 프롬프트

```
slides-grab 프로젝트의 template pack을 표준 디자인 규격에 맞게 수정해줘.

## 프로젝트 컨텍스트

- 프로젝트: /Users/usuhwa/_workspace/bootstrap/slides-grab
- CLAUDE.md, TASKS.md를 먼저 읽어
- 디자인 규격: skills/slides-grab-design/references/design-system-full.md
- 슬라이드 크기: 720pt × 405pt (고정)

## 작업 대상

팩: `packs/<PACK_ID>/`

## 표준 타이포그래피 스케일

모든 팩의 템플릿은 아래 크기를 기준으로 맞춰야 해:

| 역할 | 크기 | 굵기 | 사용 위치 |
|------|------|------|----------|
| Hero Title | 56-72pt | 700-800 | cover 슬라이드 메인 타이틀 |
| Section Title | 40-48pt | 700 | section-divider 제목 |
| Slide Title | 28-36pt | 600-700 | 일반 슬라이드 제목 (h1/h2) |
| Subtitle | 18-22pt | 500 | 부제목, 설명 |
| Body | 14-18pt | 400 | 본문 텍스트 |
| Caption | 10-12pt | 400 | 캡션, 출처 |
| Label | 9-11pt | 500-600 | 배지, 태그, 번호 |

### letter-spacing 기준
- 큰 제목 (Hero, Section): -0.02em
- 중간 제목 (Slide Title): -0.01em
- 본문: 0
- 캡션/라벨: 0.02em

### line-height 기준
- 제목: 1.2
- 본문: 1.6
- 단일 행: 1.0

## 폰트 규칙

- 팩의 theme.css에 --font-sans가 정의되어 있으면 그 폰트를 사용
- 없으면 Pretendard를 기본으로 사용
- 팩의 기존 폰트를 바꾸지 말 것 (Inter를 쓰는 팩은 Inter 유지)

## 색상 규칙

- 팩의 theme.css CSS 변수를 그대로 사용
- 하드코딩된 색상은 가능한 var() 참조로 교체
- 색상 자체를 변경하지 말 것

## 작업 순서

1. `slides-grab show-pack <PACK_ID>`로 팩이 가진 템플릿 목록 확인
2. `slides-grab show-theme <PACK_ID>`로 팩의 CSS 변수 확인
3. 각 템플릿 HTML을 읽고 현재 폰트 크기를 파악
4. 위 표준 스케일에 맞게 수정:
   - cover.html: Hero Title → 56-72pt, 부제목 → 18-22pt
   - section-divider.html: Section Title → 40-48pt
   - content.html: Slide Title → 28-36pt, Body → 14-18pt
   - 기타 템플릿도 역할에 맞게 조정
5. 수정 후 `slides-grab validate --slides-dir`로 검증
6. 수정 전/후 비교표 제출

## 주의사항

- 레이아웃(flexbox, grid 구조)은 변경하지 않는다
- 색상은 변경하지 않는다
- 폰트 패밀리는 변경하지 않는다
- 오직 font-size, font-weight, letter-spacing, line-height만 조정한다
- padding/margin은 크기 변경에 따라 필요한 만큼만 미세 조정한다
- 수정 후 시각적으로 깨지는 부분이 없는지 확인한다

## CSS 변수 표준화 (선택)

가능하면 팩의 theme.css에 아래 변수를 추가하고 템플릿에서 참조하도록 전환:

```css
:root {
  /* Typography scale */
  --title-hero: 64pt;
  --title-section: 44pt;
  --title-slide: 32pt;
  --text-subtitle: 20pt;
  --text-body: 16pt;
  --text-caption: 11pt;
  --text-label: 10pt;
}
```

이렇게 하면 나중에 팩 전체의 크기를 한 곳에서 조정할 수 있다.
단, 기존 --title-xl 같은 변수명이 있으면 그걸 유지하되 값을 표준에 맞춰라.

## 완료 기준

- [ ] 모든 템플릿의 Hero Title이 56-72pt 범위
- [ ] 모든 템플릿의 Slide Title이 28-36pt 범위
- [ ] 모든 템플릿의 Body가 14-18pt 범위
- [ ] letter-spacing, line-height 기준 적용
- [ ] validation 통과
- [ ] 색상/레이아웃 변경 없음
```

---

## 팩별 작업 순서 (권장)

1. `simple_light` — 가장 많은 템플릿 (23개), 기준 팩
2. `simple_dark` — CSS 변수가 이미 있음, 값만 조정
3. `corporate` — 비즈니스 기본
4. `bold_minimal` — base.css 클래스 구조 있음
5. `green` — Inter 폰트 팩
6. `black_rainbow` — Inter 폰트 팩
7. `grab` — 이미 72pt Hero, 미세 조정
8. `midnight` — 다크 테마
9. `creative` — 개성 있는 팩
10. `mobile_strategy` — 특화 팩

## 주의: 한 세션에 1-2개 팩만 처리

팩 하나에 7-23개 템플릿이 있으므로 한 세션에 많은 팩을 처리하면
컨텍스트가 부족해질 수 있습니다. 1-2개씩 나눠서 진행하세요.
