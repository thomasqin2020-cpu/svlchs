'use server'

import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface ForgotResult {
  ok: boolean
  message: string
}

/**
 * Sends a password-recovery email. Supabase generates a single-use link that
 * lands on /auth/callback?code=...&next=/reset-password — once the code is
 * exchanged we have a temporary session and can let the user pick a new password.
 *
 * If the email isn't registered, we still return success: telling unauthenticated
 * visitors which emails exist is an account-enumeration leak.
 */
export async function forgotPasswordAction(formData: FormData): Promise<ForgotResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { ok: false, message: 'Please enter a valid email.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Password reset is not configured yet. Try again later.' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  let baseUrl = siteUrl
  if (!baseUrl) {
    const host = (await headers()).get('host')
    const protocol = host?.startsWith('localhost') ? 'http' : 'https'
    baseUrl = `${protocol}://${host}`
  }
  const redirectTo = `${baseUrl}/auth/callback?next=/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) {
    console.error('resetPasswordForEmail failed:', error)
    const status = (error as { status?: number }).status
    if (status === 429) {
      return { ok: true, message: `If ${email} is registered, a reset link is on the way. Check your inbox.` }
    }
    // Don't leak whether the email exists; surface a generic success.
  }
  return { ok: true, message: `If ${email} is registered, a reset link is on the way. Check your inbox.` }
}
