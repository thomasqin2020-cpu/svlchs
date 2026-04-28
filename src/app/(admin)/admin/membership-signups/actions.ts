'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail, welcomeApprovedEmail } from '@/lib/email'

export async function setSignupStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')

  // Read the row first so we have name + email for the welcome email.
  const { data: row } = await supabase
    .from('membership_signups')
    .select('name, email')
    .eq('id', id)
    .single()

  await supabase.from('membership_signups').update({ status }).eq('id', id)

  if (status === 'approved' && row?.email) {
    sendEmail({
      to: row.email,
      subject: "You're approved — Spartan Vanguard",
      html: welcomeApprovedEmail(row.name ?? 'there'),
    }).catch(() => {})
  }

  revalidatePath('/admin/membership-signups')
}
