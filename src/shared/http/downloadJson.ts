export interface DownloadProgress {
  receivedBytes: number
  totalBytes: number | null
}

interface DownloadOptions {
  signal: AbortSignal
  onProgress: (progress: DownloadProgress) => void
}

export function downloadJson(
  url: string,
  { signal, onProgress }: DownloadOptions,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
      return
    }

    const request = new XMLHttpRequest()
    request.open('GET', url)
    request.timeout = 60_000

    const abortRequest = () => request.abort()

    request.onprogress = (event) => {
      onProgress({
        receivedBytes: event.loaded,
        totalBytes: event.lengthComputable && event.total > 0 ? event.total : null,
      })
    }
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`Сервер вернул ошибку HTTP ${request.status}.`))
        return
      }

      try {
        const data: unknown = JSON.parse(request.responseText)
        resolve(data)
      } catch {
        reject(new Error('Сервер вернул некорректный JSON.'))
      }
    }
    request.onerror = () => reject(new Error('Не удалось подключиться к серверу.'))
    request.ontimeout = () => reject(new Error('Сервер не ответил вовремя.'))
    request.onabort = () => reject(signal.reason)
    request.onloadend = () => signal.removeEventListener('abort', abortRequest)

    signal.addEventListener('abort', abortRequest, { once: true })
    try {
      request.send()
    } catch (error) {
      signal.removeEventListener('abort', abortRequest)
      reject(error)
    }
  })
}
