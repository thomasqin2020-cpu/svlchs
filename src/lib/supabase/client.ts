'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client for use in Client Components.
 * Safe to call multiple times — the SDK handles caching internally.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Supabase env vars missing — NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required.')
  }
  return createBrowserClient(url, anonKey)
}
