import { Link, useLocation } from 'react-router-dom'
import { Search, ChevronRight, Menu } from 'lucide-react'
import { HealthBadge } from './HealthBadge'
import { useClusterDetail, useHealth } from '@/hooks/useTaceQueries'

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  search: 'Investigation Search',
  clusters: 'Cluster',
  graph: 'Graph',
  timeline: 'Timeline',
  jobs: 'Collection Monitor',
}

interface Crumb {
  label: string
  to: string
  isLast: boolean
}

function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  // Both /clusters/:id and /graph/:id have an entity id as their second
  // segment — resolve it to the cluster's label once loaded so breadcrumbs
  // read "Cluster / Shadowline Collective" instead of "Cluster / c_18f2".
  const isEntityRoute = (segments[0] === 'clusters' || segments[0] === 'graph') && Boolean(segments[1])
  const entityId = isEntityRoute ? segments[1] : undefined
  const { data: clusterDetail } = useClusterDetail(entityId)

  if (segments.length === 0) return [{ label: 'Dashboard', to: '/', isLast: true }]

  let acc = ''
  return segments.map((seg, i) => {
    acc += `/${seg}`
    const isLast = i === segments.length - 1
    let label = routeLabels[seg] ?? decodeURIComponent(seg)
    if (i === 1 && isEntityRoute && seg === entityId) {
      label = clusterDetail?.label ?? decodeURIComponent(seg)
    }
    return { label, to: acc, isLast }
  })
}

export function TopNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const crumbs = useBreadcrumbs()
  const { data: health, isLoading, isError } = useHealth()

  return (
    <header className="h-14 border-b border-border bg-surface/60 flex items-center justify-between px-4 sticky top-0 z-20 backdrop-blur-none gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden shrink-0 text-text-secondary hover:text-text-primary focus-ring rounded p-1"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
          {crumbs.map((c, i) => (
            <span key={c.to} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <ChevronRight size={14} className="text-text-muted shrink-0" />}
              {c.isLast ? (
                <span className="text-text-primary font-medium truncate">{c.label}</span>
              ) : (
                <Link
                  to={c.to}
                  className="text-text-secondary hover:text-text-primary focus-ring rounded truncate"
                >
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          to="/search"
          className="hidden sm:flex items-center gap-2 text-xs text-text-muted bg-background border border-border rounded-md px-2.5 py-1.5 hover:border-accent/50 hover:text-text-secondary transition-colors focus-ring"
        >
          <Search size={14} />
          <span>Search entities</span>
          <kbd className="font-mono text-[10px] bg-surface px-1 py-0.5 rounded border border-border">
            /
          </kbd>
        </Link>
        <HealthBadge
          status={isError ? 'down' : health?.status ?? 'unknown'}
          loading={isLoading}
        />
      </div>
    </header>
  )
}
