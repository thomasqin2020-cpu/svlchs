'use server'

import { headers } from 'next/headers'
import { getStripe, MAX_DONATION_CENTS, MIN_DONATION_CENTS } from '@/lib/stripe'

export interface CheckoutResult {
  ok: boolean
  url?: string
  message: string
}

export async function startCheckout(formData: FormData): Promise<CheckoutResult> {
  const stripe = getStripe()
  if (!stripe) {
    return {
      ok: false,
      message: 'Donations are not configured yet. Please check back soon — see docs/STRIPE_SETUP.md.',
    }
  }

  const amountCents = Number(formData.get('amount_cents') ?? 0)
  const donorName = String(formData.get('donor_name') ?? '').trim()
  const donorEmail = String(formData.get('donor_email') ?? '').trim().toLowerCase()
  const message = String(formData.get('message') ?? '').trim()
  const anonymous = formData.get('anonymous') === 'on'

  if (!Number.isFinite(amountCents) || amountCents < MIN_DONATION_CENTS) {
    return { ok: false, message: 'Amount must be at least $1.' }
  }
  if (amountCents > MAX_DONATION_CENTS) {
    return { ok: false, message: 'Amount is too large. Please contact officers directly.' }
  }
  if (!donorEmail) {
    return { ok: false, message: 'An email is required so we can send you a receipt.' }
  }

  const host = (await headers()).get('host')
  const protocol = host?.startsWith('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: donorEmail,
      submit_type: 'donate',
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate/cancel`,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: 'Donation to Spartan Vanguard',
              description: 'Supports La Cañada High School math club programming.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        donor_name: donorName,
        donor_email: donorEmail,
        message,
        anonymous: String(anonymous),
      },
    })

    if (!session.url) {
      return { ok: false, message: 'Stripe did not return a checkout URL.' }
    }
    return { ok: true, message: 'Redirecting…', url: session.url }
  } catch (e) {
    console.error('Stripe checkout session create failed:', e)
    return { ok: false, message: 'Could not start checkout. Please try again.' }
  }
}
