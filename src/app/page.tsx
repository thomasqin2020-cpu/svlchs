import Link from "next/link"
import Image from "next/image"
import { fetchAnnouncements, fetchEvents, fetchConfig } from "@/lib/data"
import { getCurrentMember } from "@/lib/auth"
import { SiteShell, PageHead, Bar, PhotoRow, Question } from "@/components/site/site-shell"
import { ProblemOfTheWeek } from "@/components/site/potw"
import { SubscribeForm } from "@/components/subscribe-form"
import { POTW_PROBLEMS, problemOfTheWeek } from "@/lib/potw"
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
        <PageHead
          tone="orange"
          tall
          title={<>We do<br />hard math</>}
          lead="The student-run competition math club at La Cañada High School. Grades 7 to 12, free to join."
          action={<Link href="/signup" className="sv-button sv-button-big sv-button-orange">Join the club</Link>}
          photo={PHOTOS.aleph3}
        />

        <section className="sv-tiles" aria-label="What we are">
          <div className="sv-tile sv-tile-a sv-tone-black" data-sv-reveal>
            <h2 className="sv-tile-shout">Free<br />to join</h2>
          </div>
          <div className="sv-tile sv-tile-b sv-tone-sage" data-sv-reveal style={{ transitionDelay: "80ms" }}>
            <span className="sv-tile-figure">7–12</span>
          </div>
          <div className="sv-tile sv-tile-c" data-sv-reveal style={{ transitionDelay: "160ms" }}>
            <Image src={PHOTOS.mathDay.src} alt={PHOTOS.mathDay.alt} width={PHOTOS.mathDay.width} height={PHOTOS.mathDay.height} sizes="(max-width: 720px) 50vw, 33vw" className="sv-tile-photo" />
          </div>
          <div className="sv-tile-text" data-sv-reveal>
            <p>Grades go from seven to twelve, so a seventh grader and a senior can sit at the same table. We meet twice a week, work through problem sets, and travel to the Berkeley, Stanford and Caltech tournaments in the fall and spring. Every February and March we run our own: VMT for middle schoolers, Aleph for high schoolers, both at La Cañada High School, both free. Most people who join have never done a competition before. That is fine. Bring a pencil.</p>
          </div>
        </section>

        <section id="meetings" className="sv-bars-section">
          <div className="sv-bars">
            <h2 className="sv-giant-word" data-sv-reveal>When</h2>
            {meetings.map((m, i) => (
              <Bar key={m.who} label={m.who} open={i === 0}>
                <div className="sv-bar-line"><span>{m.when}</span><span>{m.where}</span></div>
                <div className="sv-bar-line"><span>Problem sets and competition prep</span><span>Weekly</span></div>
              </Bar>
            ))}
            {dated.map((c) => (
              <Bar key={c.name} label={c.name}>
                <div className="sv-bar-line"><span>{c.format}</span><span>{c.when}</span></div>
                <div className="sv-bar-line"><span>{c.where}</span><span>{c.internal ? <Link href={c.internal}>Register</Link> : c.link ? <a href={c.link} rel="noopener">Website</a> : ""}</span></div>
              </Bar>
            ))}
          </div>
        </section>

        <section className="sv-slips" aria-label="Problems we write">
          <Image src={PHOTOS.bmt.src} alt={PHOTOS.bmt.alt} width={PHOTOS.bmt.width} height={PHOTOS.bmt.height} sizes="100vw" className="sv-slips-photo" />
          <div className="sv-slips-copy" data-sv-reveal>
            <h2 className="sv-slips-heading">Problems we write</h2>
            <p>One a week for the club, and every question at VMT and Aleph. These are this year’s weekly problems; the tournament sets stay sealed until the day.</p>
          </div>
          <div className="sv-slips-row">
            {POTW_PROBLEMS.map((p, i) => (
              <div key={p.statement} className={`sv-slip sv-slip-${i + 1}`} data-sv-reveal style={{ transitionDelay: `${i * 60}ms` }}>
                <strong>{p.tag}</strong>
                <span className="sv-slip-rule" aria-hidden="true">· · ·</span>
                <span>{p.statement}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="latest" className="sv-panel sv-tone-sage">
          <div className="sv-panel-grid">
            <h2 className="sv-panel-heading" data-sv-reveal>Latest</h2>
            <div className="sv-panel-body">
              {latest.length === 0 ? (
                <p className="sv-large" data-sv-reveal>Nothing posted yet this season. Announcements from the officers appear here.</p>
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
          </div>
        </section>

        <PhotoRow photos={[PHOTOS.aleph3, PHOTOS.bmt, PHOTOS.foothills]} />

        <Question
          top="Student"
          bottom="or parent?"
          left={<Link href="/signup" className="sv-button sv-button-wide sv-button-orange">Join the club</Link>}
          right={<Link href="/donate" className="sv-button sv-button-wide sv-button-yellow">Donate</Link>}
          note="Students get the Classroom code; parents get a receipt and a thank-you from the officers."
        />
      </main>
    </SiteShell>
  )
}
