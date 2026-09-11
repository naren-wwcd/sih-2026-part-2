import { http } from './httpClient'

import type {
  ClusterDetail,
  ClusterSummary,
  CollectionJob,
  CollectorType,
  GraphResponse,
  DashboardStats,
  HealthResponse,
} from '@/types'

// ---------------------------------------------------------------------------
// Collection response
// ---------------------------------------------------------------------------

export interface CollectResponse {
  collector: CollectorType
  task_id: string
  status: string
}

// ---------------------------------------------------------------------------
// Collector paths
// ---------------------------------------------------------------------------

const collectorPathMap: Record<CollectorType, string> = {
  all: '/collect/all',
  tor: '/collect/tor',
  github: '/collect/github',
  reddit: '/collect/reddit',
  blockchain: '/collect/blockchain',
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const tace = {
  // -------------------------------------------------------------------------
  // Collection
  // -------------------------------------------------------------------------

  startCollection: (collector: CollectorType) =>
    http.post<CollectResponse>(
      collectorPathMap[collector],
    ),

  // -------------------------------------------------------------------------
  // Clusters
  // -------------------------------------------------------------------------

  getClusters: () =>
    http
      .get<{
        clusters: ClusterSummary[]
        total: number
      }>('/clusters')
      .then((res) => res.clusters),

  getClusterDetail: (clusterId: string) =>
    http.get<ClusterDetail>(
      `/clusters/${encodeURIComponent(clusterId)}`,
    ),

  // -------------------------------------------------------------------------
  // Graph
  // -------------------------------------------------------------------------

  getGraph: (clusterId: string) =>
    http.get<GraphResponse>(
      `/graph/${encodeURIComponent(clusterId)}`,
    ),

  // -------------------------------------------------------------------------
  // Dashboard statistics
  // -------------------------------------------------------------------------

  getDashboardStats: () =>
    http.get<DashboardStats>(
      '/dashboard/stats',
    ),

  // -------------------------------------------------------------------------
  // Health
  // -------------------------------------------------------------------------

  getHealth: () =>
    http
      .get<{
        status: 'ok' | 'degraded' | 'down'
        service: string
        environment: string
        postgres: boolean
        neo4j: boolean
        redis: boolean
      }>('/health')
      .then(
        (res): HealthResponse => ({
          status: res.status,

          services: [
            {
              name: 'PostgreSQL',
              status: res.postgres ? 'ok' : 'down',
            },
            {
              name: 'Neo4j',
              status: res.neo4j ? 'ok' : 'down',
            },
            {
              name: 'Redis',
              status: res.redis ? 'ok' : 'down',
            },
          ],
        }),
      ),

  // -------------------------------------------------------------------------
  // Jobs
  // -------------------------------------------------------------------------

  getJobs: () =>
    http.get<CollectionJob[]>('/jobs'),
}