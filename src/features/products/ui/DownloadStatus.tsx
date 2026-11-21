import type { DownloadState } from '../model/downloadState'

interface DownloadStatusProps {
  state: Exclude<DownloadState, { status: 'ready' }>
  compact: boolean
  onCancel: () => void
  onStart: () => void
}

const statusLabels = {
  idle: 'Подключение к серверу',
  loading: 'Загрузка данных',
  cancelled: 'Загрузка отменена',
  error: 'Ошибка загрузки',
} satisfies Record<DownloadStatusProps['state']['status'], string>

export function DownloadStatus({ state, compact, onCancel, onStart }: DownloadStatusProps) {
  const progress = state.status === 'loading' ? state.progress : null
  const canRetry = state.status === 'error' || state.status === 'cancelled'
  let percent: number | undefined

  if (progress) {
    const { receivedBytes, totalBytes } = progress
    if (totalBytes !== null) percent = Math.min(100, Math.floor(receivedBytes / totalBytes * 100))
    else if (receivedBytes === 0) percent = 0
  }

  return (
    <div className={compact ? 'download-area download-area--compact' : 'download-area'}>
      <div className="download-card" data-status={state.status}>
        <div className="download-details">
          {!compact && (
            <div className="download-source">
              <span className="file-icon" aria-hidden="true">{'{ }'}</span>
              <span>products.json</span>
            </div>
          )}
          <div className="download-state">
            <span role="status">{statusLabels[state.status]}</span>
            {percent !== undefined && <strong>{percent}%</strong>}
          </div>
          {progress && (
            <progress className="download-progress" aria-label="Загрузка данных" max={100} value={percent} />
          )}
          {progress && percent === undefined && (
            <p className="download-message">Получено {Math.floor(progress.receivedBytes / 1024)} КБ</p>
          )}
          {state.status === 'error' && <p className="download-message">{state.message}</p>}
        </div>
        {(progress || canRetry) && (
          <button className="download-action" type="button" onClick={canRetry ? onStart : onCancel}>
            {canRetry ? 'Повторить' : 'Отменить'}
          </button>
        )}
      </div>
    </div>
  )
}
