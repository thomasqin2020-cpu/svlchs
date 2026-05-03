'use client'

/**
 * In-page card checkout using Stripe Elements + animated card preview.
 *
 * PCI safety: Card number / expiry / CVC come from Stripe-hosted iframes
 * (`<CardNumberElement>`, `<CardExpiryElement>`, `<CardCvcElement>`). Raw card
 * data never touches our DOM or our server. The animated card preview shows
 * placeholder dots for the card number — Stripe Elements does not (and should
 * not) leak the typed digits to JS. The brand badge and cardholder name DO
 * mirror live, since brand is exposed via Element `change` events and the
 * cardholder name is just a regular text input we own.
 */

import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe, type StripeElementChangeEvent } from '@stripe/stripe-js'
import { useState, useTransition } from 'react'
import { createPaymentIntent, startCheckout } from './actions'

/* --------------------------------------------------------------------------
 * Stripe instance — singleton, loaded once per browser tab.
 * -------------------------------------------------------------------------- */
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null

/* --------------------------------------------------------------------------
 * Card preview — design from svlchs stripe page-handoff.zip.
 * Flips to back when CVC field is focused.
 * -------------------------------------------------------------------------- */

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'unionpay' | 'unknown'

function BrandMark({ brand }: { brand: CardBrand }) {
  if (!brand || brand === 'unknown') return null
  if (brand === 'visa') {
    return (
      <span className="cp-brand-mark cp-brand-visa">VISA</span>
    )
  }
  if (brand === 'mastercard') {
    return (
      <span className="cp-brand-mark cp-brand-mc">
        <span className="cp-mc-red" />
        <span className="cp-mc-yellow" />
      </span>
    )
  }
  if (brand === 'amex') {
    return <span className="cp-brand-mark cp-brand-amex">AMEX</span>
  }
  if (brand === 'discover') {
    return <span className="cp-brand-mark cp-brand-disc">DISCOVER</span>
  }
  return <span className="cp-brand-mark cp-brand-other">{brand.toUpperCase()}</span>
}

function CardPreview({
  cardholderName,
  brand,
  numberComplete,
  expiryComplete,
  cvcComplete,
  flipped,
  amount,
  freq,
}: {
  cardholderName: string
  brand: CardBrand
  numberComplete: boolean
  expiryComplete: boolean
  cvcComplete: boolean
  flipped: boolean
  amount: number
  freq: 'once' | 'monthly'
}) {
  return (
    <div className={'cp-card' + (flipped ? ' flipped' : '')}>
      <div className="cp-flipper">
        {/* ── Front ───────────────────────────────────── */}
        <div className="cp-face">
          <div className="cp-row">
            <div className="cp-brand">
              <span className="cp-lambda">λ</span>
              <span>Spartan Vanguard</span>
            </div>
            <BrandMark brand={brand} />
          </div>
          <div className="cp-chip" />
          <div className="cp-number">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={'cp-grp' + (numberComplete ? ' filled' : ' placeholder')}
              >
                ••••
              </span>
            ))}
          </div>
          <div className="cp-bottom">
            <div>
              <span className="cp-lab">Cardholder</span>
              <span className="cp-v">{cardholderName.trim() || 'Your Name'}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="cp-lab">Donation</span>
              <span className="cp-v">
                ${amount.toFixed(2)}
                {freq === 'monthly' ? '/mo' : ''}
              </span>
            </div>
          </div>
          {/* tiny status indicators in a corner so users see fields validating */}
          <div className="cp-status">
            <span className={'cp-dot' + (numberComplete ? ' ok' : '')} title="Card number" />
            <span className={'cp-dot' + (expiryComplete ? ' ok' : '')} title="Expiry" />
            <span className={'cp-dot' + (cvcComplete ? ' ok' : '')} title="CVC" />
          </div>
        </div>

        {/* ── Back ────────────────────────────────────── */}
        <div className="cp-back">
          <div className="cp-mag" />
          <div className="cp-cvv-lab">CVC</div>
          <div className="cp-cvv">{cvcComplete ? '✓' : '•••'}</div>
          <div className="cp-back-foot">
            <span>Donor support · treasurer@svlchs.org</span>
            <BrandMark brand={brand} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------
 * Stripe Element styling — keep visual parity with the design's text inputs.
 * -------------------------------------------------------------------------- */
const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      fontFamily: 'var(--sans), system-ui, sans-serif',
      color: '#F5F5F7',
      '::placeholder': { color: 'rgba(245,245,247,0.32)' },
      iconColor: '#F5F5F7',
    },
    invalid: { color: '#ff5050', iconColor: '#ff5050' },
  },
  showIcon: false,
} as const

/* --------------------------------------------------------------------------
 * Inner form — needs to be rendered inside <Elements>, hence the split.
 * -------------------------------------------------------------------------- */

interface CardFormProps {
  amount: number
  freq: 'once' | 'monthly'
  donorName: string
  donorEmail: string
  message: string
  anonymous: boolean
  setError: (e: string | null) => void
  setStatus: (s: 'idle' | 'processing' | 'success') => void
  status: 'idle' | 'processing' | 'success'
}

function CardForm({
  amount,
  freq,
  donorName,
  donorEmail,
  message,
  anonymous,
  setError,
  setStatus,
  status,
}: CardFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [brand, setBrand] = useState<CardBrand>('unknown')
  const [numberComplete, setNumberComplete] = useState(false)
  const [expiryComplete, setExpiryComplete] = useState(false)
  const [cvcComplete, setCvcComplete] = useState(false)
  const [cvcFocused, setCvcFocused] = useState(false)

  const [pending, startTransition] = useTransition()

  const onNumberChange = (e: StripeElementChangeEvent) => {
    setNumberComplete(e.complete)
    setBrand(((e as { brand?: string }).brand as CardBrand) || 'unknown')
    if (e.error) setError(e.error.message)
    else setError(null)
  }
  const onExpiryChange = (e: StripeElementChangeEvent) => {
    setExpiryComplete(e.complete)
    if (e.error) setError(e.error.message)
  }
  const onCvcChange = (e: StripeElementChangeEvent) => {
    setCvcComplete(e.complete)
    if (e.error) setError(e.error.message)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!stripe || !elements) return

    if (!amount || amount < 1) {
      setError('Pick or enter an amount of $1 or more.')
      return
    }
    if (!donorEmail) {
      setError('Email is required so Stripe can send you a receipt.')
      return
    }
    if (freq === 'monthly') {
      // Monthly subscriptions still go through Stripe Checkout — the in-page
      // card form supports one-time only for now. Redirect to the hosted page.
      const fd = new FormData()
      fd.set('amount_cents', String(Math.round(amount * 100)))
      fd.set('freq', 'monthly')
      fd.set('donor_name', donorName)
      fd.set('donor_email', donorEmail)
      fd.set('message', message)
      if (anonymous) fd.set('anonymous', 'on')
      startTransition(async () => {
        const result = await startCheckout(fd)
        if (!result.ok) {
          setError(result.message)
          return
        }
        if (result.url) window.location.href = result.url
      })
      return
    }

    setStatus('processing')

    // 1) Create PaymentIntent on the server.
    const fd = new FormData()
    fd.set('amount_cents', String(Math.round(amount * 100)))
    fd.set('donor_name', donorName)
    fd.set('donor_email', donorEmail)
    fd.set('message', message)
    if (anonymous) fd.set('anonymous', 'on')

    const pi = await createPaymentIntent(fd)
    if (!pi.ok || !pi.clientSecret) {
      setStatus('idle')
      setError(pi.message || 'Could not start payment.')
      return
    }

    // 2) Confirm the card payment in the browser.
    const cardElement = elements.getElement(CardNumberElement)
    if (!cardElement) {
      setStatus('idle')
      setError('Card element missing.')
      return
    }
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      pi.clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: donorName || undefined,
            email: donorEmail,
          },
        },
      },
    )

    if (stripeError) {
      setStatus('idle')
      setError(stripeError.message || 'Card was declined.')
      return
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      setStatus('success')
      // Brief beat to let users see the success state, then redirect.
      setTimeout(() => {
        window.location.href = '/donate/success?pi=' + encodeURIComponent(paymentIntent.id)
      }, 900)
    } else {
      setStatus('idle')
      setError('Payment did not complete. Please try again.')
    }
  }

  const isBusy = pending || status === 'processing' || status === 'success'

  return (
    <form className="cc-form" onSubmit={submit}>
      <CardPreview
        cardholderName={donorName}
        brand={brand}
        numberComplete={numberComplete}
        expiryComplete={expiryComplete}
        cvcComplete={cvcComplete}
        flipped={cvcFocused}
        amount={amount}
        freq={freq}
      />

      <div className="cc-field cc-card-number">
        <label>Card number</label>
        <div className="cc-input-wrap">
          <CardNumberElement
            options={{ ...ELEMENT_OPTIONS, placeholder: '1234 5678 9012 3456' }}
            onChange={onNumberChange}
          />
        </div>
      </div>

      <div className="cc-row">
        <div className="cc-field">
          <label>Expiry</label>
          <div className="cc-input-wrap">
            <CardExpiryElement
              options={{ ...ELEMENT_OPTIONS, placeholder: 'MM / YY' }}
              onChange={onExpiryChange}
            />
          </div>
        </div>
        <div className="cc-field">
          <label>CVC</label>
          <div className="cc-input-wrap">
            <CardCvcElement
              options={{ ...ELEMENT_OPTIONS, placeholder: '123' }}
              onChange={onCvcChange}
              onFocus={() => setCvcFocused(true)}
              onBlur={() => setCvcFocused(false)}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className={
          'cc-submit' +
          (isBusy ? ' processing' : '') +
          (status === 'success' ? ' success' : '')
        }
        disabled={isBusy || !stripe}
      >
        {status === 'success' ? (
          <>✓ Thank you</>
        ) : status === 'processing' || pending ? (
          <>
            <span className="cc-spinner" />
            <span>{freq === 'monthly' ? 'Redirecting…' : 'Charging card…'}</span>
          </>
        ) : (
          <>
            <LockIcon />
            <span>
              {freq === 'monthly' ? 'Set up monthly · ' : 'Donate · '}
              ${amount.toFixed(2)}
              {freq === 'monthly' ? ' / month' : ''}
            </span>
          </>
        )}
      </button>
    </form>
  )
}

/* --------------------------------------------------------------------------
 * Outer wrapper — provides the <Elements> context.
 * -------------------------------------------------------------------------- */

export interface CardCheckoutProps {
  amount: number
  freq: 'once' | 'monthly'
  donorName: string
  donorEmail: string
  message: string
  anonymous: boolean
  error: string | null
  setError: (e: string | null) => void
  status: 'idle' | 'processing' | 'success'
  setStatus: (s: 'idle' | 'processing' | 'success') => void
}

export function CardCheckout(props: CardCheckoutProps) {
  if (!stripePromise) {
    return (
      <div className="cc-not-configured">
        Card payments are not configured. Set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
      </div>
    )
  }
  return (
    <Elements stripe={stripePromise}>
      <CardForm {...props} />
    </Elements>
  )
}

/* Local lock icon — duplicated from donate-client to avoid import gymnastics. */
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
