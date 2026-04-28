import Stripe from 'stripe'

/**
 * Server-side Stripe client. Returns null if STRIPE_SECRET_KEY isn't set
 * so pages can render without crashing during local dev.
 */
let _stripe: Stripe | null = null
export function getStripe(): Stripe | null {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  // Letting Stripe pick the account default API version is safer than
  // hard-pinning a string the SDK's types may not know about.
  _stripe = new Stripe(key)
  return _stripe
}

export const SUGGESTED_AMOUNTS_USD = [5, 10, 25, 50, 100] as const
export const MIN_DONATION_CENTS = 100 // $1.00
export const MAX_DONATION_CENTS = 100_000_00 // $100k cap to deter abuse
