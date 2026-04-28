import { createSupabaseServerClient } from '@/lib/supabase/server'

interface Donation {
  id: string
  amount_cents: number
  currency: string
  donor_name: string | null
  donor_email: string | null
  anonymous: boolean
  message: string | null
  created_at: string
  stripe_payment_intent_id: string | null
}

async function loadDonations(): Promise<Donation[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('donations')
    .select('id, amount_cents, currency, donor_name, donor_email, anonymous, message, created_at, stripe_payment_intent_id')
    .order('created_at', { ascending: false })
  return (data ?? []) as Donation[]
}

function fmtUSD(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default async function DonationsAdmin() {
  const rows = await loadDonations()
  const total = rows.reduce((sum, r) => sum + (r.amount_cents ?? 0), 0)

  return (
    <>
      <h1 className="admin-h1">Donations.</h1>

      <div className="admin-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat">
          <span className="admin-stat-label">Total raised</span>
          <span className="admin-stat-value">{fmtUSD(total)}</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Donations</span>
          <span className="admin-stat-value">{rows.length}</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-label">Avg gift</span>
          <span className="admin-stat-value">{rows.length ? fmtUSD(Math.round(total / rows.length)) : '$0'}</span>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>All donations</h2>
          <a className="admin-tag" href="/admin/donations/export.csv">Export CSV</a>
        </div>

        {rows.length === 0 ? (
          <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No donations yet. Once Stripe webhook is configured, they&rsquo;ll show up here.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Donor</th>
                <th>Email</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td><strong>{fmtUSD(row.amount_cents)}</strong></td>
                  <td>{row.anonymous ? <em>Anonymous</em> : row.donor_name ?? '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{row.donor_email ?? '—'}</td>
                  <td style={{ fontSize: 13 }}>{row.message ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
