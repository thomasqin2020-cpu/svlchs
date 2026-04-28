import { createSupabaseServerClient } from '@/lib/supabase/server'
import { upsertConfig, deleteConfig } from './actions'

interface Row { key: string; value: string }

async function load(): Promise<Row[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data } = await supabase.from('site_config').select('key, value').order('key')
  return (data ?? []) as Row[]
}

export default async function SiteConfigAdmin() {
  const rows = await load()
  return (
    <>
      <h1 className="admin-h1">Site config.</h1>
      <p style={{ color: 'var(--fg-muted)', fontSize: 13, marginTop: -8, marginBottom: 24 }}>
        Key / value pairs that appear on the public site (Classroom code, Remind handle, meeting times, etc.).
      </p>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Set / update value</h2>
        <form action={upsertConfig} className="admin-form">
          <div className="admin-form-row">
            <label className="auth-field">
              <span>Key</span>
              <input name="key" type="text" required placeholder="google_classroom" />
            </label>
            <label className="auth-field">
              <span>Value</span>
              <input name="value" type="text" />
            </label>
          </div>
          <button type="submit" className="pill" style={{ alignSelf: 'flex-start' }}>Save</button>
        </form>
      </div>

      <div className="admin-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Existing values</h2>
        {rows.length === 0 ? (
          <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No config rows yet.</p>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Key</th><th>Value</th><th></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td><code style={{ fontSize: 12 }}>{row.key}</code></td>
                  <td style={{ fontSize: 13 }}>{row.value}</td>
                  <td>
                    <form action={async () => { 'use server'; await deleteConfig(row.key) }}>
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
