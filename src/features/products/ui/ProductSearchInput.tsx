interface ProductSearchInputProps {
  value: string
  onChange: (value: string) => void
  onCompositionChange: (isComposing: boolean) => void
}

export function ProductSearchInput({ value, onChange, onCompositionChange }: ProductSearchInputProps) {
  return (
    <div className="search-field">
      <span className="search-icon" aria-hidden="true" />
      <input
        type="search"
        aria-label="Поиск по таблице"
        placeholder="Поиск по таблице"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onCompositionStart={() => onCompositionChange(true)}
        onCompositionEnd={() => onCompositionChange(false)}
      />
    </div>
  )
}
