import type { Metadata } from "next"
import Link from "next/link"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, PageHead, Bar, Figure, PhotoRow, Question } from "@/components/site/site-shell"
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
        <PageHead
          tone="sage"
          title={<>Nine meets<br />a year</>}
          lead="The competitions Spartan Vanguard enters in 2026–2027, from the AMC in November to the spring tournaments at Stanford and Caltech. Two of them are ours."
          action={<Link href="/signup" className="sv-button sv-button-big sv-button-orange">Join to compete</Link>}
          photo={PHOTOS.bmt}
        />

        <section className="sv-bars-section">
          <div className="sv-bars">
            <h2 className="sv-giant-word" data-sv-reveal>Meets</h2>
            {COMPETITIONS.map((c, i) => (
              <Bar key={c.name} label={c.name} open={i === 0}>
                <p className="sv-bar-text">{c.description}</p>
                <div className="sv-bar-line"><span>{c.format}</span><span>{c.when}</span></div>
                <div className="sv-bar-line"><span>{c.where}</span><span>{c.internal ? <Link href={c.internal}>Register</Link> : c.link ? <a href={c.link} rel="noopener">Official site</a> : ""}</span></div>
              </Bar>
            ))}
          </div>
        </section>

        <Figure photo={PHOTOS.mathDay} tone="yellow" />

        <section className="sv-panel sv-tone-black">
          <div className="sv-panel-grid">
            <h2 className="sv-panel-heading" data-sv-reveal>How to compete</h2>
            <div className="sv-panel-body">
              <p className="sv-large" data-sv-reveal>Come to a meeting first. The AMC is taken on campus and open to every member; the travel tournaments take teams of four to six, chosen from the people who have been practicing.</p>
              <p data-sv-reveal>Entry fees and travel are covered by the club wherever we can manage it.</p>
            </div>
          </div>
        </section>

        <PhotoRow photos={[PHOTOS.aleph3, PHOTOS.foothills, PHOTOS.bmt]} />

        <Question
          top="Practice"
          bottom="or compete?"
          left={<Link href="/signup" className="sv-button sv-button-wide sv-button-orange">Join the club</Link>}
          right={<Link href="/tournaments" className="sv-button sv-button-wide sv-button-yellow">VMT and Aleph</Link>}
          note="Members practice on Tuesdays and Thursdays; anyone in the right grades can enter our two tournaments."
        />
      </main>
    </SiteShell>
  )
}
