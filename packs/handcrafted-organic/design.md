# Handcrafted Organic Design Spec

## Identity

**Mood**: Artisanal, natural, human, sustainable
**Best For**: Eco brands, food/beverage, craft studios, farm-to-table

Warm as a kraft paper bag from a farmers market. Hand-drawn circles nest inside
each other — dashed outer, solid inner, slightly off-kilter. Serif italics feel
penned by hand. Dashed rules replace hard lines. Everything says "made by
humans, with care."

---

## Signature Elements

- **Nested circles**: Dashed outer circle + solid inner circle, rotated 5-10° for an imperfect feel
- **Botanical accent markers**: Small leaf or seed-like decorative dots (CSS circles in earthy tones)
- **Dashed rule lines**: Borders and dividers use dashed strokes instead of solid lines
- **Kraft paper background**: Warm #FDF6EE that feels like unbleached paper
- **Italic serif headlines**: Playfair Display Italic / Cormorant Garamond Italic for an elegant-yet-handmade quality
- **KPI/number sizes**: Playfair Display 28-34pt for metrics

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'EB Garamond', Georgia, serif;
  background: #FDF6EE;
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Nested Circles

```css
.circle-outer {
  width: 200pt;
  height: 200pt;
  border: 2pt dashed #C8A882;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-7deg); /* Original: dashed outer rotated 5-10° */
}
.circle-inner {
  width: 140pt;
  height: 140pt;
  border: 2pt solid #A87850;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(5deg); /* Original: solid inner rotated 5-10° */
}
```

### Title

```css
h1 {
  font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 30pt;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.25;
  color: #6B4C2A;
}
```

### Dashed Rule

```css
.dashed-rule {
  border: none;
  border-top: 1.5pt dashed #C8A882;
  width: 100%;
  margin: 16pt 0;
}
```

### Botanical Dot Accent

```css
.dot-earth {
  width: 8pt;
  height: 8pt;
  border-radius: 50%;
  background: #A87850;
  display: inline-block;
}
.dot-leaf {
  width: 6pt;
  height: 10pt;
  border-radius: 50%;
  background: #8B9A6B;
  display: inline-block;
  transform: rotate(30deg);
}
```

### Body Text

```css
.body-text {
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 14pt;
  font-weight: 400;
  line-height: 1.7;
  color: #6B4C2A;
}
```

### Caption (Typewriter)

```css
.caption {
  font-family: 'Courier New', Courier, monospace;
  font-size: 9pt;
  font-weight: 400;
  letter-spacing: 0.05em;
  color: #A87850;
  text-transform: lowercase;
}
```

### Card (Paper Inset)

```css
.card {
  background: rgba(255, 255, 255, 0.6);
  border: 1.5pt dashed #C8A882;
  border-radius: 8pt;
  padding: 20pt 24pt;
}
```

---

## Font Pairing

- **Title**: Playfair Display Italic / Cormorant Garamond Italic, 22-34pt, weight 700, line-height 1.25
- **Body**: EB Garamond, 13-15pt, weight 400, line-height 1.7
- **Caption**: Courier New, 9pt, weight 400, letter-spacing 0.05em, lowercase
- **KPI/Numbers**: Playfair Display, 28-34pt, weight 700

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FDF6EE` | Kraft paper background |
| `--bg-secondary` | `#F5ECDE` | Darker paper for sections |
| `--bg-elevated` | `rgba(255,255,255,0.6)` | Card and inset backgrounds |
| `--text-primary` | `#6B4C2A` | Headlines, body — warm deep brown |
| `--text-secondary` | `#A87850` | Captions, supporting text — medium brown |
| `--accent` | `#8B9A6B` | Sage green for botanical accents |
| `--border` | `#C8A882` | Dashed circles, rules, borders — tan |

---

## Layout Principles

- **Centered composition**: Nested circles and titles center on the slide for a medallion/label feel
- **Generous whitespace**: 48-56pt padding. The craft paper itself is part of the design.
- **Circle as focal point**: On hero slides, the nested circles are THE visual, containing a word or number
- **Dashed everything**: All dividers, borders, and frames use dashed strokes
- **Warm tones only**: Every element pulls from the brown/tan/sage palette
- **Imperfect rotation**: 5-10° rotations on decorative elements to avoid sterile precision

---

## Avoid

- **No clean geometric shapes** — avoid perfect rectangles and sharp grids
- **No bright or saturated colors** — everything stays muted, earthy, natural
- **No sans-serif fonts** — only serif (Playfair, EB Garamond) and monospace (Courier New)
- **No solid heavy borders** — use dashed strokes instead
- **No dark backgrounds** — kraft paper warmth is essential
- **No digital/tech aesthetic** — no gradients, no glows, no neon
- **No heavy drop shadows** — at most a very subtle warm shadow

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap">
```

Note: Courier New is a system font (`'Courier New', Courier, monospace`).
