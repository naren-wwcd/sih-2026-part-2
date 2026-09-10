import { useMemo, useState } from 'react'
import {
  Boxes,
  ShieldCheck,
  Wallet,
  Radio,
  Github,
  MessageSquare,
  Play,
  ListChecks,
} from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { HealthBadge } from '@/components/HealthBadge'
import { SkeletonStatGrid, SkeletonCard, SkeletonList } from '@/components/LoadingSkeleton'
import { ErrorBanner } from '@/components/ErrorBanner'
import { JobTable } from '@/components/JobTable'
import { EmptyState } from '@/components/EmptyState'
import { useClusters, useHealth, useJobs, useStartCollection } from '@/hooks/useTaceQueries'
import { useToast } from '@/hooks/useToast'
import type { ApiError, CollectorType } from '@/types'

const quickActions: { collector: CollectorType; label: string; icon: typeof Play }[] = [
  { collector: 'all', label: 'Run All Collectors', icon: Play },
  { collector: 'tor', label: 'Collect Tor', icon: Radio },
  { collector: 'github', label: 'Collect GitHub', icon: Github },
  { collector: 'reddit', label: 'Collect Reddit', icon: MessageSquare },
  { collector: 'blockchain', label: 'Collect Blockchain', icon: Wallet },
]

export default function Dashboard() {
  const clustersQuery = useClusters()
  const healthQuery = useHealth()
  const jobsQuery = useJobs()
  const startCollection = useStartCollection()
  const { push } = useToast()

  // Track which specific collector button is mid-flight so only that
  // button shows a loading state (not every quick action at once).
  const [pendingCollector, setPendingCollector] = useState<CollectorType | null>(null)

  const stats = useMemo(() => {
    const clusters = clustersQuery.data ?? []
    return {
      total_clusters: clusters.length,
      high_confidence_clusters: clusters.filter((c) => c.confidence_level === 'high').length,
      wallets_collected: clusters.reduce((sum, c) => sum + (c.wallet_count ?? 0), 0),
      tor_relays_indexed: clusters.reduce((sum, c) => sum + (c.relay_count ?? 0), 0),
      github_profiles: clusters.reduce((sum, c) => sum + (c.alias_count ?? 0), 0),
      reddit_posts: clusters.reduce((sum, c) => sum + (c.pgp_count ?? 0), 0),
    }
  }, [clustersQuery.data])

  async function handleCollect(collector: CollectorType, label: string) {
    setPendingCollector(collector)
    try {
      await startCollection.mutateAsync(collector)
      push({
        variant: 'success',
        title: `${label} started`,
        description: 'Job queued — track progress in Collection Monitor.',
      })
    } catch (err) {
      const apiError = err as ApiError
      push({
        variant: 'danger',
        title: `${label} failed to start`,
        description: apiError?.message ?? 'Something went wrong.',
      })
    } finally {
      setPendingCollector(null)
    }
  }

  const recentJobs = (jobsQuery.data ?? []).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Correlation engine overview, system health, and collection controls.
        </p>
      </div>

      {/* Stat cards */}
      {clustersQuery.isLoading ? (
        <SkeletonStatGrid count={6} />
      ) : clustersQuery.isError ? (
        <ErrorBanner error={clustersQuery.error} onRetry={() => clustersQuery.refetch()} title="Failed to load cluster stats" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard label="Total Clusters" value={stats.total_clusters} icon={Boxes} tone="default" />
          <StatCard
            label="High Confidence"
            value={stats.high_confidence_clusters}
            icon={ShieldCheck}
            tone="success"
          />
          <StatCard label="Wallets Collected" value={stats.wallets_collected} icon={Wallet} tone="warning" />
          <StatCard label="Tor Relays Indexed" value={stats.tor_relays_indexed} icon={Radio} tone="default" />
          <StatCard label="GitHub Profiles" value={stats.github_profiles} icon={Github} tone="default" />
          <StatCard label="Reddit Posts" value={stats.reddit_posts} icon={MessageSquare} tone="default" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* System health */}
        <div className="card lg:col-span-1">
          <div className="card-header">
            <h2 className="text-sm font-medium">System Health</h2>
            {!healthQuery.isLoading && !healthQuery.isError && healthQuery.data && (
              <HealthBadge status={healthQuery.data.status} />
            )}
          </div>
          <div className="p-4 space-y-2.5">
            {healthQuery.isLoading ? (
              <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : healthQuery.isError ? (
              <ErrorBanner error={healthQuery.error} onRetry={() => healthQuery.refetch()} title="Health check failed" />
            ) : healthQuery.data && healthQuery.data.services.length > 0 ? (
              healthQuery.data.services.map((svc) => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{svc.name}</p>
                    {svc.detail && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">{svc.detail}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {typeof svc.latency_ms === 'number' && (
                      <span className="text-xs text-text-muted mono-num">{svc.latency_ms}ms</span>
                    )}
                    <HealthBadge status={svc.status} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={ShieldCheck} title="No service health data" />
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card lg:col-span-1">
          <div className="card-header">
            <h2 className="text-sm font-medium">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map(({ collector, label, icon: Icon }) => {
              const isPending = pendingCollector === collector && startCollection.isPending
              return (
                <button
                  key={collector}
                  onClick={() => handleCollect(collector, label)}
                  disabled={startCollection.isPending}
                  className="w-full flex items-center gap-2.5 text-sm font-medium rounded-md border border-border px-3 py-2.5 hover:border-accent/50 hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring"
                >
                  <Icon
                    size={16}
                    className={isPending ? 'animate-spin text-accent' : 'text-text-secondary'}
                  />
                  <span className="flex-1 text-left">{label}</span>
                  {isPending && <span className="text-xs text-text-muted">Starting…</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent jobs */}
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Recent Jobs</h2>
            <a href="/jobs" className="text-xs text-accent hover:text-accent-hover">
              View all
            </a>
          </div>
          {jobsQuery.isLoading ? (
            <SkeletonList rows={4} />
          ) : jobsQuery.isError ? (
            <ErrorBanner error={jobsQuery.error} onRetry={() => jobsQuery.refetch()} title="Failed to load jobs" />
          ) : recentJobs.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No collection jobs yet"
              description="Use Quick Actions to trigger a collector."
            />
          ) : (
            <JobTable jobs={recentJobs} compact />
          )}
        </div>
      </div>
    </div>
  )
}
