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
export async function proxy(request: NextRequest) {
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
