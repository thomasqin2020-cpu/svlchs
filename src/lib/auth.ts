import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from './supabase/server'
import type { Member } from '@/types/content'

/**
 * Returns the currently signed-in member's profile row, or null.
 * Returns null if Supabase isn't configured (allows public site to render).
 */
export async function getCurrentMember(): Promise<Member | null> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('members')
    .select('id, email, full_name, grade, school_year, role')
    .eq('id', user.id)
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
