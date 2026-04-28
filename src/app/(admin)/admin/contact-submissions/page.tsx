import { createSupabaseServerClient } from '@/lib/supabase/server'
import { toggleReplied } from './actions'

interface Row {
  id: string
  name: string
  email: string
  message: string
  replied: boolean
  created_at: string
}

async function load(): Promise<Row[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('contact_submissions')
    .select('id, name, email, message, replied, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as Row[]
}

export default async function ContactSubmissionsAdmin() {
  const rows = await load()
  return (
    <>
      <h1 className="admin-h1">Contact inbox.</h1>
      <div className="admin-card">
        {rows.length === 0 ? (
          <p style={{ color: 'var(--fg-muted)', fontSize: 14 }}>No messages yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((row) => (
              <div key={row.id} style={{ padding: '14px 16px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', opacity: row.replied ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <strong>{row.name}</strong>
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{new Date(row.created_at).toLocaleString()}</span>
                </div>
                <a href={`mailto:${row.email}`} style={{ fontSize: 12, color: 'var(--accent)' }}>{row.email}</a>
                <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{row.message}</p>
                <form action={async () => { 'use server'; await toggleReplied(row.id, !row.replied) }}>
                  <button type="submit" className={`admin-tag ${row.replied ? '' : 'green'}`} style={{ cursor: 'pointer', marginTop: 4 }}>
                    {row.replied ? 'Mark unread' : 'Mark replied'}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
