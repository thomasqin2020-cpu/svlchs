import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client. Use in:
 *  - Server Components
 *  - Server Actions
 *  - Route handlers
 *
 * It reads/writes auth cookies via Next.js `cookies()` so sessions persist.
 * Returns null if env vars aren't configured (allows fallback paths).
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Components can't set cookies; ignored if middleware refreshes them.
        }
      },
    },
  })
}
