import { useEffect, useState } from 'react'

const SEARCH_DELAY_MS = 300

export function useDebouncedSearch(query: string, isComposing: boolean): string {
  const [appliedQuery, setAppliedQuery] = useState('')
  useEffect(() => {
    if (isComposing) return

    const timer = window.setTimeout(() => setAppliedQuery(query.trim()), SEARCH_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [query, isComposing])

  return appliedQuery
}
