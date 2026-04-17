'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { useScroll } from 'motion/react'
import type { Announcement, Event, Officer, SiteConfig } from '@/types/content'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

interface HeroSectionProps {
    announcements: Announcement[]
    events: Event[]
    officers: Officer[]
    config: SiteConfig
}

export function HeroSection({ announcements, events, officers, config }: HeroSectionProps) {
    const announcementText = config['announcement_text'] || 'Spartan Vanguard hosts an annual spring math competition for middle and high school students. Organized and run entirely by high school volunteers, the event takes place at La Cañada High School. We welcome anyone with an interest in competitive math to join us, and participants and volunteers can enjoy free pizza!'
    const meeting1 = config['meeting_1'] || 'Grades 9–10 | Monday, 3:30–5:00 PM | Room 217'
    const meeting2 = config['meeting_2'] || 'Grades 7–8 | Wednesday, 3:30–4:30 PM | Room 724'
    const classroomCode = config['google_classroom'] || 'hsx4c54'
    const remindCode = config['remind'] || '@lchssv'
    const email1 = config['email_1'] || 'vchen26@mylcusd.net'
    const email2 = config['email_2'] || 'nchen26@mylcusd.net'

    const m1Parts = meeting1.split('|').map(s => s.trim())
    const m2Parts = meeting2.split('|').map(s => s.trim())

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-24">
                        <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
                        <div className="mx-auto max-w-5xl px-6">
                            <div className="sm:mx-auto lg:mr-auto">
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                >
                                    <h1
                                        className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16">
                                        Spartan Vanguard Math Club
                                    </h1>
                                    <p
                                        className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                                        Extracurricular math, problem solving, and competitions at La Cañada High School. Sharpen your skills, join a team, and compete in AMC, AIME, BMT, and more.
                                    </p>
                                    <div className="mt-12 flex items-center gap-2">
                                        <div
                                            key={1}
                                            className="bg-foreground/10 rounded-[14px] border p-0.5">
                                            <Button
                                                asChild
                                                size="lg"
                                                className="rounded-xl px-5 text-base">
                                                <Link href="#announcements">
                                                    <span className="text-nowrap">Announcements</span>
                                                </Link>
                                            </Button>
                                        </div>
                                        <Button
                                            key={2}
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-[42px] rounded-xl px-5 text-base">
                                            <Link href="#meetings">
                                                <span className="text-nowrap">Meeting Schedule</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative mt-8 px-2 sm:mt-12 md:mt-20">
                                <div className="relative mx-auto max-w-5xl">
                                    <img
                                        className="w-full object-contain"
                                        src="/sv-logo.png"
                                        alt="Spartan Vanguard logo"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>

                {/* Announcements */}
                <section id="announcements" className="bg-background pb-16 pt-16 md:pb-24">
                    <div className="m-auto max-w-5xl px-6">
                        <h2 className="text-xl font-semibold mb-4">Announcements</h2>
                        <p className="text-muted-foreground max-w-3xl mb-8">{announcementText}</p>

                        {/* Notion announcements */}
                        {announcements.length > 0 && (
                            <div className="space-y-4 mb-8">
                                {announcements.map((a) => (
                                    <div key={a.id} className="rounded-xl border border-border bg-secondary p-5">
                                        <p className="text-sm text-muted-foreground mb-1">{a.date}</p>
                                        <h3 className="text-base font-semibold">{a.title}</h3>
                                        {a.body && <p className="text-sm text-muted-foreground mt-1">{a.body}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Event cards */}
                        <div className="grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
                            {events.map((event) => (
                                <div key={event.id} className="rounded-xl border border-border bg-secondary p-6">
                                    <p className="text-sm text-muted-foreground mb-1">{event.date}</p>
                                    <h3 className="text-lg font-semibold">{event.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {event.location}{event.grades ? ` · ${event.grades}` : ''}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {event.signUpLink && (
                                            <><a href={event.signUpLink} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-foreground hover:underline">Sign Up</a>
                                            <span className="text-muted-foreground text-xs">·</span></>
                                        )}
                                        {event.volunteerLink && (
                                            <><a href={event.volunteerLink} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-foreground hover:underline">Volunteer</a>
                                            <span className="text-muted-foreground text-xs">·</span></>
                                        )}
                                        {event.pageLink && (
                                            <Link href={event.pageLink} className="text-xs text-accent-foreground hover:underline">Details →</Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Meetings */}
                <section id="meetings" className="bg-background pb-16">
                    <div className="m-auto max-w-5xl px-6">
                        <h2 className="text-xl font-semibold mb-8">Meeting Schedule</h2>
                        <div className="grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="rounded-xl border-l-2 border-primary bg-secondary p-6">
                                <h3 className="text-lg font-semibold">{m1Parts[0] || 'Grades 9–10'}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{m1Parts[1] || 'Monday, 3:30–5:00 PM'}</p>
                                <p className="text-sm text-muted-foreground">{m1Parts[2] || 'Room 217'}</p>
                            </div>
                            <div className="rounded-xl border-l-2 border-primary bg-secondary p-6">
                                <h3 className="text-lg font-semibold">{m2Parts[0] || 'Grades 7–8'}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{m2Parts[1] || 'Wednesday, 3:30–4:30 PM'}</p>
                                <p className="text-sm text-muted-foreground">{m2Parts[2] || 'Room 724'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Officers */}
                <section className="bg-background pb-16">
                    <div className="m-auto max-w-5xl px-6">
                        <h2 className="text-xl font-semibold mb-8">2025–2026 Officers</h2>
                        <div className="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
                            {officers.map((officer) => (
                                <div key={officer.id}>
                                    <p className="font-medium">{officer.name}</p>
                                    <p className="text-sm text-muted-foreground">{officer.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-background pb-16">
                    <div className="m-auto max-w-5xl px-6">
                        <h2 className="text-xl font-semibold mb-4">Contact</h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <span>Google Classroom: <code className="text-accent-foreground bg-accent rounded px-1.5 py-0.5 text-xs font-mono">{classroomCode}</code></span>
                            <span>Remind: <code className="text-accent-foreground bg-accent rounded px-1.5 py-0.5 text-xs font-mono">{remindCode}</code></span>
                            <span>Email: <Link href={`mailto:${email1}`} className="text-accent-foreground hover:underline">{email1}</Link>, <Link href={`mailto:${email2}`} className="text-accent-foreground hover:underline">{email2}</Link></span>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-border bg-background py-8">
                    <div className="m-auto max-w-5xl px-6 flex flex-wrap items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">© 2025–2026 Spartan Vanguard · La Cañada High School</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <Link href="/competitions" className="hover:text-foreground">Competitions</Link>
                            <Link href="/resources" className="hover:text-foreground">Resources</Link>
                            <Link href="/vmt" className="hover:text-foreground">VMT</Link>
                            <Link href="/aleph" className="hover:text-foreground">Aleph</Link>
                            <Link href="/archive" className="hover:text-foreground">Archive</Link>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Competitions', href: '/competitions' },
    { name: 'Resources', href: '/resources' },
    { name: 'VMT', href: '/vmt' },
    { name: 'Aleph', href: '/aleph' },
    { name: 'Archive', href: '/archive' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    const { scrollYProgress } = useScroll()

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrolled(latest > 0.05)
        })
        return () => unsubscribe()
    }, [scrollYProgress])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn('group fixed z-20 w-full border-b border-border transition-colors duration-150', scrolled && 'bg-background/50 backdrop-blur-3xl')}>
                <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center text-foreground font-semibold">
                                Spartan Vanguard
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>

                            <div className="hidden lg:block">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border p-4 shadow-2xl shadow-zinc-950/20 md:flex-nowrap lg:m-0 lg:hidden lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
                            <div className="w-full">
                                <ul className="space-y-4 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setMenuState(false)}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
