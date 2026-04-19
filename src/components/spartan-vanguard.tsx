'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { Announcement, Event, Officer, SiteConfig } from '@/types/content'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'competitions', label: 'Competitions' },
  { id: 'resources', label: 'Resources' },
  { id: 'vmt', label: 'VMT' },
  { id: 'aleph', label: 'Aleph' },
  { id: 'team', label: 'Team' },
]

const competitions = [
  { name: 'AMC 10 & 12', desc: 'The American Mathematics Competitions are the first in a series of competitions that lead to the International Mathematical Olympiad (IMO). AMC 10 is for students in 10th grade and below; AMC 12 is for students in 12th grade and below.', format: '25 multiple-choice questions in 75 minutes', link: 'https://amc-reg.maa.org/', arrow: 'Website \u2192' },
  { name: 'AIME', desc: 'The American Invitational Mathematics Examination is a 15-question, 3-hour exam for students who score well on the AMC 10/12. Answers are integers from 000 to 999.', format: '15 questions, 3 hours, integer answers 000\u2013999', link: 'https://artofproblemsolving.com/wiki/index.php/AIME', arrow: 'Website \u2192' },
  { name: 'Berkeley Math Tournament (BMT)', desc: 'An annual math competition at UC Berkeley featuring individual and team rounds. Spartan Vanguard sends teams each fall.', format: 'Individual rounds + team rounds, overnight trip', link: 'https://bmt.berkeley.edu/', arrow: 'Website \u2192' },
  { name: 'Stanford Math Tournament (SMT)', desc: 'A student-run math competition held at Stanford University featuring power, team, individual, and guts rounds.', format: 'Power Round, Team Round, Individual Rounds, Guts Round', link: 'https://stanfordmathtournament.com/', arrow: 'Website \u2192' },
  { name: 'Caltech Math Meet', desc: 'An in-person competition at Caltech with three main rounds plus optional activities.', format: '3 rounds + optional activities, teams of 6', link: 'https://caltechmathmeet.org/', arrow: 'Website \u2192' },
  { name: 'SDMHC', desc: 'A Southern California math competition held annually in San Diego. Spartan Vanguard sends teams to compete.', format: 'Individual and team rounds' },
  { name: 'Westmont', desc: 'A math competition hosted by Westmont College in Santa Barbara.', format: 'Individual and team rounds' },
  { name: 'VMT (Vanguard Math Tournament)', desc: 'Our annual middle school competition for grades 6\u20138, hosted at La Ca\u00f1ada High School.', format: 'Individual, team, and buzzer rounds', internal: '#vmt', arrow: 'Learn more \u2192' },
  { name: 'Aleph', desc: 'Our annual high school competition for grades 9\u201312, hosted at La Ca\u00f1ada High School.', format: 'Individual, team, and buzzer rounds', internal: '#aleph', arrow: 'Learn more \u2192' },
]

const resources = [
  { name: 'AMC Trivial', description: 'Generates randomized competition math problem sets with adjustable difficulty.', link: 'https://amctrivial.com/' },
  { name: 'Art of Problem Solving Volumes 1 & 2', description: 'Comprehensive books covering AMC 8/10/12, AIME, and beyond. Volume 2 also available.', link: 'https://artofproblemsolving.com/store/book/aops-vol1' },
  { name: "David Altizio's Geometry Collection", description: '100 geometry problems ranging from mid-AMC to IMO level.', link: 'https://davidaltizio.web.illinois.edu/CollectionOfGeometryProblems.pdf' },
  { name: 'AoPS \u2014 Avoiding Mistakes', description: 'Article on common errors in competition problem-solving.', link: 'https://artofproblemsolving.com/blog/articles/stop-making-stupid-mistakes' },
  { name: 'AIME Problem Set', description: 'Collection of past AIME problems for practice.', link: 'https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions' },
  { name: '\u201cHow to Solve It\u201d by George Polya', description: 'Classic problem-solving methodology guide.', link: 'https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How_To_Solve_It_.pdf' },
  { name: 'AoPS Resource Wiki', description: 'Aggregated math competition resources.', link: 'https://artofproblemsolving.com/wiki/index.php/Resources_for_mathematics_competitions' },
]

const worksheets = [
  { name: 'Bases Worksheet', description: 'Number bases practice problems.', link: 'https://drive.google.com/file/d/1xc_R8Z1LmBVqzCMbRCdx0iQIgvWaMlwo/view?pli=1' },
  { name: 'Complex Numbers Worksheet', description: 'Introduction to complex numbers in competition math.', link: 'https://drive.google.com/file/d/1dVw1vMhqJ5IX87OU81cIY__Earx5hPOD/view?pli=1' },
]

const activities = [
  { name: 'Google Form Escape Room', description: 'Interactive math puzzle escape room.', link: 'https://docs.google.com/forms/d/e/1FAIpQLSfzYQFY0ZPJRMfpnZmW7gLN-OHirWjXH5LZ7xT7O_wbZ-rbww/viewform' },
  { name: 'Competition Math Iceberg', description: 'In progress \u2014 accepting topic suggestions.', link: 'https://docs.google.com/file/d/109wIAfA2XgqVE4ihQ8AAKvDXlT8n49MyAbyS227wMFk/edit' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function Chev() {
  return (
    <svg viewBox="0 0 10 18" width="8" height="14" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline', marginLeft: 2, verticalAlign: 'baseline' }}>
      <polyline points="1,1 9,9 1,17" />
    </svg>
  )
}

const CREST_SYMBOLS = [
  { char: '\u03C0', x: 120, y: 140, size: 22 },
  { char: '\u03B8', x: 200, y: 124, size: 22 },
  { char: '\u2211', x: 280, y: 140, size: 22 },
  { char: '\u03B1', x: 110, y: 220, size: 22 },
  { char: '\u222B', x: 290, y: 220, size: 22 },
  { char: '\u0394', x: 125, y: 285, size: 20 },
  { char: '\u03A9', x: 200, y: 296, size: 20 },
  { char: '\u03C6', x: 275, y: 285, size: 20 },
]

function CrestSVG() {
  const symbolRefs = useRef<(SVGTextElement | null)[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      const t = (now - start) / 1000
      symbolRefs.current.forEach((el, i) => {
        if (!el) return
        const base = CREST_SYMBOLS[i]
        const phase = t * (1 / (2.2 + (i * 0.35))) * Math.PI * 2 + (i * 0.8)
        const dx = Math.sin(phase) * 1.6
        const dy = Math.cos(phase * 0.9 + (i * 0.3)) * 1.4
        el.setAttribute('x', (base.x + dx).toFixed(3))
        el.setAttribute('y', (base.y + dy).toFixed(3))
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2
    const r = 162
    const f = (n: number) => n.toFixed(3)
    return <line key={i} x1={f(200 + Math.cos(a) * r)} y1={f(200 + Math.sin(a) * r)} x2={f(200 + Math.cos(a) * (r - 6))} y2={f(200 + Math.sin(a) * (r - 6))} stroke="url(#gC1)" strokeWidth="1" />
  })
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="crest-svg" style={{ width: '52%' }}>
      <defs>
        <radialGradient id="gC1" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#efdba4" />
          <stop offset="55%" stopColor="#c9a961" />
          <stop offset="100%" stopColor="#7c5f28" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="168" fill="none" stroke="url(#gC1)" strokeWidth="1.2" />
      <circle cx="200" cy="200" r="158" fill="none" stroke="url(#gC1)" strokeWidth="0.5" opacity="0.55" />
      <g>{ticks}</g>
      <circle cx="200" cy="200" r="120" fill="none" stroke="url(#gC1)" strokeWidth="0.6" opacity="0.6" />
      <g fontFamily="var(--display)" fontStyle="italic" fill="url(#gC1)" textAnchor="middle" opacity="0.9">
        {CREST_SYMBOLS.map((s, i) => (
          <text
            key={s.char}
            ref={(el) => { symbolRefs.current[i] = el }}
            x={s.x}
            y={s.y}
            fontSize={s.size}
          >
            {s.char}
          </text>
        ))}
      </g>
      <g textAnchor="middle">
        <text x="175" y="212" fontFamily="var(--display)" fontSize="60" fontWeight="700" fill="url(#gC1)" letterSpacing="-2">S</text>
        <text x="228" y="212" fontFamily="var(--display)" fontSize="60" fontWeight="700" fill="url(#gC1)" letterSpacing="-2">V</text>
        <text x="200" y="244" fontFamily="var(--mono)" fontSize="8" fill="#c9a961" letterSpacing="3" opacity="0.8">EST &middot; 2019</text>
      </g>
    </svg>
  )
}

/* ---- Animated hero title (character stagger via CSS) -------------- */
function HeroTitle() {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = window.setTimeout(() => setReady(true), 40); return () => window.clearTimeout(t) }, [])
  const renderWord = (word: string, startIdx: number) => (
    <span className="hero-word">
      {word.split('').map((c, i) => (
        <span
          key={`${startIdx}-${i}`}
          className={`hero-char${ready ? ' in' : ''}`}
          style={{ transitionDelay: `${(startIdx + i) * 28}ms` }}
        >
          {c}
        </span>
      ))}
    </span>
  )
  return (
    <h1>
      <span className="hero-line hero-line-balanced">
        <span className="hero-half hero-half-right">{renderWord('Spartan', 0)}</span>
        <span className="hero-gap" aria-hidden="true">&nbsp;</span>
        <span className="hero-half hero-half-left">{renderWord('Vanguard', 7)}</span>
      </span>
      <span className="hero-line grad">
        {renderWord('Math', 15)}
        {' '}
        {renderWord('Club.', 19)}
      </span>
    </h1>
  )
}

/* ---- Drifting math-symbol constellation --------------------------- */
const CONSTELLATION = [
  { char: '\u03C0', x: 6, y: 12, delay: 0, dur: 14 },
  { char: '\u03B8', x: 22, y: 38, delay: 2.5, dur: 11 },
  { char: '\u2211', x: 14, y: 70, delay: 1, dur: 16 },
  { char: '\u03B1', x: 40, y: 18, delay: 3.5, dur: 13 },
  { char: '\u222B', x: 58, y: 55, delay: 0.8, dur: 15 },
  { char: '\u0394', x: 72, y: 22, delay: 2, dur: 12 },
  { char: '\u03A9', x: 86, y: 48, delay: 4, dur: 14 },
  { char: '\u03C6', x: 92, y: 78, delay: 1.5, dur: 13 },
  { char: '\u03BB', x: 32, y: 82, delay: 3, dur: 15 },
  { char: '\u03C8', x: 66, y: 8, delay: 0.3, dur: 12 },
  { char: '\u221A', x: 78, y: 66, delay: 2.2, dur: 17 },
  { char: '\u221E', x: 48, y: 88, delay: 1.8, dur: 14 },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return (parts[0]?.[0] || '').toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface SpartanVanguardProps {
  announcements: Announcement[]
  events: Event[]
  officers: Officer[]
  config: SiteConfig
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function SpartanVanguard({ announcements, events, officers, config }: SpartanVanguardProps) {
  const [activeSection, setActiveSection] = useState('home')
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null)
  const navLinksRef = useRef<HTMLDivElement>(null)
  const navPillRef = useRef<HTMLSpanElement>(null)
  const navPillInnerRef = useRef<HTMLSpanElement>(null)
  const pillFirstRunRef = useRef(true)
  const clickScrollRef = useRef<number | null>(null)
  const scrollProgressRef = useRef<HTMLDivElement>(null)

  /* --- derived config -------------------------------------------- */
  const announcementText = config['announcement_text'] || 'Spartan Vanguard hosts an annual spring math competition for middle and high school students. Organized and run entirely by high school volunteers, the event takes place at La Ca\u00f1ada High School. We welcome anyone with an interest in competitive math to join us, and participants and volunteers can enjoy free pizza!'
  const meeting1 = config['meeting_1'] || 'Grades 9\u201310 | Monday, 3:30\u20135:00 PM | Room 217'
  const meeting2 = config['meeting_2'] || 'Grades 7\u20138 | Wednesday, 3:30\u20134:30 PM | Room 724'
  const classroomCode = config['google_classroom'] || 'hsx4c54'
  const remindCode = config['remind'] || '@lchssv'
  const email1 = config['email_1'] || 'vchen26@mylcusd.net'
  const email2 = config['email_2'] || 'nchen26@mylcusd.net'

  const m1Parts = meeting1.split('|').map(s => s.trim())
  const m2Parts = meeting2.split('|').map(s => s.trim())

  /* --- find events by name --------------------------------------- */
  const vmtEvent = events.find(e => e.name.toLowerCase().includes('vmt') || e.name.toLowerCase().includes('vanguard math'))
  const alephEvent = events.find(e => e.name.toLowerCase().includes('aleph'))

  const vmtDate = vmtEvent?.date || 'February 21, 2026'
  const vmtLocation = vmtEvent?.location || 'La Ca\u00f1ada High School'
  const vmtGrades = vmtEvent?.grades || 'Grades 6\u20138'
  const vmtSignUp = vmtEvent?.signUpLink || 'https://forms.gle/uhmyxkM4V5vCXHQy7'
  const vmtVolunteer = vmtEvent?.volunteerLink || 'https://forms.gle/EqUt4VN5SoBkuBF86'

  const alephDate = alephEvent?.date || 'March 21, 2026'
  const alephLocation = alephEvent?.location || 'La Ca\u00f1ada High School'
  const alephGrades = alephEvent?.grades || 'Grades 9\u201312'
  const alephSignUp = alephEvent?.signUpLink || 'https://forms.gle/VSPZMyGM9fT1wndq9'
  const alephVolunteer = alephEvent?.volunteerLink || 'https://forms.gle/NDthbirThVbnxmW37'

  /* --- scrollToSection ------------------------------------------- */
  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    setActiveSection(id)
    if (clickScrollRef.current) window.clearTimeout(clickScrollRef.current)
    clickScrollRef.current = window.setTimeout(() => { clickScrollRef.current = null }, 900)
    window.scrollTo({ top, behavior: 'smooth' })
  }

  /* --- mountAll-style reveal: stagger + auto-add reveal class ---- */
  useEffect(() => {
    document.querySelectorAll('.page-section').forEach(sec => {
      Array.from(sec.children).forEach((child, i) => {
        (child as HTMLElement).style.setProperty('--i', String(Math.min(i, 8)))
        if (!child.hasAttribute('data-reveal') && !child.classList.contains('reveal')) {
          child.classList.add('reveal')
          child.setAttribute('data-reveal', 'up')
        }
      })
    })
    document.querySelectorAll('.tiles, .officer-grid, .res-grid, .comp-list, .event-meta-row, .hero-links').forEach(container => {
      Array.from(container.children).forEach((child, i) => {
        if (child.classList.contains('reveal') || child.hasAttribute('data-reveal')) {
          (child as HTMLElement).style.setProperty('--i', String(Math.min(i, 6)))
        }
      })
    })
  }, [])

  /* --- scroll reveal --------------------------------------------- */
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
        } else if (e.boundingClientRect.top > window.innerHeight || e.boundingClientRect.bottom < 0) {
          e.target.classList.remove('in')
        }
      })
    }, { threshold: 0, rootMargin: '120px 0px 120px 0px' })

    document.querySelectorAll('[data-reveal]').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add('instant', 'in')
        requestAnimationFrame(() => {
          requestAnimationFrame(() => el.classList.remove('instant'))
        })
        observer.observe(el)
      } else {
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [])

  /* --- global 3D tilt on all rounded tiles/cards ---------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cards = document.querySelectorAll<HTMLElement>('.tile, .officer-card, .res-card')
    const cleanups: Array<() => void> = []
    cards.forEach(el => {
      if (el.dataset.tiltBound) return
      el.dataset.tiltBound = '1'
      el.style.transformStyle = 'preserve-3d'

      let raf: number | null = null
      let rx = 0, ry = 0, tx = 0, ty = 0
      const render = () => {
        rx += (tx - rx) * 0.16
        ry += (ty - ry) * 0.16
        const atRest = Math.abs(tx - rx) < 0.02 && Math.abs(ty - ry) < 0.02 && tx === 0 && ty === 0
        if (atRest) {
          el.style.transform = ''
          raf = null
          return
        }
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
        raf = requestAnimationFrame(render)
      }
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width - 0.5
        const ny = (e.clientY - r.top) / r.height - 0.5
        tx = ny * -6
        ty = nx * 6
        if (raf === null) raf = requestAnimationFrame(render)
      }
      const leave = () => {
        tx = 0; ty = 0
        if (raf === null) raf = requestAnimationFrame(render)
      }
      el.addEventListener('mousemove', move)
      el.addEventListener('mouseleave', leave)
      cleanups.push(() => {
        el.removeEventListener('mousemove', move)
        el.removeEventListener('mouseleave', leave)
        delete el.dataset.tiltBound
        el.style.transform = ''
        if (raf) cancelAnimationFrame(raf)
      })
    })
    return () => cleanups.forEach(fn => fn())
  }, [])

  /* --- scroll spy ------------------------------------------------ */
  useEffect(() => {
    let raf: number | null = null
    let lastY = window.scrollY
    let idleTimer: number | null = null
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        const y = window.scrollY
        if (y !== lastY) {
          document.body.dataset.scrollDir = y > lastY ? 'down' : 'up'
          lastY = y
          if (idleTimer) window.clearTimeout(idleTimer)
          idleTimer = window.setTimeout(() => { delete document.body.dataset.scrollDir }, 600)
        }
        if (scrollProgressRef.current) {
          const max = document.documentElement.scrollHeight - window.innerHeight
          const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0
          scrollProgressRef.current.style.transform = `scaleX(${ratio})`
        }
        if (clickScrollRef.current) return
        const viewportMid = y + window.innerHeight * 0.35
        let current = 'home'
        for (const s of SECTIONS) {
          const el = document.getElementById(s.id)
          if (!el) continue
          const top = el.getBoundingClientRect().top + y
          if (top <= viewportMid) current = s.id
        }
        setActiveSection(current)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (idleTimer) window.clearTimeout(idleTimer)
    }
  }, [])

  /* --- nav pill -------------------------------------------------- */
  useEffect(() => {
    const pill = navPillRef.current
    if (!pill) return

    const target = hoveredRoute
      ? navLinksRef.current?.querySelector(`[data-route="${hoveredRoute}"]`)
      : navLinksRef.current?.querySelector('.nav-link.active')

    if (target && navLinksRef.current) {
      const navRect = navLinksRef.current.getBoundingClientRect()
      const borderLeft = parseFloat(getComputedStyle(navLinksRef.current).borderLeftWidth) || 0
      const linkRect = (target as HTMLElement).getBoundingClientRect()
      const x = linkRect.left - navRect.left - borderLeft
      const w = linkRect.width

      if (pillFirstRunRef.current) {
        pill.style.transition = 'opacity 320ms ease'
        pill.style.transform = `translate(${x}px, -50%)`
        pill.style.width = w + 'px'
        void pill.offsetWidth
        pill.style.transition = ''
        pillFirstRunRef.current = false
      } else {
        pill.style.transform = `translate(${x}px, -50%)`
        pill.style.width = w + 'px'
      }
      pill.classList.add('visible')
    } else {
      pill.classList.remove('visible')
    }
  }, [activeSection, hoveredRoute])

  /* --- magnetic pill --------------------------------------------- */
  useEffect(() => {
    const nav = navLinksRef.current
    const inner = navPillInnerRef.current
    if (!nav || !inner) return
    let raf: number | null = null
    const onMove = (e: MouseEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        if (!hoveredRoute) { inner.style.transform = 'translate(0px, 0px)'; return }
        const link = nav.querySelector(`[data-route="${hoveredRoute}"]`) as HTMLElement | null
        if (!link) return
        const r = link.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
        const mx = Math.max(-3, Math.min(3, dx * 3))
        const my = Math.max(-2, Math.min(2, dy * 2))
        inner.style.transform = `translate(${mx}px, ${my}px)`
      })
    }
    const onLeave = () => { inner.style.transform = 'translate(0px, 0px)' }
    nav.addEventListener('mousemove', onMove)
    nav.addEventListener('mouseleave', onLeave)
    return () => {
      nav.removeEventListener('mousemove', onMove)
      nav.removeEventListener('mouseleave', onLeave)
    }
  }, [hoveredRoute])

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <>
      {/* -- Scroll progress + Edge Fades -- */}
      <div className="scroll-progress" ref={scrollProgressRef} aria-hidden="true" />
      <div className="edge-fade edge-fade-top" aria-hidden="true" />
      <div className="edge-fade edge-fade-bottom" aria-hidden="true" />

      {/* -- Brand Bar -- */}
      <a href="#home" className="brand-bar" onClick={(e) => { e.preventDefault(); scrollToSection('home') }}>
        <span className="crest-mini">SV</span>
        Spartan Vanguard
      </a>

      {/* -- Bottom Dock Navigation -- */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-right" ref={navLinksRef} onMouseLeave={() => setHoveredRoute(null)}>
            <span className="nav-pill" ref={navPillRef} aria-hidden="true">
              <span className="nav-pill-inner" ref={navPillInnerRef} />
            </span>
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`nav-link${activeSection === s.id ? ' active' : ''}`}
                data-route={s.id}
                onClick={(e) => { e.preventDefault(); scrollToSection(s.id) }}
                onMouseEnter={() => setHoveredRoute(s.id)}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* -- Marquee Band -- */}
      <div className="marquee-band">
        <div className="marquee-track">
          <span><em>Now signing up.</em>  Vanguard Math Tournament &middot; Grades 6&ndash;8 &middot; Feb 21, 2026</span>
          <span>&middot;</span>
          <span><em>Now signing up.</em>  Aleph Competition &middot; Grades 9&ndash;12 &middot; Mar 21, 2026</span>
          <span>&middot;</span>
          <span><em>Free pizza.</em>  For participants &amp; volunteers</span>
          <span>&middot;</span>
          <span><em>Weekly meetings.</em>  Mondays &amp; Wednesdays &middot; La Ca&ntilde;ada HS</span>
          <span>&middot;</span>
          {/* duplicate for seamless loop */}
          <span><em>Now signing up.</em>  Vanguard Math Tournament &middot; Grades 6&ndash;8 &middot; Feb 21, 2026</span>
          <span>&middot;</span>
          <span><em>Now signing up.</em>  Aleph Competition &middot; Grades 9&ndash;12 &middot; Mar 21, 2026</span>
          <span>&middot;</span>
          <span><em>Free pizza.</em>  For participants &amp; volunteers</span>
          <span>&middot;</span>
          <span><em>Weekly meetings.</em>  Mondays &amp; Wednesdays &middot; La Ca&ntilde;ada HS</span>
          <span>&middot;</span>
        </div>
      </div>

      {/* -- Main Content -- */}
      <main id="app">

        {/* ============================================================ */}
        {/*  HOME                                                        */}
        {/* ============================================================ */}
        <section id="home" className="page-section">

          {/* Hero */}
          <section className="hero reveal" data-reveal>
            <div className="constellation" aria-hidden="true">
              {CONSTELLATION.map((g, i) => (
                <span
                  key={i}
                  style={{ left: `${g.x}%`, top: `${g.y}%`, animationDelay: `${g.delay}s`, animationDuration: `${g.dur}s` }}
                >{g.char}</span>
              ))}
            </div>
            <div className="hero-content">
              <HeroTitle />
              <p className="hero-sub">
                Extracurricular math, problem solving, and competitions at La Ca&ntilde;ada High School. Sharpen your skills, join a team, and compete in AMC, AIME, BMT, and more.
              </p>
              <div className="hero-links">
                <a href="#announcements" className="link-cta" onClick={(e) => { e.preventDefault(); const el = document.getElementById('announcements'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}>
                  Announcements <Chev />
                </a>
                <a href="#meetings" className="link-cta" onClick={(e) => { e.preventDefault(); const el = document.getElementById('meetings'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }}>
                  Meeting Schedule <Chev />
                </a>
              </div>

              <div className="hero-visual" aria-label="Spartan Vanguard logo">
                <CrestSVG />
              </div>
            </div>
          </section>

          {/* Announcements */}
          <section className="officers-section reveal" data-reveal id="announcements" style={{ paddingTop: '40px' }}>
            <div className="h2">Announcements.</div>
            <p className="h2-sub">{announcementText}</p>
          </section>

          <section className="tiles" style={{ paddingTop: '16px' }}>
            {/* Main announcement tile */}
            {announcements.length > 0 ? (
              <div className="tile col-12 dark reveal" data-reveal>
                <div>
                  <div className="tile-eyebrow" style={{ color: '#a1a1a6', fontFamily: 'var(--mono)', fontSize: '12px' }}>{announcements[0].date}</div>
                  <h2 className="tile-title big" style={{ maxWidth: '18ch' }}>{announcements[0].title}</h2>
                  <p className="tile-desc">{announcements[0].body}</p>
                </div>
              </div>
            ) : (
              <div className="tile col-12 dark reveal" data-reveal>
                <div>
                  <div className="tile-eyebrow" style={{ color: '#a1a1a6', fontFamily: 'var(--mono)', fontSize: '12px' }}>2026-03-28</div>
                  <h2 className="tile-title big" style={{ maxWidth: '18ch' }}>Spring Competitions 2026</h2>
                  <p className="tile-desc">Spartan Vanguard hosts an annual spring math competition for middle and high school students. Organized and run entirely by high school volunteers, the event takes place at La Ca&ntilde;ada High School. We welcome anyone with an interest in competitive math to join us, and participants and volunteers can enjoy free pizza!</p>
                </div>
              </div>
            )}

            {/* VMT tile */}
            <div className="tile col-6 reveal" data-reveal>
              <div>
                <div className="tile-eyebrow" style={{ fontFamily: 'var(--mono)' }}>{vmtDate}</div>
                <h2 className="tile-title">Vanguard Math<br />Tournament</h2>
                <p className="tile-desc">{vmtLocation} &middot; {vmtGrades}</p>
              </div>
              <div className="tile-ctas">
                <a className="pill ghost" href={vmtSignUp} target="_blank" rel="noopener noreferrer">Sign Up</a>
                <span style={{ color: 'var(--fg-dim)' }}>&middot;</span>
                <a className="pill ghost" href={vmtVolunteer} target="_blank" rel="noopener noreferrer">Volunteer</a>
                <span style={{ color: 'var(--fg-dim)' }}>&middot;</span>
                <a className="pill ghost" href="#vmt" onClick={(e) => { e.preventDefault(); scrollToSection('vmt') }}>Details <Chev /></a>
              </div>
            </div>

            {/* Aleph tile */}
            <div className="tile col-6 reveal" data-reveal>
              <div>
                <div className="tile-eyebrow" style={{ fontFamily: 'var(--mono)' }}>{alephDate}</div>
                <h2 className="tile-title">Aleph<br />Competition</h2>
                <p className="tile-desc">{alephLocation} &middot; {alephGrades}</p>
              </div>
              <div className="tile-ctas">
                <a className="pill ghost" href={alephSignUp} target="_blank" rel="noopener noreferrer">Sign Up</a>
                <span style={{ color: 'var(--fg-dim)' }}>&middot;</span>
                <a className="pill ghost" href={alephVolunteer} target="_blank" rel="noopener noreferrer">Volunteer</a>
                <span style={{ color: 'var(--fg-dim)' }}>&middot;</span>
                <a className="pill ghost" href="#aleph" onClick={(e) => { e.preventDefault(); scrollToSection('aleph') }}>Details <Chev /></a>
              </div>
            </div>
          </section>

          {/* Additional Notion announcements */}
          {announcements.length > 1 && (
            <section className="tiles" style={{ paddingTop: '0' }}>
              {announcements.slice(1).map((a) => (
                <div key={a.id} className="tile col-12 reveal" data-reveal>
                  <div>
                    <div className="tile-eyebrow" style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{a.date}</div>
                    <h2 className="tile-title">{a.title}</h2>
                    {a.body && <p className="tile-desc">{a.body}</p>}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Meeting Schedule */}
          <section className="officers-section reveal" data-reveal id="meetings" style={{ paddingTop: '40px', paddingBottom: '20px' }}>
            <div className="h2">Meeting Schedule.</div>
          </section>
          <section className="tiles" style={{ paddingTop: '16px', paddingBottom: '40px' }}>
            <div className="tile col-6 gold-bg reveal" data-reveal style={{ minHeight: '240px' }}>
              <div>
                <div className="tile-eyebrow">{m1Parts[0] || 'Grades 9\u201310'}</div>
                <h3 className="tile-title">{(m1Parts[1] || 'Monday, 3:30\u20135:00 PM').split(',').map((part, i) => i === 0 ? part.trim() : <React.Fragment key={i}><br />{part.trim()}</React.Fragment>)}</h3>
                <p className="tile-desc" style={{ marginTop: '12px' }}>{m1Parts[2] || 'Room 217'}</p>
              </div>
            </div>
            <div className="tile col-6 reveal" data-reveal style={{ minHeight: '240px' }}>
              <div>
                <div className="tile-eyebrow">{m2Parts[0] || 'Grades 7\u20138'}</div>
                <h3 className="tile-title">{(m2Parts[1] || 'Wednesday, 3:30\u20134:30 PM').split(',').map((part, i) => i === 0 ? part.trim() : <React.Fragment key={i}><br />{part.trim()}</React.Fragment>)}</h3>
                <p className="tile-desc" style={{ marginTop: '12px' }}>{m2Parts[2] || 'Room 724'}</p>
              </div>
            </div>
          </section>

        </section>

        <div className="section-divider reveal" data-reveal />

        {/* ============================================================ */}
        {/*  COMPETITIONS                                                */}
        {/* ============================================================ */}
        <section id="competitions" className="page-section">
          <section className="hero reveal" data-reveal style={{ paddingBottom: '40px' }}>
            <h1>Competitions.</h1>
            <p className="hero-sub">Competitions we train for and participate in during the 2025&ndash;2026 season.</p>
          </section>

          <div className="comp-list">
            {competitions.map((c) => (
              <div
                key={c.name}
                className="comp-row reveal"
                data-reveal
                onClick={c.internal ? () => scrollToSection(c.internal!.replace('#', '')) : undefined}
              >
                <div>
                  <div className="comp-name">{c.name}</div>
                </div>
                <div>
                  <div className="comp-desc">{c.desc}</div>
                  <div className="comp-format"><strong>Format:</strong> {c.format}</div>
                </div>
                <div className="comp-arrow">
                  {c.internal ? (
                    <a href={c.internal} onClick={(e) => { e.preventDefault(); e.stopPropagation(); scrollToSection(c.internal!.replace('#', '')) }}>
                      {c.arrow}
                    </a>
                  ) : c.link ? (
                    <a href={c.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      {c.arrow}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="section-divider reveal" data-reveal />

        {/* ============================================================ */}
        {/*  RESOURCES                                                   */}
        {/* ============================================================ */}
        <section id="resources" className="page-section">
          <section className="hero reveal" data-reveal style={{ paddingBottom: '40px' }}>
            <h1>Resources.</h1>
            <p className="hero-sub">Study materials, practice problems, and useful links for competition math.</p>
          </section>

          <div className="res-wrap">
            <div className="h2 reveal" data-reveal style={{ fontSize: '28px', marginBottom: '18px' }}>Recommended Resources</div>
            <div className="res-grid">
              {resources.map((r) => (
                <div key={r.name} className="res-card reveal" data-reveal>
                  <div className="res-title">{r.name}</div>
                  <div className="res-desc">{r.description}</div>
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer" className="res-cta">Open &rarr;</a>
                  )}
                </div>
              ))}
            </div>

            <div className="h2 reveal" data-reveal style={{ fontSize: '28px', margin: '56px 0 18px' }}>Worksheets</div>
            <div className="res-grid">
              {worksheets.map((w) => (
                <div key={w.name} className="res-card reveal" data-reveal>
                  <div className="res-title">{w.name}</div>
                  <div className="res-desc">{w.description}</div>
                  {w.link && (
                    <a href={w.link} target="_blank" rel="noopener noreferrer" className="res-cta">Open &rarr;</a>
                  )}
                </div>
              ))}
            </div>

            <div className="h2 reveal" data-reveal style={{ fontSize: '28px', margin: '56px 0 18px' }}>Activities</div>
            <div className="res-grid">
              {activities.map((a) => (
                <div key={a.name} className="res-card reveal" data-reveal>
                  <div className="res-title">{a.name}</div>
                  <div className="res-desc">{a.description}</div>
                  {a.link && (
                    <a href={a.link} target="_blank" rel="noopener noreferrer" className="res-cta">Open &rarr;</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider reveal" data-reveal />

        {/* ============================================================ */}
        {/*  VMT                                                         */}
        {/* ============================================================ */}
        <section id="vmt" className="page-section">
          <section className="event-hero reveal" data-reveal>
            <div className="event-eyebrow">Spartan Vanguard</div>
            <h1 className="event-title">Vanguard Math Tournament</h1>
            <p className="event-sub">An annual math competition for {vmtGrades.toLowerCase()}, hosted by Spartan Vanguard.</p>
          </section>

          <section className="officers-section" style={{ paddingTop: '20px' }}>
            <div className="h2 reveal" data-reveal>2026 Tournament.</div>
            <div className="event-meta-row reveal" data-reveal>
              <div className="event-meta-item"><div className="label">Date</div><div className="value">{vmtDate}</div></div>
              <div className="event-meta-item"><div className="label">Location</div><div className="value">{vmtLocation}</div></div>
              <div className="event-meta-item"><div className="label">Eligibility</div><div className="value">{vmtGrades}</div></div>
              <div className="event-meta-item"><div className="label">Hosted by</div><div className="value">Spartan Vanguard</div></div>
            </div>
          </section>

          {/* VMT Banner */}
          <section className="tiles" style={{ paddingTop: '16px' }}>
            <div className="tile col-12 reveal" data-reveal style={{ background: 'linear-gradient(135deg,#000 0%,#1d1d1f 100%)', color: '#F8FBF8', minHeight: '320px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                <div style={{ fontFamily: "'Inter Tight'", fontSize: 'clamp(80px,12vw,160px)', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1 }}>VMT</div>
              </div>
            </div>

            <div className="tile col-12 reveal" data-reveal>
              <div>
                <div className="tile-eyebrow">About VMT</div>
                <h3 className="tile-title">Annual tournament for grades 6&ndash;8.</h3>
                <p className="tile-desc" style={{ maxWidth: '58ch' }}>The Vanguard Math Tournament is Spartan Vanguard&rsquo;s annual competition designed for middle school students. The tournament features individual rounds, team rounds, and relay rounds covering a wide range of competition math topics.</p>
              </div>
            </div>
          </section>

          {/* Format */}
          <section className="officers-section">
            <div className="h2 reveal" data-reveal>Format.</div>
            <div className="reveal" data-reveal style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
              <div style={{ padding: '24px', background: 'var(--bg-tile)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Individual Round</div>
                <div style={{ color: 'var(--fg-muted)', fontSize: '15px', marginTop: '4px' }}>Solo problem-solving across multiple topics</div>
              </div>
              <div style={{ padding: '24px', background: 'var(--bg-tile)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Team Round</div>
                <div style={{ color: 'var(--fg-muted)', fontSize: '15px', marginTop: '4px' }}>Collaborative problem-solving in small groups</div>
              </div>
              <div style={{ padding: '24px', background: 'var(--bg-tile)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Relay Round</div>
                <div style={{ color: 'var(--fg-muted)', fontSize: '15px', marginTop: '4px' }}>Fast-paced relay-style problems between teammates</div>
              </div>
            </div>
          </section>

          {/* Registration */}
          <section className="officers-section">
            <div className="h2 reveal" data-reveal>Registration &amp; Volunteering.</div>
            <div className="reveal" data-reveal style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a className="pill" href={vmtSignUp} target="_blank" rel="noopener noreferrer">Sign Up to Compete</a>
              <a className="pill ghost" href={vmtVolunteer} target="_blank" rel="noopener noreferrer">Volunteer Sign-Up <Chev /></a>
            </div>
          </section>

          {/* Support Us */}
          <section className="officers-section">
            <div className="h2 reveal" data-reveal>Support Us.</div>
            <p className="h2-sub reveal" data-reveal>Our competitions run entirely on donations. Help us cover testing materials, food, and fees so we can keep competitions free.</p>
            <div className="reveal" data-reveal style={{ marginTop: '24px' }}>
              <a className="pill" href="https://gofund.me/70f62d73d" target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(145deg,#f7ecd0,#e4ce81)', color: '#3a2e0d' }}>Spartan Vanguard GoFundMe 2026 <Chev /></a>
            </div>
          </section>

          {/* Past Tournaments */}
          <section className="officers-section" style={{ paddingBottom: '80px' }}>
            <div className="h2 reveal" data-reveal>Past Tournaments.</div>
            <div style={{ marginTop: '24px' }}>
              <div className="arch-row reveal" data-reveal>
                <div className="arch-year">2026</div>
                <div className="arch-title">VMT 2026</div>
                <div className="arch-meta">February 21, 2026</div>
                <div className="arch-arrow">&rarr;</div>
              </div>
              <div className="arch-row reveal" data-reveal>
                <div className="arch-year">2025</div>
                <div className="arch-title">VMT-2 2025</div>
                <div className="arch-meta"></div>
                <div className="arch-arrow">&rarr;</div>
              </div>
              <div className="arch-row reveal" data-reveal>
                <div className="arch-year">2024</div>
                <div className="arch-title">VMT-1 2024</div>
                <div className="arch-meta"></div>
                <div className="arch-arrow">&rarr;</div>
              </div>
            </div>
          </section>
        </section>

        <div className="section-divider reveal" data-reveal />

        {/* ============================================================ */}
        {/*  ALEPH                                                       */}
        {/* ============================================================ */}
        <section id="aleph" className="page-section">
          <section className="event-hero reveal" data-reveal>
            <div className="event-eyebrow">Spartan Vanguard</div>
            <h1 className="event-title">Aleph Competition</h1>
            <p className="event-sub">A high school math competition for {alephGrades.toLowerCase()}, hosted by Spartan Vanguard.</p>
          </section>

          <section className="officers-section" style={{ paddingTop: '20px' }}>
            <div className="h2 reveal" data-reveal>2026 Competition.</div>
            <div className="event-meta-row reveal" data-reveal>
              <div className="event-meta-item"><div className="label">Date</div><div className="value">{alephDate}</div></div>
              <div className="event-meta-item"><div className="label">Location</div><div className="value">{alephLocation}</div></div>
              <div className="event-meta-item"><div className="label">Eligibility</div><div className="value">{alephGrades}</div></div>
              <div className="event-meta-item"><div className="label">Hosted by</div><div className="value">Spartan Vanguard</div></div>
            </div>
          </section>

          {/* Aleph Banner */}
          <section className="tiles" style={{ paddingTop: '16px' }}>
            <div className="tile col-12 reveal" data-reveal style={{ background: 'linear-gradient(135deg,#1d1d1f 0%,#3a2e0d 100%)', color: '#F8FBF8', minHeight: '320px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const }}>
              <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                <div style={{ fontFamily: "'Inter Tight'", fontSize: 'clamp(140px,18vw,220px)', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>{'\u2135'}</div>
              </div>
            </div>

            <div className="tile col-12 reveal" data-reveal>
              <div>
                <div className="tile-eyebrow">About Aleph</div>
                <h3 className="tile-title">High school math competition for grades 9&ndash;12.</h3>
                <p className="tile-desc" style={{ maxWidth: '58ch' }}>Aleph is Spartan Vanguard&rsquo;s annual high school math competition. Named after the first letter of the Hebrew alphabet and a symbol for infinite cardinality in mathematics, Aleph challenges students with problems spanning algebra, geometry, number theory, and combinatorics.</p>
              </div>
            </div>
          </section>

          {/* Format */}
          <section className="officers-section">
            <div className="h2 reveal" data-reveal>Format.</div>
            <div className="reveal" data-reveal style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
              <div style={{ padding: '24px', background: 'var(--bg-tile)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Individual Round</div>
                <div style={{ color: 'var(--fg-muted)', fontSize: '15px', marginTop: '4px' }}>Challenging problems for solo competitors</div>
              </div>
              <div style={{ padding: '24px', background: 'var(--bg-tile)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em' }}>Team Round</div>
                <div style={{ color: 'var(--fg-muted)', fontSize: '15px', marginTop: '4px' }}>Collaborative round for teams</div>
              </div>
            </div>
          </section>

          {/* Registration */}
          <section className="officers-section">
            <div className="h2 reveal" data-reveal>Registration &amp; Volunteering.</div>
            <div className="reveal" data-reveal style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a className="pill" href={alephSignUp} target="_blank" rel="noopener noreferrer">Sign Up to Compete</a>
              <a className="pill ghost" href={alephVolunteer} target="_blank" rel="noopener noreferrer">Volunteer Sign-Up <Chev /></a>
            </div>
          </section>

          {/* Support Us */}
          <section className="officers-section" style={{ paddingBottom: '80px' }}>
            <div className="h2 reveal" data-reveal>Support Us.</div>
            <p className="h2-sub reveal" data-reveal>Our competitions run entirely on donations. Help us cover testing materials, food, and fees so we can keep competitions free.</p>
            <div className="reveal" data-reveal style={{ marginTop: '24px' }}>
              <a className="pill" href="https://gofund.me/70f62d73d" target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(145deg,#f7ecd0,#e4ce81)', color: '#3a2e0d' }}>Spartan Vanguard GoFundMe 2026 <Chev /></a>
            </div>
          </section>
        </section>

        <div className="section-divider reveal" data-reveal />

        {/* ============================================================ */}
        {/*  TEAM                                                        */}
        {/* ============================================================ */}
        <section id="team" className="page-section">
          <section className="hero reveal" data-reveal style={{ paddingBottom: '40px' }}>
            <h1>Meet the <span className="grad">Vanguard.</span></h1>
            <p className="hero-sub">Six officers and a network of volunteers who make Spartan Vanguard run.</p>
          </section>

          <section className="officers-section">
            <div className="officer-grid">
              {officers.map((officer) => (
                <div key={officer.id} className="officer-card reveal" data-reveal>
                  <div className="officer-avatar">{getInitials(officer.name)}</div>
                  <div>
                    <div className="officer-name">{officer.name}</div>
                    <div className="officer-role">{officer.role}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '80px', padding: '40px 0', borderTop: '1px solid var(--line)' }}>
              <div className="h2">Get in touch.</div>
              <p className="h2-sub">
                Google Classroom &middot; <code style={{ fontFamily: 'var(--mono)' }}>{classroomCode}</code> &mdash; Remind &middot; <code style={{ fontFamily: 'var(--mono)' }}>{remindCode}</code><br />
                Email: <a href={`mailto:${email1}`} style={{ color: 'var(--accent)' }}>{email1}</a>, <a href={`mailto:${email2}`} style={{ color: 'var(--accent)' }}>{email2}</a>
              </p>
            </div>
          </section>
        </section>

      </main>

      {/* -- Footer -- */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            <div className="footer-col">
              <h5>Shop &amp; Compete</h5>
              <a href="#competitions" onClick={(e) => { e.preventDefault(); scrollToSection('competitions') }}>Competitions</a>
              <a href="#vmt" onClick={(e) => { e.preventDefault(); scrollToSection('vmt') }}>VMT</a>
              <a href="#aleph" onClick={(e) => { e.preventDefault(); scrollToSection('aleph') }}>Aleph</a>
            </div>
            <div className="footer-col">
              <h5>Learn</h5>
              <a href="#resources" onClick={(e) => { e.preventDefault(); scrollToSection('resources') }}>Resources</a>
              <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home') }}>Meeting Schedule</a>
              <a href="#team" onClick={(e) => { e.preventDefault(); scrollToSection('team') }}>Officers</a>
            </div>
            <div className="footer-col">
              <h5>Contact</h5>
              <a>Google Classroom &middot; {classroomCode}</a>
              <a>Remind &middot; {remindCode}</a>
              <a>{email1}</a>
              <a>{email2}</a>
            </div>
            <div className="footer-col">
              <h5>About Spartan Vanguard</h5>
              <a>Our mission</a>
              <a>Join the club</a>
              <a>Volunteer</a>
            </div>
          </div>
          <div className="legal">
            <div>Copyright &copy; 2025&ndash;2026 Spartan Vanguard Math Club. All rights reserved.</div>
            <div>La Ca&ntilde;ada High School &middot; La Ca&ntilde;ada Flintridge, CA</div>
          </div>
        </div>
      </footer>
    </>
  )
}
