'use server'

import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface LoginResult {
  ok: boolean
  message: string
}

/**
 * Magic-link login for existing members. We do NOT verify membership status here —
 * if the email isn't already linked to a member row, the user will land on the site
 * but will see only public content (RLS enforces this).
 */
export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const next = String(formData.get('next') ?? '/').trim() || '/'

  if (!email || !email.includes('@')) {
    return { ok: false, message: 'Please enter a valid email.' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { ok: false, message: 'Login is not configured yet. Try again later.' }
  }

  // Prefer the explicit canonical site URL so magic links don't point at a
  // Vercel auto-alias the Supabase dashboard hasn't whitelisted.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  let baseUrl = siteUrl
  if (!baseUrl) {
    const host = (await headers()).get('host')
    const protocol = host?.startsWith('localhost') ? 'http' : 'https'
    baseUrl = `${protocol}://${host}`
  }
  const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  })
  if (error) {
    console.error('login signInWithOtp failed:', error)
    // Supabase rate-limits OTP requests per email (~60s cooldown). When that
    // fires, the previous request has already sent the email — surface a
    // soft success so the user goes to their inbox instead of clicking again.
    const status = (error as { status?: number }).status
    const msg = (error.message || '').toLowerCase()
    if (status === 429 || msg.includes('rate') || msg.includes('seconds')) {
      return {
        ok: true,
        message: `A sign-in link was just sent to ${email}. Check your inbox (or wait a minute and retry).`,
      }
    }
    return { ok: false, message: 'Could not send magic link. Try again.' }
  }

  return { ok: true, message: `Check your inbox at ${email} for a sign-in link.` }
}
