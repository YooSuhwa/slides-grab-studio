import { readFile, writeFile, rename, unlink, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

import { listSlideFiles, normalizeSlideFilename, normalizeSlideHtml } from '../helpers.js';

/**
 * Derive the notes filename from a slide filename.
 * slide-01.html -> slide-01.notes.md
 */
function notesFilenameFor(slideFile) {
  return slideFile.replace(/\.html$/i, '.notes.md');
}

/**
 * Slide file API routes.
 * Routes: GET /api/slides, POST /api/slides/:file/save,
 *         POST /api/slides/:file/duplicate, DELETE /api/slides/:file,
 *         GET /api/slides/:file/notes, POST /api/slides/:file/notes
 */
export function createSlidesRouter(ctx) {
  const { express } = ctx;
  const router = express.Router();

  router.get('/api/slides', async (_req, res) => {
    try {
      const slidesDirectory = ctx.getSlidesDir();
      if (!slidesDirectory) {
        return res.json([]);
      }
      const files = await listSlideFiles(slidesDirectory);
      res.json(files);
    } catch (err) {
      res.status(500).json({ error: err.message });
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
    const filePath = join(slidesDirectory, file);
    try {
      await readFile(filePath, 'utf-8');
    } catch {
      return res.status(404).json({ error: `Slide not found: ${file}` });
    }

    try {
      await writeFile(filePath, html, 'utf8');
      return res.json({
        success: true,
        slide: file,
        bytes: Buffer.byteLength(html, 'utf8'),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Failed to save ${file}: ${error.message}`,
      });
    }
  });

  // ── Duplicate slide ───────────────────────────────────────────────
  router.post('/api/slides/:file/duplicate', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) {
      return res.status(400).json({ error: 'No slides directory set.' });
    }

    const filePath = join(slidesDirectory, file);
    let content;
    try {
      content = await readFile(filePath, 'utf-8');
    } catch {
      return res.status(404).json({ error: `Slide not found: ${file}` });
    }

    try {
      const files = await listSlideFiles(slidesDirectory);
      const sourceIndex = files.indexOf(file);
      if (sourceIndex === -1) {
        return res.status(404).json({ error: `Slide not in list: ${file}` });
      }

      // Insert duplicate right after the source slide
      const insertIndex = sourceIndex + 1;
      const ordered = [...files];
      ordered.splice(insertIndex, 0, null); // placeholder for the copy

      // Renumber via temp directory to avoid naming conflicts
      const tmpDir = join(slidesDirectory, `.tmp-renumber-${Date.now()}`);
      await mkdir(tmpDir, { recursive: true });

      try {
        for (const f of files) {
          await rename(join(slidesDirectory, f), join(tmpDir, f));
        }

        const newFiles = [];
        for (let i = 0; i < ordered.length; i++) {
          const newName = `slide-${String(i + 1).padStart(2, '0')}.html`;
          if (ordered[i] === null) {
            await writeFile(join(slidesDirectory, newName), content, 'utf8');
          } else {
            await rename(join(tmpDir, ordered[i]), join(slidesDirectory, newName));
          }
          newFiles.push(newName);
        }

        await rm(tmpDir, { recursive: true, force: true });

        const result = await listSlideFiles(slidesDirectory);
        return res.json({
          success: true,
          slides: result,
          duplicatedAs: newFiles[insertIndex],
          insertIndex,
        });
      } catch (innerErr) {
        try {
          for (const f of files) {
            const tmpPath = join(tmpDir, f);
            if (existsSync(tmpPath)) {
              await rename(tmpPath, join(slidesDirectory, f));
            }
          }
          await rm(tmpDir, { recursive: true, force: true });
        } catch { /* best-effort recovery */ }
        throw innerErr;
      }
    } catch (error) {
      return res.status(500).json({ error: `Duplicate failed: ${error.message}` });
    }
  });

  // ── Delete slide ─────────────────────────────────────────────────
  router.delete('/api/slides/:file', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) {
      return res.status(400).json({ error: 'No slides directory set.' });
    }

    const filePath = join(slidesDirectory, file);
    try {
      await readFile(filePath, 'utf-8');
    } catch {
      return res.status(404).json({ error: `Slide not found: ${file}` });
    }

    try {
      const files = await listSlideFiles(slidesDirectory);
      if (files.length <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last remaining slide.' });
      }

      const deleteIndex = files.indexOf(file);
      if (deleteIndex === -1) {
        return res.status(404).json({ error: `Slide not in list: ${file}` });
      }

      await unlink(filePath);

      const remaining = files.filter((f) => f !== file);
      const tmpDir = join(slidesDirectory, `.tmp-renumber-${Date.now()}`);
      await mkdir(tmpDir, { recursive: true });

      try {
        for (const f of remaining) {
          await rename(join(slidesDirectory, f), join(tmpDir, f));
        }

        for (let i = 0; i < remaining.length; i++) {
          const newName = `slide-${String(i + 1).padStart(2, '0')}.html`;
          await rename(join(tmpDir, remaining[i]), join(slidesDirectory, newName));
        }

        await rm(tmpDir, { recursive: true, force: true });
      } catch (innerErr) {
        try {
          for (const f of remaining) {
            const tmpPath = join(tmpDir, f);
            if (existsSync(tmpPath)) {
              await rename(tmpPath, join(slidesDirectory, f));
            }
          }
          await rm(tmpDir, { recursive: true, force: true });
        } catch { /* best-effort recovery */ }
        throw innerErr;
      }

      const result = await listSlideFiles(slidesDirectory);
      return res.json({
        success: true,
        slides: result,
        deleted: file,
      });
    } catch (error) {
      return res.status(500).json({ error: `Delete failed: ${error.message}` });
    }
  });

  // ── Get presenter notes ──────────────────────────────────────────
  router.get('/api/slides/:file/notes', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) {
      return res.json({ notes: '' });
    }

    const notesPath = join(slidesDirectory, notesFilenameFor(file));
    try {
      const notes = await readFile(notesPath, 'utf-8');
      return res.json({ notes });
    } catch {
      return res.json({ notes: '' });
    }
  });

  // ── Save presenter notes ──────────────────────────────────────────
  router.post('/api/slides/:file/notes', async (req, res) => {
    let file;
    try {
      file = normalizeSlideFilename(req.params.file, '`slide`');
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const slidesDirectory = ctx.getSlidesDir();
    if (!slidesDirectory) {
      return res.status(400).json({ error: 'No slides directory set.' });
    }

    // Verify the slide file exists
    const slidePath = join(slidesDirectory, file);
    try {
      await readFile(slidePath, 'utf-8');
    } catch {
      return res.status(404).json({ error: `Slide not found: ${file}` });
    }

    const notes = typeof req.body?.notes === 'string' ? req.body.notes : '';
    const notesPath = join(slidesDirectory, notesFilenameFor(file));

    try {
      if (notes.trim() === '') {
        try { await unlink(notesPath); } catch { /* file may not exist */ }
      } else {
        await writeFile(notesPath, notes, 'utf8');
      }
      return res.json({ success: true, slide: file });
    } catch (error) {
      return res.status(500).json({
        error: `Failed to save notes for ${file}: ${error.message}`,
      });
    }
  });

  return router;
}
