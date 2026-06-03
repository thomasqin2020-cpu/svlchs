import { requireAdmin } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { csvRow } from '@/lib/csv'

export async function GET(request: Request) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  if (!supabase) return new Response('Supabase not configured', { status: 500 })

  const slug = new URL(request.url).searchParams.get('slug')
  let query = supabase
    .from('competition_registrations')
    .select('created_at, event_slug, event_name, student_name, school, grade, email, parent_email, notes')
    .order('created_at', { ascending: false })
  if (slug) query = query.eq('event_slug', slug)
  const { data } = await query

  const header = ['date', 'event', 'student', 'school', 'grade', 'email', 'parent_email', 'notes']
  const lines = [header.join(',')]
  for (const row of data ?? []) {
    // csvRow neutralizes formula injection (cells come from the public,
    // unauthenticated registration form) and escapes embedded quotes.
    lines.push(csvRow([
      row.created_at,
      row.event_name ?? '',
      row.student_name ?? '',
      row.school ?? '',
      row.grade ?? '',
      row.email ?? '',
      row.parent_email ?? '',
      row.notes ?? '',
    ]))
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="competition-${slug ?? 'all'}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
