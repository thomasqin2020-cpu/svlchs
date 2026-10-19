import type { Metadata } from "next"
import Link from "next/link"
import { fetchEvents } from "@/lib/data"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, PageHead, Figure, PhotoRow, Question } from "@/components/site/site-shell"
import { PHOTOS, formatDate } from "@/lib/site-content"
import type { Event } from "@/types/content"

export const revalidate = 60

export const metadata: Metadata = {
  title: "VMT and Aleph",
  description: "The two free tournaments Spartan Vanguard hosts at La Cañada High School every spring: VMT for grades 6 to 8 and Aleph for grades 9 to 12.",
}

function findEvent(events: Event[], key: string): Event | undefined {
  return events.find((e) => e.name.toLowerCase().includes(key))
}

function TournamentPanel({ id, tone, title, grades, month, blurb, event }: { id: string; tone: 'black' | 'orange'; title: string; grades: string; month: string; blurb: string; event?: Event }) {
  return (
    <section id={id} className={`sv-panel sv-tone-${tone} sv-tournament`}>
      <div className="sv-panel-grid">
        <div>
          <h2 className="sv-panel-heading" data-sv-reveal>{title}</h2>
          <p className="sv-panel-date" data-sv-reveal>{event ? formatDate(event.date) : `${month} 2027, date to be announced`}</p>
        </div>
        <div className="sv-panel-body">
          <p className="sv-large" data-sv-reveal>{event?.location || "La Cañada High School"}. {event?.grades || grades}.</p>
          <p data-sv-reveal>{blurb}</p>
          <div className="sv-actions" data-sv-reveal>
            {event?.signUpLink ? <Link href={event.signUpLink} className={`sv-button ${tone === 'black' ? 'sv-button-orange' : 'sv-button-black'}`}>Register</Link> : null}
            {event?.volunteerLink ? <a href={event.volunteerLink} className="sv-button sv-button-ghost" rel="noopener">Volunteer</a> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function TournamentsPage() {
  const [events, currentMember] = await Promise.all([fetchEvents(), getCurrentMember()])
  const vmt = findEvent(events, "vanguard") ?? findEvent(events, "vmt")
  const aleph = findEvent(events, "aleph")

  return (
    <SiteShell currentMember={currentMember}>
      <main id="top" className="sv-main">
        <PageHead
          tone="yellow"
          title={<>VMT and<br />Aleph</>}
          lead="Two free math tournaments at La Cañada High School every spring, written, run and graded by the club’s officers."
          action={<Link href={vmt?.signUpLink || "/competitions/vmt/register"} className="sv-button sv-button-big sv-button-orange">Register a team</Link>}
          photo={PHOTOS.aleph3}
        />

        <section className="sv-tiles sv-tiles-pair" aria-label="Who competes">
          <div className="sv-tile sv-tone-sage" data-sv-reveal>
            <span className="sv-tile-figure">6–8</span>
            <p className="sv-tile-label">Grades at VMT, February</p>
          </div>
          <div className="sv-tile sv-tone-orange" data-sv-reveal style={{ transitionDelay: "80ms" }}>
            <span className="sv-tile-figure">9–12</span>
            <p className="sv-tile-label">Grades at Aleph, March</p>
          </div>
        </section>

        <TournamentPanel
          id="vmt"
          tone="black"
          title="Vanguard Math Tournament"
          grades="Grades 6 to 8"
          month="February"
          blurb="Individual, team and buzzer rounds for middle schoolers. Teams of four; individuals are placed on a team on the day. Pizza for competitors and volunteers."
          event={vmt}
        />

        <Figure photo={PHOTOS.mathDay} tone="yellow" />

        <TournamentPanel
          id="aleph"
          tone="orange"
          title="Aleph"
          grades="Grades 9 to 12"
          month="March"
          blurb="Individual, team and buzzer rounds for high schoolers, in the spirit of the AMC and the college tournaments we attend. Teams of four; individuals welcome."
          event={aleph}
        />

        <section id="volunteer" className="sv-panel sv-tone-sage">
          <div className="sv-panel-grid">
            <h2 className="sv-panel-heading" data-sv-reveal>Volunteering and donations</h2>
            <div className="sv-panel-body">
              <p className="sv-large" data-sv-reveal>High school students proctor, grade and run the buzzer rounds; parents help with check-in and food.</p>
              <p data-sv-reveal>Both tournaments run entirely on donations, which cover testing materials, fees and food so entry stays free.</p>
            </div>
          </div>
        </section>

        <PhotoRow photos={[PHOTOS.bmt, PHOTOS.aleph3, PHOTOS.foothills]} />

        <Question
          top="Compete"
          bottom="or help?"
          left={<Link href={vmt?.signUpLink || "/competitions/vmt/register"} className="sv-button sv-button-wide sv-button-orange">Register</Link>}
          right={<Link href="/donate" className="sv-button sv-button-wide sv-button-yellow">Donate</Link>}
          note="Teams register free; donations keep it that way. Volunteers write to the officers."
        />
      </main>
    </SiteShell>
  )
}
