# Stripe Setup Walkthrough

This guide covers creating a Stripe account, putting it in test mode, hooking it up to Spartan Vanguard, and switching to live mode for real donations. It assumes you're the club treasurer or president and you have access to the Vercel project + Supabase project.

## 1. Create a Stripe account

1. Go to https://dashboard.stripe.com/register
2. Sign up with the **club's email address** (e.g. `treasurer@svlchs.org` or whatever the officers share). Avoid using a personal email — accounts are hard to transfer when officers graduate.
3. When asked for a business name, use **"Spartan Vanguard – La Cañada High School Math Club"** or similar. For business type, "Nonprofit / Club" works.
4. You DO NOT need to activate the account to test. Stripe gives you full access to **Test mode** immediately.

## 2. Get your test API keys

1. In the Stripe dashboard, make sure the toggle in the top-left says **"Test mode"** (not "Live").
2. Click **Developers → API keys**.
3. Copy:
   - **Publishable key** — starts with `pk_test_`
   - **Secret key** — click "Reveal", starts with `sk_test_`

## 3. Add the keys to Vercel + local .env

In your project's `.env.local` (and in **Vercel → Settings → Environment Variables**, all three environments):

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=        # Filled in step 5
```

After adding to Vercel, redeploy so the env vars take effect.

## 4. Test the donate flow locally

```bash
npm run dev
```

Visit http://localhost:3000/donate, pick $10, and use Stripe's test card:

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | any future date (e.g. `12/34`) |
| CVC | any 3 digits |
| ZIP | any |

You should land on `/donate/success`. The donation **won't appear** in `/admin/donations` yet — that requires the webhook (next step).

## 5. Set up the webhook (so donations land in the admin dashboard)

Stripe needs a way to call your site after a successful charge. There are two paths:

### Path A — Local testing with Stripe CLI

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/donate/webhook
   ```
3. The CLI prints a webhook signing secret like `whsec_...`. Copy it.
4. Put it in `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
5. Restart `npm run dev` and try another `$10` donation. The CLI will log `checkout.session.completed`, and the row will appear at `/admin/donations`.

### Path B — Production webhook

1. After your first deploy with the Stripe keys set, visit https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**.
3. Endpoint URL: `https://YOUR-VERCEL-DOMAIN/api/donate/webhook`
4. Events to send: just `checkout.session.completed`.
5. After creating, click into the endpoint and **reveal the signing secret** (starts with `whsec_`).
6. In Vercel → Settings → Environment Variables, add `STRIPE_WEBHOOK_SECRET` with that value. Redeploy.

## 6. Required Supabase env (already set if Step 2 of the overhaul is done)

The webhook writes via the **service role** key, which bypasses RLS. Make sure these are in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...   # PRIVATE — never commit, never expose to the browser
```

## 7. Going live

Before flipping to live mode you must:

1. Complete Stripe's **business verification** (officer's legal name + EIN if the school district has set up a tax ID for the club; otherwise the verifying officer's SSN, treated confidentially).
2. Add a bank account for payouts.
3. Re-run steps 2 and 5 with the **Live** toggle on. You'll get new keys (`sk_live_`, `pk_live_`, `whsec_` for live endpoint). Update Vercel env vars.
4. Update the Stripe webhook in **Live mode** with the same endpoint URL.
5. Make a small real donation ($1) to confirm the end-to-end flow.

## 8. Receipts

Stripe automatically emails a receipt to the customer email used at checkout. You don't need to do anything to enable this. To customize the look, go to **Settings → Branding** in Stripe.

## Failure modes to watch

- **Test donations never appear in `/admin/donations`**: the webhook isn't wired up. Check `stripe listen` (Path A) or the dashboard webhook history (Path B) for failed deliveries.
- **Webhook returns 400 invalid signature**: `STRIPE_WEBHOOK_SECRET` is wrong or copied with whitespace. Re-copy from the dashboard.
- **`/donate` says "Donations are not configured yet"**: `STRIPE_SECRET_KEY` is missing in the running environment. Check Vercel, redeploy, and confirm with `vercel env ls`.

## Officer handoff checklist

When the current treasurer graduates:
1. Add the next treasurer as a **team member** in Stripe (Settings → Team).
2. Verify they can see Test + Live modes.
3. Update the email on the account if it was personal.
4. Rotate the Stripe webhook signing secret (Vercel env update + redeploy) if you suspect anyone outside the team had access.
