import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Share2, X, UserRound, Wallet, Radio, Fingerprint, Globe2 } from 'lucide-react'
import clsx from 'clsx'
import { GraphPanel } from '@/components/GraphPanel'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Skeleton } from '@/components/LoadingSkeleton'
import { useClusters, useGraph } from '@/hooks/useTaceQueries'
import type { EntityType } from '@/types'

const entityIcon: Record<EntityType, typeof UserRound> = {
  alias: UserRound,
  wallet: Wallet,
  relay: Radio,
  pgp: Fingerprint,
  platform: Globe2,
}

const entityTone: Record<EntityType, string> = {
  alias: 'text-accent bg-accent-muted/30',
  wallet: 'text-warning bg-warning-muted/40',
  relay: 'text-danger bg-danger-muted/40',
  pgp: 'text-success bg-success-muted/40',
  platform: 'text-text-secondary bg-white/5',
}

const relationshipLabel: Record<string, string> = {
  USES_WALLET: 'Uses Wallet',
  HAS_PGP: 'Has PGP',
  POSTED_ON: 'Posted On',
  CONNECTED_TO: 'Connected To',
}

export default function GraphView() {
  const { clusterId } = useParams()
  const navigate = useNavigate()
  const clustersQuery = useClusters()
  const graphQuery = useGraph(clusterId)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const selectedNode = useMemo(
    () => graphQuery.data?.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graphQuery.data, selectedNodeId]
  )

  const neighborEdges = useMemo(() => {
    if (!graphQuery.data || !selectedNodeId) return []
    return graphQuery.data.edges.filter(
      (e) => e.source === selectedNodeId || e.target === selectedNodeId
    )
  }, [graphQuery.data, selectedNodeId])

  function nodeLabel(id: string) {
    return graphQuery.data?.nodes.find((n) => n.id === id)?.label ?? id
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Interactive Graph</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Entity relationships rendered with Cytoscape.js. Click a node to inspect its connections.
          </p>
        </div>

        {/* Cluster picker — shown whenever no clusterId is in the route */}
        {!clusterId && (
          <div className="w-full sm:w-72">
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
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) navigate(`/graph/${encodeURIComponent(e.target.value)}`)
                }}
                className="w-full bg-surface border border-border rounded-md text-sm px-3 py-2 outline-none focus-ring"
              >
                <option value="" disabled>
                  Select a cluster to visualize…
                </option>
                {(clustersQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} — {c.confidence_score}%
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {!clusterId ? (
        <EmptyState
          icon={Share2}
          title="No cluster selected"
          description="Pick a cluster above, or open a graph from a Cluster Investigation page."
        />
      ) : graphQuery.isError ? (
        <ErrorBanner error={graphQuery.error} onRetry={() => graphQuery.refetch()} title="Failed to load graph" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <GraphPanel
              data={graphQuery.data}
              loading={graphQuery.isLoading}
              onNodeSelect={setSelectedNodeId}
            />
            <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-text-muted">
              <span className="font-medium text-text-secondary">Legend:</span>
              {(Object.keys(entityIcon) as EntityType[]).map((type) => {
                const Icon = entityIcon[type]
                return (
                  <span key={type} className="flex items-center gap-1.5 capitalize">
                    <span className={clsx('rounded-full p-1', entityTone[type])}>
                      <Icon size={10} />
                    </span>
                    {type}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Details side panel */}
          <div className="lg:col-span-1">
            {selectedNode ? (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-medium">Node Details</h3>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-text-muted hover:text-text-primary focus-ring rounded"
                    aria-label="Close details"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className={clsx('rounded-md p-2', entityTone[selectedNode.type])}>
                      {(() => {
                        const Icon = entityIcon[selectedNode.type]
                        return <Icon size={16} />
                      })()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{selectedNode.label}</p>
                      <p className="text-xs text-text-muted capitalize">{selectedNode.type}</p>
                    </div>
                  </div>

                  {typeof selectedNode.confidence === 'number' && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Confidence</p>
                      <p className="text-sm font-semibold mono-num">{selectedNode.confidence}%</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-text-muted mb-1.5">
                      Connections ({neighborEdges.length})
                    </p>
                    {neighborEdges.length === 0 ? (
                      <p className="text-xs text-text-muted">No connections.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {neighborEdges.map((edge) => {
                          const otherId = edge.source === selectedNode.id ? edge.target : edge.source
                          return (
                            <li key={edge.id} className="text-xs border-b border-border last:border-0 pb-1.5 last:pb-0">
                              <span className="text-text-secondary">
                                {relationshipLabel[edge.type] ?? edge.type}
                              </span>{' '}
                              <span className="text-text-primary font-medium">{nodeLabel(otherId)}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Share2}
                title="No node selected"
                description="Click a node in the graph to see its details and connections here."
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
