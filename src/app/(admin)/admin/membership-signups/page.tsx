import { createSupabaseServerClient } from '@/lib/supabase/server'
import { setSignupStatus } from './actions'

interface Row {
  id: string
  name: string
  email: string
  grade: string | null
  why_joining: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

async function load(): Promise<Row[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('membership_signups')
    .select('id, name, email, grade, why_joining, status, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as Row[]
}

export default async function MembershipSignupsAdmin() {
  const rows = await load()

  return (
    <>
      <h1 className="admin-h1">Member sign-ups.</h1>
      <div className="admin-card">
        {rows.length === 0 ? (
          <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No sign-ups yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Grade</th>
                <th>Why</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td><strong>{row.name}</strong></td>
                  <td style={{ fontSize: 12 }}>{row.email}</td>
                  <td>{row.grade}</td>
                  <td style={{ fontSize: 13, maxWidth: 280 }}>{row.why_joining}</td>
                  <td>
                    <span className={`admin-tag ${row.status === 'approved' ? 'green' : row.status === 'rejected' ? 'red' : ''}`}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {row.status !== 'approved' && (
                      <form action={async () => { 'use server'; await setSignupStatus(row.id, 'approved') }}>
                        <button type="submit" className="admin-tag green" style={{ cursor: 'pointer' }}>Approve</button>
                      </form>
                    )}
                    {row.status !== 'rejected' && (
                      <form action={async () => { 'use server'; await setSignupStatus(row.id, 'rejected') }}>
                        <button type="submit" className="admin-tag red" style={{ cursor: 'pointer' }}>Reject</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
