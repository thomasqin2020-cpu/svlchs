import type { Metadata } from "next"
import Link from "next/link"
import { fetchOfficers } from "@/lib/data"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, Figure, PhotoRow } from "@/components/site/site-shell"
import { SubscribeForm } from "@/components/subscribe-form"
import { CLASSROOM_CODE, PHOTOS } from "@/lib/site-content"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Team",
  description: "The officers running Spartan Vanguard in 2026–2027, and how to reach them.",
}

export default async function TeamPage() {
  const [officers, currentMember] = await Promise.all([fetchOfficers(), getCurrentMember()])
  const year = officers[0]?.schoolYear || "2026–2027"

  return (
    <SiteShell currentMember={currentMember}>
      <main id="top" className="sv-main">
        <section className="sv-page-head">
          <h1 className="sv-title sv-rise">The team</h1>
          <p className="sv-lead sv-rise sv-rise-2">The six student officers who run Spartan Vanguard’s meetings, write the tournament problems and organise the trips, for {year}.</p>
          <div className="sv-rise sv-rise-3"><Link href="/contact" className="sv-button">Write to the officers</Link></div>
        </section>

        <section className="sv-lineup sv-lineup-officers" aria-label="Officers">
          <h2 className="sv-lineup-heading" data-sv-reveal>Officers</h2>
          {officers.map((o) => (
            <div className="sv-row sv-row-officer" key={o.id} data-sv-reveal>
              <span className="sv-officer-name">
                {o.photoUrl ? (
                  // Officer photos live in Supabase Storage, whose host is not fixed in next.config, so this stays a plain image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.photoUrl} alt="" className="sv-officer-photo" width={56} height={56} loading="lazy" />
                ) : null}
                {o.name}
              </span>
              <span className="sv-row-end">{o.role}</span>
            </div>
          ))}
        </section>

        <Figure photo={PHOTOS.aleph3} />

        <section className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>Reach us</h2>
          <div className="sv-split-body">
            <p className="sv-large" data-sv-reveal>Questions about a competition, sponsorship or joining go to the officers through the contact form.</p>
            <p data-sv-reveal>An officer replies, usually within a few days.</p>
            <div className="sv-actions" data-sv-reveal>
              <Link href="/contact" className="sv-button">Write to the officers</Link>
              <Link href="/donate" className="sv-button sv-button-ghost">Donate</Link>
            </div>
            <h3 className="sv-h3" data-sv-reveal>Joining</h3>
            <p data-sv-reveal>Any La Cañada student in grades 7 to 12 can join. Sign up on this site with the Google Classroom code <strong className="sv-code">{CLASSROOM_CODE}</strong>, then come to a meeting.</p>
            <p data-sv-reveal><Link href="/signup" className="sv-button sv-button-small">Sign up</Link></p>
            <h3 className="sv-h3" data-sv-reveal>Announcements by email</h3>
            <SubscribeForm />
          </div>
        </section>

        <PhotoRow photos={[PHOTOS.mathDay, PHOTOS.bmt, PHOTOS.foothills]} />
      </main>
    </SiteShell>
  )
}
