# Neo-Brutalism Design Spec

## Identity

**Mood**: Bold, raw, provocative, startup energy
**Best For**: Startup pitches, marketing decks, creative agency presentations, product launches

Unapologetically loud design that breaks polish conventions on purpose. Thick black borders, hard-offset shadows with zero blur, and high-contrast color blocks create a sense of urgency and confidence. The "roughness" is intentional and systematic.

---

## Signature Elements

- **Thick black borders**: 2-4pt solid black on every card and interactive element
- **Hard offset shadows**: 5-8pt offset, pure black, zero blur — the defining visual
- **High-contrast color blocks**: Bright yellow, red, or white backgrounds with black text
- **Intentional misalignment**: Slight rotation (-1 to 2deg) on select elements for raw energy
- **Monospace accent text**: Courier New or Space Mono for labels and metadata

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
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Brutal Card

```css
.brutal-card {
  background: #FFFFFF;
  border: 3pt solid #000000;
  box-shadow: 6pt 6pt 0 #000000;
  padding: 24pt 28pt;
  position: relative;
}
/* No border-radius. No blur. Hard edges only. */
```

### Brutal Card (Colored)

```css
.brutal-card-accent {
  background: #F5F500;
  border: 3pt solid #000000;
  box-shadow: 6pt 6pt 0 #000000;
  padding: 24pt 28pt;
}
```

### Hard-Offset Button / Tag

```css
.brutal-tag {
  display: inline-block;
  background: #FF3B30;
  color: #FFFFFF;
  border: 2pt solid #000000;
  box-shadow: 3pt 3pt 0 #000000;
  padding: 4pt 12pt;
  font-family: 'Courier New', 'Space Mono', monospace;
  font-size: 11pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Tilted Element

```css
.tilted {
  transform: rotate(-1.5deg);
}
.tilted-right {
  transform: rotate(1deg);
}
/* Use sparingly — max 1-2 tilted elements per slide */
```

### Hero Title

```css
h1 {
  font-size: 52pt;
  font-weight: 900;
  color: #000000;
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}
```

---

## Font Pairing

- **Title**: Arial Black / Impact / Bebas Neue, 40-56pt, weight 900, uppercase, letter-spacing -0.02em
- **Body**: Courier New / Space Mono, 13-16pt, weight 400, line-height 1.5
- **Numbers**: Arial Black, 72-96pt (reduce to 58-77pt for 720pt slide), weight 900
- **Label**: Space Mono, 10-11pt, weight 700, uppercase, letter-spacing 0.05em

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#F5F500` | Primary background — electric yellow |
| `--bg-secondary` | `#FFFFFF` | Card backgrounds, alternate slide bg |
| `--bg-elevated` | `#000000` | Inverted cards, dark blocks |
| `--text-primary` | `#000000` | All headings and body text |
| `--text-secondary` | `#333333` | Supporting text, descriptions |
| `--accent` | `#FF3B30` | Tags, highlights, call-to-action |
| `--border` | `#000000` | All borders — always pure black |

**Alternate backgrounds**: `#CCFF00` (lime), `#FF2D55` (hot pink), `#FFFFFF` (white). Rotate between slides for energy.

---

## Layout Principles

- **No grid subtlety**: Blocks are stacked, offset, or overlapping — not carefully aligned
- **Padding**: 48pt 56pt standard; can go tighter (36pt 40pt) for dense content
- **Gap**: 20-28pt between cards; irregular spacing is acceptable
- **Maximum contrast**: If background is yellow, text is black. If background is black, text is white or yellow.
- **Element overlap**: Cards or titles can intentionally overlap edges by 8-16pt
- **Hierarchy through size**: Title should be 3-4x body size minimum

---

## Avoid

- **No soft shadows** — all shadows must be hard-offset with 0 blur
- **No gradients** — flat solid colors only
- **No rounded corners** — border-radius: 0 on everything
- **No pastel colors** — only high-saturation, high-contrast colors
- **No thin borders** — minimum 2pt, preferred 3pt
- **No elegant serif fonts** — this is raw, not refined
- **No subtle layouts** — if it looks "polished", it's wrong for this pack
- **No more than 3 colors per slide** — bold but not chaotic

---

## Webfont CDN

```html
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

Note: Arial Black and Impact are system fonts. Courier New is a system font.
