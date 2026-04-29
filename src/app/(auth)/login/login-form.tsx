'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from './actions'

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
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const next = useSearchParams().get('next') ?? '/'

  return (
    <div className="auth-card-v2">
      <div className="dp-checkout-head">
        <span className="dp-label">Spartan Vanguard · Log in</span>
        <span className="dp-stripe-mark">
          <LockIcon /> Magic link
        </span>
      </div>

      <h1 className="auth-title-v2">Welcome back.</h1>
      <p className="auth-sub-v2">
        Enter your email and we&rsquo;ll send you a one-tap sign-in link.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          fd.set('next', next)
          startTransition(async () => {
            const result = await loginAction(fd)
            setMessage({ ok: result.ok, text: result.message })
          })
        }}
      >
        <div className="dp-field">
          <label>Email</label>
          <div className="dp-input-wrap">
            <input name="email" type="email" required autoComplete="email" />
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
              <span>Send sign-in link</span>
            </>
          )}
        </button>

        {message && (
          <p className={`auth-msg-v2 ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>
        )}
      </form>

      <p className="auth-foot-v2">
        New here? <Link href="/signup">Sign up with a Classroom code</Link>
      </p>
    </div>
  )
}
