# Dark Forest Design Spec

## Identity

**Mood**: Mysterious, atmospheric, primal, eco-premium
**Best For**: Environmental brands, adventure/outdoor companies, sustainable luxury, nature documentaries

A nocturnal forest scene with layered silhouettes, a glowing moon, and subtle mist. The background radiates from a dim forest-center to near-black edges, creating a vignette that draws the eye inward. Typography is exclusively italic serif — elegant, organic, and slightly wild. Every slide feels like standing at the edge of an ancient wood at midnight.

---

## Signature Elements

- **Layered tree silhouettes at 3+ depths**: Dark tree shapes at different opacities and sizes, creating parallax-like depth
- **Glowing moon**: A soft radial gradient circle in the upper-right, casting a warm sage-white light
- **Fog/mist gradient**: A horizontal band of very low-opacity (#B4FFC8 @ 4%) mist drifting across the lower third
- **Italic serif typography**: All titles in Playfair Display Italic — the defining typographic choice
- **Star particles**: Tiny dots (#D4F0B0) scattered in the upper portion for atmosphere

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'EB Garamond', 'Georgia', serif;
  background: radial-gradient(ellipse at 50% 60%, #0D2B14 0%, #060E08 100%);
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Tree Silhouette Layer

```css
.tree-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 0;
}
.tree-layer.back {
  height: 240pt;
  background: linear-gradient(to top, #0A3D1A 0%, transparent 80%);
  opacity: 0.4;
}
.tree-layer.mid {
  height: 180pt;
  background: linear-gradient(to top, #0D4D20 0%, transparent 70%);
  opacity: 0.6;
}
.tree-layer.front {
  height: 120pt;
  background: linear-gradient(to top, #060E08 0%, transparent 60%);
  opacity: 0.85;
}
```

### Glowing Moon

```css
.moon {
  position: absolute;
  top: 36pt;
  right: 80pt;
  width: 64pt;
  height: 64pt;
  border-radius: 50%;
  background: radial-gradient(circle, #E8F4D0 0%, #B8CC80 50%, transparent 100%);
  box-shadow: 0 0 40pt rgba(232, 244, 208, 0.3);
  z-index: 0;
  pointer-events: none;
}
```

### Star Particles

```css
.star {
  position: absolute;
  width: 2pt;
  height: 2pt;
  border-radius: 50%;
  background: #D4F0B0;
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
}
```

### Mist Band

```css
.mist {
  position: absolute;
  bottom: 60pt;
  left: 0;
  right: 0;
  height: 80pt;
  background: linear-gradient(
    to top,
    rgba(180, 255, 200, 0.04) 0%,
    rgba(180, 255, 200, 0.02) 50%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
}
```

### Hero Title (Italic Serif)

```css
h1 {
  font-family: 'Playfair Display', 'DM Serif Display', 'Georgia', serif;
  font-style: italic;
  font-size: 26pt;
  font-weight: 700;
  color: rgba(200, 255, 180, 0.85);
  line-height: 1.3;
  letter-spacing: 0.02em;
  text-shadow: 0 0 20pt rgba(180, 255, 200, 0.15);
  position: relative;
  z-index: 2;
  margin: 0;
}
```

### Body Text

```css
.body-text {
  font-family: 'EB Garamond', 'Georgia', serif;
  font-size: 14pt;
  font-weight: 400;
  color: rgba(200, 255, 180, 0.65);
  line-height: 1.65;
  position: relative;
  z-index: 2;
}
```

### Caption

```css
.caption {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  color: rgba(200, 255, 180, 0.4);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
}
```

---

## Font Pairing

- **Title**: Playfair Display Italic / DM Serif Display Italic, 20-28pt, weight 700, letter-spacing 0.02em
- **Body**: EB Garamond, 13-15pt, weight 400, line-height 1.65
- **Caption**: Space Mono, 9pt, weight 400, uppercase, wide letter-spacing
- **KPI Numbers**: Playfair Display Italic, 36-48pt, weight 700, sage-white

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#060E08` | Near-black forest edge |
| `--bg-secondary` | `#0D2B14` | Dark forest center |
| `--bg-elevated` | `#0A3D1A` | Tree silhouette, elevated panels |
| `--text-primary` | `rgba(200,255,180,0.85)` | Sage-white titles |
| `--text-secondary` | `rgba(200,255,180,0.65)` | Body text |
| `--accent` | `#E8F4D0` | Moon glow, star highlights |
| `--border` | `rgba(180,255,200,0.12)` | Subtle foliage-tinted borders |

---

## Layout Principles

- **Layered depth**: Always include tree silhouettes at 3+ depth layers and the moon element
- **Content in upper half**: Text lives in the upper 60% of the slide, above the tree line
- **Padding**: 48pt 56pt standard
- **Atmospheric space**: At least 30% of the slide should be dedicated to the forest/moon atmosphere
- **Warm-cool balance**: Text is warm sage-green; background is cold dark green — the contrast creates depth
- **Subtle glow**: Titles have a faint text-shadow glow matching the forest palette

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

---

## Avoid

- **No bright greens** — all greens are dark, muted, or sage-tinted
- **No hard edges on trees** — silhouettes are gradient-based, soft transitions
- **No sans-serif fonts** — only italic serif for display, regular serif for body, monospace for captions
- **No bold bright colors** — the palette is nocturnal and muted
- **No daytime feel** — lighting is always moonlit/twilight
- **No dense text** — atmospheric slides need breathing room
- **No fully opaque white** — text is always tinted sage/green and slightly transparent
