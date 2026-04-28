import { notFound } from 'next/navigation'
import { RegisterForm } from './register-form'

const VALID_SLUGS = new Set(['vmt', 'aleph'])

const META: Record<string, { name: string; tagline: string }> = {
  vmt: {
    name: 'Vanguard Math Tournament',
    tagline: 'Annual middle-school tournament. Grades 6–8. La Cañada High School.',
  },
  aleph: {
    name: 'Aleph',
    tagline: 'High school math competition. Grades 9–12. La Cañada High School.',
  },
}

export default async function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!VALID_SLUGS.has(slug)) notFound()
  const meta = META[slug]

  return (
    <main className="public-form-shell">
      <div style={{ textAlign: 'center', maxWidth: 540 }}>
        <div style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Spartan Vanguard
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          Register for {meta.name}.
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 15, lineHeight: 1.5 }}>{meta.tagline}</p>
      </div>
      <RegisterForm slug={slug} />
    </main>
  )
}
