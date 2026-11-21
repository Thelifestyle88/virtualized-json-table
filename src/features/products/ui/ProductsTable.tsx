import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { FilterFn } from '@tanstack/react-table'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { Product } from '../model/product'
import { createProductSearch } from '../model/productSearch'
import type { ProductSearchMatcher } from '../model/productSearch'
import { HighlightedText } from './HighlightedText'
import { createProductColumns } from './productColumns'
import { VirtualProductRows } from './VirtualProductRows'

interface ProductsTableProps {
  products: Product[]
  query: string
  isLoading: boolean
}

const filterProductCell: FilterFn<Product> = (row, columnId, search: ProductSearchMatcher) =>
  search.hasMatch(row.getValue<string>(columnId))

const formatCount = new Intl.NumberFormat('ru-RU')
const HEADER_HEIGHT = 42

export function ProductsTable({ products, query, isLoading }: ProductsTableProps) {
  const viewport = useRef<HTMLDivElement>(null)
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
  const visibleColumns = table.getVisibleLeafColumns()
  const isWaiting = isLoading && products.length === 0
  const emptyMessage = isWaiting
    ? 'Таблица появится после загрузки'
    : products.length === 0 ? 'Нет данных для отображения' : 'Ничего не найдено'

  useLayoutEffect(() => {
    if (viewport.current) viewport.current.scrollTop = 0
  }, [query, products])

  return (
    <>
      <div className="table-viewport" ref={viewport} role="region" tabIndex={0} aria-label="Таблица товаров">
        <table aria-labelledby="table-title" aria-rowcount={rows.length + (rows.length === 0 ? 2 : 1)}>
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length}>
                  <div className="empty-table">
                    <span className="empty-table-icon" aria-hidden="true" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
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
          ? <>Найдено <b>{formatCount.format(rows.length)}</b> из {formatCount.format(products.length)}</>
          : <>Строк в таблице <b>{formatCount.format(rows.length)}</b></>}
      </div>
    </>
  )
}
