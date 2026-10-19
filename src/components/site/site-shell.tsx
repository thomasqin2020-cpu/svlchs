import Link from 'next/link'
import Image from 'next/image'
import { SiteNav } from './site-nav'
import { RevealObserver } from './reveal'
import type { Member } from '@/types/content'
import type { Photo } from '@/lib/site-content'

export function SiteShell({ children, currentMember }: { children: React.ReactNode; currentMember: Member | null }) {
  return (
    <div className="sv-site">
      <RevealObserver />
      <header className="sv-header">
        <Link href="/" className="sv-wordmark">Spartan Vanguard</Link>
        <SiteNav />
        <div className="sv-header-actions">
          {currentMember ? (
            <Link href="/logout" className="sv-text-link">Log out</Link>
          ) : (
            <Link href="/login" className="sv-text-link">Member login</Link>
          )}
          <Link href="/signup" className="sv-button sv-button-small">Join</Link>
        </div>
      </header>
      {children}
      <SiteFooter />
    </div>
  )
}

const MARK = [
  { letter: 'V', fill: '#fe7141', height: 100 },
  { letter: 'A', fill: '#000000', height: 70 },
  { letter: 'N', fill: '#f0ff1c', height: 85 },
  { letter: 'G', fill: '#fe7141', height: 60 },
  { letter: 'U', fill: '#000000', height: 95 },
  { letter: 'A', fill: '#f0ff1c', height: 75 },
  { letter: 'R', fill: '#fe7141', height: 88 },
  { letter: 'D', fill: '#000000', height: 65 },
]

/** The name built from blocks: each letter knocked out of its own rectangle, bottoms on one line. */
function BlockMark() {
  const W = 1000, H = 300, GAP = 4
  const w = (W - GAP * (MARK.length - 1)) / MARK.length
  return (
    <svg className="sv-mark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vanguard">
      {MARK.map((m, i) => {
        const x = i * (w + GAP)
        const h = (H * m.height) / 100
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={w} height={h} fill={m.fill} />
            <text x={x + w / 2} y={H - 10} textAnchor="middle" fontSize="150" fill="#d1ddd3">{m.letter}</text>
          </g>
        )
      })}
    </svg>
  )
}

/** The footer: the name built from blocks, then plain links. */
export function SiteFooter() {
  return (
    <footer className="sv-footer">
      <BlockMark />
      <div className="sv-footer-grid" data-sv-reveal>
        <div>
          <Link href="/competitions">Competitions</Link>
          <Link href="/tournaments">VMT and Aleph</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/team">Team</Link>
        </div>
        <div>
          <Link href="/signup">Sign up</Link>
          <Link href="/login">Log in</Link>
          <a href="/events.ics">Calendar feed</a>
        </div>
        <div>
          <Link href="/donate">Donate</Link>
          <Link href="/tournaments#volunteer">Volunteer</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="sv-footer-address">
          <span>La Cañada High School</span>
          <span>Room 315 Thursdays, Room 725 Tuesdays</span>
        </div>
      </div>
      <div className="sv-footer-bottom">
        <span>Spartan Vanguard, 2026–2027. A student club of La Cañada High School.</span>
        <a href="#top" className="sv-button sv-button-small">Back to top</a>
      </div>
    </footer>
  )
}

/** The page head: a flat field with the shout and a photo stuck on, then a dark band with the sentence and the action. */
export function PageHead({
  tone,
  title,
  lead,
  action,
  photo,
  tall = false,
}: {
  tone: 'orange' | 'sage' | 'yellow'
  title: React.ReactNode
  lead: string
  action: React.ReactNode
  photo?: Photo
  tall?: boolean
}) {
  return (
    <section className={`sv-head sv-tone-${tone} ${tall ? 'sv-head-tall' : ''}`}>
      <div className="sv-head-field">
        <h1 className="sv-shout sv-rise">{title}</h1>
        {photo ? (
          <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 720px) 60vw, 30vw" priority className="sv-head-photo sv-rise sv-rise-2" />
        ) : null}
      </div>
      <div className="sv-head-band sv-rise sv-rise-3">
        <p className="sv-lead">{lead}</p>
        {action}
      </div>
    </section>
  )
}

/** One full-bleed photograph with a caption block over a solid colour bar. */
export function Figure({ photo, tone = 'sage' }: { photo: Photo; tone?: 'orange' | 'sage' | 'yellow' | 'black' }) {
  return (
    <figure className="sv-figure" data-sv-reveal>
      <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="100vw" loading="eager" className="sv-figure-img" />
      <figcaption className={`sv-figure-caption sv-tone-${tone}`}>{photo.caption}</figcaption>
    </figure>
  )
}

/** Three photographs cut hard, on a board of tiles. */
export function PhotoRow({ photos }: { photos: [Photo, Photo, Photo] }) {
  return (
    <section className="sv-photo-row" aria-label="Pictures">
      {photos.map((photo, i) => (
        <figure key={photo.src} className="sv-photo-cell" data-sv-reveal style={{ transitionDelay: `${i * 90}ms` }}>
          <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 720px) 100vw, 40vw" loading="eager" className="sv-photo-img" />
          <figcaption className="sv-photo-caption">{photo.caption}</figcaption>
        </figure>
      ))}
    </section>
  )
}

/** A bar that opens in place. */
export function Bar({ label, children, open = false }: { label: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="sv-bar" open={open} data-sv-reveal>
      <summary className="sv-bar-summary">
        <span>{label}</span>
        <span className="sv-bar-plus" aria-hidden="true">+</span>
      </summary>
      <div className="sv-bar-body">{children}</div>
    </details>
  )
}

/** The closing choice: a question in two lines at both edges, two buttons between. */
export function Question({ top, bottom, left, right, note }: { top: string; bottom: string; left: React.ReactNode; right: React.ReactNode; note: string }) {
  return (
    <section className="sv-question">
      <h2 className="sv-question-line" data-sv-reveal>{top}</h2>
      <div className="sv-question-middle" data-sv-reveal>
        <div className="sv-question-row">
          {left}
          <span className="sv-question-or">or</span>
          {right}
        </div>
        <p className="sv-question-note">{note}</p>
      </div>
      <h2 className="sv-question-line" data-sv-reveal>{bottom}</h2>
    </section>
  )
}
