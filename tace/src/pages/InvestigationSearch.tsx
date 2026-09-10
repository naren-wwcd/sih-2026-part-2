import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Fingerprint, Wallet, Radio, UserRound } from 'lucide-react'
import { format } from 'date-fns'
import { SearchBar } from '@/components/SearchBar'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { SkeletonList } from '@/components/LoadingSkeleton'
import { useClusters } from '@/hooks/useTaceQueries'
import type { ClusterSummary, SearchField, SearchQuery } from '@/types'

// ---------------------------------------------------------------------------
// ASSUMPTION FLAGGED (see README "Search matching" section): the backend's
// /clusters endpoint (ClusterSummary) exposes only aggregate counts and a
// label per cluster — not the raw alias handles, wallet addresses, PGP
// fingerprints, or relay fingerprints themselves. There's no dedicated
// search endpoint in the given spec either. Until the backend adds one
// (e.g. GET /search?field=&value=), this page matches the query against
// each cluster's label as the best available client-side proxy, and is
// clearly labeled as such in the UI. If your backend can expose a real
// search endpoint, only the `runSearch` function below needs to change.
// ---------------------------------------------------------------------------

const fieldIcon: Record<SearchField, typeof UserRound> = {
  alias: UserRound,
  wallet: Wallet,
  pgp: Fingerprint,
  relay: Radio,
}

const fieldCountKey: Record<SearchField, keyof ClusterSummary> = {
  alias: 'alias_count',
  wallet: 'wallet_count',
  pgp: 'pgp_count',
  relay: 'relay_count',
}

function runSearch(clusters: ClusterSummary[], query: SearchQuery): ClusterSummary[] {
  const needle = query.value.toLowerCase()
  return clusters.filter((c) => {
    // Only surface clusters that actually have entities of the selected
    // type, then match the free-text query against the cluster label.
    const hasEntityType = (c[fieldCountKey[query.field]] as number) > 0
    return hasEntityType && c.label.toLowerCase().includes(needle)
  })
}

function confidenceTone(level: ClusterSummary['confidence_level']) {
  if (level === 'high') return 'text-success'
  if (level === 'medium') return 'text-warning'
  return 'text-danger'
}

export default function InvestigationSearch() {
  const navigate = useNavigate()
  const clustersQuery = useClusters()
  const [lastQuery, setLastQuery] = useState<SearchQuery | null>(null)

  const results = useMemo(() => {
    if (!lastQuery || !clustersQuery.data) return null
    return runSearch(clustersQuery.data, lastQuery)
  }, [lastQuery, clustersQuery.data])

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold">Investigation Search</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Search across aliases, wallets, PGP keys, and relay fingerprints.
        </p>
      </div>

      <SearchBar
        onSearch={(field, value) => setLastQuery({ field, value })}
        loading={clustersQuery.isFetching && Boolean(lastQuery)}
        autoFocus
      />

      {clustersQuery.isLoading ? (
        <SkeletonList rows={4} />
      ) : clustersQuery.isError ? (
        <ErrorBanner
          error={clustersQuery.error}
          onRetry={() => clustersQuery.refetch()}
          title="Failed to load clusters"
        />
      ) : !lastQuery ? (
        <EmptyState
          icon={Search}
          title="Start typing to search"
          description="Matches against known cluster labels for the selected entity type."
        />
      ) : results && results.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No clusters match "${lastQuery.value}"`}
          description="Try a different field or check the spelling."
        />
      ) : results ? (
        <div className="space-y-2">
          <p className="text-xs text-text-muted">
            {results.length} cluster{results.length === 1 ? '' : 's'} matching{' '}
            <span className="text-text-secondary">"{lastQuery.value}"</span>
          </p>
          <div className="card divide-y divide-border overflow-hidden">
            {results.map((cluster) => {
              const Icon = fieldIcon[lastQuery.field]
              return (
                <button
                  key={cluster.id}
                  onClick={() => navigate(`/clusters/${encodeURIComponent(cluster.id)}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors focus-ring"
                >
                  <div className="rounded-md p-2 bg-accent-muted/30 text-accent shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{cluster.label}</p>
                      <span className={`text-xs font-semibold mono-num ${confidenceTone(cluster.confidence_level)}`}>
                        {cluster.confidence_score}%
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {cluster.alias_count} aliases · {cluster.wallet_count} wallets · {cluster.pgp_count} PGP ·{' '}
                      {cluster.relay_count} relays · updated{' '}
                      {(() => {
                        try {
                          return format(new Date(cluster.last_updated), 'MMM d, HH:mm')
                        } catch {
                          return cluster.last_updated
                        }
                      })()}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-text-muted shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
