import { useMemo, useState } from 'react'
import { RefreshCw, ListChecks } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'
import { JobTable } from '@/components/JobTable'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { SkeletonTable } from '@/components/LoadingSkeleton'
import { useJobs } from '@/hooks/useTaceQueries'
import { useToast } from '@/hooks/useToast'
import type { CollectorType, JobStatus } from '@/types'

type StatusFilter = 'all' | JobStatus
type CollectorFilter = 'all' | CollectorType

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'queued', label: 'Queued' },
  { value: 'running', label: 'Running' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
]

const collectorTabs: { value: CollectorFilter; label: string }[] = [
  { value: 'all', label: 'All Collectors' },
  { value: 'tor', label: 'Tor' },
  { value: 'github', label: 'GitHub' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'blockchain', label: 'Blockchain' },
]

export default function CollectionMonitor() {
  const jobsQuery = useJobs()
  const { push } = useToast()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [collectorFilter, setCollectorFilter] = useState<CollectorFilter>('all')
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date())

  const jobs = jobsQuery.data ?? []

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const statusOk = statusFilter === 'all' || job.status === statusFilter
      const collectorOk = collectorFilter === 'all' || job.job_type === collectorFilter
      return statusOk && collectorOk
    })
  }, [jobs, statusFilter, collectorFilter])

  async function handleRefresh() {
    try {
      await jobsQuery.refetch()
      setLastRefreshedAt(new Date())
    } catch {
      push({ variant: 'danger', title: 'Refresh failed', description: 'Could not reach the TACE backend.' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Collection Monitor</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Background collection jobs across every collector, auto-refreshing every 5 seconds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            Updated {formatDistanceToNow(lastRefreshedAt, { addSuffix: true })}
          </span>
          <button
            onClick={handleRefresh}
            disabled={jobsQuery.isFetching}
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary border border-border rounded-md px-3 py-1.5 hover:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <RefreshCw size={14} className={jobsQuery.isFetching ? 'animate-spin' : undefined} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-surface border border-border rounded-md p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={clsx(
                'text-xs font-medium px-2.5 py-1.5 rounded transition-colors focus-ring',
                statusFilter === tab.value
                  ? 'bg-accent-muted/40 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border rounded-md p-1">
          {collectorTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCollectorFilter(tab.value)}
              className={clsx(
                'text-xs font-medium px-2.5 py-1.5 rounded transition-colors focus-ring capitalize',
                collectorFilter === tab.value
                  ? 'bg-accent-muted/40 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {jobsQuery.isLoading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : jobsQuery.isError ? (
        <ErrorBanner error={jobsQuery.error} onRetry={() => jobsQuery.refetch()} title="Failed to load jobs" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No collection jobs yet"
          description="Trigger a collector from the Dashboard to start ingesting data."
        />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No jobs match these filters"
          description="Try a different status or collector filter."
          action={{
            label: 'Clear filters',
            onClick: () => {
              setStatusFilter('all')
              setCollectorFilter('all')
            },
          }}
        />
      ) : (
        <JobTable jobs={filteredJobs} />
      )}
    </div>
  )
}
