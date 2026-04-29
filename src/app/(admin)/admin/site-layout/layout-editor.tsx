'use client'

import { useState, useTransition } from 'react'
import {
  saveDraft,
  publishDraft,
  discardDraft,
  restoreVersionToDraft,
} from './actions'
import {
  DEFAULT_LAYOUT,
  type LayoutSection,
  type SiteLayoutData,
} from '@/lib/site-layout'

interface PublishedSummary {
  publishedAt: string | null
  notes: string | null
  sectionCount: number
}

interface ArchiveSummary {
  id: string
  archivedAt: string | null
  publishedAt: string | null
  notes: string | null
  sectionCount: number
}

interface LayoutEditorProps {
  initialDraft: SiteLayoutData | null
  publishedSummary: PublishedSummary | null
  archives: ArchiveSummary[]
}

export function LayoutEditor({ initialDraft, publishedSummary, archives }: LayoutEditorProps) {
  // The working draft state. Falls back to DEFAULT_LAYOUT so admins can always
  // produce a layout even on a fresh database.
  const [layout, setLayout] = useState<SiteLayoutData>(initialDraft ?? DEFAULT_LAYOUT)
  const [hasDraft, setHasDraft] = useState(!!initialDraft)
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const updateSection = (idx: number, patch: Partial<LayoutSection>) => {
    setLayout((prev) => {
      const next = { ...prev, sections: prev.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }
      return next
    })
  }
  const moveSection = (idx: number, dir: -1 | 1) => {
    setLayout((prev) => {
      const next = [...prev.sections]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return { ...prev, sections: next }
    })
  }

  const onSave = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await saveDraft(layout, notes || undefined)
      setMessage({ ok: result.ok, text: result.message })
      if (result.ok) setHasDraft(true)
    })
  }
  const onPublish = () => {
    if (!hasDraft) {
      setMessage({ ok: false, text: 'Save your changes as a draft first, then publish.' })
      return
    }
    if (!confirm('Publish this layout? The previous version will be saved to history.')) return
    setMessage(null)
    startTransition(async () => {
      const result = await publishDraft()
      setMessage({ ok: result.ok, text: result.message })
      if (result.ok) setHasDraft(false)
    })
  }
  const onDiscard = () => {
    if (!confirm('Discard the current draft? This cannot be undone.')) return
    setMessage(null)
    startTransition(async () => {
      const result = await discardDraft()
      setMessage({ ok: result.ok, text: result.message })
      if (result.ok) setHasDraft(false)
    })
  }
  const onRestore = (id: string) => {
    if (!confirm('Load this version into your current draft? Your unsaved changes will be replaced.')) return
    setMessage(null)
    startTransition(async () => {
      const result = await restoreVersionToDraft(id)
      setMessage({ ok: result.ok, text: result.message })
      if (result.ok) {
        // Easiest way to surface the loaded draft is a soft refresh.
        window.location.reload()
      }
    })
  }

  return (
    <>
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Sections</h2>
          <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
            {hasDraft ? 'Draft has unsaved/unpublished changes' : 'No draft — editing the live layout copy'}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 14 }}>
          Use the up/down arrows to reorder. Toggle visibility with the checkbox. Edit each
          section&rsquo;s heading and intro text inline. Hidden sections disappear from the
          homepage and the bottom dock nav.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {layout.sections.map((sec, i) => (
            <div
              key={sec.id}
              style={{
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: 14,
                background: sec.visible ? 'var(--bg-tile)' : 'rgba(255,255,255,0.02)',
                opacity: sec.visible ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => moveSection(i, -1)}
                    disabled={i === 0}
                    style={{ ...arrowBtn, opacity: i === 0 ? 0.3 : 1 }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => moveSection(i, 1)}
                    disabled={i === layout.sections.length - 1}
                    style={{ ...arrowBtn, opacity: i === layout.sections.length - 1 ? 0.3 : 1 }}
                  >
                    ▼
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.06em' }}>
                    #{sec.id} &middot; position {i + 1}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>{sec.label}</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-muted)' }}>
                  <input
                    type="checkbox"
                    checked={sec.visible}
                    onChange={(e) => updateSection(i, { visible: e.target.checked })}
                  />
                  Visible
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                <label className="auth-field" style={{ marginTop: 0 }}>
                  <span style={{ fontSize: 12 }}>Section title</span>
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => updateSection(i, { title: e.target.value })}
                  />
                </label>
                <label className="auth-field" style={{ marginTop: 0 }}>
                  <span style={{ fontSize: 12 }}>Section subtitle / intro</span>
                  <textarea
                    rows={2}
                    value={sec.subtitle}
                    onChange={(e) => updateSection(i, { subtitle: e.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="auth-field">
            <span style={{ fontSize: 12 }}>Snapshot note (optional)</span>
            <input
              type="text"
              placeholder="e.g., Pre-VMT 2027 launch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="pill" onClick={onSave} disabled={pending}>
              {pending ? 'Saving…' : hasDraft ? 'Update draft' : 'Save as draft'}
            </button>
            <button
              type="button"
              className="pill"
              onClick={onPublish}
              disabled={pending || !hasDraft}
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {pending ? 'Working…' : 'Publish draft'}
            </button>
            {hasDraft && (
              <button
                type="button"
                onClick={onDiscard}
                disabled={pending}
                className="admin-tag red"
                style={{ cursor: 'pointer', padding: '8px 14px' }}
              >
                Discard draft
              </button>
            )}
          </div>
          {message && (
            <p
              style={{
                fontSize: 13,
                padding: '8px 12px',
                borderRadius: 8,
                color: message.ok ? 'var(--ok, #6ee7a4)' : 'var(--err, #ff9f9f)',
                background: message.ok ? 'rgba(110,231,164,0.10)' : 'rgba(255,159,159,0.08)',
              }}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>

      {publishedSummary && (
        <div className="admin-card">
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Currently live</h2>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            Published {fmtDate(publishedSummary.publishedAt)} &middot;{' '}
            {publishedSummary.sectionCount} visible section
            {publishedSummary.sectionCount === 1 ? '' : 's'}
            {publishedSummary.notes ? ` · "${publishedSummary.notes}"` : ''}
          </p>
        </div>
      )}

      <div className="admin-card">
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Version history</h2>
        {archives.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            No archived versions yet. Each time you publish, the previous version moves here.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Archived</th>
                <th>Published before</th>
                <th>Sections</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {archives.map((a) => (
                <tr key={a.id}>
                  <td>{fmtDate(a.archivedAt)}</td>
                  <td>{fmtDate(a.publishedAt)}</td>
                  <td>{a.sectionCount}</td>
                  <td style={{ color: 'var(--fg-muted)', fontSize: 13 }}>{a.notes || '—'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onRestore(a.id)}
                      disabled={pending}
                      className="admin-tag blue"
                      style={{ cursor: 'pointer' }}
                    >
                      Load into draft
                    </button>
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

const arrowBtn: React.CSSProperties = {
  width: 24,
  height: 18,
  border: '1px solid var(--line)',
  borderRadius: 4,
  background: 'var(--bg-dark-2)',
  color: 'var(--fg-muted)',
  fontSize: 9,
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
