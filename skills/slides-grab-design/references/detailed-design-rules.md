## Base Settings

### Slide Size (16:9 default)
- Keep slide body at 720pt x 405pt.
- Use Pretendard as the default font stack; if the pack's theme.css specifies a different font, follow the pack.
- Include the Pretendard webfont CDN link when needed.

### Image Usage Rules (Local Asset / Data URL / Placeholder)
- Always include alt on img tags.
- Use `./assets/<file>` as the default image contract for slide HTML.
- Keep slide assets in `<slides-dir>/assets/`.
- Use `slides-grab image --prompt "<prompt>" --slides-dir <path>` with Nano Banana Pro when a slide needs bespoke generated imagery.
- Use `tldraw`-generated assets for complex diagrams whenever possible.
- `data:` URLs are allowed for fully self-contained slides.
- Do not leave remote `http(s)://` image URLs in saved slide HTML; download source images into `<slides-dir>/assets/` and reference them as `./assets/<file>`.
- If `GOOGLE_API_KEY` or `GEMINI_API_KEY` is unavailable, or the Nano Banana API fails, ask the user for a Google API key or fall back to web search + download into `<slides-dir>/assets/`.
- Do not use absolute filesystem paths in slide HTML.
- Do not use non-body `background-image` for content imagery; use `<img>` instead.
- Use `data-image-placeholder` to reserve space when no image is available yet.

## Text Usage Rules
- All text must be inside `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, or `<li>`.
- Never place text directly in `<div>` or `<span>`.

## Workflow (Stage 2: Design + Human Review)
- After slide generation or edits, run `slides-grab validate --slides-dir <path>`.
- Edit only the relevant HTML file during revision loops.
- Prefer `slides-grab tldraw` + local exported assets for complex diagrams.
- Never start PPTX conversion without explicit approval.
- Do not persist runtime-only editor/viewer injections in saved slide HTML.

## Important Notes
- CSS gradients are not supported in PowerPoint conversion; replace them with background images.
- Always include the Pretendard CDN link.
- Use `./assets/<file>` from each `slide-XX.html` and avoid absolute filesystem paths.
- Always include `#` prefix in CSS colors.
- Never place text directly in `div`/`span`.
