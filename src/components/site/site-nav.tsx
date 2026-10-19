'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const TABS = [
  { href: '/', label: 'Home' },
  { href: '/competitions', label: 'Competitions' },
  { href: '/tournaments', label: 'VMT and Aleph' },
  { href: '/resources', label: 'Resources' },
  { href: '/team', label: 'Team' },
] as const

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export function SiteNav() {
  const pathname = usePathname()
  return (
    <nav className="sv-tabs" aria-label="Pages">
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="sv-tab"
            aria-current={active ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
