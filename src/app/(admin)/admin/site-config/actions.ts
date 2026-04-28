'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function upsertConfig(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  const key = String(formData.get('key') ?? '').trim()
  const value = String(formData.get('value') ?? '')
  if (!key) return
  await supabase.from('site_config').upsert({ key, value }, { onConflict: 'key' })
  revalidatePath('/admin/site-config')
  revalidatePath('/')
}

export async function deleteConfig(key: string) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('site_config').delete().eq('key', key)
  revalidatePath('/admin/site-config')
  revalidatePath('/')
}
