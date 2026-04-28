'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createOfficer(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')

  const file = formData.get('photo') as File | null
  let photoUrl: string | null = null
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop() ?? 'jpg'
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
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('officers').delete().eq('id', id)
  revalidatePath('/admin/officers')
  revalidatePath('/')
}

export async function togglePublishOfficer(id: string, published: boolean) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('officers').update({ published }).eq('id', id)
  revalidatePath('/admin/officers')
  revalidatePath('/')
}
