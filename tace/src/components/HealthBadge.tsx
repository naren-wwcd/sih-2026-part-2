import clsx from 'clsx'

export type HealthStatus = 'ok' | 'up' | 'degraded' | 'down' | 'unknown'

interface HealthBadgeProps {
  status: HealthStatus
  label?: string
  loading?: boolean
}

const config: Record<HealthStatus, { dot: string; text: string; label: string }> = {
  ok: { dot: 'bg-success', text: 'text-success', label: 'Operational' },
  up: { dot: 'bg-success', text: 'text-success', label: 'Operational' },
  degraded: { dot: 'bg-warning', text: 'text-warning', label: 'Degraded' },
  down: { dot: 'bg-danger', text: 'text-danger', label: 'Down' },
  unknown: { dot: 'bg-text-muted', text: 'text-text-muted', label: 'Unknown' },
}

export function HealthBadge({ status, label, loading }: HealthBadgeProps) {
  const c = config[status]

  if (loading) {
    return (
      <span className="badge bg-white/5 text-text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-pulse" />
        Checking…
      </span>
    )
  }

  return (
    <span className={clsx('badge bg-white/5', c.text)}>
      <span className={clsx('h-1.5 w-1.5 rounded-full', c.dot, status !== 'down' && 'animate-pulse-slow')} />
      {label ?? c.label}
    </span>
  )
}
