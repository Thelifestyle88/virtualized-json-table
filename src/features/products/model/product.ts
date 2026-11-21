export const productStatusLabels = {
  in_stock: 'В наличии',
  low_stock: 'Мало',
  out_of_stock: 'Нет в наличии',
} as const

export type ProductStatus = keyof typeof productStatusLabels

export interface Product {
  id: number
  sku: string
  name: string
  category: string
  quantity: number
  status: ProductStatus
}
