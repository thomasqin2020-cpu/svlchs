import { NextResponse, type NextRequest } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendEmail, donationThanksEmail } from '@/lib/email'

/**
 * Stripe webhook. Called by Stripe after Checkout sessions complete.
 * Listens for `checkout.session.completed` and inserts a row into `donations`.
 *
 * Secret env vars required:
 *  - STRIPE_SECRET_KEY        (used by getStripe)
 *  - STRIPE_WEBHOOK_SECRET    (used to verify the signature)
 *  - SUPABASE_SERVICE_ROLE_KEY (writes to donations, bypasses RLS)
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'stripe not configured' }, { status: 500 })
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'webhook secret missing' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (e) {
    console.error('webhook signature verification failed:', e)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  // Handle two event types:
  //   - checkout.session.completed   → from the legacy Stripe Checkout redirect
  //   - payment_intent.succeeded     → from the in-page Stripe Elements card form
  // Both write the same shape into `donations`. The dual handler lets us keep
  // the redirect flow as a fallback (e.g., for monthly subscriptions, which
  // still go through Checkout) while the new card UI handles one-time charges.
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    console.error('webhook: SUPABASE_SERVICE_ROLE_KEY missing')
    return NextResponse.json({ error: 'supabase admin not configured' }, { status: 500 })
  }

  let donationRow:
    | {
        stripe_checkout_session_id: string | null
        stripe_payment_intent_id: string | null
        amount_cents: number
        currency: string
        donor_name: string | null
        donor_email: string | null
        anonymous: boolean
        message: string | null
      }
    | null = null
  let conflictKey: 'stripe_checkout_session_id' | 'stripe_payment_intent_id' = 'stripe_checkout_session_id'
  let donorEmail: string | null = null
  let donorName: string | null = null
  let amountCents = 0

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata ?? {}
    donationRow = {
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string' ? session.payment_intent : null,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      donor_name: meta.donor_name || session.customer_details?.name || null,
      donor_email: meta.donor_email || session.customer_details?.email || null,
      anonymous: meta.anonymous === 'true',
      message: meta.message || null,
    }
    conflictKey = 'stripe_checkout_session_id'
    donorEmail = donationRow.donor_email
    donorName = donationRow.donor_name
    amountCents = donationRow.amount_cents
  } else if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const meta = intent.metadata ?? {}
    donationRow = {
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: intent.id,
      amount_cents: intent.amount_received ?? intent.amount ?? 0,
      currency: intent.currency ?? 'usd',
      donor_name: meta.donor_name || null,
      donor_email: meta.donor_email || intent.receipt_email || null,
      anonymous: meta.anonymous === 'true',
      message: meta.message || null,
    }
    conflictKey = 'stripe_payment_intent_id'
    donorEmail = donationRow.donor_email
    donorName = donationRow.donor_name
    amountCents = donationRow.amount_cents
  } else {
    // Other events we don't care about (yet) — ack so Stripe doesn't retry.
    return NextResponse.json({ received: true })
  }

  const { error } = await supabase
    .from('donations')
    .upsert(donationRow, { onConflict: conflictKey })

  if (error) {
    console.error('webhook: failed to upsert donation:', error)
    return NextResponse.json({ error: 'db write failed' }, { status: 500 })
  }

  // Fire a personal thank-you email (Stripe also sends an automatic receipt).
  if (donorEmail) {
    sendEmail({
      to: donorEmail,
      subject: 'Thank you for supporting Spartan Vanguard',
      html: donationThanksEmail({ donorName, amountCents }),
    }).catch(() => {})
  }

  return NextResponse.json({ received: true })
}
