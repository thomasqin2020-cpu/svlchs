import type { Metadata } from "next"
import Link from "next/link"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, Figure, PhotoRow } from "@/components/site/site-shell"
import { RESOURCES, WORKSHEETS, ACTIVITIES, PHOTOS, type Resource } from "@/lib/site-content"

export const metadata: Metadata = {
  title: "Resources",
  description: "Books, problem sets, worksheets and activities the Spartan Vanguard officers use for competition math.",
}

function ResourceList({ items }: { items: Resource[] }) {
  return (
    <div className="sv-split-body">
      {items.map((r) => (
        <article key={r.name} className="sv-announcement" data-sv-reveal>
          <h3><a href={r.link} rel="noopener">{r.name}</a></h3>
          <p>{r.description}</p>
        </article>
      ))}
    </div>
  )
}

export default async function ResourcesPage() {
  const currentMember = await getCurrentMember()
  return (
    <SiteShell currentMember={currentMember}>
      <main id="top" className="sv-main">
        <section className="sv-page-head">
          <h1 className="sv-title sv-rise">Resources</h1>
          <p className="sv-lead sv-rise sv-rise-2">Books, problem sets and worksheets for competition math, chosen by the officers. Everything here is free except the Art of Problem Solving volumes.</p>
          <div className="sv-rise sv-rise-3"><a href={RESOURCES[0].link} className="sv-button" rel="noopener">Start with AMC Trivial</a></div>
        </section>

        <section className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>Recommended</h2>
          <ResourceList items={RESOURCES} />
        </section>

        <Figure photo={PHOTOS.foothills} />

        <section className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>Worksheets</h2>
          <ResourceList items={WORKSHEETS} />
        </section>

        <section className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>Activities</h2>
          <ResourceList items={ACTIVITIES} />
        </section>

        <PhotoRow photos={[PHOTOS.mathDay, PHOTOS.bmt, PHOTOS.aleph3]} />

        <section className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>Practice with us</h2>
          <div className="sv-split-body">
            <p className="sv-large" data-sv-reveal>Meetings are where the problems get worked through on the board.</p>
            <p data-sv-reveal><Link href="/signup" className="sv-button">Join the club</Link></p>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
