'use client'

import { useState, useTransition } from 'react'
import { registerForCompetition } from './actions'

export function RegisterForm({ slug }: { slug: string }) {
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
            const result = await registerForCompetition(slug, fd)
            setMessage({ ok: result.ok, text: result.message })
            if (result.ok) form.reset()
          })
        }}
      >
        <label className="auth-field">
          <span>Student name</span>
          <input name="student_name" type="text" required autoComplete="name" />
        </label>
        <div className="admin-form-row">
          <label className="auth-field">
            <span>School</span>
            <input name="school" type="text" />
          </label>
          <label className="auth-field">
            <span>Grade</span>
            <select name="grade" defaultValue="">
              <option value="" disabled>Select…</option>
              {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="auth-field">
          <span>Student email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="auth-field">
          <span>Parent / guardian email (optional)</span>
          <input name="parent_email" type="email" />
        </label>
        <label className="auth-field">
          <span>Notes (allergies, accommodations, partner team, etc.)</span>
          <textarea name="notes" rows={3} />
        </label>

        <button type="submit" className="pill" disabled={pending}>
          {pending ? 'Submitting…' : 'Register'}
        </button>

        {message && (
          <p className={`auth-message ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>
        )}
      </form>
    </div>
  )
}
