import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { serveProducts } from './server/serveProducts.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveProducts()],
})
