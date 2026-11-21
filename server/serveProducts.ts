import { readFile } from 'node:fs/promises'
import type { ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { setTimeout as delay } from 'node:timers/promises'
import type { Plugin } from 'vite'

const CHUNK_BYTES = 24 * 1024
const CHUNK_DELAY_MS = 85

async function* pacedChunks(data: Buffer, signal: AbortSignal) {
  for (let offset = 0; offset < data.length; offset += CHUNK_BYTES) {
    await delay(CHUNK_DELAY_MS, undefined, { signal })
    yield data.subarray(offset, offset + CHUNK_BYTES)
  }
}

async function sendProducts(response: ServerResponse, filePath: string) {
  const controller = new AbortController()
  const stopOnDisconnect = () => {
    if (!response.writableFinished) controller.abort()
  }
  response.once('close', stopOnDisconnect)

  try {
    const data = await readFile(filePath, { signal: controller.signal })
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Content-Length', data.length)
    response.setHeader('Cache-Control', 'no-store')
    await pipeline(pacedChunks(data, controller.signal), response, { signal: controller.signal })
  } catch {
    if (response.destroyed) return

    if (response.headersSent) {
      response.destroy()
    } else {
      response.writeHead(500, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ error: 'Could not read products.json' }))
    }
  } finally {
    response.off('close', stopOnDisconnect)
  }
}

export function serveProducts(): Plugin {
  return {
    name: 'serve-products',
    apply: 'serve',
    configureServer(server) {
      const filePath = resolve(server.config.publicDir, 'data/products.json')
      const url = `${server.config.base}data/products.json`

      server.middlewares.use((request, response, next) => {
        if (request.method !== 'GET' || request.url?.split('?')[0] !== url) {
          next()
          return
        }
        void sendProducts(response, filePath)
      })
    },
  }
}
