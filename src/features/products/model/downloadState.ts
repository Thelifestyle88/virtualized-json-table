import type { DownloadProgress } from '../../../shared/http/downloadJson'
import type { Product } from './product'

export type DownloadState =
  | { status: 'idle'; products: Product[] }
  | { status: 'loading'; products: Product[]; requestId: number; progress: DownloadProgress }
  | { status: 'ready'; products: Product[] }
  | { status: 'cancelled'; products: Product[] }
  | { status: 'error'; products: Product[]; message: string }

type DownloadAction =
  | { type: 'started'; requestId: number }
  | { type: 'progress'; requestId: number; progress: DownloadProgress }
  | { type: 'succeeded'; requestId: number; products: Product[] }
  | { type: 'cancelled'; requestId: number }
  | { type: 'failed'; requestId: number; message: string }

export const initialDownloadState: DownloadState = { status: 'idle', products: [] }

export function reduceDownload(state: DownloadState, action: DownloadAction): DownloadState {
  if (action.type === 'started') {
    return {
      status: 'loading',
      products: state.products,
      requestId: action.requestId,
      progress: { receivedBytes: 0, totalBytes: null },
    }
  }

  if (state.status !== 'loading' || state.requestId !== action.requestId) return state

  switch (action.type) {
    case 'progress':
      return { ...state, progress: action.progress }
    case 'succeeded':
      return { status: 'ready', products: action.products }
    case 'cancelled':
      return { status: 'cancelled', products: state.products }
    case 'failed':
      return { status: 'error', products: state.products, message: action.message }
  }
}
