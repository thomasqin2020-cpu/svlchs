import { createSupabaseServerClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const [
    { count: pendingSignups },
    { count: upcomingEvents },
    { data: donationsAgg },
    { count: unrepliedContact },
  ] = await Promise.all([
    supabase.from('membership_signups').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('published', true).gte('date', new Date().toISOString().slice(0, 10)),
    supabase.from('donations').select('amount_cents'),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('replied', false),
  ])

  const totalDonationCents = (donationsAgg ?? []).reduce((sum, row) => sum + (row.amount_cents ?? 0), 0)

  return {
    pendingSignups: pendingSignups ?? 0,
    upcomingEvents: upcomingEvents ?? 0,
    totalDonations: totalDonationCents,
    unrepliedContact: unrepliedContact ?? 0,
  }
}

function fmtUSD(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

export default async function AdminOverview() {
  const stats = await getStats()
  return (
    <>
      <h1 className="admin-h1">Overview.</h1>
      {!stats ? (
        <p>Supabase isn&rsquo;t configured yet — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your env.</p>
      ) : (
        <div className="admin-grid">
          <div className="admin-stat">
            <span className="admin-stat-label">Pending sign-ups</span>
            <span className="admin-stat-value">{stats.pendingSignups}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Upcoming events</span>
            <span className="admin-stat-value">{stats.upcomingEvents}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Total donations</span>
            <span className="admin-stat-value">{fmtUSD(stats.totalDonations)}</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-label">Unread contact</span>
            <span className="admin-stat-value">{stats.unrepliedContact}</span>
          </div>
        </div>
      )}
    </>
  )
}
