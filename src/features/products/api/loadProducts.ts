import { downloadJson } from '../../../shared/http/downloadJson'
import type { DownloadProgress } from '../../../shared/http/downloadJson'
import { productStatusLabels } from '../model/product'
import type { Product } from '../model/product'

interface LoadProductsOptions {
  signal: AbortSignal
  onProgress: (progress: DownloadProgress) => void
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false

  const row = value as Record<string, unknown>
  return (
    typeof row.id === 'number' && Number.isSafeInteger(row.id) && row.id > 0 &&
    typeof row.sku === 'string' && row.sku.trim().length > 0 &&
    typeof row.name === 'string' && row.name.trim().length > 0 &&
    typeof row.category === 'string' && row.category.trim().length > 0 &&
    typeof row.quantity === 'number' && Number.isSafeInteger(row.quantity) && row.quantity >= 0 &&
    typeof row.status === 'string' && Object.hasOwn(productStatusLabels, row.status)
  )
}

function parseProducts(data: unknown): Product[] {
  if (!Array.isArray(data)) {
    throw new Error('В JSON ожидался массив товаров.')
  }

  const ids = new Set<number>()
  return data.map((row: unknown, index) => {
    if (!isProduct(row)) {
      throw new Error(`Запись ${index + 1} не соответствует формату товара.`)
    }
    if (ids.has(row.id)) {
      throw new Error(`Идентификатор товара ${row.id} повторяется.`)
    }
    ids.add(row.id)
    return row
  })
}

export async function loadProducts(options: LoadProductsOptions): Promise<Product[]> {
  const data = await downloadJson(`${import.meta.env.BASE_URL}data/products.json`, options)
  return parseProducts(data)
}
