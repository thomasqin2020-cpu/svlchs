import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/officers', label: 'Officers' },
  { href: '/admin/donations', label: 'Donations' },
  { href: '/admin/membership-signups', label: 'Member sign-ups' },
  { href: '/admin/competition-registrations', label: 'Comp. registrations' },
  { href: '/admin/contact-submissions', label: 'Contact inbox' },
  { href: '/admin/site-config', label: 'Site config' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">SV Admin</div>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="admin-nav-link">
            {item.label}
          </Link>
        ))}
        <form action="/logout" method="GET" style={{ marginTop: 'auto' }}>
          <button type="submit" className="admin-nav-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </form>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  )
}
