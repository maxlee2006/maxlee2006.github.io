import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined
const sessionStorageKey = 'max-lee-admin-session'

// Supabase's password API accepts an email identifier. Admins type a username;
// translate it to an internal identifier without needing an email inbox. Create
// the corresponding Auth user in the dashboard (see docs/ADMIN.md). This address
// is an identifier, not a secret, and it grants no access without a password.
export function usernameIdentifier(username: string): string {
  const normalized = username.trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9_-]{1,31}$/.test(normalized)) throw new Error('Use a username with 2–32 letters, numbers, underscores, or hyphens.')
  return `${normalized}@admin.maxlee2006.github.io`
}

// Separate from the public catalog client: admin sessions stay in this tab and
// never change the public reader's permissions or enable content writes.
export function createAdminClient(): SupabaseClient {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase public configuration is missing.')
  client = createClient(url, key, {
    // Bound Auth requests too, so an offline service cannot leave the login
    // screen checking forever. Supabase still sends its normal API headers.
    global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) }) },
    db: { retry: false },
    auth: {
      storageKey: sessionStorageKey,
      storage: typeof window === 'undefined' ? undefined : window.sessionStorage,
      persistSession: true, autoRefreshToken: true, detectSessionInUrl: false,
    },
  })
  return client
}

export async function signOutAdmin(): Promise<boolean> {
  try {
    const { error } = await createAdminClient().auth.signOut({ scope: 'local' })
    return !error
  } catch { return false }
  finally {
    // Auth's signOut normally removes this itself. If its network request fails,
    // still remove our tab's stored credentials so a reload cannot log back in.
    // This does not claim to revoke a remote token while Supabase is offline.
    window.sessionStorage.removeItem(sessionStorageKey)
  }
}

export async function readAdmin() {
  const supabase = createAdminClient()
  // getUser verifies the token with Auth; a saved browser session alone is not
  // authorization. RLS independently restricts this lookup to the current user.
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const result = await supabase.from('admin_users').select('user_id,username').eq('user_id', user.id).eq('active', true).abortSignal(AbortSignal.timeout(15000)).maybeSingle()
  if (result.error) throw new Error('Could not verify admin access. Please try again.')
  return result.data ? { ...user, username: String(result.data.username) } : null
}
