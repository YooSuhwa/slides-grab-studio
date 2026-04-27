// editor-restore.js — backup restore modal (previous deck versions)

import { setStatus } from './editor-utils.js';

const modal = () => document.getElementById('restore-version-modal');
const selectEl = () => document.getElementById('restore-version-select');
const cancelBtn = () => document.getElementById('restore-version-cancel');
const confirmBtn = () => document.getElementById('restore-version-confirm');

let _wired = false;

function wire() {
  if (_wired) return;
  _wired = true;
  const m = modal();
  if (!m) return;
  cancelBtn()?.addEventListener('click', () => { m.hidden = true; });
  m.addEventListener('click', (e) => { if (e.target === m) m.hidden = true; });
  confirmBtn()?.addEventListener('click', handleRestore);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !m.hidden) m.hidden = true;
  });
}

async function handleRestore() {
  const timestamp = selectEl()?.value;
  if (!timestamp) return;
  const cfgRes = await fetch('/api/editor-config').catch(() => null);
  const deckName = cfgRes?.ok ? (await cfgRes.json()).deckName : '';
  if (!deckName) { setStatus('덱 이름을 확인할 수 없습니다.'); return; }
  modal().hidden = true;
  setStatus(`복원 중: ${timestamp}...`);
  try {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckName, timestamp }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setStatus(`복원 실패: ${err.error}`);
      return;
    }
    const data = await res.json();
    setStatus(`복원 완료: ${data.restored}개 슬라이드 (${timestamp})`);
    window.location.reload();
  } catch (err) {
    setStatus(`복원 실패: ${err.message}`);
  }
}

export async function openRestoreVersionModal() {
  wire();
  const m = modal();
  if (!m) return;
  const res = await fetch('/api/backups').catch(() => null);
  const backups = res?.ok ? await res.json() : [];
  if (!backups.length) {
    setStatus('이전 버전이 없습니다.');
    return;
  }
  selectEl().innerHTML = backups
    .map((b) => `<option value="${b.timestamp}">${b.label} (${b.slideCount} slides)</option>`)
    .join('');
  m.hidden = false;
}
