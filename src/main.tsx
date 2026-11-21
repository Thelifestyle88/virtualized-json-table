import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import './index.css'
import { ProductsPage } from './features/products/ui/ProductsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProductsPage />
  </StrictMode>,
)
