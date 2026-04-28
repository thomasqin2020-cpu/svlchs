import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createAnnouncement, deleteAnnouncement } from './actions'

interface Row {
  id: string
  title: string
  body: string
  date: string
  pinned: boolean
  members_only: boolean
  published: boolean
}

async function loadAnnouncements(): Promise<Row[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('announcements')
    .select('id, title, body, date, pinned, members_only, published')
    .order('date', { ascending: false })
  return (data ?? []) as Row[]
}

export default async function AnnouncementsAdmin() {
  const rows = await loadAnnouncements()
  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <h1 className="admin-h1">Announcements.</h1>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>New announcement</h2>
        <form action={createAnnouncement} className="admin-form">
          <label className="auth-field">
            <span>Title</span>
            <input name="title" type="text" required />
          </label>
          <label className="auth-field">
            <span>Body</span>
            <textarea name="body" rows={4} />
          </label>
          <div className="admin-form-row">
            <label className="auth-field">
              <span>Date</span>
              <input name="date" type="date" defaultValue={today} required />
            </label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 22 }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" name="pinned" /> Pinned
              </label>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" name="members_only" /> Members only
              </label>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" name="published" defaultChecked /> Published
              </label>
            </div>
          </div>
          <button type="submit" className="pill" style={{ alignSelf: 'flex-start' }}>Create</button>
        </form>
      </div>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>All announcements</h2>
        {rows.length === 0 ? (
          <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No announcements yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Flags</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.title}</strong><br /><span style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{row.body.slice(0, 100)}{row.body.length > 100 ? '…' : ''}</span></td>
                  <td>{row.date}</td>
                  <td style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {row.pinned && <span className="admin-tag gold">Pinned</span>}
                    {row.members_only && <span className="admin-tag blue">Members</span>}
                    {!row.published && <span className="admin-tag red">Draft</span>}
                  </td>
                  <td>
                    <form action={async () => { 'use server'; await deleteAnnouncement(row.id) }}>
                      <button type="submit" className="admin-tag red" style={{ cursor: 'pointer' }}>Delete</button>
                    </form>
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
