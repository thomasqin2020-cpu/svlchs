'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface ResetResult {
  ok: boolean
  message: string
  signedIn?: boolean
}

const PASSWORD_MIN = 8

/**
 * Sets a new password for the currently signed-in user. The user reaches this
 * action via /forgot-password → magic link → /auth/callback → /reset-password,
 * which means they have a Supabase session by the time we run.
 */
export async function resetPasswordAction(formData: FormData): Promise<ResetResult> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('password_confirm') ?? '')

  if (password.length < PASSWORD_MIN) {
    return { ok: false, message: `Password must be at least ${PASSWORD_MIN} characters.` }
  }
  if (password !== confirm) {
    return { ok: false, message: 'Passwords don’t match.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Password reset is not configured yet. Try again later.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      ok: false,
      message: 'Your reset link expired. Request a new one from “Forgot password?”.',
    }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    console.error('updateUser(password) failed:', error)
    return { ok: false, message: 'Could not update your password. Try again.' }
  }

  return { ok: true, message: 'Password updated. Redirecting…', signedIn: true }
}
