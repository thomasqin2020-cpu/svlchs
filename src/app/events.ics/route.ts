import { createEvents, type EventAttributes } from 'ics'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Public iCal feed of all upcoming Spartan Vanguard events.
 * Users can subscribe in Google Calendar / Apple Calendar by adding
 * `https://YOUR-SITE/events.ics` as a subscribed calendar.
 *
 * Auto-published: only `published=true` events with `date >= today`.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient()

  let rows: Array<{ name: string; date: string; location: string | null; description: string | null }> = []

  if (supabase) {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('events')
      .select('name, date, location, description')
      .eq('published', true)
      .gte('date', today)
      .order('date', { ascending: true })
    rows = (data ?? []) as typeof rows
  }

  const events: EventAttributes[] = rows.map((row) => {
    // Supabase 'date' is YYYY-MM-DD; treat as an all-day event.
    const [y, m, d] = row.date.split('-').map(Number)
    return {
      title: row.name,
      description: row.description ?? '',
      location: row.location ?? '',
      start: [y, m, d],
      duration: { days: 1 },
      url: process.env.NEXT_PUBLIC_SITE_URL ?? '',
      productId: 'spartan-vanguard',
    } satisfies EventAttributes
  })

  const { error, value } = createEvents(events, {
    calName: 'Spartan Vanguard',
  })

  if (error || !value) {
    console.error('ics generation failed:', error)
    return new Response('Could not generate calendar', { status: 500 })
  }

  return new Response(value, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="spartan-vanguard.ics"',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
