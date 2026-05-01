'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface LoginResult {
  ok: boolean
  message: string
  /** True when the user is now signed in. Client should redirect on this signal
   *  so server-rendered pages pick up the auth cookies. */
  signedIn?: boolean
  /** Where to send the user post-login. Echoes the form's `next` field. */
  next?: string
}

/**
 * Email + password login. Cookies are set on the canonical host (svlchs.vercel.app)
 * via Supabase's standard SSR cookie handling — no email round-trip, no
 * cross-domain redirect, so refresh and new-tab persistence work cleanly.
 */
export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/').trim() || '/'

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'Please enter a valid email.' }
  }
  if (!password) {
    return { ok: false, message: 'Please enter your password.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Login is not configured yet. Try again later.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('signInWithPassword failed:', error)
    const status = (error as { status?: number }).status
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('invalid') || status === 400 || status === 401) {
      return {
        ok: false,
        message: 'Wrong email or password. If you haven’t set a password yet, use the link below.',
      }
    }
    if (status === 429 || msg.includes('rate')) {
      return { ok: false, message: 'Too many attempts. Wait a minute and try again.' }
    }
    return { ok: false, message: 'Could not log you in. Try again.' }
  }

  return { ok: true, message: 'Signed in. Redirecting…', signedIn: true, next }
}
