import { useState } from 'react'
import { useDebouncedSearch } from '../model/useDebouncedSearch'
import { useProductsDownload } from '../model/useProductsDownload'
import { DownloadStatus } from './DownloadStatus'
import { ProductSearchInput } from './ProductSearchInput'
import { ProductsTable } from './ProductsTable'
import '../products.css'

export function ProductsPage() {
  const { state, startDownload, cancelDownload } = useProductsDownload()
  const [query, setQuery] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const appliedQuery = useDebouncedSearch(query, isComposing)
  const isLoading = state.status === 'loading' || state.status === 'idle'

  return (
    <>
      <header className="site-header">
        <div className="page-width header-inner">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>Складской каталог</span>
          </div>
          <button className="reload-button" type="button" disabled={state.status !== 'ready'} onClick={startDownload}>
            <span className="reload-icon" aria-hidden="true">↻</span>
            Обновить данные
          </button>
        </div>
      </header>
      <main className="page-width catalog-page">
        <section className="catalog-intro" aria-labelledby="page-title">
          <div className="catalog-copy">
            <h1 id="page-title">Каталог товаров</h1>
            <p>Наименования, остатки и статус наличия.</p>
          </div>
          <DownloadStatus state={state} onCancel={cancelDownload} onStart={startDownload} />
        </section>
        <section className="catalog-table" aria-labelledby="table-title">
          <div className="table-toolbar">
            <h2 id="table-title">Ассортимент</h2>
            <ProductSearchInput value={query} onChange={setQuery} onCompositionChange={setIsComposing} />
          </div>
          <ProductsTable products={state.products} query={appliedQuery} isLoading={isLoading} />
        </section>
      </main>
    </>
  )
}
