import clsx from 'clsx'
import { format } from 'date-fns'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { CollectionJob, JobStatus } from '@/types'
import { EmptyState } from './EmptyState'
import { ListChecks } from 'lucide-react'

interface JobTableProps {
  jobs: CollectionJob[]
  compact?: boolean
}

const statusConfig: Record<JobStatus, { icon: typeof Loader2; className: string; label: string }> = {
  queued: { icon: Clock, className: 'text-text-muted', label: 'Queued' },
  running: { icon: Loader2, className: 'text-accent', label: 'Running' },
  success: { icon: CheckCircle2, className: 'text-success', label: 'Success' },
  failed: { icon: XCircle, className: 'text-danger', label: 'Failed' },
}

function formatTime(ts: string | null) {
  if (!ts) return '—'
  try {
    return format(new Date(ts), 'MMM d, HH:mm:ss')
  } catch {
    return ts
  }
}

export function JobTable({ jobs, compact }: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No collection jobs yet"
        description="Trigger a collector from the dashboard to start ingesting data."
      />
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-text-muted uppercase tracking-wide">
            <th className="px-4 py-2.5 font-medium">Job Type</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Started</th>
            {!compact && <th className="px-4 py-2.5 font-medium">Finished</th>}
            <th className="px-4 py-2.5 font-medium text-right">Records Imported</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {jobs.map((job) => {
            const s = statusConfig[job.status]
            return (
              <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5 font-medium capitalize">{job.job_type}</td>
                <td className="px-4 py-2.5">
                  <span className={clsx('inline-flex items-center gap-1.5', s.className)}>
                    <s.icon size={14} className={job.status === 'running' ? 'animate-spin' : undefined} />
                    {s.label}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-text-secondary mono-num">{formatTime(job.started_at)}</td>
                {!compact && (
                  <td className="px-4 py-2.5 text-text-secondary mono-num">
                    {formatTime(job.finished_at)}
                  </td>
                )}
                <td className="px-4 py-2.5 text-right mono-num">
                  {job.records_imported.toLocaleString()}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
