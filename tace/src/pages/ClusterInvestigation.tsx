import { useParams, Link } from 'react-router-dom'
import {
  ShieldAlert,
  ShieldCheck,
  Share2,
  UserRound,
  Wallet,
  Fingerprint,
  Radio,
} from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Skeleton, SkeletonCard } from '@/components/LoadingSkeleton'
import { EvidenceCard } from '@/components/EvidenceCard'
import { TimelineCard } from '@/components/TimelineCard'
import { useClusterDetail } from '@/hooks/useTaceQueries'
import type { ConfidenceLevel } from '@/types'

function confidenceTone(level: ConfidenceLevel) {
  if (level === 'high') return 'text-success bg-success-muted/40'
  if (level === 'medium') return 'text-warning bg-warning-muted/40'
  return 'text-danger bg-danger-muted/40'
}

function safeFormat(ts: string, pattern: string) {
  try {
    return format(new Date(ts), pattern)
  } catch {
    return ts
  }
}

export default function ClusterInvestigation() {
  const { clusterId } = useParams()
  const { data: cluster, isLoading, isError, error, refetch } = useClusterDetail(clusterId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorBanner error={error} onRetry={() => refetch()} title="Failed to load cluster" />
  }

  if (!cluster) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title={`Cluster ${clusterId ?? ''} not found`}
        description="This cluster may have been merged, deleted, or never existed."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{cluster.label}</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Last updated {safeFormat(cluster.last_updated, 'MMM d, yyyy HH:mm:ss')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={clsx(
              'badge text-sm font-semibold px-3 py-1',
              confidenceTone(cluster.confidence_level)
            )}
          >
            <ShieldCheck size={14} />
            {cluster.confidence_score}% confidence
          </span>
          <Link
            to={`/graph/${encodeURIComponent(cluster.id)}`}
            className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover border border-accent/30 rounded-md px-3 py-1.5 hover:border-accent/60 transition-colors focus-ring"
          >
            <Share2 size={14} />
            View Graph
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Evidence */}
        <div className="lg:col-span-1">
          <EvidenceCard evidence={cluster.evidence} confidenceScore={cluster.confidence_score} />
        </div>

        {/* Connected entities */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EntityPanel
            icon={UserRound}
            title="Aliases"
            count={cluster.aliases.length}
            tone="text-accent bg-accent-muted/30"
          >
            {cluster.aliases.length === 0 ? (
              <p className="text-xs text-text-muted">No aliases linked.</p>
            ) : (
              cluster.aliases.map((a) => (
                <div key={a.id} className="text-sm border-b border-border last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                  <p className="font-medium truncate">{a.handle}</p>
                  <p className="text-xs text-text-muted">
                    {a.platform} · seen {safeFormat(a.first_seen, 'MMM d')}–{safeFormat(a.last_seen, 'MMM d')}
                  </p>
                </div>
              ))
            )}
          </EntityPanel>

          <EntityPanel
            icon={Wallet}
            title="Wallets"
            count={cluster.wallets.length}
            tone="text-warning bg-warning-muted/40"
          >
            {cluster.wallets.length === 0 ? (
              <p className="text-xs text-text-muted">No wallets linked.</p>
            ) : (
              cluster.wallets.map((w) => (
                <div key={w.id} className="text-sm border-b border-border last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                  <p className="font-mono text-xs truncate" title={w.address}>
                    {w.address}
                  </p>
                  <p className="text-xs text-text-muted">
                    {w.currency}
                    {typeof w.tx_count === 'number' ? ` · ${w.tx_count} tx` : ''} · first seen{' '}
                    {safeFormat(w.first_seen, 'MMM d')}
                  </p>
                </div>
              ))
            )}
          </EntityPanel>

          <EntityPanel
            icon={Fingerprint}
            title="PGP Keys"
            count={cluster.pgp_keys.length}
            tone="text-success bg-success-muted/40"
          >
            {cluster.pgp_keys.length === 0 ? (
              <p className="text-xs text-text-muted">No PGP keys linked.</p>
            ) : (
              cluster.pgp_keys.map((p) => (
                <div key={p.id} className="text-sm border-b border-border last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                  <p className="font-mono text-xs truncate" title={p.fingerprint}>
                    {p.key_id}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {p.fingerprint} · created {safeFormat(p.created, 'MMM d, yyyy')}
                  </p>
                </div>
              ))
            )}
          </EntityPanel>

          <EntityPanel
            icon={Radio}
            title="Relays"
            count={cluster.relays.length}
            tone="text-danger bg-danger-muted/40"
          >
            {cluster.relays.length === 0 ? (
              <p className="text-xs text-text-muted">No relay metadata linked.</p>
            ) : (
              cluster.relays.map((r) => (
                <div key={r.id} className="text-sm border-b border-border last:border-0 pb-2 last:pb-0 mb-2 last:mb-0">
                  <p className="font-medium truncate">{r.nickname ?? r.fingerprint}</p>
                  <p className="text-xs text-text-muted truncate">
                    {r.country ?? 'Unknown country'} · last seen {safeFormat(r.last_seen, 'MMM d')}
                  </p>
                </div>
              ))
            )}
          </EntityPanel>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-sm font-medium mb-2">Timeline</h2>
        <TimelineCard events={cluster.timeline} />
      </div>
    </div>
  )
}

function EntityPanel({
  icon: Icon,
  title,
  count,
  tone,
  children,
}: {
  icon: typeof UserRound
  title: string
  count: number
  tone: string
  children: React.ReactNode
}) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <span className={clsx('rounded-md p-1.5', tone)}>
            <Icon size={14} />
          </span>
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <span className="text-xs text-text-muted mono-num">{count}</span>
      </div>
      <div className="p-4 max-h-56 overflow-y-auto">{children}</div>
    </div>
  )
}
