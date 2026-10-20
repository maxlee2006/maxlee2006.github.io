import { useEffect, useState } from 'react'
import { readCatalog } from './catalog'
import type { Catalog } from './content'

/** Connect asynchronous database reads to React's screen updates.
 * null catalog = not loaded (or failed); error explains failure; an empty array
 * inside a loaded catalog means a successful read found no rows in that table.
 * useEffect runs in the browser after mounting, not during static export.
 */
export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    // If the visitor leaves or retries before this request finishes, ignore its
    // eventual result. This flag does not cancel the shared network request.
    let active = true
    setError(null)
    setCatalog(null)
    readCatalog().then(data => { if (active) setCatalog(data) }).catch(() => {
      if (active) setError('Content is temporarily unavailable. Please try again.')
    })
    return () => { active = false }
  }, [attempt])
  // Changing attempt reruns the effect. Resetting catalog/error above returns
  // the page to its loading state while the new request is pending.
  return { catalog, error, retry: () => setAttempt(value => value + 1) }
}
