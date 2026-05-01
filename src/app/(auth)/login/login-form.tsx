'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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
  const router = useRouter()

  return (
    <div className="auth-card-v2">
      <div className="dp-checkout-head">
        <span className="dp-label">Spartan Vanguard · Log in</span>
        <span className="dp-stripe-mark">
          <LockIcon /> Email + password
        </span>
      </div>

      <h1 className="auth-title-v2">Welcome back.</h1>
      <p className="auth-sub-v2">
        Sign in with your email and password.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const email = String(fd.get('email') ?? '')
          const password = String(fd.get('password') ?? '')
          startTransition(async () => {
            try {
              const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, next }),
              })
              const result = await res.json().catch(() => ({ ok: false, message: 'Unexpected response.' }))
              setMessage({ ok: !!result.ok, text: result.message ?? '' })
              if (result.signedIn) {
                router.replace(typeof result.next === 'string' ? result.next : '/')
                router.refresh()
              }
            } catch (err) {
              console.error('login fetch failed:', err)
              setMessage({ ok: false, text: 'Network error. Try again.' })
            }
          })
        }}
      >
        <div className="dp-field">
          <label>Email</label>
          <div className="dp-input-wrap">
            <input name="email" type="email" required autoComplete="email" />
          </div>
        </div>

        <div className="dp-field">
          <label>Password</label>
          <div className="dp-input-wrap">
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        <button type="submit" className="dp-donate-btn" disabled={pending}>
          {pending ? (
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

        {message && (
          <p className={`auth-msg-v2 ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>
        )}
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
