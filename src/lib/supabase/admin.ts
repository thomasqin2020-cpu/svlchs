import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client. BYPASSES Row Level Security.
 *
 * NEVER import this in a Client Component or expose `SUPABASE_SERVICE_ROLE_KEY`
 * to the browser. Only use in:
 *  - Stripe webhook handlers (writing donations)
 *  - One-time data migration scripts
 *  - Server-side admin utilities that need to bypass RLS
 *
 * Returns null if env not configured.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
