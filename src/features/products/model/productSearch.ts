export interface MatchRange {
  start: number
  end: number
}

export function createProductSearch(query: string) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return undefined

  const literalQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const firstMatch = new RegExp(literalQuery, 'iu')
  const everyMatch = new RegExp(literalQuery, 'giu')

  return {
    hasMatch: (value: string) => firstMatch.test(value),
    findMatches: (value: string): MatchRange[] => Array.from(value.matchAll(everyMatch), (match) => ({
      start: match.index,
      end: match.index + match[0].length,
    })),
  }
}

export type ProductSearchMatcher = NonNullable<ReturnType<typeof createProductSearch>>
