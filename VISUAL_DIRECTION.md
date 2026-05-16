# VISUAL_DIRECTION.md

## Design Philosophy

Loreweaver is a **living narrative archive** — an intelligent codex where worlds, characters, and memories converge. The interface should feel like opening an ancient illuminated manuscript that happens to be powered by modern AI.

**Core feeling:**
```
intelligent    — every element has purpose
immersive    — the interface becomes the world
mysterious   — depth without clutter
restrained   — confidence through subtraction
readable     — content always comes first
premium      — craft evident in every pixel
```

**Not:**
- generic SaaS dashboards
- Tailwind starter templates
- Discord clones
- cyberpunk neon overload
- analytics soup

**Inspirations:**
- Obsidian (deep archival darkness, intentional hierarchy)
- Disco Elysium (text as art, atmospheric panels)
- Illuminated manuscripts (gold accents on dark parchment)
- SCP Foundation archives (clinical yet mysterious)
- Premium terminal/devtools (clarity, precision, restraint)

---

## Color Palette

### Base (Dark Archival)

| Token | Hex | Usage |
|---|---|---|
| `void` | `#0A0B0F` | Deepest background, the "page" |
| `depth` | `#111318` | Elevated surfaces, sidebar |
| `surface` | `#181A21` | Cards, panels, input backgrounds |
| `ridge` | `#22242D` | Borders, dividers, subtle separation |
| `shingle` | `#2D303A` | Hover states, active borders |

### Text

| Token | Hex | Usage |
|---|---|---|
| `parchment` | `#E8E4DC` | Primary text, headings |
| `ash` | `#A8A29E` | Secondary text, labels |
| `dust` | `#6B6560` | Tertiary text, placeholders, meta |
| `ghost` | `#4A4540` | Disabled, very subtle |

### Accents (Restrained)

| Token | Hex | Usage |
|---|---|---|
| `gold` | `#C9A96E` | Primary accent, active states, key actions |
| `sage` | `#5A7A6A` | Secondary accent, success, health |
| `ember` | `#8B5A3C` | Warnings, heat, significance |
| `silver` | `#8A8F98` | Neutral accent, metadata |
| `mist` | `#5E6B7A` | Information, calm highlights |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `trust` | `#6B8E6B` | Positive relationship scores |
| `fear` | `#8B4557` | Negative, danger, rivalry |
| `memory` | `#7B6B9A` | Memory indicators |

### Light Mode (Subdued Warm)

The light mode is intentionally subdued — a "daylight archive" rather than a bright office app:

| Token | Hex | Usage |
|---|---|---|
| `parchment-bg` | `#F5F1EA` | Background |
| `parchment-surface` | `#EDE8DF` | Cards |
| `parchment-ridge` | `#D4CFC6` | Borders |
| `ink` | `#2A2520` | Primary text |
| `soot` | `#5A554E` | Secondary text |

---

## Typography

### Font Stack

```
Body/UI:     Inter, system-ui, sans-serif
Headings:    Cormorant Garamond, Georgia, serif
Display:     Cormorant Garamond, Georgia, serif
Monospace:   JetBrains Mono, ui-monospace, monospace
```

### Scale

| Level | Size | Weight | Family | Usage |
|---|---|---|---|---|
| Display | 2.5rem (40px) | 300 | Cormorant | Page titles, hero |
| H1 | 1.875rem (30px) | 400 | Cormorant | Section headings |
| H2 | 1.5rem (24px) | 500 | Cormorant | Sub-sections |
| H3 | 1.25rem (20px) | 500 | Cormorant | Card titles |
| Body | 0.9375rem (15px) | 400 | Inter | Paragraphs |
| Small | 0.8125rem (13px) | 400 | Inter | Labels, meta |
| Tiny | 0.75rem (12px) | 500 | Inter | Badges, timestamps |
| Mono | 0.8125rem (13px) | 400 | JetBrains | Code, scores |

### Rules

- Headings use lighter weights (300-500) for elegance
- Body text minimum 15px for readability
- Labels and metadata use uppercase + tracking-widest for hierarchy
- Line height: 1.65 for body, 1.2 for headings
- Letter spacing: -0.02em on display headings for refinement

---

## Spacing System

### Rhythm

The spacing rhythm is generous. Archives need breathing room.

```
Section gap:     32px
Card gap:        20px
Inner padding:   20px
Compact pad:     12px
Micro pad:       8px
```

### Layout

- Max content width: 1200px (not 100% fill on ultrawide)
- Sidebar width: 240px
- Page horizontal padding: 32px
- No cramped card grids — prefer fewer, larger focal elements

---

## Component Philosophy

### Cards

- Minimal borders over heavy shadows: `1px solid ridge`
- No border-radius on cards (sharp archival edges) OR very subtle 6px
- Background: `surface` with subtle gradient
- Hover: border color shifts to `gold` with 0.15 opacity background change
- **Reduce card spam**: fewer cards, more direct content

### Buttons

- Primary: `gold` text on `depth` background, 1px gold border
- Secondary: `ash` text on transparent, 1px `ridge` border
- Hover: subtle background lightening, border intensifies
- No heavy shadows, no gradient fills
- Height: 40px for standard, 32px for compact

### Inputs

- Background: `surface`
- Border: 1px `ridge`, focus: `gold` glow (box-shadow)
- Placeholder: `dust`
- No inner shadows

### Selects

- Same styling as inputs
- Custom dropdown chevron in `ash`

---

## Animation Philosophy

**Allowed:**
- Subtle fade transitions (150-200ms ease-out)
- Gentle hover color shifts (150ms)
- Soft glow on focus (box-shadow transition)
- Loading: elegant shimmer or slow pulse, not frantic spinners

**Avoided:**
- Excessive motion
- Parallax
- Bouncy springs
- Neon glows
- Large transform animations

**Default transition:** `transition-all duration-200 ease-out`

---

## Layout Philosophy

### Sidebar
- Darker than main content (`depth` vs `void`)
- Elegant vertical rhythm
- Active item: gold left border + subtle background shift
- Hover: minimal, dignified

### Content Areas
- Direct content where possible (reduced card wrapping)
- Clear section separators (1px `ridge` lines, not gap alone)
- Focal points: world names, character names, lore titles should feel important

### Chat
- Conversation as the primary surface
- Sidebar context panels feel like "marginalia" in an illuminated manuscript
- Character identity clearly distinguished
- Messages feel like inscribed text, not bubbles

---

## Icon Usage

- Lucide icons, stroke-width 1.5
- Icons in `ash` or `dust` by default
- Active/important icons in `gold`
- Small icons: 16px, medium: 20px, large: 24px

---

## Empty States

- Atmospheric, not apologetic
- Icon in `dust` at 40% opacity
- Text in `ash`
- No excessive padding — proportional to context

---

## Status & Health

- Integrated into the visual language, not tacked on
- Live indicator: subtle gold pulse dot
- Simulated indicator: `dust` static dot
- Qdrant status: minimal text badge
- No bright green/red traffic lights

---

## Dark Mode (Primary)

Dark mode is the **canonical experience**. Light mode exists as a subdued alternative.

All design energy goes into making the dark mode feel:
```
premium     — like a high-end developer tool
archival    — like a dark codex
immersive   — the UI disappears, the content speaks
```

---

## Anti-Patterns

| Avoid | Replace With |
|---|---|
| Bright Tailwind slate colors | Warm archival tones |
| Heavy drop shadows | Subtle borders + depth layers |
| Gradient backgrounds | Solid layers with 1px separation |
| Rounded-2xl cards | Sharp or subtly rounded (6px) edges |
| Bright indigo primary | Muted gold |
| Tiny 14px body text | 15px minimum, generous line-height |
| Generic stat tiles | Narrative focal points with context |
| Discord-like chat bubbles | Text-centric message surfaces |
