# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Website for the Spartan Vanguard math club at La Cañada High School.
- **Live:** https://spartan-vanguard-next.vercel.app (planned move to svlchs.org)
- **GitHub:** https://github.com/thomasqin2020-cpu/spartan-vanguard-next
- **School year:** 2025–2026

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint (flat config, eslint.config.mjs)
```

## Tech Stack

- Next.js 16 (App Router), TypeScript, React 19
- Tailwind CSS v4 (`@import "tailwindcss"` in globals.css) + plain CSS custom properties (no `@theme inline`)
- Custom CSS design system in `globals.css` — all component styles are vanilla CSS, not Tailwind utilities
- Notion API as headless CMS with ISR (`revalidate = 60`)
- Deployed on Vercel, auto-deploys on push to main
- Path alias: `@/*` maps to `./src/*`

## Architecture

### Single-Page Scroll

The site is a **single-page scroll** with anchor navigation. There are no separate route pages — sub-routes (`/competitions`, `/resources`, `/vmt`, `/aleph`) all `redirect()` to `/#section`.

```
page.tsx (Server Component) → fetches all Notion data → passes to SpartanVanguard client component
```

### Data Flow

```
Notion databases → src/lib/notion.ts → src/lib/data.ts → page.tsx → SpartanVanguard
                   (raw API client)    (fallbacks + error handling)    (single client component)
```

- **`src/lib/notion.ts`** — Notion SDK client. Exports `getAnnouncements`, `getEvents`, `getOfficers`, `getSiteConfig`, `getEventByName`. All queries filter by `Published: true`.
- **`src/lib/data.ts`** — Wraps each Notion function in try/catch with hardcoded fallback data. If `NOTION_API_KEY` is unset, returns fallbacks directly.
- **`src/types/content.ts`** — TypeScript interfaces: `Announcement`, `Event`, `Officer`, `SiteConfig`.

### Main Component

**`src/components/spartan-vanguard.tsx`** — The entire UI lives here. This is a large `'use client'` component (~800 lines) that renders:

- **Brand bar** — floating glass pill top-left ("SV Spartan Vanguard")
- **Bottom dock nav** — macOS-style liquid glass navigation at bottom center with scroll-spy active states and animated pill indicator
- **Marquee band** — scrolling announcement ticker at top
- **6 sections** (Home, Competitions, Resources, VMT, Aleph, Team) rendered as one long scrolling page with `<section id="..." className="page-section">`
- **Footer** — 4-column Apple-style footer

Scroll behavior is handled by:
- **IntersectionObserver** — adds/removes `in` class on `[data-reveal]` elements for bidirectional fade+blur animations
- **Scroll spy** — `requestAnimationFrame`-throttled listener tracking which section is in viewport, updating the dock nav pill
- **Auto-reveal** — `useEffect` replicating the design's `mountAll()` logic: auto-adds `reveal` class and `data-reveal="up"` to every page-section child that doesn't already have them

### CSS Design System

`globals.css` uses **plain CSS custom properties** (not Tailwind utilities) with an Apple-inspired dark theme. Key class families:

- **Nav:** `.nav`, `.nav-right`, `.nav-pill`, `.nav-link`, `.brand-bar` — liquid glass dock
- **Layout:** `.hero`, `.tiles` (12-col grid), `.officers-section`, `.comp-list`, `.res-wrap`
- **Tiles:** `.tile`, `.col-6`/`.col-12`, `.dark`, `.gold-bg`, `.tile-title`, `.tile-desc`, `.tile-ctas`
- **Typography:** `.h2` (section headings — uses `<div>` not `<h2>`), `.h2-sub`, `.hero-sub`
- **Buttons:** `.pill`, `.pill.ghost`, `.link-cta`
- **Animations:** `.reveal`/`.in` (scroll fade+blur), `@keyframes titleDrop`, `@keyframes pillSettle`, `@keyframes marquee`

CSS variables: `--bg`, `--fg`, `--fg-muted`, `--accent` (#2997ff), `--gold` (#b08d3a), `--radius-lg`/`md`/`sm`, `--sans`/`--display`/`--mono`.

### Fonts

Inter + Inter Tight + JetBrains Mono via `next/font/google` in `layout.tsx`. Exposed as CSS variables `--font-inter`, `--font-inter-tight`, `--font-jetbrains-mono`.

## Design Rules

- Dark background (`#000000`) with Apple-inspired styling. Gold accent (`#b08d3a`) for Spartan branding.
- Blue accent (`#2997ff`) for links and CTAs.
- No stock photos. SVG crest with math symbols (π, θ, Σ, etc.) as the logo.
- All section headings end with a period: "Announcements.", "Meeting Schedule.", etc.
- CSS class names in the component MUST match globals.css exactly — the design was prototyped in raw HTML/CSS and translated to React.

## Notion CMS

Four databases, each with a "Published" checkbox:

| Database | Env Variable | Content |
|----------|-------------|---------|
| SV Announcements | `NOTION_ANNOUNCEMENTS_DB` | Homepage announcements |
| SV Events | `NOTION_EVENTS_DB` | Competitions and meetings |
| SV Officers | `NOTION_OFFICERS_DB` | Team roster |
| SV Site Config | `NOTION_CONFIG_DB` | Key-value site settings |

Env vars go in `.env.local` (locally) and Vercel Environment Variables (production).
Variable names must be exact: `NOTION_API_KEY`, `NOTION_ANNOUNCEMENTS_DB`, `NOTION_EVENTS_DB`, `NOTION_OFFICERS_DB`, `NOTION_CONFIG_DB`.

### Content vs Code Changes

- **Content (no code):** Edit Notion databases directly. Changes appear within 60 seconds (ISR).
- **Code (new features/design):** Edit locally, test with `npm run dev`, push to GitHub for auto-deploy.

## Known Gotchas

- Vercel Framework Preset MUST be "Next.js" (not "Other") or the site will 404 even though the build succeeds.
- Env var name is `NOTION_API_KEY`, not `NOTION_API`.
- CSS class names are from a raw HTML prototype — do NOT rename them. The design uses specific classes like `col-6`, `dark`, `gold-bg`, `pill ghost`, `officers-section`, `comp-row`, `arch-row` etc. that must match exactly between `globals.css` and `spartan-vanguard.tsx`.
- The `reveal` animation system requires BOTH the `reveal` class AND the `data-reveal` attribute. Missing either one breaks the scroll animations.
- `<main id="app">` (not `app-main`) — the CSS targets `#app`.
- Section headings use `<div className="h2">` (not `<h2>` elements) to match the design's CSS.

## Unused Legacy Files

These files are from the old multi-page architecture and are no longer used by the active page:
- `src/components/ui/hero-section-2.tsx` — old home page component
- `src/components/ui/page-shell.tsx` — old shared nav/footer wrapper
- `src/components/ui/animated-group.tsx` — old animation wrapper
- `src/components/ui/button.tsx` — old shadcn button

## Club Info

- Join: Google Classroom code `hsx4c54`, Remind `@lchssv`
- GoFundMe: https://gofund.me/70f62d73d
- Competitions hosted: VMT (middle school, Feb), Aleph (high school, March)
