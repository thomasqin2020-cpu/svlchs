'use server'

import { headers } from 'next/headers'
import { getStripe, MAX_DONATION_CENTS, MIN_DONATION_CENTS } from '@/lib/stripe'

export interface CheckoutResult {
  ok: boolean
  url?: string
  message: string
}

export interface PaymentIntentResult {
  ok: boolean
  clientSecret?: string
  paymentIntentId?: string
  message: string
}

/**
 * Creates a one-time PaymentIntent for the in-page card form (Stripe Elements).
 * The browser then calls `stripe.confirmCardPayment(clientSecret, ...)` with
 * the user's card element to complete the charge without leaving our site.
 *
 * Subscriptions (monthly) still use `startCheckout` and redirect to Stripe's
 * hosted page — the in-page form supports one-time only for now.
 */
export async function createPaymentIntent(formData: FormData): Promise<PaymentIntentResult> {
  const stripe = getStripe()
  if (!stripe) {
    return { ok: false, message: 'Donations are not configured yet.' }
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
    return { ok: false, message: 'Email is required so we can send you a receipt.' }
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      receipt_email: donorEmail,
      // We don't want Stripe to redirect anywhere — Elements handles it
      // entirely on our page. `automatic_payment_methods` would enable
      // wallet redirects (PayPal, etc.); restrict to card to keep flow tight.
      payment_method_types: ['card'],
      description:
        donorName
          ? `Donation to Spartan Vanguard from ${donorName}`
          : 'Donation to Spartan Vanguard',
      metadata: {
        donor_name: donorName,
        donor_email: donorEmail,
        message,
        anonymous: String(anonymous),
        freq: 'once',
      },
    })
    if (!intent.client_secret) {
      return { ok: false, message: 'Stripe did not return a client secret.' }
    }
    return {
      ok: true,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      message: 'PaymentIntent created.',
    }
  } catch (e) {
    console.error('Stripe payment intent create failed:', e)
    return { ok: false, message: 'Could not start payment. Please try again.' }
  }
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
  const freq = formData.get('freq') === 'monthly' ? 'monthly' : 'once'

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

  const productData = {
    name:
      freq === 'monthly'
        ? 'Monthly donation to Spartan Vanguard'
        : 'Donation to Spartan Vanguard',
    description: 'Supports La Cañada High School math club programming.',
  }

  try {
    const session = await stripe.checkout.sessions.create(
      freq === 'monthly'
        ? {
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: donorEmail,
            success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/donate/cancel`,
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  unit_amount: amountCents,
                  recurring: { interval: 'month' },
                  product_data: productData,
                },
                quantity: 1,
              },
            ],
            metadata: {
              donor_name: donorName,
              donor_email: donorEmail,
              message,
              anonymous: String(anonymous),
              freq,
            },
          }
        : {
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
                  product_data: productData,
                },
                quantity: 1,
              },
            ],
            metadata: {
              donor_name: donorName,
              donor_email: donorEmail,
              message,
              anonymous: String(anonymous),
              freq,
            },
          },
    )

    if (!session.url) {
      return { ok: false, message: 'Stripe did not return a checkout URL.' }
    }
    return { ok: true, message: 'Redirecting…', url: session.url }
  } catch (e) {
    console.error('Stripe checkout session create failed:', e)
    return { ok: false, message: 'Could not start checkout. Please try again.' }
  }
}
