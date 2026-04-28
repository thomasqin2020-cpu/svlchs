'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signupAction } from './actions'

export default function SignupPage() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  return (
    <div className="auth-card">
      <h1 className="auth-title">Join Spartan Vanguard.</h1>
      <p className="auth-sub">
        Enter the Google Classroom code your officers gave you, plus your school email. We&rsquo;ll
        email you a one-tap sign-in link.
      </p>

      <form
        className="auth-form"
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
        <label className="auth-field">
          <span>Full name</span>
          <input name="full_name" type="text" required autoComplete="name" />
        </label>
        <label className="auth-field">
          <span>School email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@mylcusd.net" />
        </label>
        <label className="auth-field">
          <span>Grade</span>
          <select name="grade" defaultValue="">
            <option value="" disabled>Select…</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </label>
        <label className="auth-field">
          <span>Google Classroom code</span>
          <input name="classroom_code" type="text" required autoCapitalize="off" autoCorrect="off" />
        </label>
        <label className="auth-field">
          <span>Why are you joining? (optional)</span>
          <textarea name="why_joining" rows={3} />
        </label>

        <button type="submit" className="pill" disabled={pending}>
          {pending ? 'Sending…' : 'Send me a sign-in link'}
        </button>

        {message && (
          <p className={`auth-message ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>
        )}
      </form>

      <p className="auth-footnote">
        Already a member? <Link href="/login">Log in</Link>
      </p>
    </div>
  )
}
