# Dark Neon Miami Design Spec

## Identity

**Mood**: Synthwave, 80s nostalgia, neon nightlife
**Best For**: Entertainment, music festivals, event promotions, creative agency decks

Miami Vice meets Blade Runner. A dark purple void anchors a glowing sunset
semicircle on the horizon. Perspective grid lines converge toward it, pulling
the eye into the neon distance. Headlines shimmer with orange-to-pink-to-purple
gradients. Everything glows.

---

## Signature Elements

- **Sunset semicircle**: A half-circle gradient (orange #FF6B35 to pink #FF0080) centered on the bottom edge
- **Converging perspective grid**: Grid lines on a floor plane vanishing toward the sunset horizon
- **Gradient text on titles**: Linear gradient from orange through hot pink to purple on headline text
- **Wide letter-spacing on display type**: `letter-spacing: 6pt;` to `8pt;` on Bebas Neue creates retro signage feel
- **Hot pink glow effects**: #FF0080 used for neon glows on text and borders
- **Palm tree accent**: Optional palm tree or geometric accent in lower corners
- **KPI/number sizes**: Bebas Neue 36-44pt with 6pt letter-spacing for metrics

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Space Mono', monospace;
  background: #0A0014;
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Sunset Semicircle

```css
.sunset {
  position: absolute;
  bottom: -80pt;
  left: 50%;
  transform: translateX(-50%);
  width: 320pt;
  height: 160pt;
  border-radius: 160pt 160pt 0 0;
  background: linear-gradient(180deg, #FF6B35 0%, #FF0080 60%, #8B00FF 100%);
  box-shadow: 0 0 60pt rgba(255, 0, 128, 0.4);
  z-index: 0;
}
```

### Perspective Grid Floor

```css
.grid-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180pt;
  background:
    linear-gradient(transparent 0%, rgba(255, 0, 128, 0.15) 100%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 0, 128, 0.2) 0px,
      rgba(255, 0, 128, 0.2) 1px,
      transparent 1px,
      transparent 36pt
    );
  transform: perspective(400pt) rotateX(60deg);
  transform-origin: bottom center;
  z-index: 0;
}
```

### Gradient Title

```css
h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48pt;
  font-weight: 400;
  letter-spacing: 7pt; /* Original: 6-8pt letter-spacing */
  line-height: 1.1;
  background: linear-gradient(90deg, #FF6B35, #FF0080, #8B00FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}
```

### Neon Glow Text

```css
.neon-text {
  color: #FF0080;
  text-shadow:
    0 0 10pt rgba(255, 0, 128, 0.6),
    0 0 30pt rgba(255, 0, 128, 0.3),
    0 0 60pt rgba(255, 0, 128, 0.15);
}
```

### Body Text

```css
.body-text {
  font-family: 'Space Mono', monospace;
  font-size: 12pt;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}
```

### Neon Border Card

```css
.neon-card {
  border: 1pt solid rgba(255, 0, 128, 0.4);
  padding: 20pt 24pt;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 12pt rgba(255, 0, 128, 0.2);
}
```

---

## Font Pairing

- **Title**: Bebas Neue, 36-52pt, weight 400, letter-spacing 6-8pt, line-height 1.1, uppercase
- **Body**: Space Mono, 11-13pt, weight 400, line-height 1.6
- **KPI/Numbers**: Bebas Neue, 36-44pt, weight 400, letter-spacing 6pt

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0A0014` | Deep purple-black background |
| `--bg-secondary` | `#140028` | Slightly lighter secondary areas |
| `--bg-elevated` | `#1E003C` | Card or panel backgrounds |
| `--text-primary` | `#FFFFFF` | Headline text (before gradient applied) |
| `--text-secondary` | `rgba(255, 255, 255, 0.7)` | Body text, descriptions |
| `--accent` | `#FF0080` | Hot pink neon — glows, highlights |
| `--border` | `rgba(255, 0, 128, 0.4)` | Neon border lines |

**Sunset orange**: `#FF6B35` for gradient start.
**Grid pink**: `rgba(255, 0, 128, 0.15-0.40)` for perspective grid lines (original: #FF0080 @ 15-40%).

---

## Layout Principles

- **Sunset on bottom-heavy slides**: The semicircle sits at the bottom edge, content lives in the upper 60%
- **Grid as ambient**: The perspective grid is always subtle (15-40% opacity), never overpowering
- **Content above the horizon**: Text and cards float above the grid floor
- **Center-aligned for hero slides**: Cover and section titles center-align above the sunset
- **Left-aligned for content slides**: Data and body text left-align for readability
- **Padding**: 40pt 48pt standard, allowing room for the atmospheric elements

---

## Avoid

- **No cool-only palettes** — always include warm orange/pink; this is Miami, not Arctic
- **No bright backgrounds** — always dark purple-black (#0A0014 or darker)
- **No sans-serif body text** — body must be Space Mono for the retro-tech feel
- **No flat design** — every slide needs glow or atmospheric depth
- **No white or gray** as dominant colors — everything is neon-tinted
- **No subtle typography** — display text must be bold, tracked, and glowing
- **No realistic images** — this is graphic/illustrative only

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```
