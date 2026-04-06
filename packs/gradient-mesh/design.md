# Gradient Mesh Design Spec

## Identity

**Mood**: Artistic, vibrant, sensory, brand-forward
**Best For**: Brand launches, creative portfolios, music/film presentations, product reveals

A painterly explosion of color created by overlapping radial gradients. The background itself is the hero — a rich, multi-point mesh of pinks, purples, cyans, and oranges. All text is white with drop shadows for legibility. The effect is immersive and emotional, like looking through stained glass into light.

---

## Signature Elements

- **Multi-radial painterly gradient**: 3-4 overlapping radial gradients creating a rich color mesh
- **White text with drop shadow**: All text is pure white, made legible by consistent text-shadow
- **Large typographic element**: Hero titles at 48-72pt dominate the slide as the primary visual
- **Semi-transparent overlay panels**: When body text needs extra legibility, use `rgba(0,0,0,0.25)` panels
- **Minimal UI elements**: Let the gradient and typography do all the work

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: #2A0845;
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Gradient Mesh Background

```css
.gradient-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, #FF6EC7 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, #7B61FF 0%, transparent 55%),
    radial-gradient(ellipse at 60% 80%, #00D4FF 0%, transparent 50%),
    radial-gradient(ellipse at 90% 70%, #FFB347 0%, transparent 45%);
  background-color: #2A0845;
  z-index: 0;
}
/* Place as first child of body, all content above with z-index: 1 */
```

### Hero Title

```css
h1 {
  font-size: 64pt;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.05;
  letter-spacing: -0.03em;
  text-shadow: 0 2pt 16pt rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 1;
}
```

### Body Text with Shadow

```css
p {
  font-size: 15pt;
  font-weight: 300;
  color: #FFFFFF;
  line-height: 1.6;
  text-shadow: 0 1pt 8pt rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}
```

### Legibility Panel

```css
.text-panel {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12pt;
  padding: 24pt 28pt;
  position: relative;
  z-index: 1;
}
```

### Accent Line

```css
.accent-line {
  width: 48pt;
  height: 3pt;
  background: #FFFFFF;
  opacity: 0.7;
  border-radius: 2pt;
  margin: 12pt 0;
}
```

---

## Font Pairing

- **Title**: Bebas Neue / Barlow Condensed ExtraBold, 48-72pt, weight 800, letter-spacing -0.03em
- **Body**: Outfit / Poppins Light, 14-16pt, weight 300, line-height 1.6
- **Caption**: Outfit, 10-11pt, weight 300

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#2A0845` | Base color beneath gradient mesh |
| `--bg-secondary` | `#1A0530` | Darker variant for alternate slides |
| `--bg-elevated` | `rgba(0,0,0,0.25)` | Legibility panel behind text blocks |
| `--text-primary` | `#FFFFFF` | All text — always pure white |
| `--text-secondary` | `rgba(255,255,255,0.8)` | Lighter text for captions |
| `--accent` | `#FF6EC7` | Not used as text color — mesh color reference |
| `--border` | `rgba(255,255,255,0.2)` | Subtle dividers if needed |

**Gradient palette**: `#FF6EC7` (pink), `#7B61FF` (violet), `#00D4FF` (cyan), `#FFB347` (orange). These appear only in the background mesh, never as UI element colors.

---

## Layout Principles

- **Background is the hero**: The gradient mesh IS the visual — content floats on top of it
- **Large type, few words**: Hero slides should have 3-8 words maximum at very large size
- **Generous padding**: 48pt 56pt minimum; content should never crowd the edges
- **Vertical centering**: Center-align works best when gradient is the backdrop
- **Legibility first**: If text is longer than 2 lines, wrap it in a `text-panel`
- **One idea per slide**: The immersive gradient demands focus — don't split attention

---

## Avoid

- **No linear two-color gradients** — always use 3+ radial gradient points
- **No dark text** — all text must be white with text-shadow
- **No overcrowded layouts** — the gradient needs breathing room
- **No flat solid backgrounds** — every slide must have the mesh gradient
- **No colored text** — text is always white; color lives in the background only
- **No thin lightweight titles** — display titles must be bold/extrabold (700-800)
- **No opaque cards** — panels must be semi-transparent to show gradient through

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
```
