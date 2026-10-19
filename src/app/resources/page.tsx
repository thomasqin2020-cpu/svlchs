import type { Metadata } from "next"
import Link from "next/link"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, PageHead, Bar, Figure, PhotoRow, Question } from "@/components/site/site-shell"
import { RESOURCES, WORKSHEETS, ACTIVITIES, PHOTOS, type Resource } from "@/lib/site-content"

export const metadata: Metadata = {
  title: "Resources",
  description: "Books, problem sets, worksheets and activities the Spartan Vanguard officers use for competition math.",
}

function Bars({ items, firstOpen = false }: { items: Resource[]; firstOpen?: boolean }) {
  return (
    <>
      {items.map((r, i) => (
        <Bar key={r.name} label={r.name} open={firstOpen && i === 0}>
          <p className="sv-bar-text">{r.description}</p>
          <div className="sv-bar-line"><span></span><span><a href={r.link} rel="noopener">Open</a></span></div>
        </Bar>
      ))}
    </>
  )
}

export default async function ResourcesPage() {
  const currentMember = await getCurrentMember()
  return (
    <SiteShell currentMember={currentMember}>
      <main id="top" className="sv-main">
        <PageHead
          tone="sage"
          title={<>Start<br />here</>}
          lead="Books, problem sets and worksheets for competition math, chosen by the officers. Everything here is free except the Art of Problem Solving volumes."
          action={<a href={RESOURCES[0].link} className="sv-button sv-button-big sv-button-orange" rel="noopener">Open AMC Trivial</a>}
          photo={PHOTOS.foothills}
        />

        <section className="sv-bars-section">
          <div className="sv-bars">
            <h2 className="sv-giant-word" data-sv-reveal>Read</h2>
            <Bars items={RESOURCES} firstOpen />
          </div>
        </section>

        <Figure photo={PHOTOS.bmt} tone="orange" />

        <section className="sv-bars-section">
          <div className="sv-bars">
            <h2 className="sv-giant-word" data-sv-reveal>Do</h2>
            <Bars items={[...WORKSHEETS, ...ACTIVITIES]} />
          </div>
        </section>

        <PhotoRow photos={[PHOTOS.mathDay, PHOTOS.aleph3, PHOTOS.foothills]} />

        <Question
          top="Read"
          bottom="or come?"
          left={<a href={RESOURCES[1].link} className="sv-button sv-button-wide sv-button-yellow" rel="noopener">The AoPS books</a>}
          right={<Link href="/signup" className="sv-button sv-button-wide sv-button-orange">Join the club</Link>}
          note="Meetings are where the problems get worked through on the board, with people who have seen them before."
        />
      </main>
    </SiteShell>
  )
}
