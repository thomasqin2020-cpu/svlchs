'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { startCheckout } from './actions'

const SpiralBg = dynamic(() => import('./spiral-bg').then((m) => m.SpiralBg), {
  ssr: false,
  loading: () => null,
})

const PRESETS = [5, 10, 25, 50, 100] as const

interface ImpactTier {
  min: number
  icon: string
  text: string
}

const IMPACT_TIERS: ImpactTier[] = [
  { min: 0, icon: 'π', text: 'Helps cover printing for weekly problem sets.' },
  { min: 10, icon: 'θ', text: 'Buys pizza for one Friday meeting.' },
  { min: 25, icon: 'Σ', text: 'Sponsors testing materials for two students at AMC.' },
  { min: 50, icon: 'ʃ', text: 'Covers tournament registration for one VMT volunteer.' },
  { min: 100, icon: 'Ω', text: 'Funds a full Aleph round — testing, food, and prizes.' },
  { min: 250, icon: 'ℵ', text: 'Underwrites travel to a regional invitational.' },
]

const CONSTELLATION = [
  { c: 'π', x: 4, y: 8, d: 0, t: 14 },
  { c: 'θ', x: 86, y: 16, d: 2.5, t: 11 },
  { c: 'Σ', x: 12, y: 52, d: 1, t: 16 },
  { c: 'ʃ', x: 72, y: 62, d: 0.8, t: 15 },
  { c: 'Δ', x: 48, y: 78, d: 2, t: 12 },
  { c: 'Ω', x: 92, y: 86, d: 4, t: 14 },
  { c: 'φ', x: 30, y: 32, d: 1.5, t: 13 },
  { c: 'λ', x: 62, y: 36, d: 3, t: 15 },
]

function pickImpact(amount: number): ImpactTier {
  let chosen = IMPACT_TIERS[0]
  for (const t of IMPACT_TIERS) if (amount >= t.min) chosen = t
  return chosen
}

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

function LambdaMark({
  size = 24,
  color = 'currentColor',
  sharp = false,
}: {
  size?: number
  color?: string
  sharp?: boolean
}) {
  const sw = Math.max(1.6, size * 0.085)
  const inset = size * 0.12
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap={sharp ? 'butt' : 'round'}
      strokeLinejoin={sharp ? 'miter' : 'round'}
      aria-hidden
      style={{ display: 'block' }}
    >
      <path
        d={`M ${inset} ${size - inset} L ${size / 2} ${inset} L ${size - inset} ${size - inset}`}
      />
    </svg>
  )
}

function LambdaCrest({ size = 64 }: { size?: number }) {
  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 50% 30%, rgba(176,141,58,0.20) 0%, rgba(176,141,58,0.05) 60%, transparent 100%)',
        boxShadow:
          '0 8px 24px rgba(176,141,58,0.18), inset 0 0 0 1px rgba(176,141,58,0.35)',
        flexShrink: 0,
      }}
    >
      <LambdaMark size={size * 0.55} color="var(--gold)" sharp />
    </span>
  )
}

function StaggerHeading({ words, gradLine }: { words: string[]; gradLine?: number }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 60)
    return () => window.clearTimeout(t)
  }, [])
  let idx = 0
  return (
    <h1 className="dp-section-h">
      {words.map((line, li) => (
        <span
          key={li}
          className={'dp-hero-line' + (gradLine === li ? ' dp-grad' : '')}
          style={{ display: 'block' }}
        >
          {line.split(' ').map((word, wi) => (
            <span
              key={wi}
              style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: '0.22em' }}
            >
              {word.split('').map((ch) => {
                const i = idx++
                return (
                  <span
                    key={i}
                    className={'dp-hchar' + (ready ? ' in' : '')}
                    style={{ transitionDelay: `${i * 24}ms` }}
                  >
                    {ch}
                  </span>
                )
              })}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

function Constellation() {
  return (
    <div className="dp-constellation" aria-hidden>
      {CONSTELLATION.map((g, i) => (
        <span
          key={i}
          style={{
            left: `${g.x}%`,
            top: `${g.y}%`,
            animationDelay: `${g.d}s`,
            animationDuration: `${g.t}s`,
          }}
        >
          {g.c}
        </span>
      ))}
    </div>
  )
}

export function DonateClient() {
  const [amount, setAmount] = useState<number>(25)
  const [custom, setCustom] = useState('')
  const [customFocused, setCustomFocused] = useState(false)
  const [freq, setFreq] = useState<'once' | 'monthly'>('once')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  // Reveal observer for [data-reveal] elements.
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in')
        })
      },
      { threshold: 0.1 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Scroll progress bar.
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)
      const bar = document.querySelector<HTMLDivElement>('.dp-scroll-progress')
      if (bar) bar.style.transform = `scaleX(${p})`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const impact = pickImpact(amount || 0)
  const presets: number[] = [...PRESETS]

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!amount || amount < 1) {
      setError('Pick or enter an amount of $1 or more.')
      return
    }
    if (!email) {
      setError('Email is required so Stripe can send you a receipt.')
      return
    }
    const fd = new FormData(e.currentTarget)
    fd.set('amount_cents', String(Math.round(amount * 100)))
    fd.set('freq', freq)
    startTransition(async () => {
      const result = await startCheckout(fd)
      if (!result.ok) {
        setError(result.message)
        return
      }
      if (result.url) window.location.href = result.url
    })
  }

  return (
    <div className="donate-page">
      <SpiralBg />
      <div className="dp-scroll-progress" />

      <div className="dp-brand-bar">
        <span className="dp-brand-mark">
          <LambdaMark size={18} color="#F8FBF8" sharp />
        </span>
        <a href="/" style={{ color: 'inherit' }}>
          Spartan Vanguard
        </a>
        <span className="dp-est">EST · 2019</span>
      </div>

      <main className="dp-page">
        {/* ── Left column: order summary ───────────────────── */}
        <div className="dp-order">
          <Constellation />

          <div data-reveal>
            <span className="dp-eyebrow">Spartan Vanguard · Donate</span>
          </div>
          <div data-reveal style={{ transitionDelay: '60ms' }}>
            <StaggerHeading words={['Support the', 'math club.']} gradLine={1} />
            <p className="dp-section-sub">
              Donations cover testing materials, pizza, competition fees, and travel. La Cañada
              High School is a public school — gifts may be tax-deductible. We&rsquo;ll email a
              receipt.
            </p>
          </div>

          <div className="dp-crest-wrap" data-reveal style={{ transitionDelay: '120ms' }}>
            <LambdaCrest size={64} />
            <div className="dp-crest-meta">
              <div className="dp-id">SPARTAN VANGUARD MATH CLUB</div>
              <div>EST · 2019 &middot; LA CAÑADA HIGH SCHOOL</div>
              <div>2026–2027 SEASON</div>
            </div>
          </div>

          <div
            className={'dp-freq' + (freq === 'monthly' ? ' is-monthly' : '')}
            data-reveal
            style={{ transitionDelay: '160ms' }}
          >
            <span className="dp-freq-pill" />
            <button
              type="button"
              className={freq === 'once' ? 'is-active' : ''}
              onClick={() => setFreq('once')}
            >
              One-time
            </button>
            <button
              type="button"
              className={freq === 'monthly' ? 'is-active' : ''}
              onClick={() => setFreq('monthly')}
            >
              Monthly
            </button>
          </div>

          <div className="dp-amounts" data-reveal style={{ transitionDelay: '200ms' }}>
            {presets.map((v) => (
              <button
                key={v}
                type="button"
                className={'dp-amt' + (!customFocused && amount === v ? ' selected' : '')}
                onClick={() => {
                  setAmount(v)
                  setCustom('')
                  setCustomFocused(false)
                }}
              >
                <span>${v}</span>
                <span className="dp-amt-sub">
                  {v === 25 ? 'popular' : v === 100 ? 'supporter' : ' '}
                </span>
              </button>
            ))}
            <div className={'dp-amt dp-amt-custom' + (customFocused ? ' active' : '')}>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Other"
                value={custom}
                onFocus={() => setCustomFocused(true)}
                onBlur={() => {
                  if (!custom) setCustomFocused(false)
                }}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '')
                  setCustom(v)
                  const n = parseFloat(v)
                  if (!isNaN(n)) setAmount(n)
                }}
              />
            </div>
          </div>

          <div
            className="dp-impact"
            data-reveal
            style={{ transitionDelay: '240ms' }}
            key={impact.icon}
          >
            <div className="dp-impact-bar" />
            <div className="dp-impact-icon">{impact.icon}</div>
            <div className="dp-impact-text">
              <span className="dp-muted">
                ${amount.toFixed(0)} {freq === 'monthly' ? 'monthly' : 'today'} —{' '}
              </span>
              {impact.text}
            </div>
          </div>

          <div className="dp-order-lines" data-reveal style={{ transitionDelay: '280ms' }}>
            <div className="dp-line">
              <span>Donation &middot; {freq === 'monthly' ? 'Monthly' : 'One-time'}</span>
              <span className="dp-val">${amount.toFixed(2)}</span>
            </div>
            <div className="dp-line">
              <span>Processing fee (covered by Stripe)</span>
              <span className="dp-val" style={{ color: 'var(--fg-muted)' }}>—</span>
            </div>
            <div className="dp-line dp-total">
              <span>Total {freq === 'monthly' ? 'monthly' : 'today'}</span>
              <span className="dp-val">${amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="dp-trust" data-reveal style={{ transitionDelay: '320ms' }}>
            <span>
              <LockIcon /> 256-bit TLS
            </span>
            <span className="dp-dot" />
            <span>STRIPE PROTECTED</span>
            <span className="dp-dot" />
            <span>PCI DSS L1</span>
          </div>
        </div>

        {/* ── Right column: checkout details ───────────────── */}
        <form
          ref={formRef}
          className="dp-checkout"
          onSubmit={submit}
          data-reveal
          style={{ transitionDelay: '120ms' }}
        >
          <div className="dp-checkout-head">
            <span className="dp-label">Your details.</span>
            <span className="dp-stripe-mark">
              <LockIcon /> Powered by Stripe
            </span>
          </div>

          <p className="dp-checkout-intro">
            Card details are entered on Stripe&rsquo;s secure checkout. We never see or store
            them. Confirm your info, then continue.
          </p>

          <Field label="Your name (optional)">
            <input
              name="donor_name"
              type="text"
              placeholder="A. Lambda"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Email for receipt">
            <input
              name="donor_email"
              type="email"
              required
              placeholder="you@school.edu"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Message (optional)">
            <textarea
              name="message"
              rows={2}
              placeholder="Cheering you on!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>

          <label
            className={'dp-checkbox-row' + (anonymous ? ' checked' : '')}
            onClick={(e) => {
              if ((e.target as HTMLElement).tagName === 'INPUT') return
              setAnonymous((v) => !v)
            }}
          >
            <input
              type="checkbox"
              name="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            />
            <span className="dp-box" aria-hidden>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3,8 7,12 13,4" />
              </svg>
            </span>
            <span>Show as anonymous on any future donor wall.</span>
          </label>

          <button
            type="submit"
            className={'dp-donate-btn' + (pending ? ' processing' : '')}
            disabled={pending}
          >
            {pending ? (
              <>
                <span className="dp-spinner" />
                <span>Redirecting to Stripe…</span>
              </>
            ) : (
              <>
                <LockIcon />
                <span>
                  Continue · ${amount.toFixed(2)} {freq === 'monthly' ? '/ month' : ''}
                </span>
              </>
            )}
          </button>

          {error && <p className="dp-form-err">{error}</p>}

          <p className="dp-footnote">
            By donating, you agree to our terms. Your payment is processed by Stripe and never
            touches our servers. Need help?{' '}
            <a href="mailto:vchen26@mylcusd.net">vchen26@mylcusd.net</a>
          </p>
        </form>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="dp-field">
      <label>{label}</label>
      <div className="dp-input-wrap">{children}</div>
    </div>
  )
}
