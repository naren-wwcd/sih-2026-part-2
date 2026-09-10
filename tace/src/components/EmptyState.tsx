import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="rounded-full bg-white/5 p-3 mb-3">
        <Icon size={22} className="text-text-muted" />
      </div>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="text-xs text-text-secondary mt-1 max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-xs font-medium text-accent hover:text-accent-hover border border-accent/30 rounded-md px-3 py-1.5 hover:border-accent/60 transition-colors focus-ring"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
