'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendEmail, notifyOfficers, membershipAckEmail, membershipNotifyEmail } from '@/lib/email'

export interface SignupResult {
  ok: boolean
  message: string
  /** True when the action created the user and signed them in. The client should
   *  redirect to the home page on this signal so server-rendered pages pick up
   *  the new auth cookies. */
  signedIn?: boolean
}

const PASSWORD_MIN = 8

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const code = String(formData.get('classroom_code') ?? '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') ?? '').trim()
  const grade = String(formData.get('grade') ?? '').trim()
  const why = String(formData.get('why_joining') ?? '').trim()

  if (!email || !code || !fullName || !password) {
    return { ok: false, message: 'Email, password, name, and Classroom code are required.' }
  }
  if (!email.includes('@')) {
    return { ok: false, message: 'That email looks invalid.' }
  }
  if (password.length < PASSWORD_MIN) {
    return { ok: false, message: `Password must be at least ${PASSWORD_MIN} characters.` }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Sign-up is not configured yet. Try again later.' }
  }
  const admin = createSupabaseAdminClient()
  if (!admin) {
    return { ok: false, message: 'Sign-up is not configured yet. Try again later.' }
  }

  // Block re-signups: if this email already has an auth user, send them to /login.
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

  // Log the membership signup intent (RLS allows anon insert).
  const { error: insertError } = await supabase.from('membership_signups').insert({
    name: fullName,
    grade: grade || null,
    email,
    why_joining: why || null,
  })
  if (insertError) {
    console.error('membership_signups insert failed:', insertError)
    // Non-fatal — keep going with auth.
  }

  // Create the auth user with email_confirm: true so they don't have to click an
  // email link before logging in. The Classroom code already gates who can sign
  // up, so we accept the residual risk of an email typo creating an
  // unconfirmable account.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, grade },
  })
  if (createError || !created.user) {
    console.error('admin.createUser failed:', createError)
    const msg = (createError?.message || '').toLowerCase()
    if (msg.includes('already') || msg.includes('exists')) {
      return {
        ok: false,
        message: 'That email is already registered. Try logging in or use the “forgot password” link.',
      }
    }
    return { ok: false, message: 'Could not create your account. Try again.' }
  }

  // Mirror the auth user into public.members so getCurrentMember() returns a
  // profile and the homepage account chip renders. Without this row, the user
  // is signed in but every server-side `members` lookup returns null.
  const { error: memberInsertError } = await admin.from('members').upsert(
    {
      id: created.user.id,
      email,
      full_name: fullName,
      grade: grade || null,
      role: 'member',
    },
    { onConflict: 'id' },
  )
  if (memberInsertError) {
    console.error('members upsert failed:', memberInsertError)
  }

  // Acknowledgement + officer notification (fire-and-forget).
  sendEmail({ to: email, subject: 'Welcome to Spartan Vanguard', html: membershipAckEmail(fullName) }).catch(() => {})
  notifyOfficers({
    subject: `New SV sign-up: ${fullName}`,
    html: membershipNotifyEmail({ name: fullName, email, grade, why }),
  }).catch(() => {})

  // Sign them in immediately so the auth cookies are set on the canonical
  // host before they ever leave the page.
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) {
    console.error('post-signup signInWithPassword failed:', signInError)
    return {
      ok: true,
      message: 'Account created. Please log in to continue.',
    }
  }

  return {
    ok: true,
    message: 'Welcome! Redirecting…',
    signedIn: true,
  }
}
