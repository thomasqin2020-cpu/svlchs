import { ContactForm } from './contact-form'

export default function ContactPage() {
  return (
    <main className="public-form-shell">
      <div style={{ textAlign: 'center', maxWidth: 540 }}>
        <div style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Spartan Vanguard
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          Get in touch.
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 15, lineHeight: 1.5 }}>
          Questions about a competition, sponsorships, or joining the club? Drop us a note and an officer will reply.
        </p>
      </div>
      <ContactForm />
    </main>
  )
}
