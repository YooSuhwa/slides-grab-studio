# Retro Y2K Design Spec

## Identity

**Mood**: Nostalgic, pop, chaotic fun, millennium energy
**Best For**: Events, lifestyle marketing, fashion presentations, creative campaigns, music/entertainment

The year 2000 aesthetic revived — electric blue backgrounds, rainbow gradient stripes, double-shadow text effects, and star/sparkle decorations. The design is intentionally maximalist, colorful, and joyful. It channels early-internet optimism, boy-band posters, and Windows Media Player visualizations.

---

## Signature Elements

- **Rainbow gradient stripe bars**: Horizontal bands (6-8pt height) with a full rainbow gradient used as dividers or decorative accents (top and bottom of slide)
- **Double-color text shadow**: Title text with two 2pt offset shadows — one cyan (#00FFFF), one magenta (#FF00FF) — creating a chromatic aberration effect
- **Star/sparkle motifs**: Small 4-pointed star shapes in yellow (#FFFF00) scattered as decorative accents
- **Electric blue base**: Deep navy-to-electric-blue backgrounds as the foundation
- **Bold condensed titles**: All-caps Impact or Bebas Neue in white, large and dominant

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Rainbow Stripe Bar

```css
.rainbow-bar {
  width: 100%;
  height: 6pt;
  background: linear-gradient(
    90deg,
    #FF0000, #FF8000, #FFFF00, #00FF00,
    #00FFFF, #0080FF, #8000FF, #FF00FF
  );
  border-radius: 3pt;
}
/* Use as horizontal divider or decorative accent */
```

### Double-Shadow Title

```css
h1 {
  font-size: 48pt;
  font-weight: 900;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.1;
  text-shadow:
    2pt 2pt 0 #00FFFF,
    -2pt -2pt 0 #FF00FF;
}
/* 2pt cyan + 2pt magenta double offset creates chromatic aberration */
```

### Star Sparkle

```css
.star {
  display: inline-block;
  color: #FFFF00;
  font-size: 16pt;
  text-shadow: 0 0 8pt rgba(255, 255, 0, 0.6);
}
/* Use Unicode ✦ or ✧ character. Place 2-4 per slide as accent. */
```

### Y2K Card

```css
.y2k-card {
  background: rgba(0, 0, 128, 0.6);
  border: 2pt solid rgba(0, 255, 255, 0.4);
  border-radius: 8pt;
  padding: 20pt 24pt;
  box-shadow: 0 0 16pt rgba(0, 255, 255, 0.15);
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(90deg, #00FFFF, #FF00FF, #FFFF00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
}
```

### Retro Monospace Body

```css
.retro-body {
  font-family: 'VT323', 'Space Mono', monospace;
  font-size: 13pt;
  color: #CCCCFF;
  line-height: 1.6;
  letter-spacing: 0.02em;
}
```

---

## Font Pairing

- **Title**: Bebas Neue / Impact, 36-52pt, weight 900, uppercase, letter-spacing 0.02em
- **Body**: VT323 / Space Mono, 12-14pt, weight 400, line-height 1.6
- **Label**: Space Mono, 10-11pt, weight 400, uppercase

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#000080` | Classic Y2K navy blue |
| `--bg-secondary` | `#0020C2` | Electric blue variant |
| `--bg-elevated` | `rgba(0,0,128,0.6)` | Card/panel backgrounds |
| `--text-primary` | `#FFFFFF` | Headings — pure white |
| `--text-secondary` | `#CCCCFF` | Body text — soft lavender |
| `--accent` | `#FFFF00` | Yellow stars and highlights |
| `--border` | `rgba(0,255,255,0.4)` | Cyan-tinted card borders |

**Shadow palette**: `#00FFFF` (cyan) and `#FF00FF` (magenta) for the signature double text-shadow effect.

---

## Layout Principles

- **Title dominance**: Hero titles take up 40-60% of the slide — big, loud, and central
- **Rainbow bars as structure**: Use gradient stripe bars to divide sections, not subtle lines
- **Star placement**: 2-4 sparkle stars per slide, asymmetrically placed near titles or corners
- **Dark panels for readability**: Body text always inside semi-transparent navy panels
- **Padding**: 40pt 48pt standard; can go tighter for dense event-style content
- **Center-aligned default**: This pack favors centered, poster-like compositions

---

## Avoid

- **No minimalist layouts** — this pack is intentionally maximalist and energetic
- **No muted colors** — everything should be saturated and electric
- **No serif fonts** — sans-serif and monospace only
- **No subtle text shadows** — shadows should be visible and colorful
- **No earth tones** — no browns, beiges, olives, or warm neutrals
- **No single-color gradients** — always use full rainbow or multi-color gradients
- **No thin lightweight typography** — all titles are bold/black weight

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

Note: Impact is a system font. VT323 is available from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
```
