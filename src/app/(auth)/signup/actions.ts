'use server'

import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendEmail, notifyOfficers, membershipAckEmail, membershipNotifyEmail } from '@/lib/email'

export interface SignupResult {
  ok: boolean
  message: string
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const code = String(formData.get('classroom_code') ?? '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') ?? '').trim()
  const grade = String(formData.get('grade') ?? '').trim()
  const why = String(formData.get('why_joining') ?? '').trim()

  if (!email || !code || !fullName) {
    return { ok: false, message: 'Email, name, and Classroom code are required.' }
  }
  if (!email.includes('@')) {
    return { ok: false, message: 'That email looks invalid.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Sign-up is not configured yet. Try again later.' }
  }

  // Block re-signups: if this email is already a member or already has a
  // pending/approved signup, send them to /login instead of creating a
  // duplicate row. Uses the admin client because RLS keeps anonymous
  // visitors from reading other people's rows.
  const admin = createSupabaseAdminClient()
  if (admin) {
    const { data: existingMember } = await admin
      .from('members')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (existingMember) {
      return {
        ok: false,
        message: 'That email is already a Spartan Vanguard member. Log in instead.',
      }
    }
    const { data: existingSignup } = await admin
      .from('membership_signups')
      .select('id, status')
      .eq('email', email)
      .neq('status', 'rejected')
      .maybeSingle()
    if (existingSignup) {
      return {
        ok: false,
        message:
          existingSignup.status === 'approved'
            ? 'That email is already approved. Log in to access member-only content.'
            : 'You already have a pending sign-up. Check your inbox for the magic link.',
      }
    }
  }

  const { data: codeRow, error: codeError } = await supabase
    .from('allowed_classroom_codes')
    .select('code')
    .eq('code', code)
    .eq('active', true)
    .maybeSingle()

  if (codeError) {
    console.error('classroom code lookup failed:', codeError)
    return { ok: false, message: 'Could not verify that Classroom code. Try again.' }
  }
  if (!codeRow) {
    return { ok: false, message: 'That Classroom code is not valid. Ask an officer for the current code.' }
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

  // Build redirect URL for the magic link. Prefer the explicit canonical site
  // URL so we don't generate links pointing at a Vercel auto-alias that the
  // Supabase dashboard hasn't whitelisted.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  let baseUrl = siteUrl
  if (!baseUrl) {
    const host = (await headers()).get('host')
    const protocol = host?.startsWith('localhost') ? 'http' : 'https'
    baseUrl = `${protocol}://${host}`
  }
  const redirectTo = `${baseUrl}/auth/callback?next=/`

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      data: { full_name: fullName, grade },
    },
  })
  if (otpError) {
    console.error('signInWithOtp failed:', otpError)
    // Same rate-limit handling as the login action — Supabase will reject
    // a second OTP request for the same email within ~60s even though the
    // first one already sent the email.
    const status = (otpError as { status?: number }).status
    const msg = (otpError.message || '').toLowerCase()
    if (status === 429 || msg.includes('rate') || msg.includes('seconds')) {
      return {
        ok: true,
        message: `A sign-in link was just sent to ${email}. Check your inbox (or wait a minute and retry).`,
      }
    }
    return { ok: false, message: 'Could not send magic link. Try again or contact an officer.' }
  }

  return { ok: true, message: `Check your inbox at ${email} for a sign-in link.` }
}
