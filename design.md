# YT Playlist Cal — Design System & UI/UX Specification

## 1. Overview & Philosophy

**YT Playlist Cal** is designed with a **Vercel-inspired aesthetic**: minimal, mathematically precise, developer-friendly, trustworthy, and fast. The interface prioritizes high information density with ample negative space, clear visual hierarchy, accessible contrast, and zero layout shift.

- **Framework**: Astro 7 + Tailwind CSS v4 (`@tailwindcss/vite`).
- **Mode**: Native dual-theme (Light & Dark) with flash-free initialization.
- **Rendering**: Static server-rendered HTML shells with vanilla TypeScript client enhancements.

---

## 2. Color Palette

All colors are exposed as CSS custom variables in `src/styles/global.css` under the `@theme` directive and dynamically overridden in `:root.dark`.

### Surface & Neutral Tiers

| Token | Light Theme | Dark Theme (`:root.dark`) | Usage |
| :--- | :--- | :--- | :--- |
| `--color-bg` | `#fafafa` | `#09090b` | Application background |
| `--color-surface` | `#ffffff` | `#18181b` | Primary card / container surface |
| `--color-surface-2` | `#f4f4f5` | `#27272a` | Secondary card, input background, pill badges |
| `--color-surface-3` | `#e4e4e7` | `#3f3f46` | Tertiary surface, hover states, button chips |
| `--color-border` | `#e4e4e7` | `#3f3f46` | Subtle structural borders |
| `--color-border-strong`| `#d4d4d8` | `#52525b` | Emphasized borders, active input borders |

### Typography & Text Tiers

| Token | Light Theme | Dark Theme (`:root.dark`) | Usage |
| :--- | :--- | :--- | :--- |
| `--color-text` | `#09090b` | `#fafafa` | Primary headings, strong emphasis, main body text |
| `--color-text-2` | `#3f3f46` | `#d4d4d8` | Secondary body text, sub-labels |
| `--color-text-muted` | `#71717a` | `#a1a1aa` | Explanatory text, table secondary headers, breadcrumbs |
| `--color-text-subtle` | `#a1a1aa` | `#71717a` | Placeholder text, timestamps, copyright disclaimers |

### Accent Colors

| Token | Light Theme | Dark Theme (`:root.dark`) | Usage |
| :--- | :--- | :--- | :--- |
| `--color-accent` | `#e11d48` (Rose 600) | `#e11d48` | Brand accent, active play indicator, selection |
| `--color-accent-hover`| `#be123c` (Rose 700) | `#be123c` | Hover state for accent buttons and links |
| `--color-accent-soft` | `#fff1f2` (Rose 50) | `#1c0a0f` | Highlight badges, active feature card background |

### Status & Feedback Tokens

| Semantic Role | Main Token | Soft Background Token (Light / Dark) |
| :--- | :--- | :--- |
| **Success** | `--color-success`: `#16a34a` | `--color-success-soft`: `#f0fdf4` / `#052e16` |
| **Warning** | `--color-warning`: `#ca8a04` | `--color-warning-soft`: `#fefce8` / `#1c1400` |
| **Error** | `--color-error`: `#dc2626` | `--color-error-soft`: `#fef2f2` / `#1c0505` |
| **Info** | `--color-info`: `#2563eb` | `--color-info-soft`: `#eff6ff` / `#0a1628` |

---

## 3. Typography System

Typography is loaded via Bunny Fonts for full privacy compliance (GDPR-safe, zero IP tracking).

### Font Families
- **Sans-Serif (`--font-sans`)**: `'Inter', ui-sans-serif, system-ui, sans-serif`
  - Body copy, navigation, headers, button labels.
  - Features high legibility, clean geometric numerals, and neutral letterforms.
- **Monospace (`--font-mono`)**: `'JetBrains Mono', 'Fira Code', ui-monospace, monospace`
  - Durations (e.g. `12h 45m 10s`), video timestamps, raw YouTube URLs, playlist IDs.

### Type Scale & Hierarchy
- **Hero Title (`h1`)**: `text-3xl` to `text-4xl` (30px–36px), `font-bold`, `letter-spacing: -0.03em`.
- **Section Heading (`h2`)**: `text-xl` to `text-2xl` (20px–24px), `font-semibold` / `font-bold`, `letter-spacing: -0.02em`.
- **Card / Subsection Heading (`h3`)**: `text-sm` to `text-base` (14px–16px), `font-semibold`.
- **Body Regular**: `text-sm` (14px), `leading-relaxed` (1.625), `--color-text-muted`.
- **Small / Metadata**: `text-xs` (12px), `font-medium`, `--color-text-subtle`.
- **Data & Numbers**: `text-sm font-mono`, `letter-spacing: -0.01em`.

---

## 4. Spacing System (8px Base Grid)

The layout adheres strictly to an 8px modular spacing rhythm:

| Token | Dimension | Common Use |
| :--- | :--- | :--- |
| `--spacing-1` | `4px` | Fine inline gaps, tight badge padding |
| `--spacing-2` | `8px` | Icon-to-label spacing, compact margins |
| `--spacing-3` | `12px` | Card internal padding (mobile), pill padding |
| `--spacing-4` | `16px` | Standard element gaps, input vertical padding |
| `--spacing-5` | `20px` | Section sub-gaps, card padding |
| `--spacing-6` | `24px` | Standard component padding, container margins |
| `--spacing-8` | `32px` | Grid column spacing, section vertical spacing |
| `--spacing-10` | `40px` | Card container separation |
| `--spacing-12` | `48px` | Major section margins |
| `--spacing-16` | `64px` | Page segment top/bottom margins |
| `--spacing-20` | `80px` | Large footer / hero section top margins |

---

## 5. Border Radius & Shadows

### Border Radius
- `--radius-xs`: `4px` (Tags, small code chips)
- `--radius-sm`: `6px` (Speed presets, theme toggles, compact buttons)
- `--radius-md`: `8px` (Inputs, textareas, standard action buttons)
- `--radius-lg`: `12px` (Cards, dialog containers, result panels)
- `--radius-xl`: `16px` (Feature cards, hero wrapper)
- `--radius-2xl`: `20px` (Special pill badges)
- Full / Circular: `rounded-full` (Persona chips, indicator dots)

### Elevation & Shadows
- `--shadow-xs`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- `--shadow-sm`: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
- `--shadow-md`: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`

---

## 6. Motion & Transitions

Subtle and performant transition timings:
- `--duration-fast`: `100ms` (Color switches, active states)
- `--duration-base`: `150ms` (Hover scaling, border transitions)
- `--duration-slow`: `200ms` (Drawer slide-outs, accordion expansions)
- `--ease-default`: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Reduced Motion**: Automatically disables animations and sets durations to `0.01ms` when `prefers-reduced-motion: reduce` is detected.

---

## 7. Layout Containers & Breakpoints

### Maximum Widths
- **Full Container (`.container`)**: Max `1280px`, centered with `1rem` (mobile), `1.5rem` (tablet), `2rem` (desktop) horizontal padding.
- **Reading / Legal Width (`.content-width`)**: Max `720px`, centered. Used for About, Privacy, Terms, Disclaimer, FAQ.
- **Calculator Form Width (`.calculator-width`)**: Max `640px`, centered. Focused tool viewport.

### Breakpoints
- **Mobile (`< 640px`)**: Single column, full-width inputs, collapsible navigation drawer.
- **Tablet (`sm: 640px`)**: 2-column feature grids, inline mode switchers.
- **Desktop (`md: 768px`)**: Sticky desktop navigation bar with horizontal links.
- **Large Desktop (`lg: 1024px`)**: 4-column feature matrix, expanded sitemap footer grid.

---

## 8. Component Design Standards

### Navigation (`Header.astro`)
- Sticky top bar with `backdrop-filter: blur(12px)`.
- Brand logo ("Chrono Play") with subtle hover micro-interaction (`group-hover:scale-110`).
- Active link styling with `--color-surface-2` pill background.
- Clean sun/moon theme switcher.

### Buttons & Interactive Controls
- **Primary Calculate Button**: High contrast (`background-color: var(--color-text)`, `color: var(--color-bg)`), 14px semi-bold, 44px minimum height.
- **Secondary Buttons**: Neutral background (`--color-surface-2`), 1px solid border (`--color-border`), text `--color-text`.
- **Keyboard Navigation**: `:focus-visible` ring with `2px solid var(--color-text)` and `2px` offset.
- **Keyboard Shortcuts**:
  - `Enter` in URL or parameter inputs triggers immediate calculation without duplicate submissions.
  - `Escape` in URL or parameter inputs clears the field and resets state.
  - `Escape` closes the mobile navigation drawer.

### Brand Identity & Iconography
- **Official Brand Mark (`BrandLogo.astro`)**: "Chrono Play" — circular dark slate background (`#1F2937` to `#111827`), red progress dial arc (`#FF6B5E` to `#FF3030`), and solid white play button triangle.
- **UI Icons (`Icon.astro`)**: Crisp, server-rendered Lucide SVG icons inheriting `currentColor` with standard `1.85` stroke width. Zero client JavaScript footprint.

