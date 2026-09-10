import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tace } from '@/services/api'
import type { CollectorType } from '@/types'

export const queryKeys = {
  clusters: ['clusters'] as const,
  clusterDetail: (id: string) => ['clusters', id] as const,
  graph: (id: string) => ['graph', id] as const,
  health: ['health'] as const,
  jobs: ['jobs'] as const,
}

export function useClusters() {
  return useQuery({
    queryKey: queryKeys.clusters,
    queryFn: tace.getClusters,
    staleTime: 30_000,
  })
}

export function useClusterDetail(clusterId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clusterDetail(clusterId ?? ''),
    queryFn: () => tace.getClusterDetail(clusterId as string),
    enabled: Boolean(clusterId),
  })
}

export function useGraph(clusterId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.graph(clusterId ?? ''),
    queryFn: () => tace.getGraph(clusterId as string),
    enabled: Boolean(clusterId),
  })
}

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: tace.getHealth,
    // System health should feel "live" without the user refreshing manually
    refetchInterval: 15_000,
    retry: 1,
  })
}

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: tace.getJobs,
    refetchInterval: 5_000,
    enabled: false, // backend has no /jobs endpoint yet — revisit once it's built
  })
}

export function useStartCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (collector: CollectorType) => tace.startCollection(collector),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
    },
  })
}
