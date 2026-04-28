import Link from 'next/link'

export default function DonateSuccess() {
  return (
    <main className="public-form-shell">
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          Thank you.
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 15, lineHeight: 1.55 }}>
          Your donation went through. Stripe will email you a receipt within a few minutes.
          Every dollar goes back into pizza, prizes, and travel for the club.
        </p>
        <Link href="/" className="pill" style={{ marginTop: 20, display: 'inline-block' }}>Back to home</Link>
      </div>
    </main>
  )
}
