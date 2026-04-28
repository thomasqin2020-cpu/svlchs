import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createOfficer, deleteOfficer, togglePublishOfficer } from './actions'

interface Row {
  id: string
  name: string
  role: string
  order_idx: number
  photo_url: string | null
  school_year: string
  published: boolean
}

async function loadOfficers(): Promise<Row[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('officers')
    .select('id, name, role, order_idx, photo_url, school_year, published')
    .order('school_year', { ascending: false })
    .order('order_idx', { ascending: true })
  return (data ?? []) as Row[]
}

export default async function OfficersAdmin() {
  const rows = await loadOfficers()

  return (
    <>
      <h1 className="admin-h1">Officers.</h1>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>New officer</h2>
        <form action={createOfficer} className="admin-form" encType="multipart/form-data">
          <div className="admin-form-row">
            <label className="auth-field">
              <span>Name</span>
              <input name="name" type="text" required />
            </label>
            <label className="auth-field">
              <span>Role</span>
              <input name="role" type="text" required placeholder="Co-President" />
            </label>
          </div>
          <div className="admin-form-row">
            <label className="auth-field">
              <span>Order (sort)</span>
              <input name="order_idx" type="number" defaultValue={0} />
            </label>
            <label className="auth-field">
              <span>School year</span>
              <input name="school_year" type="text" defaultValue="2026-2027" />
            </label>
          </div>
          <label className="auth-field">
            <span>Photo (optional)</span>
            <input name="photo" type="file" accept="image/*" />
          </label>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
            <input type="checkbox" name="published" defaultChecked /> Published
          </label>
          <button type="submit" className="pill" style={{ alignSelf: 'flex-start' }}>Create</button>
        </form>
      </div>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>All officers</h2>
        {rows.length === 0 ? (
          <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No officers yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Role</th>
                <th>Year</th>
                <th>Order</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.photo_url} alt={row.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-dark-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--fg-muted)' }}>
                        {row.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </td>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.role}</td>
                  <td>{row.school_year}</td>
                  <td>{row.order_idx}</td>
                  <td>
                    <span className={`admin-tag ${row.published ? 'green' : 'red'}`}>
                      {row.published ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <form action={async () => { 'use server'; await togglePublishOfficer(row.id, !row.published) }}>
                      <button type="submit" className="admin-tag" style={{ cursor: 'pointer' }}>{row.published ? 'Hide' : 'Publish'}</button>
                    </form>
                    <form action={async () => { 'use server'; await deleteOfficer(row.id) }}>
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
