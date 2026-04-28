'use client'

import { useState, useTransition } from 'react'
import { startCheckout } from './actions'

export function DonateForm({ amounts }: { amounts: number[] }) {
  const [selected, setSelected] = useState<number | 'custom'>(amounts[1] ?? 10)
  const [custom, setCustom] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const amountUsd = selected === 'custom' ? Number(custom) : selected

  return (
    <div className="auth-card" style={{ width: '100%' }}>
      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (!amountUsd || amountUsd < 1) {
            setError('Please pick or enter an amount of $1 or more.')
            return
          }
          const fd = new FormData(e.currentTarget)
          fd.set('amount_cents', String(Math.round(amountUsd * 100)))
          startTransition(async () => {
            const result = await startCheckout(fd)
            if (!result.ok) {
              setError(result.message)
              return
            }
            if (result.url) window.location.href = result.url
          })
        }}
      >
        <div>
          <span style={{ fontSize: 12, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Choose amount
          </span>
          <div className="donate-amounts">
            {amounts.map((amt) => (
              <button
                key={amt}
                type="button"
                className={`donate-amount${selected === amt ? ' selected' : ''}`}
                onClick={() => setSelected(amt)}
              >
                ${amt}
              </button>
            ))}
            <button
              type="button"
              className={`donate-amount${selected === 'custom' ? ' selected' : ''}`}
              onClick={() => setSelected('custom')}
            >
              Custom
            </button>
          </div>
        </div>

        {selected === 'custom' && (
          <label className="auth-field">
            <span>Custom amount (USD)</span>
            <input
              type="number"
              min={1}
              step={1}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              required
            />
          </label>
        )}

        <label className="auth-field">
          <span>Your name (optional)</span>
          <input name="donor_name" type="text" autoComplete="name" />
        </label>
        <label className="auth-field">
          <span>Email for receipt</span>
          <input name="donor_email" type="email" required autoComplete="email" />
        </label>
        <label className="auth-field">
          <span>Message (optional)</span>
          <textarea name="message" rows={2} placeholder="Cheering you on!" />
        </label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
          <input type="checkbox" name="anonymous" /> Show as anonymous on any future donor wall
        </label>

        <button type="submit" className="pill" disabled={pending}>
          {pending ? 'Redirecting…' : `Donate $${amountUsd || ''}`}
        </button>

        {error && <p className="auth-message err">{error}</p>}
      </form>
    </div>
  )
}
