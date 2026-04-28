import { createSupabaseServerClient } from '@/lib/supabase/server'

interface Row {
  id: string
  event_slug: string
  event_name: string
  student_name: string
  school: string | null
  grade: string | null
  email: string
  parent_email: string | null
  notes: string | null
  created_at: string
}

async function load(): Promise<Row[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('competition_registrations')
    .select('id, event_slug, event_name, student_name, school, grade, email, parent_email, notes, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as Row[]
}

export default async function CompetitionRegistrationsAdmin() {
  const rows = await load()
  const byEvent = new Map<string, Row[]>()
  for (const r of rows) {
    if (!byEvent.has(r.event_slug)) byEvent.set(r.event_slug, [])
    byEvent.get(r.event_slug)!.push(r)
  }

  return (
    <>
      <h1 className="admin-h1">Competition registrations.</h1>
      {byEvent.size === 0 && (
        <div className="admin-card"><p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No registrations yet.</p></div>
      )}
      {Array.from(byEvent.entries()).map(([slug, items]) => (
        <div key={slug} className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>{items[0].event_name} ({items.length})</h2>
            <a className="admin-tag" href={`/admin/competition-registrations/export.csv?slug=${slug}`}>Export CSV</a>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>School</th>
                <th>Grade</th>
                <th>Email</th>
                <th>Parent email</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td><strong>{row.student_name}</strong></td>
                  <td>{row.school}</td>
                  <td>{row.grade}</td>
                  <td style={{ fontSize: 12 }}>{row.email}</td>
                  <td style={{ fontSize: 12 }}>{row.parent_email}</td>
                  <td style={{ fontSize: 13 }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  )
}
