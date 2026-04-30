import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Refreshes the Supabase auth session on every request so server components
 * see fresh `auth.getUser()`. Required by @supabase/ssr.
 *
 * If env vars aren't configured yet, passes the request through unchanged.
 *
 * IMPORTANT contract from @supabase/ssr: don't run any code between
 * createServerClient and supabase.auth.getUser(). Doing so can cause users
 * to be randomly logged out.
 */
// Vercel auto-aliases the deployment under both the short and long forms; the
// Supabase dashboard's Site URL points at the long one, so magic-link redirects
// land there. We bounce them to the canonical short host so cookies are scoped
// to a single hostname (cookies on `*-projects.vercel.app` don't reach `*.vercel.app`).
const LEGACY_LONG_HOST = 'svlchs-thomasqin2020-cpus-projects.vercel.app'
const CANONICAL_HOST = 'svlchs.vercel.app'

export async function proxy(request: NextRequest) {
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

  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return response

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Mutate the in-flight request so the rest of this proxy run sees
        // the refreshed cookies, then rebuild the response and write the
        // cookies onto it with their original options (path/maxAge/etc).
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options }),
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // DO NOT add code between createServerClient above and getUser below — see
  // the contract above.
  await supabase.auth.getUser()

  return response
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
