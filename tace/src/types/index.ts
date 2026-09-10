// ---------------------------------------------------------------------------
// Core domain types for TACE. These mirror the shapes returned by the
// existing FastAPI backend. Adjust field names here if your backend's
// serializers differ — this file is the single source of truth for typing
// the rest of the frontend, so most backend-shape changes should only
// require edits in this file plus services/api.ts.
// ---------------------------------------------------------------------------

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export type CollectorType = 'tor' | 'github' | 'reddit' | 'blockchain' | 'all'

export type JobStatus = 'queued' | 'running' | 'success' | 'failed'

export type EntityType = 'alias' | 'wallet' | 'relay' | 'pgp' | 'platform'

export type RelationshipType =
  | 'USES_WALLET'
  | 'HAS_PGP'
  | 'POSTED_ON'
  | 'CONNECTED_TO'

// --- Evidence & Clusters ----------------------------------------------------

export interface EvidenceItem {
  type: 'shared_wallet' | 'shared_pgp' | 'posting_pattern' | 'stylometry' | string
  label: string
  weight: number
  detail?: string
}

export interface ClusterSummary {
  id: string
  label: string
  confidence_score: number // 0-100
  confidence_level: ConfidenceLevel
  alias_count: number
  wallet_count: number
  pgp_count: number
  relay_count: number
  last_updated: string // ISO timestamp
}

export interface AliasRecord {
  id: string
  handle: string
  platform: string
  first_seen: string
  last_seen: string
}

export interface WalletRecord {
  id: string
  address: string
  currency: string
  first_seen: string
  tx_count?: number
}

export interface PgpRecord {
  id: string
  key_id: string
  fingerprint: string
  created: string
}

export interface RelayRecord {
  id: string
  fingerprint: string
  nickname?: string
  country?: string
  last_seen: string
}

export interface TimelineEvent {
  id: string
  timestamp: string // ISO timestamp
  label: string
  description?: string
  kind: 'discovery' | 'link' | 'confidence_change' | 'collection' | string
}

export interface ClusterDetail extends ClusterSummary {
  evidence: EvidenceItem[]
  aliases: AliasRecord[]
  wallets: WalletRecord[]
  pgp_keys: PgpRecord[]
  relays: RelayRecord[]
  timeline: TimelineEvent[]
}

// --- Graph -------------------------------------------------------------------

export interface GraphNodeData {
  id: string
  label: string
  type: EntityType
  confidence?: number
}

export interface GraphEdgeData {
  id: string
  source: string
  target: string
  type: RelationshipType
}

export interface GraphResponse {
  cluster_id: string
  nodes: GraphNodeData[]
  edges: GraphEdgeData[]
}

// --- Collection jobs -----------------------------------------------------------

export interface CollectionJob {
  id: string
  job_type: CollectorType
  status: JobStatus
  started_at: string | null
  finished_at: string | null
  records_imported: number
  error?: string
}

// --- Health --------------------------------------------------------------------

export interface ServiceHealth {
  name: string
  status: 'up' | 'degraded' | 'down'
  latency_ms?: number
  detail?: string
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down'
  services: ServiceHealth[]
  timestamp: string
}

// --- Dashboard aggregate stats (derived client-side from /clusters etc.) -------

export interface DashboardStats {
  total_clusters: number
  high_confidence_clusters: number
  wallets_collected: number
  tor_relays_indexed: number
  github_profiles: number
  reddit_posts: number
}

// --- Search --------------------------------------------------------------------

export type SearchField = 'alias' | 'wallet' | 'pgp' | 'relay'

export interface SearchQuery {
  field: SearchField
  value: string
}

// --- API envelope / errors ------------------------------------------------------

export interface ApiError {
  status: number
  message: string
  detail?: unknown
}
