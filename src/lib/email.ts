import { Resend } from 'resend'

/**
 * Resend wrapper. All template-aware helpers route through `sendEmail()`.
 * Returns false silently when env isn't configured so dev/prod degrades gracefully.
 *
 * Required env:
 *   RESEND_API_KEY
 *   RESEND_FROM_EMAIL          (e.g. "Spartan Vanguard <hello@svlchs.org>")
 *   OFFICER_NOTIFICATION_EMAIL (where officer alerts go)
 */
let _resend: Resend | null = null
function getResend(): Resend | null {
  if (_resend) return _resend
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  _resend = new Resend(key)
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Spartan Vanguard <onboarding@resend.dev>'
const OFFICERS = process.env.OFFICER_NOTIFICATION_EMAIL ?? ''

interface SendArgs {
  to: string | string[]
  subject: string
  /** HTML body. Use a tagged template literal or React Email's render(). */
  html: string
  /** Optional plain text fallback. */
  text?: string
  replyTo?: string
}

export async function sendEmail(args: SendArgs): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing — skipping send to', args.to)
    return false
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
    })
    return true
  } catch (e) {
    console.error('[email] Resend send failed:', e)
    return false
  }
}

export function notifyOfficers(args: Omit<SendArgs, 'to'>): Promise<boolean> {
  if (!OFFICERS) {
    console.warn('[email] OFFICER_NOTIFICATION_EMAIL not set — skipping officer notify')
    return Promise.resolve(false)
  }
  return sendEmail({ ...args, to: OFFICERS })
}

// ----------------------------------------------------------------------------
// Tiny HTML wrapper so every email shares a header / footer.
// React Email is installed for fancier templates if we want them later.
// ----------------------------------------------------------------------------
export function emailLayout(body: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1d1d1f;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.04);">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #ececec;">
          <strong style="font-size:14px;letter-spacing:-0.01em;">SV · Spartan Vanguard</strong>
          <span style="color:#6e6e73;font-size:13px;margin-left:8px;">La Cañada High School math club</span>
        </td></tr>
        <tr><td style="padding:28px 32px;font-size:15px;line-height:1.55;">${body}</td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #ececec;color:#6e6e73;font-size:12px;line-height:1.5;">
          You're getting this because you submitted a form on the Spartan Vanguard site. Reply to this email to reach an officer.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

// ----------------------------------------------------------------------------
// Template helpers — pure functions returning HTML strings.
// ----------------------------------------------------------------------------

export function membershipAckEmail(name: string): string {
  return emailLayout(`
    <p>Hi ${escapeHtml(name)},</p>
    <p>Thanks for signing up for Spartan Vanguard! An officer will review your sign-up and approve you within a few days.</p>
    <p>In the meantime, join our Google Classroom (code <strong>hsx4c54</strong>) and Remind (<strong>@lchssv</strong>) to get day-to-day updates.</p>
    <p>— The SV officer team</p>
  `)
}

export function membershipNotifyEmail(args: { name: string; email: string; grade: string; why: string }): string {
  return emailLayout(`
    <p><strong>New membership sign-up.</strong></p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(args.name)}</li>
      <li><strong>Email:</strong> ${escapeHtml(args.email)}</li>
      <li><strong>Grade:</strong> ${escapeHtml(args.grade || '—')}</li>
    </ul>
    <p><strong>Why joining:</strong></p>
    <p style="white-space:pre-wrap;">${escapeHtml(args.why || '—')}</p>
    <p>Approve or reject in <a href="${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL ?? '')}/admin/membership-signups">the admin dashboard</a>.</p>
  `)
}

export function compRegistrationAckEmail(args: { studentName: string; eventName: string; date?: string }): string {
  return emailLayout(`
    <p>Hi ${escapeHtml(args.studentName)},</p>
    <p>You're registered for <strong>${escapeHtml(args.eventName)}</strong>${args.date ? ` on ${escapeHtml(args.date)}` : ''}. We'll email you full event details (location, schedule, what to bring) closer to the date.</p>
    <p>If you need to make a change, just reply to this email.</p>
    <p>— Spartan Vanguard officers</p>
  `)
}

export function compRegistrationNotifyEmail(args: { studentName: string; eventName: string; school: string; grade: string; email: string; parentEmail: string; notes: string }): string {
  return emailLayout(`
    <p><strong>New ${escapeHtml(args.eventName)} registration.</strong></p>
    <ul>
      <li><strong>Student:</strong> ${escapeHtml(args.studentName)} (grade ${escapeHtml(args.grade || '—')})</li>
      <li><strong>School:</strong> ${escapeHtml(args.school || '—')}</li>
      <li><strong>Student email:</strong> ${escapeHtml(args.email)}</li>
      <li><strong>Parent email:</strong> ${escapeHtml(args.parentEmail || '—')}</li>
    </ul>
    ${args.notes ? `<p><strong>Notes:</strong></p><p style="white-space:pre-wrap;">${escapeHtml(args.notes)}</p>` : ''}
  `)
}

export function contactAckEmail(name: string): string {
  return emailLayout(`
    <p>Hi ${escapeHtml(name)},</p>
    <p>We got your message. An officer will reply within a few days.</p>
    <p>— Spartan Vanguard</p>
  `)
}

export function contactNotifyEmail(args: { name: string; email: string; message: string }): string {
  return emailLayout(`
    <p><strong>New contact form submission.</strong></p>
    <p><strong>From:</strong> ${escapeHtml(args.name)} &lt;${escapeHtml(args.email)}&gt;</p>
    <p style="white-space:pre-wrap;border-left:3px solid #b08d3a;padding-left:12px;">${escapeHtml(args.message)}</p>
  `)
}

export function welcomeApprovedEmail(name: string): string {
  return emailLayout(`
    <p>Welcome, ${escapeHtml(name)} —</p>
    <p>You're now an approved Spartan Vanguard member. You can sign in at any time at <a href="${escapeHtml(process.env.NEXT_PUBLIC_SITE_URL ?? '')}/login">/login</a> using a one-tap email link to see member-only announcements.</p>
    <p>Meeting times are on the homepage. See you there.</p>
    <p>— SV officers</p>
  `)
}

export function donationThanksEmail(args: { donorName: string | null; amountCents: number }): string {
  const name = args.donorName ?? 'friend'
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(args.amountCents / 100)
  return emailLayout(`
    <p>Thank you, ${escapeHtml(name)} —</p>
    <p>Your <strong>${escapeHtml(amount)}</strong> donation just landed in the Spartan Vanguard account. Stripe will send a separate receipt for tax purposes; this is just a personal thanks from the officers.</p>
    <p>Every dollar covers competition prizes, materials, and pizza for the kids who show up. We appreciate it.</p>
    <p>— Spartan Vanguard, La Cañada HS</p>
  `)
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
