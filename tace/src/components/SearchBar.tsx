import { Search } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import type { SearchField } from '@/types'

interface SearchBarProps {
  onSearch: (field: SearchField, value: string) => void
  loading?: boolean
  autoFocus?: boolean
}

const fields: { value: SearchField; label: string }[] = [
  { value: 'alias', label: 'Alias' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'pgp', label: 'PGP' },
  { value: 'relay', label: 'Relay Fingerprint' },
]

export function SearchBar({ onSearch, loading, autoFocus }: SearchBarProps) {
  const [field, setField] = useState<SearchField>('alias')
  const [value, setValue] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim()) onSearch(field, value.trim())
  }

  return (
    <form onSubmit={submit} className="card p-1.5 flex items-stretch gap-1.5">
      <div className="flex items-center pl-2.5 text-text-muted">
        <Search size={16} />
      </div>
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          // live search as the analyst types, once there's something meaningful to match
          if (e.target.value.trim().length >= 2) onSearch(field, e.target.value.trim())
        }}
        placeholder={`Search by ${fields.find((f) => f.value === field)?.label.toLowerCase()}…`}
        className="flex-1 bg-transparent text-sm px-1 py-2 outline-none placeholder:text-text-muted min-w-0"
      />
      <div className="flex items-center gap-1 border-l border-border pl-1.5">
        {fields.map((f) => (
          <button
            type="button"
            key={f.value}
            onClick={() => setField(f.value)}
            className={clsx(
              'text-xs font-medium px-2 py-1.5 rounded-md transition-colors focus-ring whitespace-nowrap',
              field === f.value
                ? 'bg-accent-muted/40 text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md px-4 transition-colors focus-ring"
      >
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  )
}
