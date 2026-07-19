# Design.md — Clinic Management System

## 1. Design Brief

A production frontend for a **doctor-only** clinic management system. The
audience is clinicians working fast between patients — often on a laptop
at a desk, sometimes on a tablet at a bedside. The UI's single job is to
get out of the way: surface the right patient/medicine/prescription data
quickly, make data entry low-friction, and never let visual noise slow
down a decision.

## 2. Design Tokens

### Color — 4–6 named values, expressed as CSS variables in `src/styles/globals.css`

| Token | Hex | Usage |
|---|---|---|
| `--color-primary-600` | `#2563eb` | Primary actions, active nav, links |
| `--color-accent-500` | `#14b8a6` | Sparse — positive/health-state accents only |
| `--color-surface` | `#ffffff` | Cards, panels, inputs |
| `--color-surface-muted` | `#f8fafc` | App background |
| `--color-text-primary` | `#0f172a` | Headings, primary text |
| `--color-danger` | `#dc2626` | Destructive actions, errors |

Rationale: blue reads as clinical/trustworthy without tipping into the
generic "corporate SaaS" blue-on-white template — it's paired with a warm
neutral gray (not pure white) background so long shifts looking at the
screen are less fatiguing, and a single teal accent is reserved for
positive/health signals (e.g. "in stock", "stable") so it stays
meaningful rather than decorative.

### Type

- **UI / body face:** Inter — a highly legible, clinical, no-nonsense
  grotesk that performs well at small sizes in dense tables (patient
  lists, medicine inventories). Loaded as `--font-sans` in
  `globals.css`; ship the variable font via a CDN link or self-hosted
  file in `assets/fonts` before production.
- **Data / tabular face:** Inter's tabular-figure feature is used for
  numeric columns (dosages, quantities, revenue) — no separate mono
  face is introduced, to avoid unnecessary typographic variety in a
  data-dense product.

### Layout concept

```
┌─────────────┬─────────────────────────────────────┐
│             │  Navbar (avatar, logout)             │
│  Sidebar    ├─────────────────────────────────────┤
│  (nav)      │  Breadcrumb                          │
│  fixed on   │  ┌─────────────────────────────────┐ │
│  mobile,    │  │  Page content (Outlet)           │ │
│  static on  │  │  cards / tables / forms          │ │
│  desktop    │  └─────────────────────────────────┘ │
│             │  Footer                              │
└─────────────┴─────────────────────────────────────┘
```

A persistent left sidebar (collapsible to an overlay on mobile) plus a
slim top navbar was chosen over a top-nav-only layout because clinicians
jump between modules (Patients → Prescriptions → Medicines) far more
than they scroll — a persistent nav minimizes clicks per context switch.

### Signature element

Rounded, softly-shadowed cards (`--radius-card: 1rem`,
`--shadow-card`) are the one consistent visual signature across every
screen — stat cards, list containers, modals, forms. It's a deliberately
calm, low-contrast treatment (soft shadow instead of hard borders) that
reads as "clinical instrument panel" rather than "generic admin
template," while staying quiet enough not to compete with patient data.

## 3. Component Visual Rules

- **Buttons:** solid primary for the one main action per screen;
  secondary (bordered, white) for everything else; danger only for
  destructive actions (delete patient, delete medicine).
- **Forms:** label above field, inline error below in `--color-danger`,
  required fields marked with a red asterisk — never color-only.
- **Tables:** zebra-free, hairline row dividers, hover highlight, sticky
  header row for long lists (Patients, Medicines).
- **Empty/Error states:** icon + one-line title + one-line description +
  optional action — never a bare "No data."
- **Motion:** Framer Motion is used only for modal enter/exit and page
  transitions — small, functional, `prefers-reduced-motion`-aware. No
  ambient/decorative animation; a clinical tool should feel stable, not
  playful.

## 4. Accessibility

- All interactive elements have visible `:focus-visible` outlines
  (`globals.css`).
- Color is never the only signal (errors pair an icon/text, not just
  red).
- Minimum tap target 40px (`h-10`) on all form controls and buttons.
- `prefers-reduced-motion` is respected globally.
- Semantic HTML: `<nav>`, `<main>`, `<table>`/`<th scope="col">`,
  `aria-current="page"` on active nav/breadcrumb items.

## 5. Responsiveness

- Sidebar collapses to a slide-in overlay below the `lg` breakpoint.
- Tables scroll horizontally on narrow viewports rather than
  reflowing/breaking.
- All spacing uses Tailwind's default scale so density stays consistent
  across breakpoints.
