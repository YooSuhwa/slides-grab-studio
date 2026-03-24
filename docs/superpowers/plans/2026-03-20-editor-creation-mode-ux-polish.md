# Editor Creation Mode UX Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix UI/UX inconsistencies when the editor is in creation mode (New Presentation) — stale nav state, clickable-but-useless buttons, missing visual guards.

**Architecture:** All changes are purely frontend (editor HTML/JS). No server changes needed except one small reset endpoint. The core approach is: `showCreationMode()` disables/hides everything irrelevant, `hideCreationMode()` restores it. Each fix is a small, isolated change.

**Tech Stack:** Vanilla JS (ES modules), HTML, CSS

---

## Issue Summary

| # | Issue | Where |
|---|-------|-------|
| 1 | Nav bar shows old deck name when entering New Presentation | `editor-init.js`, `editor-server.js` |
| 2 | Outline button clickable in creation mode (no slides) | `editor-create.js` |
| 3 | Export button clickable in creation mode (no slides) | `editor-create.js` |
| 4 | Prev/Next buttons not disabled in creation mode | `editor-create.js` |
| 5 | Outline button stays enabled even when deck has no outline | `editor-outline.js` |

## File Map

| File | Responsibility | Change Type |
|------|---------------|-------------|
| `src/editor/js/editor-create.js` | Creation mode show/hide logic | Modify: disable nav buttons in show, restore in hide |
| `src/editor/js/editor-dom.js` | DOM element exports | Modify: add `btnReviewOutline` export |
| `src/editor/js/editor-init.js` | Editor initialization | Modify: hide deck name + set outline button state on init |
| `src/editor/js/editor-outline.js` | Outline panel logic | Modify: remove local `btnReviewOutline`, import from dom.js |
| `scripts/editor-server.js` | Server-side editor config | Modify: add `POST /api/decks/new` reset endpoint |

---

### Task 1: Server — add deck reset endpoint for new deck flow

New Presentation을 시작할 때 서버에서 이전 덱 상태를 초기화해야 한다. 현재는 `/editor?create=1`로 이동해도 서버의 `slidesDirectory`와 `opts.deckName`이 이전 덱을 가리키고 있어서, `/api/editor-config`가 stale deck name을 반환한다.

**Files:**
- Modify: `scripts/editor-server.js:745` (add endpoint before `/api/decks/switch`)

- [ ] **Step 1: Add `POST /api/decks/new` endpoint**

`/api/decks/switch` 바로 위에 추가한다:

```javascript
  app.post('/api/decks/new', async (_req, res) => {
    slidesDirectory = null;
    opts.deckName = '';
    opts.createMode = true;
    if (fileWatcher) { fileWatcher.close(); fileWatcher = null; }
    res.json({ ok: true });
  });
```

`fileWatcher` 변수명 확인 — 파일 상단에서 watcher 변수가 뭔지 grep으로 확인할 것. `setupFileWatcher`가 기존 watcher를 정리하는지도 확인.

- [ ] **Step 2: Commit**

```bash
git add scripts/editor-server.js
git commit -m "feat(editor): add POST /api/decks/new to reset server state for new deck"
```

---

### Task 2: Frontend — call reset endpoint when entering New Presentation

`?create=1`로 진입 시 서버 상태를 먼저 리셋한 뒤 config를 가져온다.

**Files:**
- Modify: `src/editor/js/editor-init.js:430` (forceCreate 분기)

- [ ] **Step 1: forceCreate일 때 서버 리셋 호출 추가**

`editor-init.js`에서 `forceCreate` 감지 직후, config fetch 전에:

```javascript
    // Handle ?create=1 query param (from browser "New Deck" button)
    const forceCreate = urlParams.get('create') === '1';

    // Reset server state for new deck creation
    if (forceCreate) {
      await fetch('/api/decks/new', { method: 'POST' }).catch(() => {});
    }
```

이미 `const configRes = await fetch('/api/editor-config')` 이전에 위치해야 한다. 현재 코드 순서를 보면 config fetch(line 417)가 forceCreate 감지(line 430)보다 **앞**에 있으므로, 순서를 조정해야 한다:

1. `forceCreate` 감지
2. `forceCreate`이면 `/api/decks/new` 호출
3. `/api/editor-config` fetch

- [ ] **Step 2: deck name 숨김 처리**

config fetch 후 browseMode 처리 블록에서, `forceCreate`일 때 deck name을 숨긴다:

```javascript
    if (config.browseMode) {
      const backBtn = document.getElementById('btn-back-browser');
      const deckNameEl = document.getElementById('nav-deck-name');
      if (backBtn) backBtn.style.display = '';
      if (deckNameEl) {
        if (forceCreate) {
          deckNameEl.textContent = '';
          deckNameEl.style.display = 'none';
        } else if (config.deckName) {
          deckNameEl.textContent = config.deckName;
          deckNameEl.style.display = '';
        }
      }
    }
```

- [ ] **Step 3: Commit**

```bash
git add src/editor/js/editor-init.js
git commit -m "fix(editor): reset server state and hide stale deck name on New Presentation"
```

---

### Task 3: Frontend — disable Outline/Export/Nav buttons in creation mode

`showCreationMode()`에서 관련 없는 버튼을 disabled 처리하고, `hideCreationMode()`에서 복원한다.

**Files:**
- Modify: `src/editor/js/editor-dom.js:89` (add `btnReviewOutline` export)
- Modify: `src/editor/js/editor-create.js:4-9` (add imports), `:78-114` (show/hide functions)
- Modify: `src/editor/js/editor-outline.js:561` (remove local `btnReviewOutline`, import from dom)

- [ ] **Step 1: `editor-dom.js`에 `btnReviewOutline` 추가**

```javascript
// 기존 line 89 근처
export const btnExportToggle = $('#btn-export-toggle');
export const exportDropdown = $('#export-dropdown');
export const btnReviewOutline = $('#btn-review-outline');
```

- [ ] **Step 2: `editor-outline.js`에서 로컬 선언 제거, import로 교체**

```javascript
// line 561 제거:
// const btnReviewOutline = $('#btn-review-outline');

// line 1-6 import 수정: editor-dom.js에서 가져오기
import { btnReviewOutline } from './editor-dom.js';
```

주의: `editor-outline.js`는 상단에서 `const $ = (sel) => document.querySelector(sel);`을 자체 정의하고 있다. `btnReviewOutline`만 dom.js로 옮기면 된다.

- [ ] **Step 3: `editor-create.js`에서 import 추가 및 show/hide 수정**

import에 추가:

```javascript
import {
  creationPanel, creationTopic, creationRequirements, creationModel,
  creationGenerate, creationLog, creationProgress,
  creationDeckName, creationSlideCount,
  slidePanel, editorSidebar, slideCounter, btnNewDeck, slideStrip,
  btnPrev, btnNext, btnExportToggle, btnReviewOutline,
} from './editor-dom.js';
```

`showCreationMode()` 끝에 추가:

```javascript
  // Disable nav buttons irrelevant in creation mode
  if (btnPrev) btnPrev.disabled = true;
  if (btnNext) btnNext.disabled = true;
  if (btnReviewOutline) btnReviewOutline.disabled = true;
  if (btnExportToggle) btnExportToggle.disabled = true;
```

`hideCreationMode()` 끝에 추가:

```javascript
  // Re-enable nav buttons (Prev/Next state will be corrected by goToSlide)
  if (btnPrev) btnPrev.disabled = false;
  if (btnNext) btnNext.disabled = false;
  if (btnReviewOutline) btnReviewOutline.disabled = false;
  if (btnExportToggle) btnExportToggle.disabled = false;
```

- [ ] **Step 4: Commit**

```bash
git add src/editor/js/editor-dom.js src/editor/js/editor-create.js src/editor/js/editor-outline.js
git commit -m "fix(editor): disable Outline/Export/Prev/Next buttons in creation mode"
```

---

### Task 4: Frontend — conditionally enable Outline button based on outline existence

슬라이드가 있는 기존 덱에서도, 아웃라인이 없으면 Outline 버튼을 비활성화한다.

**Files:**
- Modify: `src/editor/js/editor-init.js:460+` (edit mode 진입 시 outline 존재 확인)

- [ ] **Step 1: 에디트 모드 초기화 시 outline 존재 확인**

`editor-init.js`에서 creation mode가 아닌 일반 edit mode 진입 시 (line 460 이후):

```javascript
    // Check if outline exists and enable/disable button accordingly
    const btnOutline = document.getElementById('btn-review-outline');
    if (btnOutline) {
      try {
        const outlineCheck = await fetch('/api/outline', { method: 'HEAD' });
        btnOutline.disabled = !outlineCheck.ok;
      } catch {
        btnOutline.disabled = true;
      }
    }
```

주의: 서버에 HEAD 메서드가 지원되는지 확인 필요. 안 되면 GET으로 대체하되 body는 무시.

- [ ] **Step 2: 슬라이드 생성 완료 후에도 outline 버튼 상태 갱신**

`editor-create.js`의 `refreshSlideList()` (line 286) 에서 `hideCreationMode()` 직후:

```javascript
    if (state.slides.length > 0) {
      hideCreationMode();
      // Check outline existence to enable/disable Outline button
      try {
        const outlineCheck = await fetch('/api/outline');
        if (btnReviewOutline) btnReviewOutline.disabled = !outlineCheck.ok;
      } catch { /* leave disabled */ }
      // ... rest of existing code
    }
```

- [ ] **Step 3: Commit**

```bash
git add src/editor/js/editor-init.js src/editor/js/editor-create.js
git commit -m "fix(editor): disable Outline button when no outline exists for deck"
```

---

### Task 5: Visual polish — disabled button styling

disabled 상태의 nav-bar 버튼에 시각적 피드백을 추가한다.

**Files:**
- Modify: `src/editor/editor.html` (CSS section, around line 50-80 where `.nav-bar-btn` styles are)

- [ ] **Step 1: disabled 스타일 추가**

기존 `.nav-bar-btn` 스타일 블록 근처에:

```css
.nav-bar-btn:disabled,
.nav-bar-btn.ghost:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}
```

`pointer-events: none`은 disabled button에 hover 효과가 적용되지 않도록 한다. HTML `disabled` 속성이 있으므로 클릭은 이미 차단됨.

- [ ] **Step 2: Prev/Next 버튼 disabled 스타일 확인**

기존에 `.nav-controls button:disabled` 스타일이 있는지 확인. 있으면 일관성 유지, 없으면 위 스타일에 포함되도록 한다.

- [ ] **Step 3: Commit**

```bash
git add src/editor/editor.html
git commit -m "style(editor): add disabled state styling for nav bar buttons"
```

---

## Verification

모든 Task 완료 후 아래 시나리오를 수동 테스트:

1. **Deck Browser → New Deck 클릭**
   - Nav bar에 이전 deck name이 보이지 않아야 함
   - Outline, Export 버튼이 disabled 상태여야 함
   - Prev/Next 버튼이 disabled 상태여야 함
   - slide counter = "0 / 0"

2. **New Presentation에서 생성 완료 후**
   - Outline 버튼이 enabled (아웃라인이 있으므로)
   - Export 버튼이 enabled
   - Prev/Next가 정상 동작
   - Nav bar에 새 deck name 표시

3. **기존 Deck 열기 (아웃라인 있는 경우)**
   - Outline 버튼 enabled

4. **기존 Deck 열기 (아웃라인 없는 경우)**
   - Outline 버튼 disabled
