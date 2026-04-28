import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createEvent, deleteEvent, togglePublishEvent } from './actions'

interface Row {
  id: string
  name: string
  date: string
  location: string
  grades: string
  sign_up_link: string
  volunteer_link: string
  page_link: string
  description: string
  published: boolean
}

async function loadEvents(): Promise<Row[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('events')
    .select('id, name, date, location, grades, sign_up_link, volunteer_link, page_link, description, published')
    .order('date', { ascending: true })
  return (data ?? []) as Row[]
}

export default async function EventsAdmin() {
  const rows = await loadEvents()

  return (
    <>
      <h1 className="admin-h1">Events.</h1>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>New event</h2>
        <form action={createEvent} className="admin-form">
          <div className="admin-form-row">
            <label className="auth-field">
              <span>Name</span>
              <input name="name" type="text" required />
            </label>
            <label className="auth-field">
              <span>Date</span>
              <input name="date" type="date" required />
            </label>
          </div>
          <div className="admin-form-row">
            <label className="auth-field">
              <span>Location</span>
              <input name="location" type="text" />
            </label>
            <label className="auth-field">
              <span>Grades</span>
              <input name="grades" type="text" placeholder="Grades 6–8" />
            </label>
          </div>
          <div className="admin-form-row">
            <label className="auth-field">
              <span>Sign-up link</span>
              <input name="sign_up_link" type="text" placeholder="/competitions/vmt/register" />
            </label>
            <label className="auth-field">
              <span>Volunteer link</span>
              <input name="volunteer_link" type="text" />
            </label>
          </div>
          <label className="auth-field">
            <span>Page link</span>
            <input name="page_link" type="text" placeholder="/vmt" />
          </label>
          <label className="auth-field">
            <span>Description</span>
            <textarea name="description" rows={3} />
          </label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
            <input type="checkbox" name="published" defaultChecked /> Published
          </label>
          <button type="submit" className="pill" style={{ alignSelf: 'flex-start' }}>Create</button>
        </form>
      </div>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>All events</h2>
        {rows.length === 0 ? (
          <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No events yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Location</th>
                <th>Grades</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.date}</td>
                  <td>{row.location}</td>
                  <td>{row.grades}</td>
                  <td>
                    <span className={`admin-tag ${row.published ? 'green' : 'red'}`}>
                      {row.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <form action={async () => { 'use server'; await togglePublishEvent(row.id, !row.published) }}>
                      <button type="submit" className="admin-tag" style={{ cursor: 'pointer' }}>{row.published ? 'Hide' : 'Publish'}</button>
                    </form>
                    <form action={async () => { 'use server'; await deleteEvent(row.id) }}>
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
