'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Wrong email or password. If you haven’t set a password yet, use the link below.',
  invalid_email: 'Please enter a valid email.',
  missing_password: 'Please enter your password.',
  rate_limited: 'Too many attempts. Wait a minute and try again.',
  not_configured: 'Login is not configured yet.',
  unknown: 'Could not log you in. Try again.',
}

function LockIcon() {
  return (
    <svg
      width={11}
      height={11}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline' }}
      aria-hidden
    >
      <rect x={3} y={11} width={18} height={11} rx={2} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function LoginForm() {
  const params = useSearchParams()
  const next = params.get('next') ?? '/'
  const errorParam = params.get('error')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reflect URL error into UI on first paint.
  useEffect(() => {
    if (errorParam && ERROR_MESSAGES[errorParam]) {
      setError(ERROR_MESSAGES[errorParam])
    }
  }, [errorParam])

  return (
    <div className="auth-card-v2">
      <div className="dp-checkout-head">
        <span className="dp-label">Spartan Vanguard · Log in</span>
        <span className="dp-stripe-mark">
          <LockIcon /> Email + password
        </span>
      </div>

      <h1 className="auth-title-v2">Welcome back.</h1>
      <p className="auth-sub-v2">Sign in with your email and password.</p>

      {/* Native form POST. Browser handles the redirect + Set-Cookie chain
          natively, which is dramatically more reliable than fetch +
          location.assign for persisting auth cookies across the navigation
          boundary. */}
      <form
        method="POST"
        action="/api/auth/login"
        onSubmit={() => {
          setError(null)
          setSubmitting(true)
        }}
      >
        <input type="hidden" name="next" value={next} />

        <div className="dp-field">
          <label>Email</label>
          <div className="dp-input-wrap">
            <input name="email" type="email" required autoComplete="email" />
          </div>
        </div>

        <div className="dp-field">
          <label>Password</label>
          <div className="dp-input-wrap">
            <input name="password" type="password" required autoComplete="current-password" />
          </div>
        </div>

        <button type="submit" className="dp-donate-btn" disabled={submitting}>
          {submitting ? (
            <>
              <span className="dp-spinner" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <LockIcon />
              <span>Sign in</span>
            </>
          )}
        </button>

        {error && <p className="auth-msg-v2 err">{error}</p>}
      </form>

      <p className="auth-foot-v2">
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
      <p className="auth-foot-v2">
        New here? <Link href="/signup">Sign up with a Classroom code</Link>
      </p>
    </div>
  )
}
