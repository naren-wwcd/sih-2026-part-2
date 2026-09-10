import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { ApiError } from '@/types'

interface ErrorBannerProps {
  error: ApiError | Error | unknown
  onRetry?: () => void
  title?: string
}

function extractMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'Something went wrong.'
}

export function ErrorBanner({ error, onRetry, title = 'Request failed' }: ErrorBannerProps) {
  return (
    <div className="card border-danger/30 bg-danger-muted/10 p-4 flex items-start gap-3">
      <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-danger">{title}</p>
        <p className="text-xs text-text-secondary mt-0.5 break-words">{extractMessage(error)}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary border border-border rounded-md px-2.5 py-1.5 hover:border-accent/50 transition-colors focus-ring"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  )
}
