import { flexRender } from '@tanstack/react-table'
import type { Row } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback } from 'react'
import type { RefObject } from 'react'
import type { Product } from '../model/product'

const ROW_HEIGHT = 50

interface VirtualProductRowsProps {
  rows: Row<Product>[]
  columnCount: number
  headerHeight: number
  viewport: RefObject<HTMLDivElement | null>
}

export function VirtualProductRows({ rows, columnCount, headerHeight, viewport }: VirtualProductRowsProps) {
  const getItemKey = useCallback((index: number) => rows[index].id, [rows])
  // oxlint-disable-next-line react/incompatible-library -- This project uses Vite without React Compiler.
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewport.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 6,
    scrollMargin: headerHeight,
    getItemKey,
  })

  const items = virtualizer.getVirtualItems()
  if (items.length === 0) return null

  // Virtual offsets include the header because it shares the scroll container.
  const topSpace = Math.max(0, items[0].start - headerHeight)
  const lastRowEnd = items[items.length - 1].end - headerHeight
  const bottomSpace = Math.max(0, virtualizer.getTotalSize() - lastRowEnd)

  return (
    <>
      {topSpace > 0 && <tr aria-hidden="true"><td colSpan={columnCount} style={{ height: topSpace }} /></tr>}
      {items.map(({ index }) => {
        const row = rows[index]
        return (
          <tr key={row.id} aria-rowindex={index + 2} className="product-row" style={{ height: ROW_HEIGHT }}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} data-column={cell.column.id}>
                <div className="cell-value" title={cell.getValue<string>()}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </td>
            ))}
          </tr>
        )
      })}
      {bottomSpace > 0 && <tr aria-hidden="true"><td colSpan={columnCount} style={{ height: bottomSpace }} /></tr>}
    </>
  )
}
