import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  generateNanoBananaImage,
  saveNanoBananaImage,
  resolveNanoBananaApiKey,
  sanitizeAssetName,
  getExtensionFromMimeType,
  DEFAULT_NANO_BANANA_MODEL,
  DEFAULT_NANO_BANANA_ASPECT_RATIO,
  DEFAULT_NANO_BANANA_IMAGE_SIZE,
} from '../../../src/nano-banana.js';

function extensionFromContentType(contentType) {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg';
  if (ct.includes('svg')) return '.svg';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('webp')) return '.webp';
  return '.png';
}

function timestampSuffix() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Image operations API.
 * Routes:
 *   POST /api/image-ops/upload   — raw image body, saves to assets/
 *   POST /api/image-ops/generate — { prompt, aspectRatio? }, calls nano-banana
 */
export function createImageOpsRouter(ctx) {
  const { express } = ctx;
  const router = express.Router();

  router.post('/api/image-ops/upload',
    express.raw({ type: 'image/*', limit: '10mb' }),
    async (req, res) => {
      const slidesDir = ctx.getSlidesDir();
      if (!slidesDir) return res.status(400).json({ error: 'No slides directory set.' });
      if (!req.body || req.body.length === 0) {
        return res.status(400).json({ error: 'No image data received.' });
      }

      const contentType = req.headers['content-type'] || 'image/png';
      const ext = extensionFromContentType(contentType);
      const rawName = String(req.headers['x-filename'] || 'uploaded-image');
      const baseName = sanitizeAssetName(rawName.replace(/\.[^.]+$/, '')) || 'uploaded-image';
      const filename = `${baseName}-${timestampSuffix()}${ext}`;

      const assetsDir = join(slidesDir, 'assets');
      if (!existsSync(assetsDir)) await mkdir(assetsDir, { recursive: true });
      const filePath = join(assetsDir, filename);
      try {
        await writeFile(filePath, req.body);
      } catch (err) {
        return res.status(500).json({ error: `Failed to save image: ${err.message}` });
      }
      return res.json({ success: true, path: `./assets/${filename}` });
    },
  );

  router.post('/api/image-ops/generate', express.json({ limit: '1mb' }), async (req, res) => {
    const slidesDir = ctx.getSlidesDir();
    if (!slidesDir) return res.status(400).json({ error: 'No slides directory set.' });

    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) return res.status(400).json({ error: '`prompt` must be a non-empty string.' });

    const aspectRatio = typeof req.body?.aspectRatio === 'string' && req.body.aspectRatio.trim()
      ? req.body.aspectRatio.trim()
      : DEFAULT_NANO_BANANA_ASPECT_RATIO;
    const imageSize = typeof req.body?.imageSize === 'string' && req.body.imageSize.trim()
      ? req.body.imageSize.trim().toUpperCase()
      : DEFAULT_NANO_BANANA_IMAGE_SIZE;
    const model = typeof req.body?.model === 'string' && req.body.model.trim()
      ? req.body.model.trim()
      : DEFAULT_NANO_BANANA_MODEL;
    const explicitName = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    const { apiKey, provider } = resolveNanoBananaApiKey(process.env);
    if (!apiKey) {
      return res.status(400).json({
        error: 'Image generation requires GOOGLE_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY.',
      });
    }

    try {
      const generated = await generateNanoBananaImage({
        prompt,
        apiKey,
        provider,
        model,
        aspectRatio,
        imageSize,
      });

      const name = explicitName
        ? explicitName
        : `${sanitizeAssetName(prompt).slice(0, 60)}-${timestampSuffix()}`;

      const saved = await saveNanoBananaImage({
        prompt,
        slidesDir,
        name,
        mimeType: generated.mimeType,
        bytes: generated.bytes,
      });

      return res.json({
        success: true,
        path: saved.relativeRef,
        extension: getExtensionFromMimeType(generated.mimeType),
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
}
