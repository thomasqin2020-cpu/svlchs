import Link from "next/link"
import Image from "next/image"
import { fetchAnnouncements, fetchEvents, fetchConfig } from "@/lib/data"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, Figure, PhotoRow } from "@/components/site/site-shell"
import { ProblemOfTheWeek } from "@/components/site/potw"
import { SubscribeForm } from "@/components/subscribe-form"
import { problemOfTheWeek } from "@/lib/potw"
import { COMPETITIONS, PHOTOS, parseMeeting, formatDate } from "@/lib/site-content"

export const revalidate = 60

export default async function Home() {
  const [announcements, events, config, currentMember] = await Promise.all([
    fetchAnnouncements(),
    fetchEvents(),
    fetchConfig(),
    getCurrentMember(),
  ])

  const meetings = [config.meeting_1, config.meeting_2].filter(Boolean).map(parseMeeting)
  const problem = problemOfTheWeek()
  const latest = announcements.slice(0, 4)

  // Our own tournaments carry the real date once it is published in /admin/events.
  const dated = COMPETITIONS.map((c) => {
    if (!c.internal) return c
    const key = c.name.startsWith("VMT") ? "vanguard" : "aleph"
    const event = events.find((e) => e.name.toLowerCase().includes(key))
    return event ? { ...c, when: formatDate(event.date) } : c
  })

  return (
    <SiteShell currentMember={currentMember}>
      <main id="top" className="sv-main">
        <section className="sv-hero" aria-label="Spartan Vanguard">
          <div className="sv-hero-top sv-rise">
            <p className="sv-lead">The student-run competition math club at La Cañada High School. Grades 7 to 12, free to join.</p>
            <Link href="/signup" className="sv-button">Join the club</Link>
          </div>
          <h1 className="sv-hero-name sv-rise sv-rise-2">Spartan <span className="sv-hero-break">Vanguard</span></h1>
          <div className="sv-hero-bottom sv-rise sv-rise-3">
            <p>A math club in La Cañada Flintridge, California</p>
            <div className="sv-hero-links">
              <Link href="/contact">Contact</Link>
              <Link href="/donate">Donate</Link>
              <a href="/events.ics">Calendar feed</a>
            </div>
          </div>
        </section>

        <section className="sv-stairs" aria-label="What we do">
          <p className="sv-stairs-text">
            <span data-sv-reveal>We meet twice a week,</span>
            <span data-sv-reveal style={{ transitionDelay: "80ms" }}>travel to four tournaments,</span>
            <span data-sv-reveal style={{ transitionDelay: "160ms" }}>and host two of our own</span>
            <span data-sv-reveal style={{ transitionDelay: "240ms" }}>every spring,</span>
            <span data-sv-reveal style={{ transitionDelay: "320ms" }}>free, at La Cañada High.</span>
          </p>
          <div className="sv-stairs-photos">
            <Image src={PHOTOS.bmt.src} alt={PHOTOS.bmt.alt} width={PHOTOS.bmt.width} height={PHOTOS.bmt.height} sizes="20vw" className="sv-stairs-photo" data-sv-reveal />
            <Image src={PHOTOS.foothills.src} alt={PHOTOS.foothills.alt} width={PHOTOS.foothills.width} height={PHOTOS.foothills.height} sizes="20vw" className="sv-stairs-photo" data-sv-reveal />
          </div>
          <p className="sv-stairs-note">Berkeley, Stanford and Caltech in the fall and spring. VMT and Aleph, ours, in February and March.</p>
        </section>

        <section id="meetings" className="sv-lineup">
          <h2 className="sv-lineup-heading" data-sv-reveal>Every week</h2>
          {meetings.map((m) => (
            <div className="sv-row" key={m.who} data-sv-reveal>
              <span>{m.who}</span>
              <span>Problem sets and competition prep</span>
              <span>{m.where}</span>
              <span className="sv-row-end">{m.when}</span>
            </div>
          ))}
          <h2 className="sv-lineup-heading sv-lineup-heading-later" data-sv-reveal>The season</h2>
          {dated.map((c) => (
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

        <Figure photo={PHOTOS.mathDay} />

        <section id="latest" className="sv-split">
          <h2 className="sv-h2" data-sv-reveal>Latest</h2>
          <div className="sv-split-body">
            {latest.length === 0 ? (
              <p className="sv-large" data-sv-reveal>Nothing posted yet this season. Announcements from the officers appear here, and members can get them by email below.</p>
            ) : (
              latest.map((a) => (
                <article key={a.id} className="sv-announcement" data-sv-reveal>
                  <h3>{a.title}</h3>
                  {a.body ? <p>{a.body}</p> : null}
                  <p className="sv-muted">{formatDate(a.date)}{a.membersOnly ? ", members only" : ""}</p>
                </article>
              ))
            )}
            <h3 className="sv-h3" data-sv-reveal>Problem of the week</h3>
            <ProblemOfTheWeek problem={problem} />
            <h3 className="sv-h3" data-sv-reveal>Announcements by email</h3>
            <SubscribeForm />
          </div>
        </section>

        <PhotoRow photos={[PHOTOS.aleph3, PHOTOS.bmt, PHOTOS.foothills]} />

        <Link href="/signup" className="sv-join-band">
          <span className="sv-join-note">Sign up with the Google Classroom code, then come to a meeting.</span>
          <svg aria-hidden="true" className="sv-join-arrow" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 38 L38 10 M16 10 H38 V32" />
          </svg>
          <span className="sv-join-word">Join</span>
        </Link>
      </main>
    </SiteShell>
  )
}
