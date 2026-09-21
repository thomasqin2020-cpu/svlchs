/**
 * Pushes code-owned site_config keys to Supabase, then exits.
 *
 * Why this exists: fetchConfig() in src/lib/data.ts lets database rows override
 * the hardcoded fallbacks, so a stale site_config row silently beats correct
 * code. Committing a migration did not help, because nothing runs migrations
 * automatically. This runs on every Vercel build using SUPABASE_SERVICE_ROLE_KEY,
 * which is already in the project's environment, so no new credential is needed.
 *
 * Keys come from supabase/managed-config.json, which src/lib/data.ts also imports
 * as its fallback — one source of truth, so code and database cannot drift.
 *
 * Exit codes: 0 when synced or when Supabase env is absent (local dev / previews
 * without secrets); 1 when the write itself fails, so a broken sync fails the
 * deploy loudly instead of quietly serving stale content.
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const TAG = '[sync-site-config]'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Vercel injects env directly; locally we read .env.local so `npm run build`
// behaves the same on a laptop as it does on a deploy.
const envLocal = join(root, '.env.local')
if (existsSync(envLocal)) {
  for (const line of readFileSync(envLocal, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.log(`${TAG} Supabase env not set — skipping (site will use code fallbacks).`)
  process.exit(0)
}

const { _comment, ...managed } = JSON.parse(
  readFileSync(join(root, 'supabase', 'managed-config.json'), 'utf8'),
)
const rows = Object.entries(managed).map(([key, value]) => ({ key, value }))

// Imported only once we know we are actually going to write, so the no-env
// path never depends on node_modules being installed.
const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
const { error } = await supabase.from('site_config').upsert(rows, { onConflict: 'key' })

if (error) {
  console.error(`${TAG} FAILED to sync site_config:`, error.message)
  process.exit(1)
}

console.log(`${TAG} Synced ${rows.length} key(s): ${rows.map(r => r.key).join(', ')}`)
