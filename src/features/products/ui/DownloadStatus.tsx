import type { DownloadState } from '../model/downloadState'

interface DownloadStatusProps {
  state: DownloadState
  onCancel: () => void
  onStart: () => void
}

const statusLabels = {
  idle: 'Подключение к серверу',
  loading: 'Загрузка данных',
  ready: 'Данные загружены',
  cancelled: 'Загрузка отменена',
  error: 'Ошибка загрузки',
} satisfies Record<DownloadState['status'], string>

export function DownloadStatus({ state, onCancel, onStart }: DownloadStatusProps) {
  const isLoading = state.status === 'loading'
  const canRetry = state.status === 'error' || state.status === 'cancelled'
  const receivedBytes = isLoading ? state.progress.receivedBytes : 0
  const totalBytes = isLoading ? state.progress.totalBytes : null
  let percent: number | undefined

  if (state.status === 'ready') percent = 100
  if (isLoading && totalBytes !== null) {
    percent = Math.min(100, Math.floor(receivedBytes / totalBytes * 100))
  } else if (isLoading && receivedBytes === 0) {
    percent = 0
  }

  return (
    <div className="download-card" data-status={state.status}>
      <div className="download-source">
        <span className="file-icon" aria-hidden="true">{'{ }'}</span>
        <span>products.json</span>
      </div>
      <div className="download-state">
        <span role="status">{statusLabels[state.status]}</span>
        {percent !== undefined && <strong>{percent}%</strong>}
      </div>
      {(isLoading || state.status === 'ready') && (
        <progress className="download-progress" aria-label="Загрузка данных" max={100} value={percent} />
      )}
      {isLoading && percent === undefined && (
        <p className="download-message">Получено {Math.floor(receivedBytes / 1024)} КБ</p>
      )}
      {state.status === 'error' && <p className="download-message">{state.message}</p>}
      {isLoading && <button className="download-action" type="button" onClick={onCancel}>Отменить</button>}
      {canRetry && <button className="download-action" type="button" onClick={onStart}>Повторить</button>}
    </div>
  )
}
