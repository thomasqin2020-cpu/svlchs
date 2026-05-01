'use client'

import { useState, useTransition } from 'react'
import { resetPasswordAction } from './actions'

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

export function ResetPasswordForm() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(async () => {
          const result = await resetPasswordAction(fd)
          setMessage({ ok: result.ok, text: result.message })
          if (result.signedIn) {
            // Hard navigation so cookies are committed before the next request.
            window.location.assign('/')
          }
        })
      }}
    >
      <div className="dp-field">
        <label>New password</label>
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
        <label>Confirm new password</label>
        <div className="dp-input-wrap">
          <input
            name="password_confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      <button type="submit" className="dp-donate-btn" disabled={pending}>
        {pending ? (
          <>
            <span className="dp-spinner" />
            <span>Updating…</span>
          </>
        ) : (
          <>
            <LockIcon />
            <span>Update password</span>
          </>
        )}
      </button>

      {message && (
        <p className={`auth-msg-v2 ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>
      )}
    </form>
  )
}
