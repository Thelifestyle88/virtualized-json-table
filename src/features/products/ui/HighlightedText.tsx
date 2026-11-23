import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import type { MatchRange, ProductSearchMatcher } from '../model/productSearch'

interface HighlightedTextProps {
  value: string
  search: ProductSearchMatcher | undefined
}

interface MatchedTextProps {
  value: string
  ranges: MatchRange[]
}

const CONTEXT_CHARACTERS = 10

function MatchedText({ value, ranges }: MatchedTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const measurementRef = useRef<HTMLSpanElement>(null)
  const [visibleStart, setVisibleStart] = useState(0)
  const { start: matchStart, end: matchEnd } = ranges[0]

  useLayoutEffect(() => {
    const container = containerRef.current
    const measurement = measurementRef.current
    if (!container || !measurement) return

    const [fullText, ellipsis] = measurement.children
    const text = fullText.firstChild
    if (!(text instanceof Text)) return

    const range = document.createRange()
    const context = Array.from(value.slice(0, matchStart)).slice(-CONTEXT_CHARACTERS).join('')
    const contextStart = matchStart - context.length

    const updateFragment = () => {
      const width = container.getBoundingClientRect().width
      const ellipsisWidth = ellipsis.getBoundingClientRect().width

      range.setStart(text, 0)
      range.setEnd(text, matchEnd)

      const fullTextFits = fullText.getBoundingClientRect().width <= width
      const matchFits = range.getBoundingClientRect().width <= width - ellipsisWidth
      if (fullTextFits || matchFits) {
        setVisibleStart(0)
        return
      }

      range.setStart(text, contextStart)
      const contextFits = range.getBoundingClientRect().width + 2 * ellipsisWidth <= width
      setVisibleStart(contextFits ? contextStart : matchStart)
    }

    updateFragment()
    const observer = new ResizeObserver(updateFragment)
    observer.observe(container)
    observer.observe(measurement)
    return () => observer.disconnect()
  }, [value, matchStart, matchEnd])

  return (
    <span ref={containerRef} className="highlighted-text">
      <span ref={measurementRef} className="highlighted-text-measurement" aria-hidden="true">
        <span>{value}</span>
        <span>…</span>
      </span>
      {visibleStart > 0 && '…'}
      {ranges.map(({ start, end }, index) => (
        <Fragment key={start}>
          {value.slice(index === 0 ? visibleStart : ranges[index - 1].end, start)}
          <mark>{value.slice(start, end)}</mark>
        </Fragment>
      ))}
      {value.slice(ranges[ranges.length - 1].end)}
    </span>
  )
}

export function HighlightedText({ value, search }: HighlightedTextProps) {
  const ranges = search?.findMatches(value)
  if (!ranges?.length) return value

  return <MatchedText value={value} ranges={ranges} />
}
