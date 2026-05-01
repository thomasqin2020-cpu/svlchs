import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ResetPasswordForm } from './reset-password-form'

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return (
      <div className="auth-card-v2">
        <h1 className="auth-title-v2">Reset password</h1>
        <p className="auth-sub-v2">Password reset isn&rsquo;t configured yet.</p>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Reset links land here via /auth/callback. If we don't have a session,
    // either the link expired or someone navigated here directly.
    redirect('/forgot-password')
  }

  return (
    <div className="auth-card-v2">
      <div className="dp-checkout-head">
        <span className="dp-label">Spartan Vanguard · Set password</span>
      </div>

      <h1 className="auth-title-v2">Set a new password.</h1>
      <p className="auth-sub-v2">
        Pick a password you&rsquo;ll remember — at least 8 characters.
      </p>

      <ResetPasswordForm />

      <p className="auth-foot-v2">
        <Link href="/login">Back to log in</Link>
      </p>
    </div>
  )
}
