import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Magic-link callback. Supabase appends `?code=...&next=...` after the user
 * clicks the email link. We exchange the code for a session, then upsert the
 * `members` profile row (using `full_name`/`grade` from `auth.user.user_metadata`
 * if signupAction stored them there).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=not_configured`)
  }

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
    { onConflict: 'id' }
  )

  return NextResponse.redirect(`${origin}${next}`)
}
