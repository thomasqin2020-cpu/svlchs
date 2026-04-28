'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createEvent(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('events').insert({
    name: String(formData.get('name') ?? ''),
    date: String(formData.get('date') ?? ''),
    location: String(formData.get('location') ?? ''),
    grades: String(formData.get('grades') ?? ''),
    sign_up_link: String(formData.get('sign_up_link') ?? ''),
    volunteer_link: String(formData.get('volunteer_link') ?? ''),
    page_link: String(formData.get('page_link') ?? ''),
    description: String(formData.get('description') ?? ''),
    published: formData.get('published') !== 'off',
  })
  revalidatePath('/admin/events')
  revalidatePath('/')
}

export async function deleteEvent(id: string) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('events').delete().eq('id', id)
  revalidatePath('/admin/events')
  revalidatePath('/')
}

export async function togglePublishEvent(id: string, published: boolean) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('events').update({ published }).eq('id', id)
  revalidatePath('/admin/events')
  revalidatePath('/')
}
