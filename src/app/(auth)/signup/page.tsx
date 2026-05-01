'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

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
          <LockIcon /> Email + password
        </span>
      </div>

      <h1 className="auth-title-v2">Join Spartan Vanguard.</h1>
      <p className="auth-sub-v2">
        Enter the Google Classroom code your officers gave you, plus a school email and a password
        you&rsquo;ll remember.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget
          const fd = new FormData(form)
          const payload = {
            full_name: String(fd.get('full_name') ?? ''),
            email: String(fd.get('email') ?? ''),
            password: String(fd.get('password') ?? ''),
            grade: String(fd.get('grade') ?? ''),
            classroom_code: String(fd.get('classroom_code') ?? ''),
            why_joining: String(fd.get('why_joining') ?? ''),
          }
          startTransition(async () => {
            try {
              const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
              })
              const result = await res.json().catch(() => ({ ok: false, message: 'Unexpected response.' }))
              setMessage({ ok: !!result.ok, text: result.message ?? '' })
              if (result.signedIn) {
                // Hard navigation so cookies are committed before the next request.
                window.location.assign('/')
                return
              }
              if (result.ok) form.reset()
            } catch (err) {
              console.error('signup fetch failed:', err)
              setMessage({ ok: false, text: 'Network error. Try again.' })
            }
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
          <label>Password</label>
          <div className="dp-input-wrap">
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
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
              <span>Creating account…</span>
            </>
          ) : (
            <>
              <LockIcon />
              <span>Create account</span>
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
