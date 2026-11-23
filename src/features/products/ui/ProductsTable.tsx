import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { FilterFn } from '@tanstack/react-table'
import { useLayoutEffect, useMemo, useState } from 'react'
import type { Product } from '../model/product'
import { createProductSearch } from '../model/productSearch'
import type { ProductSearchMatcher } from '../model/productSearch'
import { HighlightedText } from './HighlightedText'
import { createProductColumns } from './productColumns'
import { VirtualProductRows } from './VirtualProductRows'

interface ProductsTableProps {
  products: Product[]
  query: string
}

const filterProductCell: FilterFn<Product> = (row, columnId, search: ProductSearchMatcher) =>
  search.hasMatch(row.getValue<string>(columnId))

const countFormatter = new Intl.NumberFormat('ru-RU')
const HEADER_HEIGHT = 42

export function ProductsTable({ products, query }: ProductsTableProps) {
  // Mount the virtual rows after React attaches the scroll element.
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null)
  const search = useMemo(() => createProductSearch(query), [query])
  const columns = useMemo(() => createProductColumns(search), [search])

  // oxlint-disable-next-line react/incompatible-library -- This project uses Vite without React Compiler.
  const table = useReactTable({
    data: products,
    columns,
    defaultColumn: {
      minSize: 0,
      cell: ({ getValue }) => <HighlightedText value={String(getValue())} search={search} />,
    },
    state: { globalFilter: search },
    globalFilterFn: filterProductCell,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (product) => String(product.id),
  })

  const rows = table.getRowModel().rows
  const rowCount = rows.length
  // The header counts as a row, and an empty table has one placeholder row.
  const ariaRowCount = 1 + Math.max(rowCount, 1)
  const visibleColumns = table.getVisibleLeafColumns()
  const emptyMessage = products.length === 0 ? 'Нет данных для отображения' : 'Ничего не найдено'

  useLayoutEffect(() => {
    if (viewport) viewport.scrollTop = 0
  }, [query, products, viewport])

  return (
    <>
      <div className="table-viewport" ref={setViewport} role="region" tabIndex={0} aria-label="Таблица товаров">
        <table aria-labelledby="table-title" aria-rowcount={ariaRowCount}>
          <colgroup>
            {visibleColumns.map((tableColumn) => (
              <col key={tableColumn.id} style={{ width: `${tableColumn.getSize()}%` }} />
            ))}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} aria-rowindex={1}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" style={{ height: HEADER_HEIGHT }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowCount === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length}>
                  <div className="empty-table">
                    <span className="empty-table-icon" aria-hidden="true" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : viewport && (
              <VirtualProductRows
                rows={rows}
                columnCount={visibleColumns.length}
                headerHeight={HEADER_HEIGHT}
                viewport={viewport}
              />
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer" role="status">
        {query
          ? <>Найдено <b>{countFormatter.format(rowCount)}</b> из {countFormatter.format(products.length)}</>
          : <>Строк в таблице <b>{countFormatter.format(rowCount)}</b></>}
      </div>
    </>
  )
}
