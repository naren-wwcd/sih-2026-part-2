import { http } from './httpClient'
import type {
  ClusterDetail,
  ClusterSummary,
  CollectionJob,
  CollectorType,
  GraphResponse,
  HealthResponse,
} from '@/types'

// ---------------------------------------------------------------------------
// Thin, explicit wrapper around every backend endpoint the frontend uses.
// Keep one function per endpoint so call sites stay readable and each call
// is easy to mock in tests.
// ---------------------------------------------------------------------------

export interface CollectResponse {
  job_id: string
  job_type: CollectorType
  status: string
}

const collectorPathMap: Record<CollectorType, string> = {
  all: '/collect/all',
  tor: '/collect/tor',
  github: '/collect/github',
  reddit: '/collect/reddit',
  blockchain: '/collect/blockchain',
}

export const tace = {
  /** Trigger a collection job for a single collector, or 'all' for every collector. */
  startCollection: (collector: CollectorType) =>
    http.post<CollectResponse>(collectorPathMap[collector]),

  /** All clusters known to the correlation engine. */
  getClusters: () => http.get<{ clusters: ClusterSummary[]; total: number }>('/clusters').then((res) => res.clusters),

  /** Full detail (evidence, entities, timeline) for a single cluster. */
  getClusterDetail: (clusterId: string) =>
    http.get<ClusterDetail>(`/clusters/${encodeURIComponent(clusterId)}`),

  /** Graph nodes/edges for a cluster, for Cytoscape rendering. */
  getGraph: (clusterId: string) =>
    http.get<GraphResponse>(`/graph/${encodeURIComponent(clusterId)}`),

  /** Backend + dependent-service health. */
  getHealth: () =>
  http.get<{
    status: string
    service: string
    environment: string
    postgres: boolean
    neo4j: boolean
    redis: boolean
  }>('/health').then((res) => ({
    status: res.status,
    services: [
      { name: 'PostgreSQL', status: res.postgres ? 'ok' : 'down' },
      { name: 'Neo4j', status: res.neo4j ? 'ok' : 'down' },
      { name: 'Redis', status: res.redis ? 'ok' : 'down' },
    ],
  })),

  /**
   * Background collection jobs. NOTE: the spec doesn't list a dedicated
   * jobs-listing endpoint — this assumes a conventional /jobs route.
   * If your backend exposes jobs differently, update this one function.
   */
  getJobs: () => http.get<CollectionJob[]>('/jobs'),
}
