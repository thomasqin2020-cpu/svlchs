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

export function SiteFooter() {
  return (
    <footer className="sv-footer">
      <div className="sv-footer-top">
        <Wordmark className="sv-footer-mark" />
        <div className="sv-footer-grid">
          <div className="sv-footer-places" data-sv-reveal>
            <Link href="/#meetings">Room 315, Thursdays</Link>
            <Link href="/#meetings">Room 725, Tuesdays</Link>
            <Link href="/contact">Write to the officers</Link>
          </div>
          <div className="sv-footer-links" data-sv-reveal>
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
          </div>
        </div>
      </div>
      <div className="sv-footer-bottom">
        <span>Spartan Vanguard, 2026–2027. A student club of La Cañada High School.</span>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  )
}

/** The name as fitted SVG text, so it spans its container on one line at any width. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 1000 118" width="100%" role="img" aria-label="Spartan Vanguard" style={{ display: 'block' }}>
        <text
          x="0"
          y="100"
          fontFamily="var(--font-fraunces), Georgia, serif"
          fontWeight="100"
          fontSize="128"
          fill="currentColor"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
        >
          SPARTAN VANGUARD
        </text>
      </svg>
    </div>
  )
}

/** One full-bleed photograph with its caption on the left margin. */
export function Figure({ photo, priority = false }: { photo: Photo; priority?: boolean }) {
  return (
    <figure className="sv-figure" data-sv-reveal>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes="100vw"
        priority={priority}
        className="sv-figure-img"
      />
      <figcaption className="sv-caption">{photo.caption}</figcaption>
    </figure>
  )
}

/** Three photographs at uneven widths, each with its caption. */
export function PhotoRow({ photos }: { photos: [Photo, Photo, Photo] }) {
  return (
    <section className="sv-photo-row" aria-label="Pictures">
      {photos.map((photo, i) => (
        <figure key={photo.src} className="sv-photo-cell" data-sv-reveal style={{ transitionDelay: `${i * 90}ms` }}>
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 720px) 100vw, 40vw"
            className="sv-photo-img"
          />
          <figcaption className="sv-caption sv-caption-tight">{photo.caption}</figcaption>
        </figure>
      ))}
    </section>
  )
}
