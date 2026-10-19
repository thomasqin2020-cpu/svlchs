import type { Metadata } from "next"
import Link from "next/link"
import { fetchOfficers } from "@/lib/data"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, PageHead, Figure, PhotoRow, Question } from "@/components/site/site-shell"
import { SubscribeForm } from "@/components/subscribe-form"
import { CLASSROOM_CODE, PHOTOS } from "@/lib/site-content"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Team",
  description: "The officers running Spartan Vanguard in 2026–2027, and how to reach them.",
}

const TONES = ['black', 'orange', 'sage', 'yellow', 'sage', 'orange'] as const

export default async function TeamPage() {
  const [officers, currentMember] = await Promise.all([fetchOfficers(), getCurrentMember()])
  const year = officers[0]?.schoolYear || "2026–2027"

  return (
    <SiteShell currentMember={currentMember}>
      <main id="top" className="sv-main">
        <PageHead
          tone="orange"
          title={<>Six of us<br />run it</>}
          lead={`The student officers who run Spartan Vanguard’s meetings, write the tournament problems and organise the trips, for ${year}.`}
          action={<Link href="/contact" className="sv-button sv-button-big sv-button-orange">Write to the officers</Link>}
          photo={PHOTOS.mathDay}
        />

        <section className="sv-tiles sv-tiles-officers" aria-label="Officers">
          {officers.map((o, i) => (
            <div key={o.id} className={`sv-tile sv-tile-officer sv-tone-${TONES[i % TONES.length]}`} data-sv-reveal style={{ transitionDelay: `${i * 60}ms` }}>
              {o.photoUrl ? (
                // Officer photos live in Supabase Storage, whose host is not fixed in next.config, so this stays a plain image.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.photoUrl} alt="" className="sv-officer-photo" width={96} height={96} loading="lazy" />
              ) : null}
              <span className="sv-tile-name">{o.name}</span>
              <span className="sv-tile-label">{o.role}</span>
            </div>
          ))}
        </section>

        <Figure photo={PHOTOS.aleph3} tone="yellow" />

        <section className="sv-panel sv-tone-black">
          <div className="sv-panel-grid">
            <h2 className="sv-panel-heading" data-sv-reveal>Reach us</h2>
            <div className="sv-panel-body">
              <p className="sv-large" data-sv-reveal>Questions about a competition, sponsorship or joining go to the officers through the contact form.</p>
              <p data-sv-reveal>An officer replies, usually within a few days.</p>
              <div className="sv-actions" data-sv-reveal>
                <Link href="/contact" className="sv-button sv-button-orange">Write to the officers</Link>
                <Link href="/donate" className="sv-button sv-button-ghost">Donate</Link>
              </div>
              <h3 className="sv-h3" data-sv-reveal>Joining</h3>
              <p data-sv-reveal>Any La Cañada student in grades 7 to 12 can join. Sign up on this site with the Google Classroom code <strong className="sv-code">{CLASSROOM_CODE}</strong>, then come to a meeting.</p>
              <h3 className="sv-h3" data-sv-reveal>Announcements by email</h3>
              <SubscribeForm />
            </div>
          </div>
        </section>

        <PhotoRow photos={[PHOTOS.bmt, PHOTOS.foothills, PHOTOS.mathDay]} />

        <Question
          top="Join"
          bottom="or ask?"
          left={<Link href="/signup" className="sv-button sv-button-wide sv-button-orange">Sign up</Link>}
          right={<Link href="/contact" className="sv-button sv-button-wide sv-button-yellow">Contact</Link>}
          note="Signing up takes the Classroom code; asking takes a sentence."
        />
      </main>
    </SiteShell>
  )
}
