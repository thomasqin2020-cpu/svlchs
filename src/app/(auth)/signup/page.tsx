'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signupAction } from './actions'

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
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  return (
    <div className="auth-card-v2">
      <div className="dp-checkout-head">
        <span className="dp-label">Spartan Vanguard · Sign up</span>
        <span className="dp-stripe-mark">
          <LockIcon /> Magic link
        </span>
      </div>

      <h1 className="auth-title-v2">Join Spartan Vanguard.</h1>
      <p className="auth-sub-v2">
        Enter the Google Classroom code your officers gave you, plus your school email. We&rsquo;ll
        email you a one-tap sign-in link.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          startTransition(async () => {
            const result = await signupAction(fd)
            setMessage({ ok: result.ok, text: result.message })
            if (result.ok) e.currentTarget?.reset?.()
          })
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
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
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
            <input
              name="classroom_code"
              type="text"
              required
              autoCapitalize="off"
              autoCorrect="off"
            />
          </div>
        </div>

        <div className="dp-field">
          <label>Why are you joining? (optional)</label>
          <div className="dp-input-wrap">
            <textarea name="why_joining" rows={3} />
          </div>
        </div>

        <button type="submit" className="dp-donate-btn" disabled={pending}>
          {pending ? (
            <>
              <span className="dp-spinner" />
              <span>Sending…</span>
            </>
          ) : (
            <>
              <LockIcon />
              <span>Send me a sign-in link</span>
            </>
          )}
        </button>

        {message && (
          <p className={`auth-msg-v2 ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>
        )}
      </form>

      <p className="auth-foot-v2">
        Already a member? <Link href="/login">Log in</Link>
      </p>
    </div>
  )
}
