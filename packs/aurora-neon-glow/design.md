# Aurora Neon Glow Design Spec

## Identity

**Mood**: Futuristic, AI, electric, otherworldly
**Best For**: AI product presentations, cybersecurity decks, deep tech pitches, data science

A near-black canvas where neon light sources bleed through the darkness. Title text shimmers with gradient color, blurred glow circles pulse in the background, and body text sits on dark semi-transparent panels for legibility. The aesthetic evokes a command center, a neural network visualization, or an aurora borealis translated to screen.

---

## Signature Elements

- **Blurred neon glow circles**: Large soft-edged circles of neon green, violet, and cyan placed behind content
- **Gradient text on titles**: Text colored with a horizontal gradient from green through cyan to violet
- **Dark legibility panels**: Body text wrapped in semi-transparent dark panels so it reads clearly over glow effects
- **Wide letter-spacing on titles**: Display titles use expanded tracking for a tech/futuristic feel
- **Monospace body text**: DM Mono or Space Mono for technical credibility

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Neon Glow Circle

```css
.neon-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(40pt);
  pointer-events: none;
  z-index: 0;
}
.neon-green {
  width: 250pt;
  height: 250pt;
  background: radial-gradient(circle, rgba(0,255,136,0.35) 0%, transparent 70%);
}
.neon-violet {
  width: 200pt;
  height: 200pt;
  background: radial-gradient(circle, rgba(123,0,255,0.3) 0%, transparent 70%);
}
.neon-cyan {
  width: 220pt;
  height: 220pt;
  background: radial-gradient(circle, rgba(0,180,255,0.3) 0%, transparent 70%);
}
```

### Gradient Title

```css
h1 {
  font-size: 52pt;
  font-weight: 700;
  background: linear-gradient(90deg, #00FF88, #00B4FF, #7B00FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4pt;
  line-height: 1.1;
  position: relative;
  z-index: 1;
}
```

### Title with Glow Effect

```css
.title-glow {
  text-shadow: 0 0 30pt rgba(0, 255, 136, 0.3);
}
/* Apply to a wrapper div behind the gradient text for glow aura */
```

### Dark Legibility Panel

```css
.dark-panel {
  background: rgba(5, 5, 16, 0.75);
  border: 1pt solid rgba(0, 255, 136, 0.15);
  border-radius: 8pt;
  padding: 20pt 24pt;
  position: relative;
  z-index: 1;
}
```

### Monospace Body

```css
.mono-body {
  font-family: 'DM Mono', 'Space Mono', monospace;
  font-size: 13pt;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 1.6;
  letter-spacing: 0.01em;
}
```

### Neon Accent Line

```css
.neon-line {
  width: 60pt;
  height: 2pt;
  background: linear-gradient(90deg, #00FF88, #00B4FF);
  border-radius: 1pt;
  box-shadow: 0 0 8pt rgba(0, 255, 136, 0.4);
}
```

---

## Font Pairing

- **Title**: Bebas Neue / Barlow Condensed, 44-60pt, weight 700, wide letter-spacing 4-8pt
- **Body**: DM Mono / Space Mono, 12-14pt, weight 400, line-height 1.6
- **Label**: Space Mono, 9-10pt, weight 400, uppercase, letter-spacing 4pt

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#050510` | Near-black base — the void |
| `--bg-secondary` | `#020208` | Darker variant for panels |
| `--bg-elevated` | `rgba(5,5,16,0.75)` | Dark legibility panel |
| `--text-primary` | `#FFFFFF` | Headings (when not using gradient) |
| `--text-secondary` | `#D0D0F0` | Body text — soft blue-white |
| `--accent` | `#00FF88` | Neon green primary accent |
| `--border` | `rgba(0,255,136,0.15)` | Subtle neon-tinted borders |

**Glow palette**: `#00FF88` (neon green), `#7B00FF` (electric violet), `#00B4FF` (cyan). Used for glow circles and gradient text only.

---

## Layout Principles

- **Dark canvas is sacred**: The near-black background creates the stage for neon to shine
- **Glow placement**: 1-3 glow circles per slide, asymmetrically placed
- **Panel for text blocks**: Any body text longer than 1 line should be inside a dark panel
- **Wide letter-spacing**: Display titles use 4-8pt letter-spacing for futuristic feel
- **Sparse content**: Max 3-4 elements per slide; neon loses impact when crowded
- **Gradient text for hero titles only**: Body text is solid color, never gradient

---

## Avoid

- **No white backgrounds** — always near-black (#050510 or darker)
- **No solid non-glowing colors** — all color should feel luminous and emissive
- **No dense text without panels** — body text must always have a dark backdrop
- **No warm colors** — no reds, oranges, yellows; stay in the cool neon spectrum
- **No serif fonts** — monospace and condensed sans-serif only
- **No heavy borders** — borders are thin (1pt) and neon-tinted
- **No gradient text on body copy** — gradient is for display titles only

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```
