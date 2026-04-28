import { requireAdmin } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  if (!supabase) return new Response('Supabase not configured', { status: 500 })

  const { data } = await supabase
    .from('donations')
    .select('created_at, amount_cents, currency, donor_name, donor_email, anonymous, message, stripe_payment_intent_id')
    .order('created_at', { ascending: false })

  const header = ['date', 'amount_usd', 'donor_name', 'donor_email', 'anonymous', 'message', 'stripe_pi']
  const lines = [header.join(',')]
  for (const row of data ?? []) {
    const cells = [
      row.created_at,
      ((row.amount_cents ?? 0) / 100).toFixed(2),
      row.anonymous ? 'Anonymous' : row.donor_name ?? '',
      row.donor_email ?? '',
      row.anonymous ? 'true' : 'false',
      (row.message ?? '').replaceAll('"', '""'),
      row.stripe_payment_intent_id ?? '',
    ].map((c) => `"${String(c)}"`)
    lines.push(cells.join(','))
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="donations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
