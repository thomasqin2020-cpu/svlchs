import { LayoutEditor } from './layout-editor'
import { loadLayoutState, loadArchivedVersions } from './actions'

export default async function SiteLayoutAdminPage() {
  const [{ draft, published }, archives] = await Promise.all([
    loadLayoutState(),
    loadArchivedVersions(),
  ])

  return (
    <>
      <h1 className="admin-h1">Layout.</h1>
      <p style={{ color: 'var(--fg-muted)', fontSize: 14, marginBottom: 16 }}>
        Reorder, hide, and rename the homepage sections. Save creates a private draft;
        Publish swaps the draft into the live site (and snapshots the previous version below).
      </p>
      <LayoutEditor
        initialDraft={draft?.data ?? null}
        publishedSummary={
          published
            ? {
                publishedAt: published.published_at,
                notes: published.notes,
                sectionCount: published.data.sections.filter((s) => s.visible).length,
              }
            : null
        }
        archives={archives.map((a) => ({
          id: a.id,
          archivedAt: a.archived_at,
          publishedAt: a.published_at,
          notes: a.notes,
          sectionCount: a.data.sections.filter((s) => s.visible).length,
        }))}
      />
    </>
  )
}
