import { type NextRequest, NextResponse } from 'next/server'

/**
 * Vercel auto-aliases the deployment under both the short and long forms; the
 * Supabase dashboard's Site URL points at the long one, so magic-link redirects
 * land there. We bounce them to the canonical short host so cookies are scoped
 * to a single hostname (cookies on `*-projects.vercel.app` don't reach `*.vercel.app`).
 */
const LEGACY_LONG_HOST = 'svlchs-thomasqin2020-cpus-projects.vercel.app'
const CANONICAL_HOST = 'svlchs.vercel.app'

/**
 * Routing-only proxy. Earlier this file ran `supabase.auth.getUser()` on every
 * request (the canonical @supabase/ssr middleware pattern) to refresh tokens.
 * That call routinely rewrote auth cookies even when they were still fresh, and
 * for password sessions specifically the rewrite was deleting cookies on every
 * page load — login persisted for one render and then evaporated.
 *
 * Page-level code in `src/lib/auth.ts` uses `getSession()` (cookie-only, no
 * network) which doesn't need a proxy-level refresh, so we simply preserve the
 * incoming cookies and let the SDK refresh tokens lazily when something
 * actually needs an access token.
 */
export function proxy(request: NextRequest) {
  const reqUrl = request.nextUrl

  // Hostname canonicalization. Only this exact alias — preview deployments
  // (`*-git-*`) and custom domains are untouched.
  if (reqUrl.host === LEGACY_LONG_HOST) {
    const target = new URL(reqUrl.href)
    target.host = CANONICAL_HOST
    return NextResponse.redirect(target, 308)
  }

  // Magic-link `?code=` may arrive at `/` because Supabase rewrites our
  // emailRedirectTo to its dashboard Site URL (which is just the root path).
  // Forward it to the proper callback so the standard exchange runs.
  if (reqUrl.pathname === '/' && reqUrl.searchParams.has('code')) {
    const callback = new URL('/auth/callback', reqUrl.origin)
    callback.search = reqUrl.search
    return NextResponse.redirect(callback, 307)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
