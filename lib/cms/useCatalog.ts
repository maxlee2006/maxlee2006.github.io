import { useEffect, useState } from 'react'
import { readCatalog } from './catalog'
import type { Catalog } from './content'

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setError(null)
    setCatalog(null)
    readCatalog().then(data => { if (active) setCatalog(data) }).catch(() => {
      if (active) setError('Content is temporarily unavailable. Please try again.')
    })
    return () => { active = false }
  }, [attempt])
  return { catalog, error, retry: () => setAttempt(value => value + 1) }
}
