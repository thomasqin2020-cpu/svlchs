import type { Metadata } from "next"
import Link from "next/link"
import { fetchEvents } from "@/lib/data"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, Figure, PhotoRow } from "@/components/site/site-shell"
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

function TournamentBlock({ id, title, grades, month, blurb, event }: { id: string; title: string; grades: string; month: string; blurb: string; event?: Event }) {
  return (
    <section id={id} className="sv-split sv-tournament">
      <h2 className="sv-h2" data-sv-reveal>{title}</h2>
      <div className="sv-split-body">
        <p className="sv-date" data-sv-reveal>{event ? formatDate(event.date) : `${month} 2027, date to be announced`}</p>
        <p className="sv-large" data-sv-reveal>{event?.location || "La Cañada High School"}. {event?.grades || grades}.</p>
        <p data-sv-reveal>{blurb}</p>
        <div className="sv-actions" data-sv-reveal>
          {event?.signUpLink ? <Link href={event.signUpLink} className="sv-button">Register</Link> : null}
          {event?.volunteerLink ? <a href={event.volunteerLink} className="sv-button sv-button-ghost" rel="noopener">Volunteer</a> : null}
          {event?.pageLink && event.pageLink.startsWith("http") ? <a href={event.pageLink} rel="noopener">Information packet</a> : null}
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
        <section className="sv-page-head">
          <h1 className="sv-title sv-rise">VMT and Aleph</h1>
          <p className="sv-lead sv-rise sv-rise-2">Two free math tournaments at La Cañada High School every spring, written, run and graded by the club’s officers. VMT is for grades 6 to 8, Aleph for grades 9 to 12.</p>
          <div className="sv-actions sv-rise sv-rise-3">
            <Link href={vmt?.signUpLink || "/competitions/vmt/register"} className="sv-button">Register for VMT</Link>
            <Link href={aleph?.signUpLink || "/competitions/aleph/register"} className="sv-button sv-button-ghost">Register for Aleph</Link>
          </div>
        </section>

        <section className="sv-specimens" aria-label="Who competes">
          <div data-sv-reveal>
            <div className="sv-specimen">6–8</div>
            <p className="sv-specimen-caption">Grades at VMT, in February</p>
          </div>
          <div data-sv-reveal style={{ transitionDelay: "120ms" }}>
            <div className="sv-specimen">9–12</div>
            <p className="sv-specimen-caption">Grades at Aleph, in March</p>
          </div>
        </section>

        <TournamentBlock
          id="vmt"
          title="Vanguard Math Tournament"
          grades="Grades 6 to 8"
          month="February"
          blurb="Individual, team and buzzer rounds for middle schoolers. Teams of four; individuals are placed on a team on the day. Pizza for competitors and volunteers."
          event={vmt}
        />

        <Figure photo={PHOTOS.aleph3} />

        <TournamentBlock
          id="aleph"
          title="Aleph"
          grades="Grades 9 to 12"
          month="March"
          blurb="Individual, team and buzzer rounds for high schoolers, in the spirit of the AMC and the college tournaments we attend. Teams of four; individuals welcome."
          event={aleph}
        />

        <PhotoRow photos={[PHOTOS.mathDay, PHOTOS.bmt, PHOTOS.foothills]} />

        <section id="volunteer" className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>Volunteering and donations</h2>
          <div className="sv-split-body">
            <p className="sv-large" data-sv-reveal>High school students proctor, grade and run the buzzer rounds; parents help with check-in and food.</p>
            <p data-sv-reveal>Both tournaments run entirely on donations, which cover testing materials, fees and food so entry stays free.</p>
            <div className="sv-actions" data-sv-reveal>
              <Link href="/donate" className="sv-button">Donate</Link>
              <Link href="/contact" className="sv-button sv-button-ghost">Ask about volunteering</Link>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
