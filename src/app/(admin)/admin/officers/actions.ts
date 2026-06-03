'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5MB

export async function createOfficer(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')

  const file = formData.get('photo') as File | null
  let photoUrl: string | null = null
  if (file && file.size > 0) {
    // Validate against a MIME allowlist and a size cap, and derive the
    // extension from the verified type rather than trusting file.name — the
    // bucket is public, so don't let a client store arbitrary content there.
    const ext = ALLOWED_PHOTO_TYPES[file.type]
    if (!ext) {
      console.error('officer photo rejected: unsupported type', file.type)
    } else if (file.size > MAX_PHOTO_BYTES) {
      console.error('officer photo rejected: too large', file.size)
    } else {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('officer-photos')
        .upload(path, file, { upsert: false, contentType: file.type })
      if (!uploadError) {
        const { data } = supabase.storage.from('officer-photos').getPublicUrl(path)
        photoUrl = data.publicUrl
      } else {
        console.error('officer photo upload failed:', uploadError)
      }
    }
  }

  await supabase.from('officers').insert({
    name: String(formData.get('name') ?? ''),
    role: String(formData.get('role') ?? ''),
    order_idx: Number(formData.get('order_idx') ?? 0),
    photo_url: photoUrl,
    school_year: String(formData.get('school_year') ?? '2026-2027'),
    published: formData.get('published') !== 'off',
  })
  revalidatePath('/admin/officers')
  revalidatePath('/')
}

export async function deleteOfficer(id: string) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('officers').delete().eq('id', id)
  revalidatePath('/admin/officers')
  revalidatePath('/')
}

export async function togglePublishOfficer(id: string, published: boolean) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('officers').update({ published }).eq('id', id)
  revalidatePath('/admin/officers')
  revalidatePath('/')
}
