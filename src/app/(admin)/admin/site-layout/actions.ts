'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentMember } from '@/lib/auth'
import { normalizeLayout, type SiteLayoutData } from '@/lib/site-layout'

export interface LayoutVersion {
  id: string
  status: 'draft' | 'published' | 'archived'
  notes: string | null
  created_at: string
  published_at: string | null
  archived_at: string | null
  data: SiteLayoutData
}

interface ActionResult {
  ok: boolean
  message: string
}

/** Fetch the current draft (if any) and the published version. */
export async function loadLayoutState(): Promise<{
  draft: LayoutVersion | null
  published: LayoutVersion | null
}> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { draft: null, published: null }
  const member = await getCurrentMember()
  if (!member || member.role !== 'admin') return { draft: null, published: null }

  const { data: rows } = await supabase
    .from('site_layouts')
    .select('id, status, notes, created_at, published_at, archived_at, data')
    .in('status', ['draft', 'published'])
    .order('created_at', { ascending: false })

  const draft = rows?.find((r) => r.status === 'draft') ?? null
  const published = rows?.find((r) => r.status === 'published') ?? null
  return {
    draft: draft ? { ...draft, data: normalizeLayout(draft.data) } as LayoutVersion : null,
    published: published ? { ...published, data: normalizeLayout(published.data) } as LayoutVersion : null,
  }
}

/** Fetch all archived (historical) versions, newest first. */
export async function loadArchivedVersions(): Promise<LayoutVersion[]> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return []
  const member = await getCurrentMember()
  if (!member || member.role !== 'admin') return []

  const { data: rows } = await supabase
    .from('site_layouts')
    .select('id, status, notes, created_at, published_at, archived_at, data')
    .eq('status', 'archived')
    .order('archived_at', { ascending: false })
    .limit(100)

  return (rows ?? []).map((r) => ({ ...r, data: normalizeLayout(r.data) }) as LayoutVersion)
}

/**
 * Save a draft. If a draft already exists, update it in place. Otherwise
 * insert a fresh draft row owned by the current admin.
 */
export async function saveDraft(data: SiteLayoutData, notes?: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' }
  const member = await getCurrentMember()
  if (!member || member.role !== 'admin') return { ok: false, message: 'Admin only.' }

  const { data: existing } = await supabase
    .from('site_layouts')
    .select('id')
    .eq('status', 'draft')
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('site_layouts')
      .update({ data, notes: notes ?? null, created_by: member.id })
      .eq('id', existing.id)
    if (error) return { ok: false, message: error.message }
  } else {
    const { error } = await supabase
      .from('site_layouts')
      .insert({ data, status: 'draft', notes: notes ?? null, created_by: member.id })
    if (error) return { ok: false, message: error.message }
  }
  revalidatePath('/admin/site-layout')
  return { ok: true, message: 'Draft saved.' }
}

/**
 * Publish the current draft: archive the existing published row (snapshot)
 * and promote the draft to published. Anyone visiting the homepage will see
 * the new layout on next page load.
 */
export async function publishDraft(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' }
  const member = await getCurrentMember()
  if (!member || member.role !== 'admin') return { ok: false, message: 'Admin only.' }

  const { data: draft } = await supabase
    .from('site_layouts')
    .select('id')
    .eq('status', 'draft')
    .maybeSingle()
  if (!draft) return { ok: false, message: 'No draft to publish. Save changes first.' }

  // Archive the currently published row (if any). The unique index on
  // status='published' would otherwise reject the next update.
  const { data: existingPublished } = await supabase
    .from('site_layouts')
    .select('id')
    .eq('status', 'published')
    .maybeSingle()
  if (existingPublished) {
    const { error } = await supabase
      .from('site_layouts')
      .update({ status: 'archived', archived_at: new Date().toISOString() })
      .eq('id', existingPublished.id)
    if (error) return { ok: false, message: 'Could not archive previous version: ' + error.message }
  }

  // Promote draft → published.
  const { error: pubError } = await supabase
    .from('site_layouts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', draft.id)
  if (pubError) return { ok: false, message: pubError.message }

  revalidatePath('/admin/site-layout')
  revalidatePath('/')
  return { ok: true, message: 'Published. The homepage now reflects the new layout.' }
}

/** Discard the current draft (if any). */
export async function discardDraft(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' }
  const member = await getCurrentMember()
  if (!member || member.role !== 'admin') return { ok: false, message: 'Admin only.' }

  const { error } = await supabase.from('site_layouts').delete().eq('status', 'draft')
  if (error) return { ok: false, message: error.message }
  revalidatePath('/admin/site-layout')
  return { ok: true, message: 'Draft discarded.' }
}

/**
 * Restore an archived version: copy its data into the current draft so the
 * admin can review/edit/publish it. Doesn't touch the live site directly.
 */
export async function restoreVersionToDraft(versionId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { ok: false, message: 'Supabase is not configured.' }
  const member = await getCurrentMember()
  if (!member || member.role !== 'admin') return { ok: false, message: 'Admin only.' }

  const { data: src } = await supabase
    .from('site_layouts')
    .select('data')
    .eq('id', versionId)
    .single()
  if (!src) return { ok: false, message: 'Version not found.' }

  return saveDraft(normalizeLayout(src.data), `Restored from version ${versionId.slice(0, 8)}`)
}
