import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

type StatTone = 'default' | 'success' | 'warning' | 'danger'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: StatTone
  hint?: string
  loading?: boolean
}

const toneStyles: Record<StatTone, string> = {
  default: 'text-accent bg-accent-muted/30',
  success: 'text-success bg-success-muted/40',
  warning: 'text-warning bg-warning-muted/40',
  danger: 'text-danger bg-danger-muted/40',
}

export function StatCard({ label, value, icon: Icon, tone = 'default', hint, loading }: StatCardProps) {
  return (
    <div className="card p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wide truncate">
          {label}
        </p>
        {loading ? (
          <div className="h-7 w-16 bg-white/5 rounded mt-1.5 animate-pulse" />
        ) : (
          <p className="text-2xl font-semibold mono-num mt-1 text-text-primary">{value}</p>
        )}
        {hint && !loading && <p className="text-xs text-text-muted mt-1">{hint}</p>}
      </div>
      <div className={clsx('rounded-md p-2 shrink-0', toneStyles[tone])}>
        <Icon size={18} />
      </div>
    </div>
  )
}
