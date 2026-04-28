'use client'

import { useState, useTransition } from 'react'
import { submitContact } from './actions'

export function ContactForm() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  return (
    <div className="auth-card" style={{ width: '100%' }}>
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const form = e.currentTarget
          startTransition(async () => {
            const result = await submitContact(fd)
            setMessage({ ok: result.ok, text: result.message })
            if (result.ok) form.reset()
          })
        }}
      >
        <label className="auth-field">
          <span>Your name</span>
          <input name="name" type="text" required autoComplete="name" />
        </label>
        <label className="auth-field">
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="auth-field">
          <span>Message</span>
          <textarea name="message" rows={5} required />
        </label>

        <button type="submit" className="pill" disabled={pending}>
          {pending ? 'Sending…' : 'Send message'}
        </button>

        {message && (
          <p className={`auth-message ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>
        )}
      </form>
    </div>
  )
}
