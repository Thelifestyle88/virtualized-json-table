import { createColumnHelper } from '@tanstack/react-table'
import { productStatusLabels } from '../model/product'
import type { Product } from '../model/product'
import type { ProductSearchMatcher } from '../model/productSearch'
import { HighlightedText } from './HighlightedText'

const column = createColumnHelper<Product>()

export function createProductColumns(search: ProductSearchMatcher | undefined) {
  return [
    column.accessor((product) => String(product.id), { id: 'id', header: '№', size: 7 }),
    column.accessor('sku', { header: 'Артикул', size: 14 }),
    column.accessor('name', { header: 'Наименование', size: 33 }),
    column.accessor('category', { header: 'Категория', size: 19 }),
    column.accessor((product) => String(product.quantity), {
      id: 'quantity',
      header: 'Остаток',
      size: 11,
    }),
    column.accessor((product) => productStatusLabels[product.status], {
      id: 'status',
      header: 'Статус',
      size: 16,
      cell: ({ row, getValue }) => (
        <span className="product-status" data-status={row.original.status}>
          <span><HighlightedText value={getValue()} search={search} /></span>
        </span>
      ),
    }),
  ]
}
