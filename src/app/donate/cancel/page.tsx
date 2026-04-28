import Link from 'next/link'

export default function DonateCancel() {
  return (
    <main className="public-form-shell">
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          Checkout cancelled.
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 15, lineHeight: 1.55 }}>
          No charge was made. If something went wrong, please reach out at <Link href="/contact" style={{ color: 'var(--accent)' }}>/contact</Link>.
        </p>
        <Link href="/donate" className="pill" style={{ marginTop: 20, display: 'inline-block' }}>Try again</Link>
      </div>
    </main>
  )
}
