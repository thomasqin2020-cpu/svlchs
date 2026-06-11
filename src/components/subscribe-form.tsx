'use client'

import { useActionState, useState } from 'react'
import { subscribeToUpdates } from '@/app/actions/subscribe'
import type { SubscribeResult } from '@/app/actions/subscribe'

export function SubscribeForm() {
  // Controlled input: keeps the typed address through a failed submit
  // (React 19 auto-resets uncontrolled fields after a form action).
  const [email, setEmail] = useState('')

  async function runSubscribe(_prev: SubscribeResult | null, formData: FormData): Promise<SubscribeResult> {
    // Client-side wrapper: a rejected server action would otherwise bubble to
    // the nearest error boundary, so every failure resolves to a status line.
    try {
      const result = await subscribeToUpdates(formData)
      if (result.ok) setEmail('')
      return result
    } catch {
      return { ok: false, message: 'Something went wrong. Please try again.' }
    }
  }

  const [state, formAction, pending] = useActionState(runSubscribe, null)

  return (
    <form className="sv-subscribe-form" action={formAction}>
      <input
        type="text"
        name="company"
        className="sv-subscribe-trap"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="sv-subscribe-row">
        <input
          type="email"
          name="email"
          className="sv-subscribe-input"
          placeholder="you@example.com"
          aria-label="Email address"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="pill sv-subscribe-btn" disabled={pending}>
          {pending ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {/* Always-mounted live region: screen readers only announce changes
          inside an element that already exists, so the status <p> renders
          empty until there is a message. */}
      <p className={`sv-subscribe-status ${state ? (state.ok ? 'ok' : 'err') : ''}`} role="status">
        {state ? state.message : ''}
      </p>
    </form>
  )
}
