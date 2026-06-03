'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail, welcomeApprovedEmail } from '@/lib/email'

export async function setSignupStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')

  // Read the row first so we have name + email for the welcome email.
  const { data: row } = await supabase
    .from('membership_signups')
    .select('name, email')
    .eq('id', id)
    .single()

  // Throw if the update fails — otherwise we'd send an "approved" email and
  // re-render as success while the row never actually changed.
  const { error } = await supabase.from('membership_signups').update({ status }).eq('id', id)
  if (error) throw new Error(`Failed to update signup status: ${error.message}`)

  if (status === 'approved' && row?.email) {
    sendEmail({
      to: row.email,
      subject: "You're approved — Spartan Vanguard",
      html: welcomeApprovedEmail(row.name ?? 'there'),
    }).catch(() => {})
  }

  revalidatePath('/admin/membership-signups')
}
