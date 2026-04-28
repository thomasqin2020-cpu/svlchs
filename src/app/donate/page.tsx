import { DonateForm } from './donate-form'
import { SUGGESTED_AMOUNTS_USD } from '@/lib/stripe'

export default function DonatePage() {
  return (
    <main className="public-form-shell">
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <div style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Spartan Vanguard
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 38, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
          Support the math club.
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 15, lineHeight: 1.55 }}>
          Donations cover competition prizes, materials, pizza for participants, and travel to invitationals.
          100% of contributions go directly to club programming. La Cañada High School is a public school —
          gifts may be tax-deductible. We&rsquo;ll email you a receipt.
        </p>
      </div>
      <DonateForm amounts={[...SUGGESTED_AMOUNTS_USD]} />
    </main>
  )
}
