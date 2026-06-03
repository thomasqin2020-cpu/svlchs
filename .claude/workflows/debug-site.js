export const meta = {
  name: 'debug-site',
  description: 'Multi-agent full-site debug: review every dimension, adversarially verify each finding, synthesize a prioritized report',
  whenToUse: 'Comprehensive correctness/quality sweep of the Spartan Vanguard site before a release or after big changes',
  phases: [
    { title: 'Review', detail: 'one agent per dimension reads the relevant code + runtime evidence and reports findings' },
    { title: 'Verify', detail: 'an independent skeptic adversarially verifies each finding (default: not a real bug)' },
    { title: 'Synthesize', detail: 'collate confirmed findings into one prioritized report' },
  ],
}

/* ------------------------------------------------------------------ *
 *  Shared context handed to every reviewer + verifier.               *
 *  Grounded in evidence already gathered live this session so the    *
 *  agents don't re-derive known facts or re-report fixed issues.     *
 * ------------------------------------------------------------------ */
const CONTEXT = `
PROJECT: "Spartan Vanguard" math-club website. Next.js 16 (App Router, Turbopack), React 19,
TypeScript, Tailwind v4 + a custom vanilla-CSS design system in src/app/globals.css (NOT utility
classes). Supabase (Postgres + Auth + Storage) via @supabase/ssr. Stripe Checkout donations.
Resend email. iCal feed via 'ics'. Deployed on Vercel. Path alias @/* -> ./src/*.

ARCHITECTURE:
- Homepage "/" is a single-page scroll. Server Component src/app/page.tsx fetches Supabase and
  passes data to the Client Component src/components/spartan-vanguard.tsx (~800 lines).
- Sub-routes /competitions /resources /vmt /aleph call redirect() to /#section.
- Real routes: /signup /login /auth/callback /logout /contact /competitions/[slug]/register
  /donate (+/success +/cancel) /api/donate/webhook /admin/* /events.ics, plus (auth)
  /forgot-password /reset-password and /api/auth/{login,signup}.
- src/lib/data.ts is the public data layer; it FALLS BACK to hardcoded data when Supabase env is absent.
- src/lib/supabase/{server,client,admin}.ts: server & client return null if env missing; admin uses the
  SERVICE ROLE key and is server-only (used by the Stripe webhook to bypass RLS).
- src/lib/auth.ts: getCurrentMember / requireMember / requireAdmin. src/proxy.ts (NOT middleware.ts;
  Next 16 renamed it) refreshes the Supabase session on every request.
- Env-missing MUST degrade gracefully (no crashes): public site renders fallbacks, /signup and /donate
  show "not configured yet".

DESIGN CONSTRAINTS — do NOT propose changes that violate these (they are deliberate):
- CSS class names in spartan-vanguard.tsx MUST match globals.css EXACTLY (design was prototyped in raw
  HTML/CSS). Never propose renaming classes like col-6, dark, gold-bg, pill ghost, officers-section.
- The Apr-2026 "cinematic" redesign was REVERTED. Do NOT propose: scroll-progress bars, hero-character
  stagger, a math "constellation", 3D card tilt, magnetic nav pill, gold dividers, shine sweep, or a
  #F8FBF8 color swap. (Some of these classes still exist in CSS as dead leftovers — that's fine to note
  but do not propose re-enabling them.)
- <main id="app"> (CSS targets #app). Section headings are <div className="h2"> ending with a period.
- The scroll-reveal system needs BOTH the "reveal" class AND a data-reveal attribute to work.

RUNTIME EVIDENCE (gathered LIVE this session via Playwright against the running dev server):
- "/" and "/donate" load with ZERO console errors/warnings. The WebGL spiral canvas is alive and animating.
- ALREADY FIXED THIS SESSION: the homepage spiral looked "frozen/black" because .home-page .bg-spiral-veil
  was too opaque and washed the (correctly animating) shader to near-black. The veil has been lightened.
  DO NOT report the spiral animation as broken — it is fixed and verified.
- "tsc --noEmit" on real source: CLEAN (0 type errors).
- "eslint src": 2 real errors (react-hooks/set-state-in-effect at src/app/(auth)/login/login-form.tsx:46
  and src/app/(auth)/signup/signup-form.tsx:46) and 1 warning (<img> in the LEGACY unused file
  src/components/ui/hero-section-2.tsx). ESLint also emits hundreds of false errors from stale
  .claude/worktrees/*/.next/ build chunks — an eslint-ignore gap, not real source bugs.

YOUR JOB: find REAL bugs and concrete correctness / security / UX issues a user or admin would actually hit.
Read the actual files (use Read/Grep/Glob). For each finding give: a precise file:line, the concrete
evidence (quote the code), a severity, a SPECIFIC fix, and a confidence 0..1. Prefer a few high-confidence
findings over speculation. Do NOT report: pure style nitpicks, the already-fixed spiral, things that
violate the design constraints above, or issues only in .claude/worktrees/ or generated .next output.
If a dimension is clean, return an empty findings array — that is a valid and useful result.
`.trim()

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['dimension', 'findings'],
  properties: {
    dimension: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'severity', 'file', 'description', 'suggestedFix', 'confidence'],
        properties: {
          title: { type: 'string', description: 'short imperative summary of the bug' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          file: { type: 'string', description: 'path, ideally file:line' },
          line: { type: 'string', description: 'line number(s) if known, else empty' },
          description: { type: 'string', description: 'what is wrong and why it matters; quote the code' },
          suggestedFix: { type: 'string', description: 'specific, concrete fix' },
          confidence: { type: 'number', description: '0..1 how sure you are this is a real bug' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['isReal', 'confidence', 'reason', 'adjustedSeverity'],
  properties: {
    isReal: { type: 'boolean', description: 'true only if this is a genuine bug/issue after independent inspection' },
    confidence: { type: 'number', description: '0..1' },
    reason: { type: 'string', description: 'what you checked and why you confirmed or refuted it' },
    adjustedSeverity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'none'] },
  },
}

const DIMENSIONS = [
  {
    key: 'routing-nav',
    focus: `Routing, navigation & redirects. Read src/app/page.tsx, src/app/layout.tsx,
      the redirect sub-routes (src/app/{competitions,resources,vmt,aleph}/page.tsx),
      src/app/competitions/page.tsx + [slug]/register, src/app/events.ics/route.ts, and the nav /
      scroll-spy / scrollToSection logic in src/components/spartan-vanguard.tsx.
      Look for: dead or wrong Link/href targets, anchors that don't match section ids, redirect loops,
      sub-routes that 404, missing dynamic params/notFound handling, the events.ics content-type/feed
      correctness, and Next 16 App Router misuse.`,
  },
  {
    key: 'auth-flows',
    focus: `Authentication. Read src/app/(auth)/{login,signup,forgot-password,reset-password}/* (forms +
      actions), src/app/api/auth/{login,signup}/route.ts, src/app/auth/callback/route.ts,
      src/app/(auth)/logout/route.ts, src/lib/auth.ts, src/proxy.ts.
      Look for: broken magic-link / PKCE exchange, redirect handling after auth, the Classroom-code gate
      on /signup, duplicate-signup blocking, session refresh in proxy.ts, error surfacing to the user,
      and whether requireMember/requireAdmin actually protect what they claim. The known
      set-state-in-effect lint errors are in login-form/signup-form — assess their real user impact.`,
  },
  {
    key: 'supabase-data',
    focus: `Supabase clients & data layer. Read src/lib/supabase/{server,client,admin}.ts,
      src/lib/data.ts, src/types/content.ts.
      Look for: places that call .from()/.auth.* WITHOUT first null-checking the env-missing client
      (would crash instead of degrading), the events "date >= today" publish filter, members_only
      announcement filtering vs RLS, fallback data correctness/shape mismatches vs the TS types, and any
      accidental import of the service-role admin client into client/edge code.`,
  },
  {
    key: 'stripe-donate',
    focus: `Stripe donation flow. Read src/lib/stripe.ts, src/app/donate/{page,actions,card-checkout,
      donate-client}.tsx, src/app/donate/{success,cancel}/page.tsx, src/app/api/donate/webhook/route.ts.
      Look for: webhook signature verification correctness (raw body!), donation min/max amount
      validation server-side, the donations insert via service role, idempotency / duplicate handling,
      currency/cents conversion bugs, and graceful behavior when Stripe env is missing.`,
  },
  {
    key: 'server-actions-forms',
    focus: `Server Actions & public forms. Read src/app/contact/{page,contact-form,actions}.tsx,
      src/app/competitions/[slug]/register/{page,register-form,actions}.tsx, and the membership signup
      action. Look for: missing/weak server-side validation, unhandled errors, missing revalidatePath,
      success/error states not surfaced, required fields not enforced, and any unsanitized data written
      to the DB or echoed back.`,
  },
  {
    key: 'admin-dashboard',
    focus: `Admin dashboard & exports. Read src/app/(admin)/admin/layout.tsx (the requireAdmin gate) and
      the pages/actions under src/app/(admin)/admin/* including announcements, events, officers,
      donations, membership-signups, competition-registrations, contact-submissions, site-config,
      site-layout, and the export.csv routes. Look for: any page/route/action that reads or mutates admin
      data WITHOUT an admin check, CSV-injection in exports, and data leaks to non-admins.`,
  },
  {
    key: 'css-ui-parity',
    focus: `Visual correctness & CSS. The design's rule is that class names used in JSX MUST exist in
      src/app/globals.css. Grep classNames used in src/components/spartan-vanguard.tsx and the other
      rendered components, and flag classes that are REFERENCED but NOT DEFINED in globals.css (=> broken
      styling), plus obvious layout/z-index/stacking issues, the reveal system (needs class + data-reveal),
      and responsive breakpoints. Do NOT propose renames or reverted "cinematic" features. Focus on real
      "this looks wrong / unstyled" defects a visitor would see.`,
  },
  {
    key: 'a11y-seo',
    focus: `Accessibility & SEO/metadata. Read src/app/layout.tsx and per-route metadata, plus the
      rendered markup in spartan-vanguard.tsx and form components. Look for: missing/empty page <title>/
      description/OpenGraph, missing html lang, images/SVG logos without alt/aria-hidden, form inputs
      without associated labels, buttons/links without accessible names, heading-order problems, and
      focus/keyboard traps. Report concrete, fixable items only.`,
  },
  {
    key: 'email-resend',
    focus: `Transactional email. Read src/lib/email.ts and its callers (signup, contact, comp
      registration, donation thanks). Look for: crashes/unhandled rejections when RESEND_API_KEY or
      RESEND_FROM_EMAIL is missing (must degrade, not throw), wrong/var-missing from-address, awaited vs
      fire-and-forget sends that could drop errors, and template interpolation/escaping bugs.`,
  },
  {
    key: 'config-hygiene',
    focus: `Build config & repo hygiene. Read package.json, eslint.config.mjs, tsconfig.json,
      next.config.*, src/proxy.ts, .gitignore. Look for: the ESLint ignore gap that lets it scan
      .claude/worktrees/*/.next/ generated chunks (should ignore .claude/ and/or **/.next/**), stale
      git worktrees under .claude/worktrees/ that should be removed/ignored, leftover debug artifacts at
      repo root (spiral-*.png screenshots, .playwright-mcp/), unused legacy files
      (src/components/ui/hero-section-2.tsx, page-shell.tsx, animated-group.tsx, button.tsx) still
      shipping, and any Vercel "Framework Preset" / proxy.ts misconfig risks. Practical hygiene only.`,
  },
]

const reviewPrompt = (d) => `${CONTEXT}

DIMENSION: ${d.key}
${d.focus}

Inspect the real files now and return your findings in the required schema. Empty findings is fine if clean.`

const verifyPrompt = (d, f) => `${CONTEXT}

A reviewer auditing the "${d.key}" dimension reported this finding. Act as an INDEPENDENT SKEPTIC: open
the cited file yourself and try to REFUTE it. Default to isReal=false if you cannot concretely confirm the
bug from the actual code. Confirm isReal=true ONLY if the code really exhibits the problem and a user/admin
would actually be affected. Watch for: false positives that ignore the env-missing null-guards, RLS, or the
design constraints; line numbers that don't match; "bugs" that are actually intended fallback behavior.

FINDING:
- title: ${f.title}
- severity: ${f.severity}
- file: ${f.file} ${f.line || ''}
- description: ${f.description}
- suggestedFix: ${f.suggestedFix}
- reviewer confidence: ${f.confidence}

Return your verdict in the required schema.`

/* ------------------------------------------------------------------ *
 *  Phase 1+2: pipeline — each dimension reviews, then every finding   *
 *  is adversarially verified as soon as that review lands (no barrier)*
 * ------------------------------------------------------------------ */
const perDimension = await pipeline(
  DIMENSIONS,
  (d) => agent(reviewPrompt(d), { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }),
  (review, d) => {
    const findings = (review && review.findings) ? review.findings : []
    log(`${d.key}: ${findings.length} candidate finding(s)`)
    if (!findings.length) return { dimension: d.key, findings: [] }
    return parallel(findings.map((f) => () =>
      agent(verifyPrompt(d, f), { label: `verify:${d.key}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => ({ ...f, verdict: v }))
        .catch(() => ({ ...f, verdict: { isReal: false, confidence: 0, reason: 'verifier errored', adjustedSeverity: 'none' } }))
    )).then((verified) => ({ dimension: d.key, findings: verified.filter(Boolean) }))
  }
)

// Keep only findings an independent skeptic confirmed.
const confirmed = []
const refuted = []
for (const dim of perDimension.filter(Boolean)) {
  for (const f of dim.findings) {
    const rec = { dimension: dim.dimension, ...f }
    if (f.verdict && f.verdict.isReal) confirmed.push(rec)
    else refuted.push(rec)
  }
}
log(`Confirmed ${confirmed.length} finding(s); refuted/dropped ${refuted.length}.`)

/* ------------------------------------------------------------------ *
 *  Phase 3: synthesize a single prioritized report.                  *
 * ------------------------------------------------------------------ */
const sevRank = { critical: 0, high: 1, medium: 2, low: 3, none: 4 }
confirmed.sort((a, b) => {
  const sa = sevRank[(a.verdict && a.verdict.adjustedSeverity) || a.severity] ?? 9
  const sb = sevRank[(b.verdict && b.verdict.adjustedSeverity) || b.severity] ?? 9
  return sa - sb
})

let report = null
if (confirmed.length) {
  report = await agent(
    `${CONTEXT}

You are the lead engineer writing the final debug report for the Spartan Vanguard site. Below are
findings that survived independent adversarial verification (JSON). Produce a concise, prioritized
Markdown report grouped by severity (Critical, High, Medium, Low). For each: one-line title, file:line,
why it matters in one sentence, and the concrete fix. Then a short "Quick wins" list of the cheapest
high-value fixes. Be specific and do not pad. Note that the homepage spiral was already fixed this session.

FINDINGS JSON:
${JSON.stringify(confirmed, null, 2)}`,
    { label: 'synthesize', phase: 'Synthesize' }
  )
}

return {
  confirmedCount: confirmed.length,
  refutedCount: refuted.length,
  confirmed,
  report,
}
