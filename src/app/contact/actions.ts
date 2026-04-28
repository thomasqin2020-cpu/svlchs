'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail, notifyOfficers, contactAckEmail, contactNotifyEmail } from '@/lib/email'

export interface ContactResult {
  ok: boolean
  message: string
}

export async function submitContact(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const message = String(formData.get('message') ?? '').trim()

  if (!name || !email || !message) {
    return { ok: false, message: 'Please fill in name, email, and a message.' }
  }
  if (!email.includes('@')) {
    return { ok: false, message: 'That email looks invalid.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Contact form is not configured yet. Email officers directly.' }
  }

  const { error } = await supabase.from('contact_submissions').insert({ name, email, message })
  if (error) {
    console.error('contact_submissions insert failed:', error)
    return { ok: false, message: 'Could not send your message. Please try again.' }
  }

  // Fire-and-forget acknowledgement + officer notification.
  sendEmail({
    to: email,
    subject: 'We got your message — Spartan Vanguard',
    html: contactAckEmail(name),
  }).catch(() => {})
  notifyOfficers({
    subject: `Contact form: ${name}`,
    html: contactNotifyEmail({ name, email, message }),
    replyTo: email,
  }).catch(() => {})

  return { ok: true, message: `Thanks ${name}, your message is in. Officers will reply to ${email}.` }
}
