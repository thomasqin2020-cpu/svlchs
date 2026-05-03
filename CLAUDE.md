# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Website for the Spartan Vanguard math club at La Cañada High School.
- **GitHub:** https://github.com/thomasqin2020-cpu/svlchs
- **Live:** Vercel deployment of `svlchs` repo (planned custom domain: svlchs.com)
- **School year:** 2026–2027

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
- **Supabase** as Postgres + Auth + Storage backend (`@supabase/ssr` for SSR cookies)
- **Stripe Checkout** for one-time donations
- **Resend** for transactional email
- `ics` package for the iCal feed at `/events.ics`
- Deployed on Vercel, auto-deploys on push to main
- Path alias: `@/*` maps to `./src/*`

## Architecture

### Public single-page scroll + new full-page features

The marketing site at `/` is still a **single-page scroll** with anchor navigation in `src/components/spartan-vanguard.tsx`. Sub-routes (`/competitions`, `/resources`, `/vmt`, `/aleph`) `redirect()` to `/#section`.

On top of that, the new pages are full Next.js routes:

| Route | Purpose |
|---|---|
| `/` | Marketing single-page scroll (Server Component fetches Supabase, passes to Client Component) |
| `/signup` | Member sign-up gated by Classroom code, then magic link |
| `/login` | Magic-link login for existing members |
| `/auth/callback` | Magic-link exchange handler |
| `/logout` | Clears session |
| `/contact` | Public contact form |
| `/competitions/vmt/register`, `/competitions/aleph/register` | Comp registration forms |
| `/donate`, `/donate/success`, `/donate/cancel` | Stripe Checkout donation flow |
| `/api/donate/webhook` | Stripe webhook → inserts row into `donations` |
| `/admin`, `/admin/announcements`, `/admin/events`, `/admin/officers`, `/admin/donations`, `/admin/membership-signups`, `/admin/competition-registrations`, `/admin/contact-submissions`, `/admin/site-config` | Admin dashboard (gated by `requireAdmin()` in layout) |
| `/admin/donations/export.csv`, `/admin/competition-registrations/export.csv` | CSV exports |
| `/events.ics` | Public iCal feed of upcoming events |

### Data Flow

```
Supabase (Postgres + Auth + Storage)
  ↓
src/lib/supabase/{server,client,admin}.ts   (env-aware clients)
  ↓
src/lib/data.ts                             (fetchAnnouncements/Events/Officers/Config — falls back to hardcoded data)
  ↓
src/app/page.tsx (Server Component)
  ↓
src/components/spartan-vanguard.tsx (Client Component)
```

- **`src/lib/supabase/server.ts`** — `@supabase/ssr` server client, returns `null` if env missing.
- **`src/lib/supabase/client.ts`** — browser client (Client Components only).
- **`src/lib/supabase/admin.ts`** — service-role client. **NEVER** import in Client Components or expose `SUPABASE_SERVICE_ROLE_KEY`. Used by Stripe webhook to bypass RLS.
- **`src/lib/data.ts`** — public-site data layer. Same export names as before (`fetchAnnouncements`, `fetchEvents`, `fetchOfficers`, `fetchConfig`, `fetchEventByName`). Falls back to hardcoded data if Supabase env isn't set yet.
- **`src/lib/auth.ts`** — `getCurrentMember`, `requireMember`, `requireAdmin`.
- **`src/lib/email.ts`** — Resend wrapper + HTML email templates (membership ack/notify, comp registration, contact, welcome, donation thanks).
- **`src/lib/stripe.ts`** — server Stripe client, `SUGGESTED_AMOUNTS_USD`, donation min/max caps.
- **`src/proxy.ts`** — Next.js 16 Proxy (replaces deprecated `middleware.ts`). Refreshes Supabase auth on every request.
- **`src/types/content.ts`** — TypeScript interfaces: `Announcement` (now with `membersOnly`), `Event`, `Officer` (now with `photoUrl`, `schoolYear`), `SiteConfig`, `Member`.

### Main marketing component

**`src/components/spartan-vanguard.tsx`** — large `'use client'` component (~800 lines) that renders the public single-page scroll with brand bar, dock nav, marquee, 6 sections, footer.

Scroll behavior:
- IntersectionObserver — `[data-reveal]` fade+blur animations
- Scroll spy — rAF-throttled scroll listener updates the dock nav pill
- Auto-reveal — `useEffect` adds `reveal` class + `data-reveal="up"` to page-section children

### CSS Design System

`globals.css` uses **plain CSS custom properties** (not Tailwind utilities). Apple-inspired dark theme.

Key class families:
- **Nav:** `.nav`, `.nav-right`, `.nav-pill`, `.nav-link`, `.brand-bar` — liquid glass dock
- **Layout:** `.hero`, `.tiles` (12-col grid), `.officers-section`, `.comp-list`, `.res-wrap`
- **Tiles:** `.tile`, `.col-6`/`.col-12`, `.dark`, `.gold-bg`, `.tile-title`, `.tile-desc`, `.tile-ctas`
- **Typography:** `.h2` (section headings — `<div>` not `<h2>`), `.h2-sub`, `.hero-sub`
- **Buttons:** `.pill`, `.pill.ghost`, `.link-cta`
- **Animations:** `.reveal`/`.in` (scroll fade+blur), `@keyframes titleDrop`, `@keyframes pillSettle`, `@keyframes marquee`
- **Auth:** `.auth-shell`, `.auth-card`, `.auth-form`, `.auth-field`, `.auth-message.ok|.err`, `.auth-footnote` (added for /signup, /login)
- **Admin:** `.admin-shell`, `.admin-sidebar`, `.admin-nav-link`, `.admin-main`, `.admin-h1`, `.admin-card`, `.admin-table`, `.admin-tag.gold|blue|green|red`, `.admin-stat`, `.admin-grid` (added for /admin/*)
- **Public forms:** `.public-form-shell`, `.donate-amounts`, `.donate-amount` (for /contact, /donate, /competitions/[slug]/register)

CSS variables: `--bg`, `--fg`, `--fg-muted`, `--accent` (#2997ff), `--gold` (#b08d3a), `--radius-lg`/`md`/`sm`, `--sans`/`--display`/`--mono`.

### Fonts

Inter + Inter Tight + JetBrains Mono via `next/font/google` in `layout.tsx`. CSS variables `--font-inter`, `--font-inter-tight`, `--font-jetbrains-mono`.

## Design Rules

- Dark background (`#000000`) with Apple-inspired styling. Gold accent (`#b08d3a`) for Spartan branding.
- Blue accent (`#2997ff`) for links and CTAs.
- No stock photos. SVG crest with math symbols (π, θ, Σ, etc.) as the logo.
- All section headings end with a period: "Announcements.", "Meeting Schedule.", etc.
- CSS class names in `spartan-vanguard.tsx` MUST match `globals.css` exactly — the design was prototyped in raw HTML/CSS and translated to React.
- The Apr 2026 "cinematic" redesign (commit `0433bba`) was reverted — do NOT add scroll progress bars, hero character stagger, math constellation, 3D card tilt, magnetic nav pill, gold dividers, shine sweep, or `#F8FBF8` color swap. The current style is `c02bfb1` baseline.

## Supabase backend

All content (announcements, events, officers, site config) lives in Supabase. RLS is enabled on every table. See `docs/SUPABASE_SETUP.md` for full setup steps and `supabase/migrations/0001_init.sql` for the schema.

| Table | Notes |
|---|---|
| `announcements` | `members_only` flag → RLS hides from anon |
| `events` | Auto-publish via `date >= today` filter in data layer |
| `officers` | `photo_url` (nullable, Supabase Storage), `school_year` |
| `site_config` | Key/value bag — replaces hardcoded fallbacks |
| `members` | Extends `auth.users`, has `role` (`member` / `admin`) |
| `donations` | Written only by Stripe webhook (service role) |
| `membership_signups` / `competition_registrations` / `contact_submissions` | Public anon insert, admin read |
| `allowed_classroom_codes` | Gates `/signup`. Seeded with `hsx4c54`. |
| `announcement_subscribers` | Email digest opt-in |

**Helper:** `is_admin()` SQL function used in RLS policies — checks `members.role = 'admin'` for `auth.uid()`.

### Content vs Code Changes

- **Content (no code):** Sign in to `/admin` and use the dashboard. Changes appear immediately (server actions call `revalidatePath('/')`).
- **Code (new features/design):** Edit locally, test with `npm run dev`, push to GitHub for auto-deploy.

### Promoting yourself to admin

After your first `/signup`:
```sql
update public.members set role = 'admin' where email = 'your-email@example.com';
```

## Required env vars

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL="Spartan Vanguard <hello@svlchs.com>"
OFFICER_NOTIFICATION_EMAIL=officers@svlchs.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # or production URL
```

If env is missing, the app degrades gracefully: public site renders with hardcoded fallbacks, /signup says "Sign-up is not configured yet", `/donate` says "Donations are not configured yet". No crashes.

## Known Gotchas

- Vercel Framework Preset MUST be "Next.js" (not "Other") or the site will 404 even though the build succeeds.
- CSS class names are from a raw HTML prototype — do NOT rename them. The design uses specific classes like `col-6`, `dark`, `gold-bg`, `pill ghost`, `officers-section`, `comp-row`, `arch-row` etc. that must match exactly between `globals.css` and `spartan-vanguard.tsx`.
- The `reveal` animation system requires BOTH the `reveal` class AND the `data-reveal` attribute. Missing either one breaks the scroll animations.
- `<main id="app">` (not `app-main`) — the CSS targets `#app`.
- Section headings use `<div className="h2">` (not `<h2>` elements) to match the design's CSS.
- **Next.js 16:** the file convention is `proxy.ts` not `middleware.ts`, and the export must be `export function proxy()` not `middleware()`.
- **Supabase env-missing fallback:** `createSupabaseServerClient()` returns `null` when env vars are absent. Always check before calling `.from()` / `.auth.*`.
- **Stripe webhook:** runs server-only, uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS. Never expose that key to the browser.
- **Auth redirect URLs:** Supabase requires you to whitelist `*/auth/callback` URLs in dashboard before magic links work.

## Unused Legacy Files

These files are from the old multi-page architecture and are no longer used by the active page:
- `src/components/ui/hero-section-2.tsx` — old home page component
- `src/components/ui/page-shell.tsx` — old shared nav/footer wrapper
- `src/components/ui/animated-group.tsx` — old animation wrapper
- `src/components/ui/button.tsx` — old shadcn button

## Club Info

- Join: `/signup` (uses Google Classroom code `hsx4c54`); legacy: Remind `@lchssv`
- Donate: `/donate` (Stripe Checkout); legacy GoFundMe link is removed
- Competitions hosted: VMT (middle school, Feb), Aleph (high school, March)
