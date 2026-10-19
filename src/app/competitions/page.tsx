import type { Metadata } from "next"
import Link from "next/link"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, Figure, PhotoRow } from "@/components/site/site-shell"
import { COMPETITIONS, PHOTOS } from "@/lib/site-content"

export const metadata: Metadata = {
  title: "Competitions",
  description: "The competitions Spartan Vanguard trains for and attends during the 2026–2027 season.",
}

export default async function CompetitionsPage() {
  const currentMember = await getCurrentMember()
  return (
    <SiteShell currentMember={currentMember}>
      <main id="top" className="sv-main">
        <section className="sv-page-head">
          <h1 className="sv-title sv-rise">Competitions</h1>
          <p className="sv-lead sv-rise sv-rise-2">The nine competitions Spartan Vanguard enters in 2026–2027, from the AMC in November to the spring tournaments at Stanford and Caltech. Two of them are ours.</p>
          <div className="sv-rise sv-rise-3"><Link href="/signup" className="sv-button">Join the club to compete</Link></div>
        </section>

        <section className="sv-lineup" aria-label="The season">
          <h2 className="sv-lineup-heading" data-sv-reveal>The season</h2>
          {COMPETITIONS.map((c) => (
            <div className="sv-row" key={c.name} data-sv-reveal>
              <span>
                {c.internal ? <Link href={c.internal}>{c.name}</Link> : c.link ? <a href={c.link} rel="noopener">{c.name}</a> : c.name}
              </span>
              <span>{c.format}</span>
              <span>{c.where}</span>
              <span className="sv-row-end">{c.when}</span>
            </div>
          ))}
        </section>

        <Figure photo={PHOTOS.bmt} />

        <section className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>What each one is</h2>
          <div className="sv-split-body">
            {COMPETITIONS.map((c) => (
              <article key={c.name} className="sv-announcement" data-sv-reveal>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                {c.link ? <p><a href={c.link} rel="noopener">Official site</a></p> : null}
                {c.internal ? <p><Link href={c.internal}>Register</Link></p> : null}
              </article>
            ))}
          </div>
        </section>

        <PhotoRow photos={[PHOTOS.mathDay, PHOTOS.aleph3, PHOTOS.foothills]} />

        <section className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>How to compete</h2>
          <div className="sv-split-body">
            <p className="sv-large" data-sv-reveal>Come to a meeting first. The AMC is taken on campus and open to every member; the travel tournaments take teams of four to six, chosen from the people who have been practicing.</p>
            <p data-sv-reveal>Entry fees and travel are covered by the club wherever we can manage it.</p>
            <p data-sv-reveal><Link href="/signup" className="sv-button">Join the club</Link></p>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
