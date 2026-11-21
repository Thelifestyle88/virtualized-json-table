import { Fragment } from 'react'
import type { ProductSearchMatcher } from '../model/productSearch'

interface HighlightedTextProps {
  value: string
  search: ProductSearchMatcher | undefined
}

export function HighlightedText({ value, search }: HighlightedTextProps) {
  if (!search) return value

  const ranges = search.findMatches(value)
  if (ranges.length === 0) return value

  return (
    <>
      {ranges.map(({ start, end }, index) => (
        <Fragment key={start}>
          {value.slice(index === 0 ? 0 : ranges[index - 1].end, start)}
          <mark>{value.slice(start, end)}</mark>
        </Fragment>
      ))}
      {value.slice(ranges[ranges.length - 1].end)}
    </>
  )
}
