'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createAnnouncement(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')

  await supabase.from('announcements').insert({
    title: String(formData.get('title') ?? ''),
    body: String(formData.get('body') ?? ''),
    date: String(formData.get('date') ?? new Date().toISOString().slice(0, 10)),
    pinned: formData.get('pinned') === 'on',
    members_only: formData.get('members_only') === 'on',
    published: formData.get('published') !== 'off',
  })
  revalidatePath('/admin/announcements')
  revalidatePath('/')
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')

  await supabase
    .from('announcements')
    .update({
      title: String(formData.get('title') ?? ''),
      body: String(formData.get('body') ?? ''),
      date: String(formData.get('date') ?? new Date().toISOString().slice(0, 10)),
      pinned: formData.get('pinned') === 'on',
      members_only: formData.get('members_only') === 'on',
      published: formData.get('published') !== 'off',
    })
    .eq('id', id)
  revalidatePath('/admin/announcements')
  revalidatePath('/')
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('announcements').delete().eq('id', id)
  revalidatePath('/admin/announcements')
  revalidatePath('/')
}
