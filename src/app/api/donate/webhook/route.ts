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

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    console.error('webhook: SUPABASE_SERVICE_ROLE_KEY missing')
    return NextResponse.json({ error: 'supabase admin not configured' }, { status: 500 })
  }

  const meta = session.metadata ?? {}

  const { error } = await supabase.from('donations').upsert(
    {
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      donor_name: meta.donor_name || session.customer_details?.name || null,
      donor_email: meta.donor_email || session.customer_details?.email || null,
      anonymous: meta.anonymous === 'true',
      message: meta.message || null,
    },
    { onConflict: 'stripe_checkout_session_id' }
  )

  if (error) {
    console.error('webhook: failed to upsert donation:', error)
    return NextResponse.json({ error: 'db write failed' }, { status: 500 })
  }

  // Fire a personal thank-you email (Stripe also sends an automatic receipt).
  const donorEmail = (meta.donor_email as string | undefined) || session.customer_details?.email || null
  const donorName = (meta.donor_name as string | undefined) || session.customer_details?.name || null
  if (donorEmail) {
    sendEmail({
      to: donorEmail,
      subject: 'Thank you for supporting Spartan Vanguard',
      html: donationThanksEmail({ donorName, amountCents: session.amount_total ?? 0 }),
    }).catch(() => {})
  }

  return NextResponse.json({ received: true })
}
