# Nordic Minimalism Design Spec

## Identity

**Mood**: Calm, natural, considered, Scandinavian
**Best For**: Wellness, lifestyle, non-profit, sustainable brands, mindful products

Design that breathes. Warm cream backgrounds, organic soft shapes, and restrained typography create slides that feel like a quiet morning in a Scandinavian cabin. Every element is placed with intention; nothing is decorative without purpose. The color palette is drawn from natural materials — stone, sand, wood.

---

## Signature Elements

- **Organic blob background shape**: A large, soft, irregular rounded shape in muted stone (#D9CFC4) placed behind content
- **3-dot color accent**: Three small circles in a row — a minimal punctuation mark used as a section divider
- **Wide letter-spacing monospace caption**: Small uppercase captions in Space Mono with generous tracking
- **Light-weight serif titles**: Elegant thin serif titles that feel literary and unhurried
- **Generous whitespace**: At least 50% of each slide is empty warm cream space

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
  color: var(--text-primary);
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Organic Blob Shape

```css
.organic-blob {
  position: absolute;
  width: 320pt;
  height: 280pt;
  background: #D9CFC4;
  border-radius: 60% 40% 50% 45% / 50% 55% 45% 50%;
  opacity: 0.5;
  z-index: 0;
}
/* Place behind content. Asymmetric border-radius creates organic feel. */
```

### 3-Dot Accent

```css
.dot-accent {
  display: flex;
  gap: 6pt;
  margin: 16pt 0;
}
.dot-accent span {
  width: 5pt;
  height: 5pt;
  border-radius: 50%;
  background: var(--text-primary);
  opacity: 0.4;
}
```

### Monospace Caption

```css
.caption {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  font-weight: 400;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 5pt;
}
```

### Serif Title

```css
h1 {
  font-family: 'Canela', 'DM Serif Display', 'Georgia', serif;
  font-size: 44pt;
  font-weight: 400;
  color: var(--text-primary);
  line-height: 1.2;
  letter-spacing: -0.01em;
}
/* Light weight — the elegance comes from the serif shapes, not boldness */
```

### Soft Divider

```css
.divider {
  width: 40pt;
  height: 1pt;
  background: var(--text-secondary);
  opacity: 0.3;
  margin: 20pt 0;
}
```

### Minimal Card

```css
.nordic-card {
  background: rgba(217, 207, 196, 0.3);
  border-radius: 12pt;
  padding: 24pt 28pt;
}
/* Subtle, warm, almost invisible — just enough to group content */
```

---

## Font Pairing

- **Title**: Canela / Freight Display / DM Serif Display, 36-52pt, weight 400 (light), letter-spacing -0.01em, line-height 1.2
- **Body**: Inter Light / Lato Light, 13-15pt, weight 300, line-height 1.7
- **Caption**: Space Mono, 9-10pt, weight 400, uppercase, letter-spacing 4-6pt

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#F4F1EC` | Warm cream — natural paper background |
| `--bg-secondary` | `#EBE6DF` | Slightly warmer variant for sections |
| `--bg-elevated` | `rgba(217,207,196,0.3)` | Subtle card/panel fill |
| `--text-primary` | `#3D3530` | Dark warm brown — titles and headings |
| `--text-secondary` | `#8A7A6A` | Medium stone — body text and captions |
| `--accent` | `#3D3530` | Same as text-primary — no bright accent color |
| `--border` | `#D9CFC4` | Warm stone — dividers and blob shapes |

**Key principle**: No bright accent color. The "accent" is the same dark brown used at strategic points. Color restraint IS the design.

---

## Layout Principles

- **50%+ whitespace**: Every slide should feel spacious and unhurried
- **Organic shape placement**: One blob shape per slide maximum, partially behind content
- **Left-aligned default**: Content aligns left; center only for cover slides
- **Padding**: 48pt 56pt standard — generous but not excessive
- **Vertical flow**: Title > dot accent or divider > body text > caption at bottom
- **Content limit**: 2-3 elements per slide maximum
- **Caption placement**: Bottom of slide, left-aligned, in monospace uppercase

---

## Avoid

- **No bright colors** — no blues, reds, greens, or saturated hues
- **No dense layouts** — if a slide feels "full", remove elements
- **No sans-serif display fonts** — titles must be serif; sans-serif is for body only
- **No heavy font weights** — titles are weight 400 (regular), never bold
- **No hard geometric shapes** — rectangles and circles should have organic feel (high border-radius, soft opacity)
- **No dark backgrounds** — always warm cream/off-white
- **No drop shadows** — depth comes from color layering and opacity, never shadows
- **No more than 3 colors on any slide** — cream, brown, stone. That's it.

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

Note: Canela and Freight Display are commercial fonts not on Google Fonts. DM Serif Display is the web-safe fallback. Font-family order: `'Canela', 'DM Serif Display', 'Georgia', serif`
