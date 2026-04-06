# Art Deco Luxe Design Spec

## Identity

**Mood**: 1920s grandeur, gilded, prestigious
**Best For**: Luxury brands, gala events, premium annual reports

Opulent geometry inspired by the Chrysler Building and vintage Gatsby-era design. Every surface drips with gold ornamentation on near-black backgrounds. Symmetry is sacred — layouts are centered, balanced, and framed by gilded borders. The typography is ALL CAPS serif with generous letter-spacing, evoking engraved invitations and Art Deco movie titles.

---

## Signature Elements

- **Double inset gold border frame**: Two nested rectangular gold borders (1pt and 0.5pt) with 12-16pt gap, framing the entire slide
- **Fan ornaments**: Radiating half-circle fan motifs on left and right sides, rendered in antique gold
- **Diamond divider**: A small rotated square (diamond) centered between content sections, flanked by thin gold rules
- **ALL CAPS wide-spaced serif**: All titles in Cormorant Garamond / Trajan / Didot, uppercase with 6-10pt letter-spacing
- **Near-black background**: Deep warm black #0E0A05 that feels rich, not cold

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Cormorant Garamond', 'Trajan', 'Didot', 'Georgia', serif;
  background: #0E0A05;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Double Inset Gold Border Frame

```css
.frame-outer {
  position: absolute;
  inset: 16pt;
  border: 1pt solid #B8960C;
  pointer-events: none;
  z-index: 2;
}
.frame-inner {
  position: absolute;
  inset: 28pt;
  border: 0.5pt solid rgba(184, 150, 12, 0.5);
  pointer-events: none;
  z-index: 2;
}
```

### Fan Ornament

```css
.fan-ornament {
  position: absolute;
  width: 80pt;
  height: 40pt;
  overflow: hidden;
  z-index: 1;
}
.fan-ornament::before {
  content: '';
  position: absolute;
  width: 80pt;
  height: 80pt;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    #B8960C 0deg 4deg,
    transparent 4deg 12deg
  );
  opacity: 0.35;
}
.fan-ornament.left {
  left: 16pt;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
}
.fan-ornament.right {
  right: 16pt;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
}
```

### Diamond Divider

```css
.diamond-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16pt;
  margin: 16pt 0;
}
.diamond-divider::before,
.diamond-divider::after {
  content: '';
  flex: 1;
  max-width: 120pt;
  height: 0.5pt;
  background: linear-gradient(90deg, transparent, #B8960C, transparent);
}
.diamond-divider .diamond {
  width: 8pt;
  height: 8pt;
  background: #B8960C;
  transform: rotate(45deg);
  flex-shrink: 0;
}
```

### Hero Title

```css
h1 {
  font-family: 'Cormorant Garamond', 'Trajan', 'Didot', 'Georgia', serif;
  font-size: 36pt;
  font-weight: 700;
  color: #D4AA2A;
  text-transform: uppercase;
  letter-spacing: 8pt;
  line-height: 1.3;
  text-align: center;
  margin: 0;
}
```

### Subtitle

```css
h2 {
  font-family: 'Cormorant Garamond', 'Trajan', 'Didot', 'Georgia', serif;
  font-size: 14pt;
  font-weight: 400;
  color: #8A7020;
  text-transform: uppercase;
  letter-spacing: 10pt;
  text-align: center;
}
```

### Caption / Monospace Accent

```css
.caption {
  font-family: 'Space Mono', monospace;
  font-size: 9pt;
  color: rgba(184, 150, 12, 0.6);
  letter-spacing: 4.5pt;
  text-transform: uppercase;
}
```

---

## Font Pairing

- **Title**: Cormorant Garamond / Trajan / Didot, 26-36pt, weight 600-700, ALL CAPS, letter-spacing 6-10pt
- **Body**: Cormorant Garamond, 13-15pt, weight 400, line-height 1.6, letter-spacing 1pt
- **Caption**: Space Mono, 9pt, weight 400, uppercase, letter-spacing 4-5pt
- **KPI Numbers**: Cormorant Garamond, 48-56pt, weight 700, ALL CAPS, letter-spacing 6pt

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0E0A05` | Near-black warm background |
| `--bg-secondary` | `#1A150A` | Secondary panels, slightly lighter |
| `--bg-elevated` | `#241E10` | Elevated card or content blocks |
| `--text-primary` | `#D4AA2A` | Rich gold for titles and headings |
| `--text-secondary` | `#8A7020` | Muted gold for subtitles and body |
| `--accent` | `#B8960C` | Antique gold for borders and ornaments |
| `--border` | `#B8960C` | Gold border frames |

---

## Layout Principles

- **Perfect symmetry**: Everything is centered and balanced. No asymmetric layouts.
- **Framed composition**: Every slide gets the double inset gold border. Content lives inside the inner frame.
- **Padding**: 40pt 56pt inside the inner border frame
- **Vertical centering**: Content centers vertically within the frame
- **Sparse content**: Max 3-4 text blocks per slide. Luxury needs breathing room.
- **Gold hierarchy**: Brightest gold (#D4AA2A) for titles, medium (#B8960C) for ornaments, muted (#8A7020) for body

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap">
```

---

## Avoid

- **No modern sans-serif fonts** — only classic serif and monospace
- **No colorful tones** — only gold, black, and warm neutrals
- **No asymmetric layouts** — symmetry is the core principle
- **No thin/hairline type** — minimum weight 400, titles 600-700
- **No rounded corners** — use sharp geometric edges only
- **No gradients on backgrounds** — solid deep black only
- **No casual or playful elements** — maintain formal prestige throughout
- **No white text** — text should be gold-toned, never pure white
