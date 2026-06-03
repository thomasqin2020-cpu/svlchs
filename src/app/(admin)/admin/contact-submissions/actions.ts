'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function toggleReplied(id: string, replied: boolean) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Supabase not configured')
  await supabase.from('contact_submissions').update({ replied }).eq('id', id)
  revalidatePath('/admin/contact-submissions')
}
