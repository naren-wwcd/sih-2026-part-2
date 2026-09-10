import { format } from 'date-fns'
import clsx from 'clsx'
import { UserSearch, Link2, TrendingUp, Database, Circle } from 'lucide-react'
import type { TimelineEvent } from '@/types'
import { EmptyState } from './EmptyState'
import { Clock } from 'lucide-react'

interface TimelineCardProps {
  events: TimelineEvent[]
}

const kindConfig: Record<string, { icon: typeof Circle; className: string }> = {
  discovery: { icon: UserSearch, className: 'text-accent bg-accent-muted/30' },
  link: { icon: Link2, className: 'text-warning bg-warning-muted/40' },
  confidence_change: { icon: TrendingUp, className: 'text-success bg-success-muted/40' },
  collection: { icon: Database, className: 'text-text-secondary bg-white/5' },
}

function formatTime(ts: string) {
  try {
    return format(new Date(ts), 'HH:mm')
  } catch {
    return ts
  }
}

export function TimelineCard({ events }: TimelineCardProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No timeline events yet"
        description="Events appear here as new evidence links into this cluster."
      />
    )
  }

  return (
    <div className="card p-4">
      <ol className="relative border-l border-border ml-3 space-y-5">
        {events.map((event) => {
          const cfg = kindConfig[event.kind] ?? { icon: Circle, className: 'text-text-muted bg-white/5' }
          return (
            <li key={event.id} className="ml-5">
              <span
                className={clsx(
                  'absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-surface',
                  cfg.className
                )}
              >
                <cfg.icon size={13} />
              </span>
              <div className="flex items-baseline gap-2">
                <time className="text-xs font-mono text-text-muted">{formatTime(event.timestamp)}</time>
                <p className="text-sm font-medium text-text-primary">{event.label}</p>
              </div>
              {event.description && (
                <p className="text-xs text-text-secondary mt-0.5">{event.description}</p>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
