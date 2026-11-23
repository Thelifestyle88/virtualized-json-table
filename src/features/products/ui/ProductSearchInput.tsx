import type { ChangeEvent } from 'react'

interface ProductSearchInputProps {
  value: string
  onChange: (value: string) => void
  onCompositionChange: (isComposing: boolean) => void
}

export function ProductSearchInput({
  value,
  onChange,
  onCompositionChange,
}: ProductSearchInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.currentTarget.value)
  }

  function handleCompositionStart() {
    onCompositionChange(true)
  }

  function handleCompositionEnd() {
    onCompositionChange(false)
  }

  return (
    <div className="search-field">
      <span className="search-icon" aria-hidden="true" />
      <input
        type="search"
        aria-label="Поиск по таблице"
        placeholder="Поиск по таблице"
        value={value}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
    </div>
  )
}
