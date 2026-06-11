'use server'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { isValidEmail } from '@/lib/validation'

export interface SubscribeResult {
  ok: boolean
  message: string
}

/**
 * Adds an email to `announcement_subscribers`.
 *
 * That table has no anonymous-insert RLS policy (members manage their own
 * row, admins read), so this goes through the service-role client. Same
 * trust model as the Stripe webhook: the key never leaves the server, and
 * this action only ever inserts one validated email into one table.
 */
export async function subscribeToUpdates(formData: FormData): Promise<SubscribeResult> {
  // Honeypot: humans never see this field. If it has a value, a bot filled
  // it in, so pretend success and move on.
  const trap = String(formData.get('company') ?? '').trim()
  if (trap) {
    return { ok: true, message: 'You’re on the list. Watch your inbox.' }
  }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  // 254 is the RFC 5321 ceiling for a deliverable address.
  if (email.length > 254 || !isValidEmail(email)) {
    return { ok: false, message: 'That email looks invalid.' }
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return { ok: false, message: 'Updates signup isn’t configured yet.' }
  }

  const { error } = await supabase.from('announcement_subscribers').insert({ email })
  if (error) {
    // 23505 = Postgres unique_violation: this email is already subscribed.
    if (error.code === '23505') {
      return { ok: true, message: 'You’re already on the list.' }
    }
    console.error('announcement_subscribers insert failed:', error)
    return { ok: false, message: 'Could not subscribe right now. Please try again.' }
  }

  return { ok: true, message: 'You’re on the list. Watch your inbox.' }
}
