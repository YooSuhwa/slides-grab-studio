# Glassmorphism Design Spec

## Identity

**Mood**: Premium, tech, futuristic
**Best For**: SaaS product decks, app launches, AI product presentations, investor pitches

Translucent frosted-glass surfaces floating over deep gradient backgrounds. The depth comes from layered semi-transparent panels with blurred backdrops, creating a sense of sophisticated dimensionality. Every element feels like it exists on a different z-plane.

---

## Signature Elements

- **Frosted-glass cards**: `backdrop-filter: blur(20px)` with white at 15-20% opacity — the defining visual
- **Blurred glow blobs**: Large soft radial gradients placed behind content to create ambient light
- **Deep gradient backgrounds**: Multi-stop gradients from deep indigo through purple to navy
- **Generous rounded corners**: 12-20pt radius on all card elements
- **Subtle luminous borders**: 1pt borders at `rgba(255,255,255,0.25)` giving cards a soft edge glow

---

## CSS Patterns

### Base Slide

```css
body {
  width: 720pt;
  height: 405pt;
  font-family: var(--font-sans);
  background: linear-gradient(135deg, #1A1A4E 0%, #6B21A8 50%, #1E3A5F 100%);
  padding: 48pt 56pt;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### Ambient Glow Blob

```css
.glow-blob {
  position: absolute;
  width: 300pt;
  height: 300pt;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(107,33,168,0.5) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.glow-blob.accent {
  background: radial-gradient(circle, rgba(103,232,249,0.3) 0%, transparent 70%);
}
```

### Glass Card

```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1pt solid rgba(255, 255, 255, 0.25);
  border-radius: 16pt;
  padding: 24pt 28pt;
  position: relative;
  z-index: 1;
}
```

### Glass Card with Inner Highlight

```css
.glass-card-highlight {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1pt solid rgba(255, 255, 255, 0.25);
  border-radius: 20pt;
  padding: 28pt 32pt;
  box-shadow:
    inset 0 1pt 0 rgba(255, 255, 255, 0.2),
    0 8pt 32pt rgba(0, 0, 0, 0.2);
}
```

### Hero Title

```css
h1 {
  font-size: 44pt;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.02em;
  line-height: 1.15;
  text-shadow: 0 2pt 12pt rgba(103, 232, 249, 0.3);
}
```

### Accent Text

```css
.accent {
  color: var(--accent);
  text-shadow: 0 0 20pt rgba(103, 232, 249, 0.4);
}
```

---

## Font Pairing

- **Title**: Segoe UI Light / Calibri Light, 36-44pt, weight 600-700 (bold), letter-spacing -0.02em
- **Body**: Segoe UI, 14-16pt, weight 400, line-height 1.6
- **KPI Numbers**: Segoe UI, 52-64pt, weight 700 (bold)
- **Caption**: Segoe UI, 10-11pt, weight 400, color `--text-secondary`

---

## Color Usage

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0F0F2D` | Solid fallback background when gradient is not used |
| `--bg-secondary` | `#1A1A4E` | Secondary panels, darker glass regions |
| `--bg-elevated` | `rgba(255,255,255,0.15)` | Glass card fill |
| `--text-primary` | `#FFFFFF` | Headings and primary text |
| `--text-secondary` | `#E0E0F0` | Body text, descriptions |
| `--accent` | `#67E8F9` | Highlights, key metrics, interactive elements |
| `--border` | `rgba(255,255,255,0.25)` | Glass card borders |

**Secondary accent**: `#A78BFA` (soft violet) for gradient text or secondary highlights.

---

## Layout Principles

- **Layered depth**: Always have at least one glow blob behind glass cards to create the frosted effect
- **Padding**: 48pt 56pt standard, 56pt 64pt for hero slides
- **Card spacing**: 16-20pt gap between glass cards
- **Content limit**: Max 3-4 cards per slide; glass effect loses impact when crowded
- **Z-ordering**: Background gradient > glow blobs > glass cards > text content
- **Vertical alignment**: Center-aligned content works best with glass aesthetic

---

## Avoid

- **No white backgrounds** — the entire identity depends on dark gradient backgrounds
- **No fully opaque cards** — cards must always be translucent with backdrop-filter
- **No bright saturated solid fills** — all color should feel diffused and glowing
- **No sharp corners** — minimum 12pt border-radius on everything
- **No heavy borders** — border max 1pt, always semi-transparent white
- **No flat design** — every slide needs depth from layered transparency
- **No dark text on dark background** — text must be white or light-tinted
- **No more than 2 glow blobs per slide** — keep it elegant, not chaotic

---

## Webfont CDN

No external webfonts required. Segoe UI and Calibri are system fonts.
Fallback stack: `'Segoe UI', 'Calibri', -apple-system, sans-serif`
