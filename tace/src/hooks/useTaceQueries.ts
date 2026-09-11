import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { tace } from '@/services/api'

import type { CollectorType } from '@/types'

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const queryKeys = {
  clusters: ['clusters'] as const,

  clusterDetail: (id: string) =>
    ['clusters', id] as const,

  graph: (id: string) =>
    ['graph', id] as const,

  health: ['health'] as const,

  jobs: ['jobs'] as const,

  dashboardStats: ['dashboard-stats'] as const,
}

// ---------------------------------------------------------------------------
// Clusters
// ---------------------------------------------------------------------------

export function useClusters() {
  return useQuery({
    queryKey: queryKeys.clusters,
    queryFn: tace.getClusters,
    staleTime: 30_000,
  })
}

// ---------------------------------------------------------------------------
// Cluster detail
// ---------------------------------------------------------------------------

export function useClusterDetail(
  clusterId: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.clusterDetail(
      clusterId ?? '',
    ),

    queryFn: () =>
      tace.getClusterDetail(
        clusterId as string,
      ),

    enabled: Boolean(clusterId),
  })
}

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

export function useGraph(
  clusterId: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.graph(
      clusterId ?? '',
    ),

    queryFn: () =>
      tace.getGraph(
        clusterId as string,
      ),

    enabled: Boolean(clusterId),
  })
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: tace.getHealth,

    refetchInterval: 15_000,

    retry: 1,
  })
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: tace.getJobs,

    refetchInterval: 5_000,

    // The backend does not have /jobs yet.
    enabled: false,
  })
}

// ---------------------------------------------------------------------------
// Dashboard statistics
// ---------------------------------------------------------------------------

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,

    queryFn: tace.getDashboardStats,

    refetchInterval: 10_000,
  })
}

// ---------------------------------------------------------------------------
// Start collection
// ---------------------------------------------------------------------------

export function useStartCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      collector: CollectorType,
    ) =>
      tace.startCollection(collector),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobs,
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats,
      })
    },
  })
}