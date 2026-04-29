import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Magic-link callback. Supabase appends `?code=...&next=...` after the user
 * clicks the email link. We exchange the code for a session and write the
 * resulting auth cookies directly onto the redirect response — bypassing
 * Next's cookies() API, which doesn't reliably propagate cookies through
 * redirect responses in all Next.js versions. Without this, sessions
 * wouldn't persist and the user had to log in every visit.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.redirect(`${origin}/login?error=not_configured`)
  }

  // Pre-build the redirect response so the Supabase SDK can write cookies
  // straight onto it. After exchange it'll be returned as-is, with the
  // auth cookies attached.
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) {
    console.error('exchangeCodeForSession failed:', error)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Upsert profile row. RLS allows the user to write their own row.
  const meta = (data.user.user_metadata ?? {}) as { full_name?: string; grade?: string }
  await supabase.from('members').upsert(
    {
      id: data.user.id,
      email: data.user.email ?? '',
      full_name: meta.full_name ?? null,
      grade: meta.grade ?? null,
    },
    { onConflict: 'id' },
  )

  return response
}
