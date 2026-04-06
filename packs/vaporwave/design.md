# Vaporwave Design Spec

## Identity

**Mood**: Dreamy, nostalgic internet, surreal
**Best For**: Creative agencies, music/art portfolios, experimental presentations

A fever dream of early internet aesthetics filtered through neon nostalgia.
A sliced sunset hangs over a perspective grid floor that stretches into infinity.
Ghost titles haunt the background at 8% opacity while gradient text floats in
the foreground. Reality is optional; vibes are mandatory.

---

## Signature Elements

- **Sliced sunset semicircle**: A half-circle with horizontal slice lines cutting through it, gradient from warm to cool
- **Perspective grid floor**: Converging grid lines on a ground plane, glowing pink/purple
- **Ghost watermark title**: Bebas Neue at 8% opacity (`#FFFFFF` @ 8%), 38-52pt with `letter-spacing: 6pt;`, near-invisible
- **Gradient display text**: Bebas Neue 24-34pt with warm-to-cool gradient (orange to pink to purple)
- **Dark purple gradient background**: Deep atmosphere from #1A0533 through #2D0057 to #570038
- **KPI/number sizes**: Bebas Neue 28-34pt gradient text for metrics

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Space Mono', monospace;
  background: linear-gradient(180deg, #1A0533 0%, #2D0057 50%, #570038 100%);
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Sliced Sunset Semicircle

```css
.sunset {
  position: absolute;
  bottom: 100pt;
  left: 50%;
  transform: translateX(-50%);
  width: 240pt;
  height: 120pt;
  border-radius: 120pt 120pt 0 0;
  background: linear-gradient(180deg, #FF9F43 0%, #FF6B9D 40%, #C44DFF 100%);
  z-index: 0;
  /* Horizontal slices via repeating gradient mask */
  -webkit-mask-image: repeating-linear-gradient(
    180deg,
    black 0px, black 14pt,
    transparent 14pt, transparent 18pt
  );
  mask-image: repeating-linear-gradient(
    180deg,
    black 0px, black 14pt,
    transparent 14pt, transparent 18pt
  );
}
```

### Perspective Grid Floor

```css
.grid-floor {
  position: absolute;
  bottom: 0;
  left: -20%;
  right: -20%;
  height: 160pt;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(255, 100, 200, 0.4) 0px,
      rgba(255, 100, 200, 0.4) 1px,
      transparent 1px,
      transparent 40pt
    ),
    repeating-linear-gradient(
      0deg,
      rgba(255, 100, 200, 0.2) 0px,
      rgba(255, 100, 200, 0.2) 1px,
      transparent 1px,
      transparent 24pt
    );
  transform: perspective(300pt) rotateX(65deg);
  transform-origin: bottom center;
  z-index: 0;
}
```

### Ghost Watermark Title

```css
.ghost-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 96pt; /* Original 120pt reduced ~20% for 720pt slide */
  font-weight: 400;
  letter-spacing: 6pt; /* Original: 6pt spacing */
  color: rgba(255, 255, 255, 0.08);
  text-transform: uppercase;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
  z-index: 0;
  pointer-events: none;
}
```

### Gradient Display Title

```css
h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 30pt; /* Original: 24-34pt gradient text */
  font-weight: 400;
  letter-spacing: 6pt; /* Original: 6pt spacing */
  line-height: 1.15;
  background: linear-gradient(90deg, #FF9F43, #FF6B9D, #C44DFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}
```

### Body Text

```css
.body-text {
  font-family: 'Space Mono', monospace;
  font-size: 10pt;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
  position: relative;
  z-index: 1;
}
```

### Neon Accent Box

```css
.neon-box {
  border: 1pt solid rgba(255, 100, 200, 0.5);
  padding: 16pt 20pt;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 12pt rgba(196, 77, 255, 0.2);
}
```

---

## Font Pairing

- **Ghost Title**: Bebas Neue, 38-52pt (display), 6pt letter-spacing, near-invisible at 8% opacity
- **Ghost Watermark**: Bebas Neue, 80-96pt (original 80-120pt reduced ~20%), 6pt letter-spacing, `#FFFFFF` @ 8%
- **Gradient Text**: Bebas Neue, 24-34pt, 6pt letter-spacing
- **Body**: Space Mono, 10pt, weight 400, line-height 1.6
- **KPI/Numbers**: Bebas Neue, 28-34pt, gradient text

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#1A0533` | Gradient top — deep purple |
| `--bg-secondary` | `#2D0057` | Gradient mid — medium purple |
| `--bg-elevated` | `#3D0070` | Card or panel backgrounds |
| `--text-primary` | `#FFFFFF` | Main text (before gradient) |
| `--text-secondary` | `rgba(255, 255, 255, 0.65)` | Body text, descriptions |
| `--accent` | `#FF6B9D` | Hot pink — highlights, glows |
| `--border` | `rgba(255, 100, 200, 0.4)` | Neon box borders, grid lines |

**Sun gradient**: `#FF9F43` (orange) to `#FF6B9D` (pink) to `#C44DFF` (purple).
**Ghost text**: `rgba(255, 255, 255, 0.08)`.
**Grid**: `rgba(255, 100, 200, 0.2-0.4)`.

---

## Layout Principles

- **Atmospheric layering**: Ghost title (z:0) > Sunset + Grid (z:0) > Content (z:1)
- **Content in upper 60%**: Main text lives above the horizon line; sunset and grid occupy the bottom
- **Center-aligned hero slides**: Cover titles center over the sunset for maximum drama
- **Left-aligned content slides**: Data and body text left-align for readability
- **Padding**: 40pt 48pt standard, leaving room for the perspective grid at bottom
- **Ghost title as texture**: The watermark adds depth but must never compete with foreground content

---

## Avoid

- **No clean/corporate layouts** — embrace the surreal, dreamy aesthetic
- **No warm earth tones** — stick to neon pinks, purples, and sunset oranges
- **No normal typography** — all display text is either ghosted, gradient, or oversized
- **No white or light backgrounds** — always deep purple gradient
- **No serif fonts** — condensed sans-serif and monospace only
- **No realistic imagery** — only geometric/abstract atmospheric elements
- **No solid-color titles** — display text should always have gradient or glow treatment

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```
