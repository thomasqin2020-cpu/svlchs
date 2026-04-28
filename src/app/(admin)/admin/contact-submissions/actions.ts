'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function toggleReplied(id: string, replied: boolean) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('contact_submissions').update({ replied }).eq('id', id)
  revalidatePath('/admin/contact-submissions')
}
