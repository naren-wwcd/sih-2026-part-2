import { useState } from 'react'

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

import {
  useDashboardStats,
  useHealth,
  useJobs,
  useStartCollection,
} from '@/hooks/useTaceQueries'

import { StatCard } from '@/components/StatCard'
import { HealthBadge } from '@/components/HealthBadge'

import {
  SkeletonStatGrid,
  SkeletonCard,
  SkeletonList,
} from '@/components/LoadingSkeleton'

import { ErrorBanner } from '@/components/ErrorBanner'
import { JobTable } from '@/components/JobTable'
import { EmptyState } from '@/components/EmptyState'

import { useToast } from '@/hooks/useToast'

import type { CollectorType } from '@/types'

export default function Dashboard() {
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  const statsQuery = useDashboardStats()
  const healthQuery = useHealth()
  const jobsQuery = useJobs()

  const startCollection =
    useStartCollection()

  // -------------------------------------------------------------------------
  // Toast
  // -------------------------------------------------------------------------

  const { push } = useToast()

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const [
    pendingCollector,
    setPendingCollector,
  ] = useState<CollectorType | null>(null)

  const stats = statsQuery.data

  // -------------------------------------------------------------------------
  // Start collection
  // -------------------------------------------------------------------------

  const handleStartCollection = async (
    collector: CollectorType,
  ) => {
    try {
      setPendingCollector(collector)

      await startCollection.mutateAsync(
        collector,
      )

      push({
        variant: 'success',
        title: 'Collection started',
        description:
          `${collector} collection job has been queued.`,
      })
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to start the collection job.'

      push({
        variant: 'danger',
        title: 'Collection failed',
        description: message,
      })
    } finally {
      setPendingCollector(null)
    }
  }

  // -------------------------------------------------------------------------
  // Collectors
  // -------------------------------------------------------------------------

  const collectors: Array<
    [CollectorType, string]
  > = [
    ['all', 'Collect All'],
    ['github', 'GitHub'],
    ['reddit', 'Reddit'],
    ['tor', 'Tor'],
    ['blockchain', 'Blockchain'],
  ]

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">

      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="text-sm text-muted-foreground">
            Threat Actor Correlation Engine overview
          </p>
        </div>

        {healthQuery.data && (
          <HealthBadge
            status={
              healthQuery.data.status
            }
          />
        )}

      </div>

      {/* ================================================================= */}
      {/* DASHBOARD STATISTICS                                              */}
      {/* ================================================================= */}

      {statsQuery.isLoading ? (

        <SkeletonStatGrid />

      ) : statsQuery.isError ? (

        <ErrorBanner
          title="Unable to load dashboard statistics"
          error={statsQuery.error}
        />

      ) : (

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

          <StatCard
            label="Total Clusters"
            value={
              stats?.total_clusters ?? 0
            }
            icon={Boxes}
          />

          <StatCard
            label="High Confidence"
            value={
              stats?.high_confidence_clusters ?? 0
            }
            icon={ShieldCheck}
          />

          <StatCard
            label="Wallets"
            value={
              stats?.wallets_collected ?? 0
            }
            icon={Wallet}
          />

          <StatCard
            label="Tor Relays"
            value={
              stats?.tor_relays_indexed ?? 0
            }
            icon={Radio}
          />

          <StatCard
            label="GitHub Profiles"
            value={
              stats?.github_profiles ?? 0
            }
            icon={Github}
          />

          <StatCard
            label="Reddit Posts"
            value={
              stats?.reddit_posts ?? 0
            }
            icon={MessageSquare}
          />

        </div>

      )}

      {/* ================================================================= */}
      {/* QUICK ACTIONS                                                     */}
      {/* ================================================================= */}

      <section className="space-y-3">

        <div>
          <h2 className="text-lg font-semibold">
            Quick Actions
          </h2>

          <p className="text-sm text-muted-foreground">
            Start OSINT collection jobs directly from the dashboard.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

          {collectors.map(
            ([collector, label]) => (
              <button
                key={collector}
                type="button"
                onClick={() =>
                  handleStartCollection(
                    collector,
                  )
                }
                disabled={
                  startCollection.isPending ||
                  pendingCollector !== null
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Play className="h-4 w-4" />

                {pendingCollector ===
                collector
                  ? 'Starting...'
                  : label}

              </button>
            ),
          )}

        </div>

      </section>

      {/* ================================================================= */}
      {/* SERVICE HEALTH                                                    */}
      {/* ================================================================= */}

      <section className="space-y-3">

        <div>
          <h2 className="text-lg font-semibold">
            Service Health
          </h2>

          <p className="text-sm text-muted-foreground">
            Current status of TACE dependencies.
          </p>
        </div>

        {healthQuery.isLoading ? (

          <SkeletonCard />

        ) : healthQuery.isError ? (

          <ErrorBanner
            title="Unable to load service health"
            error={healthQuery.error}
          />

        ) : healthQuery.data &&
          healthQuery.data.services.length > 0 ? (

          <div className="grid gap-3 md:grid-cols-3">

            {healthQuery.data.services.map(
              (service) => (

                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium">
                      {service.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Backend dependency
                    </p>

                  </div>

                  <HealthBadge
                    status={service.status}
                  />

                </div>

              ),
            )}

          </div>

        ) : (

          <EmptyState
            icon={ShieldCheck}
            title="No service health data"
          />

        )}

      </section>

      {/* ================================================================= */}
      {/* RECENT JOBS                                                       */}
      {/* ================================================================= */}

      <section className="space-y-3">

        <div className="flex items-center gap-2">

          <ListChecks className="h-5 w-5" />

          <div>

            <h2 className="text-lg font-semibold">
              Recent Jobs
            </h2>

            <p className="text-sm text-muted-foreground">
              Background collection activity.
            </p>

          </div>

        </div>

        {jobsQuery.isLoading ? (

          <SkeletonList />

        ) : jobsQuery.isError ? (

          <ErrorBanner
            title="Unable to load jobs"
            error={jobsQuery.error}
          />

        ) : (jobsQuery.data ?? []).length > 0 ? (

          <JobTable
            jobs={
              (jobsQuery.data ?? []).slice(
                0,
                5,
              )
            }
          />

        ) : (

          <EmptyState
            icon={ListChecks}
            title="No recent jobs"
            description="Collection jobs will appear here when the jobs API is available."
          />

        )}

      </section>

    </div>
  )
}