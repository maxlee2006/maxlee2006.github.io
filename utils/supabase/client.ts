import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The browser talks to Supabase's HTTPS API (a web address that accepts data
 * requests), not directly to PostgreSQL. The library builds those requests for us.
 * Reuse one client per running copy of this module; it holds configuration, not
 * a saved copy of the articles. Actual reads happen in lib/cms/catalog.ts.
 */
let client: SupabaseClient | undefined

// This public, read-only site has no login/session to persist or refresh.
// RLS and grants in Supabase enforce permissions, even outside this UI.
export function createClient(): SupabaseClient {
  if (client) return client
  // Next.js replaces NEXT_PUBLIC_ values with build-time values in the browser
  // bundle. Changing GitHub variables later requires another build/deployment.
  // The URL selects the project; the publishable key identifies public API access.
  // Neither is an owner password. Database grants/RLS still decide what is allowed.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase public configuration is missing. See docs/CMS.md.')
  client = createSupabaseClient(url, key, {
    // Let the page show its retry button instead of silently repeating requests.
    db: { retry: false },
    // Visitors do not log in here: don't save sessions, refresh login tokens,
    // or treat tokens in the current page address as a sign-in attempt.
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return client
}
