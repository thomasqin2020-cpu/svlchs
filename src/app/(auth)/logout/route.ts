import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  if (supabase) await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', 'http://placeholder').toString(), { status: 303 })
}

// Allow GET for convenience link from nav.
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  if (supabase) await supabase.auth.signOut()
  const url = new URL(request.url)
  return NextResponse.redirect(`${url.origin}/`)
}
