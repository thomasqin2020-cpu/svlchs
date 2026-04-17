'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScroll } from 'motion/react'

const menuItems = [
    { name: 'Competitions', href: '/competitions' },
    { name: 'Resources', href: '/resources' },
    { name: 'VMT', href: '/vmt' },
    { name: 'Aleph', href: '/aleph' },
    { name: 'Archive', href: '/archive' },
]

export function PageShell({ children, active }: { children: React.ReactNode; active?: string }) {
    return (
        <>
            <PageHeader active={active} />
            <main className="pt-16">
                {children}
            </main>
            <footer className="border-t border-border bg-background py-8">
                <div className="m-auto max-w-5xl px-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">&copy; 2025&ndash;2026 Spartan Vanguard &middot; La Ca&ntilde;ada High School</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <Link href="/competitions" className="hover:text-foreground">Competitions</Link>
                        <Link href="/resources" className="hover:text-foreground">Resources</Link>
                        <Link href="/vmt" className="hover:text-foreground">VMT</Link>
                        <Link href="/aleph" className="hover:text-foreground">Aleph</Link>
                        <Link href="/archive" className="hover:text-foreground">Archive</Link>
                    </div>
                </div>
            </footer>
        </>
    )
}

function PageHeader({ active }: { active?: string }) {
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
                            <Link href="/" aria-label="home" className="flex items-center text-foreground font-semibold">
                                Spartan Vanguard
                            </Link>
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                            <div className="hidden lg:block">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'block duration-150',
                                                    active === item.name ? 'text-accent-foreground' : 'text-muted-foreground hover:text-accent-foreground'
                                                )}>
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
                                    {menuItems.map((item) => (
                                        <li key={item.name}>
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
