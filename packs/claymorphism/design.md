# Claymorphism Design Spec

## Identity

**Mood**: Friendly, soft 3D, tactile, playful
**Best For**: Product launches, education, children's content, onboarding flows, lifestyle apps

Everything looks like it was molded from soft clay. Elements have colored shadows that match their fill (not grey), extreme border-radius, and a subtle inner highlight on top that simulates light hitting a rounded surface. The result is warm, inviting, and three-dimensional without being heavy.

---

## Signature Elements

- **Colored soft shadows**: Shadows match the element's fill color (not grey) — e.g., a mint card has a mint shadow
- **Very high border-radius**: 20-32pt on all elements — everything feels rounded and soft
- **Inner top highlight**: A subtle `inset 0 2pt 0 rgba(255,255,255,0.5)` on cards to simulate light from above
- **Warm pastel gradient background**: Soft peach-to-coral gradient as the base
- **Playful color palette**: Mint, pink, yellow, coral — all pastel, all friendly

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: linear-gradient(135deg, #FFECD2 0%, #FCB69F 100%);
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Clay Card (Mint)

```css
.clay-card-mint {
  background: #A8EDEA;
  border-radius: 24pt;
  padding: 24pt 28pt;
  box-shadow:
    inset 0 2pt 0 rgba(255, 255, 255, 0.5),
    0 8pt 24pt rgba(120, 210, 206, 0.4);
}
/* Shadow color is a darker version of the fill */
```

### Clay Card (Pink)

```css
.clay-card-pink {
  background: #FED6E3;
  border-radius: 24pt;
  padding: 24pt 28pt;
  box-shadow:
    inset 0 2pt 0 rgba(255, 255, 255, 0.5),
    0 8pt 24pt rgba(220, 160, 180, 0.4);
}
```

### Clay Card (Yellow)

```css
.clay-card-yellow {
  background: #FFEAA7;
  border-radius: 24pt;
  padding: 24pt 28pt;
  box-shadow:
    inset 0 2pt 0 rgba(255, 255, 255, 0.5),
    0 8pt 24pt rgba(220, 200, 120, 0.4);
}
```

### Clay Button / Pill

```css
.clay-pill {
  display: inline-block;
  background: #A8EDEA;
  border-radius: 32pt;
  padding: 8pt 20pt;
  font-weight: 700;
  font-size: 12pt;
  color: #2D5F5D;
  box-shadow:
    inset 0 1pt 0 rgba(255, 255, 255, 0.5),
    0 4pt 12pt rgba(120, 210, 206, 0.35);
}
```

### Hero Title

```css
h1 {
  font-size: 44pt;
  font-weight: 800;
  color: #3D2C2C;
  line-height: 1.15;
  letter-spacing: -0.02em;
}
```

### Floating Clay Shape (Decorative)

```css
.clay-blob {
  width: 80pt;
  height: 80pt;
  background: #FED6E3;
  border-radius: 50%;
  box-shadow:
    inset 0 3pt 0 rgba(255, 255, 255, 0.5),
    0 10pt 28pt rgba(220, 160, 180, 0.3);
  position: absolute;
}
```

---

## Font Pairing

- **Title**: Nunito ExtraBold / Rounded Mplus, 32-48pt, weight 800, letter-spacing -0.02em
- **Body**: Nunito / DM Sans, 14-16pt, weight 400, line-height 1.6
- **Icon Label**: Nunito / DM Sans, 11-13pt, weight 500 (medium)

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FFECD2` | Warm peach — gradient start |
| `--bg-secondary` | `#FCB69F` | Coral — gradient end |
| `--bg-elevated` | `#A8EDEA` | Mint clay card fill |
| `--text-primary` | `#3D2C2C` | Dark warm brown — headings |
| `--text-secondary` | `#6B5050` | Medium brown — body text |
| `--accent` | `#FED6E3` | Soft pink accent |
| `--border` | `transparent` | No visible borders — shadows define edges |

**Clay palette**: `#A8EDEA` (mint), `#FED6E3` (pink), `#FFEAA7` (yellow). Each element's shadow should be a darker, more saturated version of its fill.

---

## Layout Principles

- **Round everything**: Min border-radius 20pt on cards, 32pt on pills/buttons
- **Colored shadows only**: Shadow hue must match element fill — never use grey `rgba(0,0,0,...)`
- **Inner highlight on every card**: `inset 0 2pt 0 rgba(255,255,255,0.5)` is mandatory
- **Gentle spacing**: 16-24pt gaps between cards; nothing feels cramped
- **Warm tones**: Even text colors are brown, not black or grey
- **Limit to 3 card colors per slide**: Too many pastels become cotton candy chaos

---

## Avoid

- **No sharp corners** — everything must have high border-radius (20pt+)
- **No grey shadows** — shadows are always colored to match their element
- **No flat design elements** — every card needs the inner highlight + colored shadow combo
- **No dark backgrounds** — always warm pastel gradients
- **No thin borders** — the 3D effect comes from shadows and highlights, not strokes
- **No pure black text** — use warm dark brown instead
- **No angular geometric shapes** — circles and rounded rectangles only

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
```

Note: Rounded Mplus is a fallback. If unavailable, Nunito ExtraBold provides similar rounded feel.
