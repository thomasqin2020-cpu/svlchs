import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './supabase/server'
import type { Member } from '@/types/content'

/**
 * Returns the currently signed-in member's profile row, or null.
 * Returns null if Supabase isn't configured (allows public site to render).
 *
 * Uses `getSession()` (cookie-only, no Supabase API call) instead of
 * `getUser()` on purpose. The proxy at src/proxy.ts is routing-only and does
 * NOT call `getUser()` (an earlier version did, and kept rotating the refresh
 * token on every request — for password sessions that deleted the cookies and
 * signed the user out a render later). Because getSession() only reads the
 * cookie and does not verify it against Supabase, the real authorization
 * backstop is the RLS-protected `members` query below: a forged/expired cookie
 * yields no row (or an RLS denial) and getCurrentMember returns null. Do not
 * remove that query or treat a present session cookie as proof of membership.
 */
export async function getCurrentMember(): Promise<Member | null> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data, error } = await supabase
    .from('members')
    .select('id, email, full_name, grade, school_year, role')
    .eq('id', session.user.id)
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    grade: data.grade,
    schoolYear: data.school_year,
    role: data.role as 'member' | 'admin',
  }
}

/** Redirects to /login if not signed in. Returns the member. */
export async function requireMember(): Promise<Member> {
  const member = await getCurrentMember()
  if (!member) redirect('/login?next=/')
  return member
}

/** Redirects to / if not an admin. Returns the member. */
export async function requireAdmin(): Promise<Member> {
  const member = await getCurrentMember()
  if (!member) redirect('/login?next=/admin')
  if (member.role !== 'admin') redirect('/')
  return member
}
