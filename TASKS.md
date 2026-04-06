# slides-grab 개선 TASKS

> 2026-03-30 생성. 우선순위 높은 항목부터 Phase별 진행.

---

## Phase 1: Foundation — 독립적 병렬 작업

서버 코드를 건드리지 않는 독립 모듈. 전부 병렬 진행 가능.

### 1A. Architecture
- [x] 6.4 `editor.html` CSS 외부 분리 → `editor.css`
- [x] 7.2 PPTX 변환 테스트 추가 (`html2pptx.cjs` 스냅샷 테스트)

### 1B. Features (Editor JS Only)
- [x] 1.1 Undo/Redo 히스토리 스택 (per-slide HTML 스냅샷)
- [x] 2.5 키보드 단축키 확장 (D=Draw, S=Select, Arrow, Undo/Redo)

### 1C. Validation & CLI
- [x] 5.1 접근성 검증 (contrast ratio, alt text)
- [x] 4.2 커스텀 Pack 생성 CLI (`slides-grab pack init <name>`)

---

## Phase 2: Server Modularization

Phase 1과 병렬로 진행하되, 별도 브랜치에서 신중하게 작업.

- [x] 6.1 `editor-server.js` (3,051줄 → 297줄) Express Router 모듈 분리
  - [x] 13개 라우트 모듈 + 5개 공유 모듈로 분리
  - [x] 모든 모듈 300줄 이하
  - [x] 기존 기능 회귀 테스트 통과 확인 (46/46)

---

## Phase 3: Server-Dependent Features

Phase 2 머지 후 진행. 새 라우트 모듈에 엔드포인트 추가.

### 3A. Core Slide Operations
- [x] 1.3 슬라이드 복제/삭제 (API: duplicate/delete + 자동 리넘버링)
- [x] 1.2 슬라이드 순서 변경 — Drag & Drop (UI + API)
- [x] 2.1 비주얼 썸네일 프리뷰 (scaled iframe 기반)

### 3B. Presenter & Presentation
- [x] 1.4 Presenter Notes 지원 (notes.md 파일 + API + 자동저장)
- [x] NEW: 프레젠테이션 모드 (F5, fade 전환, N키 노트 토글)

### 3C. DX
- [x] 7.1 에디터 Hot Reload (fsWatch → SSE devReload 이벤트)

---

## Phase 4: Conversion & Design

독립적으로 병렬 가능.

### 4A. PPTX Quality
- [x] 3.1 벡터 기반 PPTX 개선 (opentype.js 폰트 메트릭)
- [x] 3.2 CSS 그래디언트 자동 래스터화

### 4B. Pack System
- [x] 4.1 Pack 갤러리/프리뷰 페이지
- [x] NEW: 슬라이드 생성 시 일관성 가이드 (크로스-슬라이드 스타일 규칙)

---

## Phase 5: Stabilization

서버 안정성, 리소스 누수, 보안 이슈 수정.

### 5A. 인프라 (Phase 0)
- [x] AsyncMutex 모듈 생성 (`scripts/server/mutex.js`)
- [x] SSE broadcast 에러 핸들링 (`scripts/server/sse.js`)
- [x] 브라우저 풀 실패 시 캐시 리셋 (`scripts/server/helpers.js`)

### 5B. 크리티컬 버그 수정 (Phase 1)
- [x] `activeGenerate` 불리언 → AsyncMutex 원자적 교체 (TOCTOU 레이스 컨디션 해소)
- [x] Global Express error middleware 추가
- [x] 포트 바인딩 에러 핸들러 추가
- [x] `unhandledRejection` 프로세스 핸들러 추가

### 5C. 리소스 누수 방지 (Phase 2)
- [x] 서브프로세스 타임아웃 추가 (Claude 10분, Codex 5분)
- [x] 익스포트 파일 Map 최대 크기 제한 (PDF/PPTX/SVG, 최대 10건)

### 5D. 안전망 (Phase 3)
- [x] 파일 워처 에러 핸들러 + debounce 정리 + safe SSE
- [x] 모든 fire-and-forget IIFE에 `.catch()` 체인 추가

### 5E. 보안 및 엣지케이스 (Phase 4)
- [x] deckName path traversal 방지 (`sanitizeDeckName` / `resolveDeckPath`)
- [x] 슬라이드 리넘버링 복구 실패 시 에러 로깅

### 5F. 테스트
- [x] 안정화 테스트 13건 작성 (뮤텍스, SSE, 브라우저 풀, 타임아웃, path traversal)

---

## Notes
- 각 태스크 완료 시 Quality Gate (테스트, 린트, 빌드) 통과 필수
- Phase 경계에서 기존 기능 회귀 없음을 확인
- 병렬 작업은 worktree 격리로 파일 충돌 방지
