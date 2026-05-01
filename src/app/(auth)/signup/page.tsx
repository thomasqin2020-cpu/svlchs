'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'Email, password, name, and Classroom code are required.',
  invalid_email: 'That email looks invalid.',
  short_password: 'Password must be at least 8 characters.',
  not_configured: 'Sign-up is not configured yet.',
  already_member: 'That email is already registered. Try logging in or use the “forgot password” link.',
  bad_code: 'That Classroom code is not valid. Ask an officer for the current code.',
  create_failed: 'Could not create your account. Try again.',
  unknown: 'Something went wrong. Try again.',
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

export default function SignupPage() {
  const params = useSearchParams()
  const errorParam = params.get('error')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (errorParam && ERROR_MESSAGES[errorParam]) {
      setError(ERROR_MESSAGES[errorParam])
    }
  }, [errorParam])

  return (
    <div className="auth-card-v2">
      <div className="dp-checkout-head">
        <span className="dp-label">Spartan Vanguard · Sign up</span>
        <span className="dp-stripe-mark">
          <LockIcon /> Email + password
        </span>
      </div>

      <h1 className="auth-title-v2">Join Spartan Vanguard.</h1>
      <p className="auth-sub-v2">
        Enter the Google Classroom code your officers gave you, plus a school email and a password
        you&rsquo;ll remember.
      </p>

      {/* Native form POST. Browser handles redirect + Set-Cookie natively. */}
      <form
        method="POST"
        action="/api/auth/signup"
        onSubmit={() => {
          setError(null)
          setSubmitting(true)
        }}
      >
        <div className="dp-field">
          <label>Full name</label>
          <div className="dp-input-wrap">
            <input name="full_name" type="text" required autoComplete="name" />
          </div>
        </div>

        <div className="dp-field">
          <label>School email</label>
          <div className="dp-input-wrap">
            <input name="email" type="email" required autoComplete="email" />
          </div>
        </div>

        <div className="dp-field">
          <label>Password</label>
          <div className="dp-input-wrap">
            <input name="password" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <p className="auth-hint-v2">At least 8 characters.</p>
        </div>

        <div className="dp-field">
          <label>Grade</label>
          <div className="dp-input-wrap">
            <select name="grade" defaultValue="" required>
              <option value="" disabled>
                Select…
              </option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
        </div>

        <div className="dp-field">
          <label>Google Classroom code</label>
          <div className="dp-input-wrap">
            <input name="classroom_code" type="text" required autoCapitalize="off" autoCorrect="off" />
          </div>
        </div>

        <div className="dp-field">
          <label>Why are you joining? (optional)</label>
          <div className="dp-input-wrap">
            <textarea name="why_joining" rows={3} />
          </div>
        </div>

        <button type="submit" className="dp-donate-btn" disabled={submitting}>
          {submitting ? (
            <>
              <span className="dp-spinner" />
              <span>Creating account…</span>
            </>
          ) : (
            <>
              <LockIcon />
              <span>Create account</span>
            </>
          )}
        </button>

        {error && <p className="auth-msg-v2 err">{error}</p>}
      </form>

      <p className="auth-foot-v2">
        Already a member? <Link href="/login">Log in</Link>
      </p>
    </div>
  )
}
