import { useCallback, useEffect, useReducer, useRef } from 'react'
import { loadProducts } from '../api/loadProducts'
import { initialDownloadState, reduceDownload } from './downloadState'

interface ActiveDownload {
  id: number
  controller: AbortController
}

export function useProductsDownload() {
  const [state, dispatch] = useReducer(reduceDownload, initialDownloadState)
  const lastRequestId = useRef(0)
  const activeDownload = useRef<ActiveDownload | null>(null)

  const startDownload = useCallback(async () => {
    activeDownload.current?.controller.abort()

    const requestId = ++lastRequestId.current
    const controller = new AbortController()
    activeDownload.current = { id: requestId, controller }
    dispatch({ type: 'started', requestId })

    try {
      const products = await loadProducts({
        signal: controller.signal,
        onProgress: (progress) => dispatch({ type: 'progress', requestId, progress }),
      })
      if (!controller.signal.aborted) dispatch({ type: 'succeeded', requestId, products })
    } catch (error) {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : 'Ошибка загрузки данных.'
        dispatch({ type: 'failed', requestId, message })
      }
    } finally {
      if (activeDownload.current?.id === requestId) activeDownload.current = null
    }
  }, [])

  function cancelDownload() {
    const currentDownload = activeDownload.current
    if (!currentDownload) return

    currentDownload.controller.abort()
    activeDownload.current = null
    dispatch({ type: 'cancelled', requestId: currentDownload.id })
  }

  useEffect(() => {
    void startDownload()
    return () => {
      activeDownload.current?.controller.abort()
      activeDownload.current = null
    }
  }, [startDownload])

  return { state, startDownload, cancelDownload }
}
