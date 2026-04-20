/**
 * Filesystem layout for presenter notes and the deck-spine cache.
 *
 * A deck directory looks like:
 *   decks/<name>/
 *     slide-NN.html
 *     slide-outline.md
 *     assets/
 *     slide_notes/
 *       deck-spine.json
 *       slide-NN.notes.md
 *       slide-NN.notes.md.bak   ← single rolling backup
 *
 * Legacy decks kept notes flat next to the HTML plus timestamped
 * `.bak-<ms>` files. `ensureNotesFolderLayout` migrates those in place.
 */

import { mkdir, readdir, rename, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';

export const NOTES_SUBDIR = 'slide_notes';
const SPINE_FILENAME = 'deck-spine.json';

export function notesDir(deckDir) {
  return join(deckDir, NOTES_SUBDIR);
}

export function notesFilenameFor(slideFile) {
  return slideFile.replace(/\.html$/i, '.notes.md');
}

export function notesPathFor(deckDir, slideFile) {
  return join(notesDir(deckDir), notesFilenameFor(slideFile));
}

export function notesBackupPathFor(deckDir, slideFile) {
  // `.notes.bak.md` — keeps `.md` as the final extension so editors still
  // treat it as Markdown (preview, syntax highlight).
  return notesPathFor(deckDir, slideFile).replace(/\.md$/, '.bak.md');
}

export function spinePath(deckDir) {
  return join(notesDir(deckDir), SPINE_FILENAME);
}

export async function ensureNotesDir(deckDir) {
  await mkdir(notesDir(deckDir), { recursive: true });
}

async function pathExists(path) {
  try { await stat(path); return true; } catch { return false; }
}

async function mtimeOf(path) {
  try { return (await stat(path)).mtime.getTime(); } catch { return -1; }
}

const NOTES_FILE_RE = /^slide-\d+\.notes\.md$/;
const LEGACY_BAK_RE = /^(slide-\d+)\.notes\.md\.bak-(\d+)$/;
const OLD_SUFFIX_BAK_RE = /^(slide-\d+)\.notes\.md\.bak$/;

function bakNameFor(slideBase) {
  // slideBase = 'slide-NN' → 'slide-NN.notes.bak.md'
  return `${slideBase}.notes.bak.md`;
}

/**
 * Reconcile the deck's notes layout so everything lives under `slide_notes/`.
 *
 * Handles three states:
 *   1. Never migrated          → move flat files into slide_notes/.
 *   2. Already migrated        → no-op.
 *   3. Partial / split state   → flat file coexists with slide_notes/ copy
 *                                (e.g. an old server wrote back after migration).
 *                                Keeps the newer version by mtime; demotes the
 *                                loser to `.bak` (only if it has different content
 *                                and newer than any existing `.bak`).
 *
 * Safe to call on every deck access. Never deletes user note content.
 */
export async function ensureNotesFolderLayout(deckDir) {
  const dir = notesDir(deckDir);

  let entries;
  try {
    entries = await readdir(deckDir);
  } catch {
    return;
  }

  const flatNotes = entries.filter((f) => NOTES_FILE_RE.test(f));
  const legacyBaks = entries.filter((f) => LEGACY_BAK_RE.test(f));
  const hasFlatSpine = entries.includes(SPINE_FILENAME);
  const hasRootWork = flatNotes.length > 0 || legacyBaks.length > 0 || hasFlatSpine;

  // If nothing at root and slide_notes/ doesn't exist → nothing to do.
  // If slide_notes/ exists, we may still need to rename `.notes.md.bak` → `.notes.bak.md` inside it.
  const dirExists = await pathExists(dir);
  if (!hasRootWork && !dirExists) return;

  await mkdir(dir, { recursive: true });

  // 0. Rename any older `.notes.md.bak` (previous-gen backups) already inside
  //    slide_notes/ to the new `.notes.bak.md` shape.
  let dirEntries = [];
  try { dirEntries = await readdir(dir); } catch { /* best-effort */ }
  for (const f of dirEntries) {
    const m = f.match(OLD_SUFFIX_BAK_RE);
    if (!m) continue;
    const newName = bakNameFor(m[1]);
    const src = join(dir, f);
    const dst = join(dir, newName);
    if (await pathExists(dst)) {
      // Keep whichever is newer (should be rare).
      const a = await mtimeOf(src);
      const b = await mtimeOf(dst);
      if (a > b) {
        try { await unlink(dst); } catch { /* best-effort */ }
        try { await rename(src, dst); } catch { /* best-effort */ }
      } else {
        try { await unlink(src); } catch { /* best-effort */ }
      }
    } else {
      try { await rename(src, dst); } catch { /* best-effort */ }
    }
  }

  // 1. Reconcile per-slide notes (root vs slide_notes/)
  for (const name of flatNotes) {
    const slideBase = name.replace(/\.notes\.md$/, '');
    const rootPath = join(deckDir, name);
    const targetPath = join(dir, name);
    const bakPath = join(dir, bakNameFor(slideBase));

    if (!(await pathExists(targetPath))) {
      try { await rename(rootPath, targetPath); } catch { /* best-effort */ }
      continue;
    }

    const rootMtime = await mtimeOf(rootPath);
    const targetMtime = await mtimeOf(targetPath);

    if (rootMtime > targetMtime) {
      // Root is newer → promote root, demote current slide_notes copy to backup.
      try { await unlink(bakPath); } catch { /* none to replace */ }
      try { await rename(targetPath, bakPath); } catch { /* best-effort */ }
      try { await rename(rootPath, targetPath); } catch { /* best-effort */ }
    } else {
      // slide_notes/ is newer or equal → root is stale, drop it.
      try { await unlink(rootPath); } catch { /* best-effort */ }
    }
  }

  // 2. Collapse legacy root `.notes.md.bak-<timestamp>` → single `.notes.bak.md`
  const latestBySlide = new Map();
  for (const f of legacyBaks) {
    const [, slideBase, tsStr] = f.match(LEGACY_BAK_RE);
    const ts = Number(tsStr);
    const prev = latestBySlide.get(slideBase);
    if (!prev || prev.ts < ts) latestBySlide.set(slideBase, { file: f, ts });
  }
  const kept = new Set([...latestBySlide.values()].map((v) => v.file));
  for (const [slideBase, { file }] of latestBySlide) {
    const target = join(dir, bakNameFor(slideBase));
    if (await pathExists(target)) {
      const legacyMtime = await mtimeOf(join(deckDir, file));
      const existingMtime = await mtimeOf(target);
      if (legacyMtime > existingMtime) {
        try { await unlink(target); } catch { /* best-effort */ }
        try { await rename(join(deckDir, file), target); } catch { /* best-effort */ }
      } else {
        try { await unlink(join(deckDir, file)); } catch { /* best-effort */ }
      }
    } else {
      try { await rename(join(deckDir, file), target); } catch { /* best-effort */ }
    }
  }
  for (const f of legacyBaks) {
    if (kept.has(f)) continue;
    try { await unlink(join(deckDir, f)); } catch { /* best-effort */ }
  }

  // 3. Reconcile spine cache (root vs slide_notes/)
  if (hasFlatSpine) {
    const rootSpine = join(deckDir, SPINE_FILENAME);
    const targetSpine = join(dir, SPINE_FILENAME);
    if (!(await pathExists(targetSpine))) {
      try { await rename(rootSpine, targetSpine); } catch { /* best-effort */ }
    } else {
      const rootMtime = await mtimeOf(rootSpine);
      const targetMtime = await mtimeOf(targetSpine);
      if (rootMtime > targetMtime) {
        try { await unlink(targetSpine); } catch { /* best-effort */ }
        try { await rename(rootSpine, targetSpine); } catch { /* best-effort */ }
      } else {
        try { await unlink(rootSpine); } catch { /* best-effort */ }
      }
    }
  }
}
