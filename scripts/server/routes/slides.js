import { readFile, writeFile, rename, unlink, mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { listSlideFiles, normalizeSlideFilename, normalizeSlideHtml } from '../helpers.js';
import {
  ensureNotesDir,
  ensureNotesFolderLayout,
  notesPathFor,
} from '../../../src/notes-paths.js';

/**
 * Renumber slide files to sequential order via a temp directory.
 * @param {string} slidesDirectory
 * @param {string[]} originalFiles - files currently on disk to move to temp
 * @param {Array<string|null>} orderedSlots - desired order; null = write newContent at that position
 * @param {string} [newContent] - HTML to write at null slots
 * @returns {Promise<string[]>} new filenames in order
 */
async function renumberSlides(slidesDirectory, originalFiles, orderedSlots, newContent) {
  const tmpDir = join(slidesDirectory, `.tmp-renumber-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  try {
    await Promise.all(originalFiles.map(f =>
      rename(join(slidesDirectory, f), join(tmpDir, f))
    ));

    const newFiles = [];
    for (let i = 0; i < orderedSlots.length; i++) {
      const newName = `slide-${String(i + 1).padStart(2, '0')}.html`;
      if (orderedSlots[i] === null) {
        await writeFile(join(slidesDirectory, newName), newContent, 'utf8');
      } else {
        await rename(join(tmpDir, orderedSlots[i]), join(slidesDirectory, newName));
      }
      newFiles.push(newName);
    }

    await rm(tmpDir, { recursive: true, force: true });
    return newFiles;
  } catch (err) {
    // Best-effort recovery: move files back from temp
    try {
      const { readdir } = await import('node:fs/promises');
      const remaining = await readdir(tmpDir);
      await Promise.all(remaining.map(async (f) => {
        try { await rename(join(tmpDir, f), join(slidesDirectory, f)); } catch { /* already moved */ }
      }));
      await rm(tmpDir, { recursive: true, force: true });
    } catch (recoveryErr) {
      console.error('[slides] Renumber recovery failed. Files may be in:', tmpDir, recoveryErr);
    }
    throw err;
  }
}

async function assertSlideExists(slidesDirectory, file) {
  try {
    await stat(join(slidesDirectory, file));
  } catch {
    const err = new Error(`Slide not found: ${file}`);
    err.status = 404;
    throw err;
  }
}

/**
 * Slide file API routes.
 */
export function createSlidesRouter(ctx) {
  const { express } = ctx;
  const router = express.Router();

  router.get('/api/slides', async (_req, res) => {
    try {
      const slidesDirectory = ctx.getSlidesDir();
      if (!slidesDirectory) return res.json([]);
      const files = await listSlideFiles(slidesDirectory);
      res.json(files);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/api/slides/reorder', async (req, res) => {
    const order = req.body?.order;
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: '`order` must be a non-empty array of slide filenames.' });
    }

    const normalized = [];
    for (const entry of order) {
      try {
        normalized.push(normalizeSlideFilename(entry, '`order` entry'));
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) return res.status(400).json({ error: 'No slides directory set.' });

    try {
      const files = await listSlideFiles(slidesDirectory);
      const sortedExisting = [...files].sort();
      const sortedOrder = [...normalized].sort();
      if (
        sortedExisting.length !== sortedOrder.length ||
        sortedExisting.some((f, idx) => f !== sortedOrder[idx])
      ) {
        return res.status(400).json({ error: 'The provided order does not match the existing slide files.' });
      }

      await renumberSlides(slidesDirectory, files, normalized);
      const result = await listSlideFiles(slidesDirectory);
      return res.json({ success: true, slides: result });
    } catch (error) {
      return res.status(500).json({ error: `Reorder failed: ${error.message}` });
    }
  });

  router.post('/api/slides/:file/save', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const bodySlide = req.body?.slide;
    if (bodySlide !== undefined) {
      let normalizedBodySlide;
      try {
        normalizedBodySlide = normalizeSlideFilename(bodySlide, '`slide`');
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
      if (normalizedBodySlide !== file) {
        return res.status(400).json({ error: '`slide` does not match the requested file.' });
      }
    }

    let html;
    try {
      html = normalizeSlideHtml(req.body?.html);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    try {
      await assertSlideExists(slidesDirectory, file);
    } catch (err) {
      return res.status(err.status || 404).json({ error: err.message });
    }

    try {
      await writeFile(join(slidesDirectory, file), html, 'utf8');
      return res.json({ success: true, slide: file, bytes: Buffer.byteLength(html, 'utf8') });
    } catch (error) {
      return res.status(500).json({ success: false, error: `Failed to save ${file}: ${error.message}` });
    }
  });

  router.post('/api/slides/:file/duplicate', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) return res.status(400).json({ error: 'No slides directory set.' });

    let content;
    try {
      content = await readFile(join(slidesDirectory, file), 'utf-8');
    } catch {
      return res.status(404).json({ error: `Slide not found: ${file}` });
    }

    try {
      const files = await listSlideFiles(slidesDirectory);
      const sourceIndex = files.indexOf(file);
      if (sourceIndex === -1) return res.status(404).json({ error: `Slide not in list: ${file}` });

      const insertIndex = sourceIndex + 1;
      const ordered = [...files];
      ordered.splice(insertIndex, 0, null);

      const newFiles = await renumberSlides(slidesDirectory, files, ordered, content);
      const result = await listSlideFiles(slidesDirectory);
      return res.json({ success: true, slides: result, duplicatedAs: newFiles[insertIndex], insertIndex });
    } catch (error) {
      return res.status(500).json({ error: `Duplicate failed: ${error.message}` });
    }
  });

  router.delete('/api/slides/:file', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) return res.status(400).json({ error: 'No slides directory set.' });

    try {
      await assertSlideExists(slidesDirectory, file);
    } catch (err) {
      return res.status(err.status || 404).json({ error: err.message });
    }

    try {
      const files = await listSlideFiles(slidesDirectory);
      if (files.length <= 1) return res.status(400).json({ error: 'Cannot delete the last remaining slide.' });

      await unlink(join(slidesDirectory, file));
      const remaining = files.filter((f) => f !== file);
      await renumberSlides(slidesDirectory, remaining, remaining);

      const result = await listSlideFiles(slidesDirectory);
      return res.json({ success: true, slides: result, deleted: file });
    } catch (error) {
      return res.status(500).json({ error: `Delete failed: ${error.message}` });
    }
  });

  router.get('/api/slides/:file/notes', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) return res.json({ notes: '' });

    await ensureNotesFolderLayout(slidesDirectory);

    try {
      const notes = await readFile(notesPathFor(slidesDirectory, file), 'utf-8');
      return res.json({ notes });
    } catch {
      return res.json({ notes: '' });
    }
  });

  router.post('/api/slides/:file/notes', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) return res.status(400).json({ error: 'No slides directory set.' });

    try {
      await assertSlideExists(slidesDirectory, file);
    } catch (err) {
      return res.status(err.status || 404).json({ error: err.message });
    }

    await ensureNotesFolderLayout(slidesDirectory);

    const notes = typeof req.body?.notes === 'string' ? req.body.notes : '';
    const notesPath = notesPathFor(slidesDirectory, file);

    try {
      if (notes.trim() === '') {
        try { await unlink(notesPath); } catch { /* file may not exist */ }
      } else {
        await ensureNotesDir(slidesDirectory);
        await writeFile(notesPath, notes, 'utf8');
      }
      return res.json({ success: true, slide: file });
    } catch (error) {
      return res.status(500).json({ error: `Failed to save notes for ${file}: ${error.message}` });
    }
  });

  return router;
}
