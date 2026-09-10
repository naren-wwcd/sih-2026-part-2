import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { TimelineCard } from '@/components/TimelineCard'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Skeleton, SkeletonList } from '@/components/LoadingSkeleton'
import { useClusterDetail, useClusters } from '@/hooks/useTaceQueries'

export default function Timeline() {
  const [searchParams, setSearchParams] = useSearchParams()
  const clusterId = searchParams.get('cluster') ?? undefined

  const clustersQuery = useClusters()
  const detailQuery = useClusterDetail(clusterId)

  const selectedCluster = useMemo(
    () => clustersQuery.data?.find((c) => c.id === clusterId),
    [clustersQuery.data, clusterId]
  )

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Timeline</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Chronological investigation events for a selected cluster.
          </p>
        </div>

        <div className="w-full sm:w-64">
          {clustersQuery.isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : clustersQuery.isError ? (
            <ErrorBanner
              error={clustersQuery.error}
              onRetry={() => clustersQuery.refetch()}
              title="Failed to load clusters"
            />
          ) : (
            <select
              value={clusterId ?? ''}
              onChange={(e) => {
                const next = e.target.value
                setSearchParams(next ? { cluster: next } : {})
              }}
              className="w-full bg-surface border border-border rounded-md text-sm px-3 py-2 outline-none focus-ring"
            >
              <option value="">Select a cluster…</option>
              {(clustersQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} — {c.confidence_score}%
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selectedCluster && (
        <p className="text-xs text-text-muted -mt-2">
          Showing events for <span className="text-text-secondary font-medium">{selectedCluster.label}</span>
        </p>
      )}

      {!clusterId ? (
        <EmptyState
          icon={Clock}
          title="No cluster selected"
          description="Pick a cluster above to see its investigation timeline."
        />
      ) : detailQuery.isLoading ? (
        <SkeletonList rows={5} />
      ) : detailQuery.isError ? (
        <ErrorBanner error={detailQuery.error} onRetry={() => detailQuery.refetch()} title="Failed to load timeline" />
      ) : (
        <TimelineCard events={detailQuery.data?.timeline ?? []} />
      )}
    </div>
  )
}
