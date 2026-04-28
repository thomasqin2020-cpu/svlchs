# Supabase Setup Walkthrough

This file walks you (the project owner) through getting Supabase wired up so the new auth, admin dashboard, donations ledger, and form submissions all work in production.

## 1. Create a Supabase project

You said you already have a Supabase account. Skip to step 2 if you have a project too.

1. Go to https://supabase.com/dashboard.
2. Click **"New project"**.
3. Name it `spartan-vanguard`. Pick a strong DB password and **save it** in a password manager.
4. Region: pick the closest US region (e.g. `us-west-1`).
5. Wait ~2 minutes for the project to provision.

## 2. Run the schema migrations

Open **SQL Editor** in your new project, then run the two migration files in order:

1. `supabase/migrations/0001_init.sql` — creates all tables, RLS policies, the `is_admin()` helper, and the storage bucket comment.
2. `supabase/migrations/0002_seed.sql` — seeds default `site_config` rows, the 2025–2026 cabinet (hidden), and the two flagship events.

Paste each file's contents into a new query and hit **Run**. Both should complete without errors.

## 3. Create the officer-photos storage bucket

Still in the Supabase dashboard:

1. Go to **Storage** → **Create bucket**.
2. Name: `officer-photos`. Public: **YES** (so photos render on the public site).
3. Click **Create**. You're done.

## 4. Get your API keys

Settings → API. Copy these three values:

| Value | Used as |
|---|---|
| `Project URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` |

> The `service_role` key bypasses RLS. **Never** expose it to the browser. It's only used server-side by the Stripe webhook.

## 5. Add env vars to Vercel + .env.local

In your local repo:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# For magic-link redirects + email links to point to the right host
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Officer notification email (where form submissions get forwarded)
OFFICER_NOTIFICATION_EMAIL=officers@svlchs.org

# Resend (see below)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Spartan Vanguard <hello@svlchs.org>
```

Then in **Vercel → Settings → Environment Variables**, add the same set — but flip `NEXT_PUBLIC_SITE_URL` to your production domain.

## 6. Configure auth redirect URLs in Supabase

Settings → Authentication → URL Configuration.

Add to "Redirect URLs":
- `http://localhost:3000/auth/callback`
- `https://YOUR-VERCEL-DOMAIN/auth/callback`
- (later) `https://svlchs.org/auth/callback`

Set "Site URL" to your production domain.

## 7. Make yourself an admin

After the first time you sign up via `/signup`, go to **SQL Editor** and run:

```sql
update public.members
set role = 'admin'
where email = 'thomasqin2020@gmail.com';
```

Refresh the site — you'll now see `/admin` working. Repeat for any other officer who needs admin.

## 8. Email setup (Resend)

1. Sign up at https://resend.com (free tier covers ~100 emails/day).
2. **Domains** → **Add domain** → enter `svlchs.org` (or whichever domain you'll use).
3. Add the DNS records Resend gives you (SPF, DKIM, DMARC) at your domain registrar. Verification usually takes 10–60 minutes.
4. Until verification finishes, you can use the sandbox `onboarding@resend.dev` from-address — but Resend will only deliver emails to the email you signed up with.
5. Get an API key from **API Keys**, paste into env as `RESEND_API_KEY`.

## 9. Stripe setup

See [STRIPE_SETUP.md](STRIPE_SETUP.md).

## 10. Test end-to-end

After deploy:

1. Visit `/signup`, use the Classroom code `hsx4c54`. Confirm magic-link arrives.
2. Promote yourself to admin (step 7).
3. Visit `/admin/officers`, create your 2026–2027 cabinet entries.
4. Visit `/admin/announcements`, create one members-only announcement. Confirm logged-out user can't see it but you can.
5. Submit a contact form, confirm email arrives at `OFFICER_NOTIFICATION_EMAIL`.
6. Trigger a Stripe test donation, confirm it lands at `/admin/donations`.
7. Open `/events.ics` in browser, confirm it downloads a valid calendar.

## Inviting officers to view the Supabase project

In Supabase → **Settings → Team** (or the gear icon), click **Invite a member** and paste their email. They get a Supabase login and can see the same data you do (read-only or admin depending on the role you give them).
