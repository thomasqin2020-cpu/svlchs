'use server'

import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail, notifyOfficers, membershipAckEmail, membershipNotifyEmail } from '@/lib/email'

export interface SignupResult {
  ok: boolean
  message: string
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') ?? '').trim()
  const grade = String(formData.get('grade') ?? '').trim()
  const why = String(formData.get('why_joining') ?? '').trim()

  if (!email || !fullName) {
    return { ok: false, message: 'Email and name are required.' }
  }
  if (!email.includes('@')) {
    return { ok: false, message: 'That email looks invalid.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Sign-up is not configured yet. Try again later.' }
  }

  // Log the membership signup intent (RLS allows anon insert)
  const { error: insertError } = await supabase.from('membership_signups').insert({
    name: fullName,
    grade: grade || null,
    email,
    why_joining: why || null,
  })
  if (insertError) {
    console.error('membership_signups insert failed:', insertError)
    // Non-fatal — keep going to magic link.
  } else {
    // Fire-and-forget emails (don't block on Resend errors).
    sendEmail({ to: email, subject: 'Welcome to Spartan Vanguard', html: membershipAckEmail(fullName) }).catch(() => {})
    notifyOfficers({
      subject: `New SV sign-up: ${fullName}`,
      html: membershipNotifyEmail({ name: fullName, email, grade, why }),
    }).catch(() => {})
  }

  // Build redirect URL for the magic link (uses the site's host).
  const host = (await headers()).get('host')
  const protocol = host?.startsWith('localhost') ? 'http' : 'https'
  const redirectTo = `${protocol}://${host}/auth/callback?next=/`

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      data: { full_name: fullName, grade },
    },
  })
  if (otpError) {
    console.error('signInWithOtp failed:', otpError)
    return { ok: false, message: 'Could not send magic link. Try again or contact an officer.' }
  }

  return { ok: true, message: `Check your inbox at ${email} for a sign-in link.` }
}
