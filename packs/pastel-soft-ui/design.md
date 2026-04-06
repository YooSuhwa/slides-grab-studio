# Pastel Soft UI Design Spec

## Identity

**Mood**: Gentle, modern app, healthcare-friendly
**Best For**: Healthcare, beauty, education startups, wellness products

Soft as a cloud. Frosted white cards float over a tricolor pastel gradient that
shifts from blush pink through baby blue to fresh mint. Every shadow is tinted
to match its nearest pastel, and all corners are generously rounded. The visual
language says "safe, approachable, modern."

---

## Signature Elements

- **Frosted white card at 70% opacity**: Semi-transparent cards with soft blur, the primary content surface
- **Pastel tricolor gradient**: Background flows pink #FCE4F3 to blue #E8F4FF to mint #F0FCE4
- **Soft color-matched shadows**: Drop shadows tinted blush or sky rather than gray or black
- **Generous border-radius**: 16-20pt on cards, 12pt on buttons and badges, pill-shaped card as central element
- **Pastel dot accents**: Small decorative circles in blush #F9C6E8 and sky #C6E8F9
- **KPI/number sizes**: Nunito Bold 32-36pt for metrics, Inter 11pt for labels

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: 'Nunito', sans-serif;
  background: linear-gradient(135deg, #FCE4F3 0%, #E8F4FF 50%, #F0FCE4 100%);
  padding: 40pt 48pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Frosted Card

```css
.card {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1pt solid rgba(255, 255, 255, 0.90);
  border-radius: 18pt;
  padding: 24pt 28pt;
  box-shadow: 0 4pt 16pt rgba(249, 198, 232, 0.25);
}
```

### Sky-Tinted Card Variant

```css
.card-sky {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1pt solid rgba(255, 255, 255, 0.90);
  border-radius: 18pt;
  padding: 24pt 28pt;
  box-shadow: 0 4pt 16pt rgba(198, 232, 249, 0.25);
}
```

### Title

```css
h1 {
  font-family: 'Nunito', 'DM Sans', sans-serif;
  font-size: 32pt;
  font-weight: 700; /* Nunito Bold / DM Sans Medium */
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--text-primary);
}
```

### Body Text

```css
.body-text {
  font-family: 'Nunito', 'DM Sans', sans-serif;
  font-size: 14pt;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
}
```

### Label / Badge

```css
.label {
  font-family: 'Inter', sans-serif;
  font-size: 11pt;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12pt;
  padding: 4pt 12pt;
}
```

### Pastel Dot Accent

```css
.dot-blush {
  width: 12pt;
  height: 12pt;
  border-radius: 50%;
  background: #F9C6E8;
}
.dot-sky {
  width: 12pt;
  height: 12pt;
  border-radius: 50%;
  background: #C6E8F9;
}
```

---

## Font Pairing

- **Title**: Nunito Bold / DM Sans Medium, 28-36pt, weight 700/500, letter-spacing -0.01em, line-height 1.2
- **Body**: Nunito / DM Sans, 13-15pt, weight 400, line-height 1.6
- **Labels**: Inter, 11pt, weight 500
- **KPI/Numbers**: Nunito Bold, 32-36pt, weight 700

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#FCE4F3` | Gradient start (blush pink) |
| `--bg-secondary` | `#E8F4FF` | Gradient mid (baby blue) |
| `--bg-elevated` | `rgba(255,255,255,0.70)` | Frosted card fill |
| `--text-primary` | `#3D3D5C` | Headlines, primary text (soft navy) |
| `--text-secondary` | `#7B7B9E` | Body text, descriptions |
| `--accent` | `#E88FC4` | Highlight pink for key metrics or CTAs |
| `--border` | `rgba(255,255,255,0.90)` | Card borders |

**Gradient end**: `#F0FCE4` (fresh mint).
**Shadow blush**: `rgba(249, 198, 232, 0.25)` for pink-tinted shadows.
**Shadow sky**: `rgba(198, 232, 249, 0.25)` for blue-tinted shadows.

---

## Layout Principles

- **Card-based**: All content lives inside frosted cards. No floating text on the gradient.
- **Rounded everything**: Minimum 12pt border-radius on all interactive/card elements.
- **Soft spacing**: 20-24pt gap between cards, 40-48pt edge padding.
- **Center-leaning**: Content tends toward center alignment for the gentle, app-like feel.
- **Max 3 cards per slide**: Preserve the airy, uncluttered feeling.
- **Dot accents as decoration**: Small pastel dots placed near corners of cards or as bullet markers.

---

## Avoid

- **No dark backgrounds** — always the pastel gradient or white
- **No saturated colors** — all hues stay at 20-40% saturation
- **No hard drop shadows** — shadows must be pastel-tinted and soft (8-16pt blur)
- **No sharp corners** — everything rounded, minimum 12pt radius
- **No heavy type** — maximum weight 700 (Bold), no Black or Extra-Bold
- **No monospace fonts** — keep it friendly with Nunito and Inter
- **No dark borders** — borders are always white or near-white

---

## Webfont CDN

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
```
