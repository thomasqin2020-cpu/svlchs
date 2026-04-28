'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from './actions'

export function LoginForm() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const next = useSearchParams().get('next') ?? '/'

  return (
    <div className="auth-card">
      <h1 className="auth-title">Welcome back.</h1>
      <p className="auth-sub">Enter your email and we&rsquo;ll send you a one-tap sign-in link.</p>

      <form
        className="auth-form"
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
        <label className="auth-field">
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>

        <button type="submit" className="pill" disabled={pending}>
          {pending ? 'Sending…' : 'Send sign-in link'}
        </button>

        {message && (
          <p className={`auth-message ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>
        )}
      </form>

      <p className="auth-footnote">
        New here? <Link href="/signup">Sign up with a Classroom code</Link>
      </p>
    </div>
  )
}
