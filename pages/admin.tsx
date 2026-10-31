import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState, type FormEvent } from 'react'
import { createAdminClient, readAdmin, signOutAdmin, usernameIdentifier } from '../utils/supabase/admin'

// The static page initially contains the login shell only. Load the interactive
// editor after Auth verification and the database allowlist check both succeed.
// Static GitHub Pages cannot keep JavaScript source private; the real database
// boundary is RLS. There are deliberately no article/modal write APIs here.
const DocumentEditor = dynamic(() => import('../components/admin/DocumentEditor'), { ssr: false, loading: () => <p role="status">Opening editor…</p> })

export default function Admin() {
  const [user, setUser] = useState<Awaited<ReturnType<typeof readAdmin>>>(null)
  const [checking, setChecking] = useState(true)
  const [revision, setRevision] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [signedOut, setSignedOut] = useState(false)

  useEffect(() => {
    try {
      const { data: { subscription } } = createAdminClient().auth.onAuthStateChange(() => {
        // Do not call Supabase inside its auth callback (which holds a lock).
        setRevision(value => value + 1)
      })
      // Recheck on returning to the tab and periodically, so disabling a row in
      // admin_users also locks an already-open editor on its next access check.
      const recheck = () => setRevision(value => value + 1)
      window.addEventListener('focus', recheck)
      const timer = window.setInterval(recheck, 60000)
      return () => { subscription.unsubscribe(); window.removeEventListener('focus', recheck); clearInterval(timer) }
    } catch { setError('Supabase is not configured. See the Admin setup guide.'); setChecking(false) }
  }, [])

  useEffect(() => {
    // Ignore an old request after unmount or a newer session event. This avoids
    // an earlier successful request reopening the editor after signing out.
    if (signedOut) { setUser(null); setChecking(false); return }
    let alive = true
    readAdmin().then(admin => {
      if (alive) { setUser(admin); setChecking(false) }
    }).catch(err => {
      if (alive) { setUser(null); setError(err instanceof Error ? err.message : 'Could not verify access.'); setChecking(false) }
    })
    return () => { alive = false }
  }, [revision, signedOut])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setBusy(true); setError(''); setSignedOut(false)
    try {
      const { error: authError } = await createAdminClient().auth.signInWithPassword({ email: usernameIdentifier(String(fields.get('username'))), password: String(fields.get('password')) })
      if (authError) throw new Error('Unable to sign in. Check your username and password and try again.')
      const admin = await readAdmin()
      if (!admin) {
        setSignedOut(true)
        await signOutAdmin()
        throw new Error('This account does not have admin access. Ask the site owner to add it to admin_users.')
      }
      setUser(admin)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.') }
    finally { setBusy(false) }
  }

  async function logout() {
    if (!window.confirm('Sign out? Copy any document you want to keep before leaving.')) return
    // Lock immediately, before the network call. Any prior access check is
    // cancelled by the effect above, so it cannot reopen a signed-out editor.
    setSignedOut(true); setUser(null); setError('')
    const revoked = await signOutAdmin()
    if (!revoked) setError('Signed out of this tab. Supabase could not be reached to revoke the remote session.')
  }

  return <>
    <Head><title>Admin | Max Lee</title><meta name="robots" content="noindex, nofollow" /><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="admin-brand">Max Lee</Link>
        {user && <div className="admin-account"><span>{user.username}</span><button type="button" onClick={logout}>Sign out</button></div>}
      </header>
      {checking ? <main className="admin-login"><p role="status">Checking access…</p></main> : user ? <DocumentEditor /> : <main className="admin-login">
        <div className="admin-login-card">
          <h1>Admin</h1>
          <form onSubmit={login}>
            <label className="admin-field">Username<input name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} defaultValue="super" required /></label>
            <label className="admin-field">Password<input name="password" type="password" autoComplete="current-password" required /></label>
            {error && <p role="alert" className="admin-error">{error}</p>}
            <button className="admin-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>
      </main>}
    </div>
  </>
}
