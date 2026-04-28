import Link from 'next/link'

/**
 * Minimal shell for /signup, /login, /auth/callback.
 * Keeps the same dark theme as the main site without loading the full nav.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <header className="auth-header">
        <Link href="/" className="auth-brand">SV · Spartan Vanguard</Link>
      </header>
      <section className="auth-content">{children}</section>
    </main>
  )
}
