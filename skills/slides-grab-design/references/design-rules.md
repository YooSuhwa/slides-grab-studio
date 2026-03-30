# slides-grab Design Reference

These are the packaged design rules for `slides-grab` skills.

## CLI commands
- Validate slides: `slides-grab validate --slides-dir <path>`
- Launch editor: `slides-grab edit --slides-dir <path>`

## Slide spec
- Slide size: `720pt x 405pt` (16:9, fixed)
- Font: Pretendard by default; if the pack's theme.css specifies a different font, follow the pack
- Semantic text tags only: `p`, `h1-h6`, `ul`, `ol`, `li`
- CSS colors must include `#`
- Avoid CSS gradients for PPTX-targeted decks

## Asset rules
- Store deck-local assets in `<slides-dir>/assets/`
- Reference deck-local assets as `./assets/<file>`
- If an image comes from the web, download it into `<slides-dir>/assets/` before referencing it
- Do not leave remote `http(s)://` image URLs in saved slide HTML
- Allow `data:` URLs only when the slide must be fully self-contained
- Never use absolute filesystem paths

## Template Pack System

Templates are organized into **packs** in `packs/`. Each pack provides a different visual design.

### Discovering packs

Run `slides-grab list-packs` to see all available packs with colors and template counts.
Default pack is `simple_light`.

### Pack CLI commands
```bash
slides-grab list-packs                              # List all packs
slides-grab show-pack <pack-id>                     # View pack details
slides-grab show-template <name> --pack <pack-id>   # View a template from a specific pack
slides-grab show-theme <pack-id>                    # View pack's theme.css
```

### Pack resolution (2-tier)
1. **Pack owns the template** → use it directly via `show-template`
2. **Pack doesn't own the template** → design from scratch using the pack's `theme.css` colors
   - Do NOT fall back to simple_light HTML structure
   - Use `slides-grab show-theme <pack-id>` to get CSS variables
   - Create a layout that fits the pack's visual language

### Theme CSS variables
Each pack has a `theme.css` defining `:root { --bg-primary, --text-primary, --accent, ... }`.
Templates use `var()` references. Copy the `:root` block when generating slides.

### Common template types
Defined in `packs/common-types.json`. Each pack implements a subset.
Check pack coverage: `slides-grab show-pack <pack-id>`

## Review loop
- Generate or edit only the needed slide files.
- Prefer `tldraw` for complex diagrams instead of hand-building dense diagram geometry in HTML/CSS.
- Re-run validation after every generation/edit pass.
- Do not move to export until the user approves the reviewed deck.
