import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './supabase/server'
import type { Member } from '@/types/content'

/**
 * Returns the currently signed-in member's profile row, or null.
 * Returns null if Supabase isn't configured (allows public site to render).
 *
 * Uses `getSession()` (cookie-only, no Supabase API call) instead of
 * `getUser()` here on purpose. The proxy at src/proxy.ts already validates
 * and refreshes the session on every request via `getUser()`. If page-level
 * code also calls `getUser()`, it can race the proxy's refresh and end up
 * rotating the refresh token a second time — the new tokens it produces
 * never reach the browser (cookies()-set cookies don't propagate from a
 * server component) and the next request is signed out. Reading the
 * session from cookies here avoids that loop.
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
