/**
 * Dev hot-reload watcher for editor source files (JS/CSS).
 *
 * Only active when the server runs from a local git checkout
 * (i.e. PACKAGE_ROOT contains a .git directory).
 */

import { existsSync } from 'node:fs';
import { watch as fsWatch } from 'node:fs';
import { join, relative } from 'node:path';
import { broadcastSSE } from './sse.js';

const WATCH_TARGETS = [
  { dir: 'src/editor/js', pattern: /\.js$/ },
  { dir: 'src/editor', pattern: /^(editor|browser)\.css$/ },
];

const DEBOUNCE_MS = 300;

/**
 * Returns true when PACKAGE_ROOT is a local git checkout (development mode).
 */
function isDevMode(packageRoot) {
  return existsSync(join(packageRoot, '.git'));
}

/**
 * Set up file watchers for editor JS/CSS source files.
 * Broadcasts a `devReload` SSE event on change so the browser reloads.
 *
 * @returns {{ close(): void } | null} — watcher handle, or null if not in dev mode.
 */
export function setupDevReloadWatcher(ctx) {
  const { PACKAGE_ROOT } = ctx;
  if (!isDevMode(PACKAGE_ROOT)) return null;

  let debounceTimer = null;
  const watchers = [];

  for (const { dir, pattern } of WATCH_TARGETS) {
    const absDir = join(PACKAGE_ROOT, dir);
    if (!existsSync(absDir)) continue;

    const watcher = fsWatch(absDir, { persistent: false }, (_eventType, filename) => {
      if (!filename || !pattern.test(filename)) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const relPath = relative(PACKAGE_ROOT, join(absDir, filename));
        broadcastSSE(ctx.sseClients, 'devReload', { file: relPath });
      }, DEBOUNCE_MS);
    });

    watchers.push(watcher);
  }

  if (watchers.length === 0) return null;

  return {
    close() {
      clearTimeout(debounceTimer);
      for (const w of watchers) {
        try { w.close(); } catch { /* ignore */ }
      }
    },
  };
}
