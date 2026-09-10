import { useEffect, useRef } from 'react'
import cytoscape, { type Core, type NodeSingular } from 'cytoscape'
import { Loader2, Share2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import type { EntityType, GraphResponse, RelationshipType } from '@/types'
import { EmptyState } from './EmptyState'

interface GraphPanelProps {
  data?: GraphResponse
  loading?: boolean
  onNodeSelect?: (nodeId: string | null) => void
}

// SOC palette, matched to tailwind.config.js — cytoscape needs literal hex
// values rather than Tailwind classes since styling happens in JS.
const nodeColors: Record<EntityType, string> = {
  alias: '#3B82F6', // accent
  wallet: '#F59E0B', // warning
  relay: '#EF4444', // danger
  pgp: '#22C55E', // success
  platform: '#9CA3AF', // text-secondary
}

const edgeColors: Record<RelationshipType, string> = {
  USES_WALLET: '#F59E0B',
  HAS_PGP: '#22C55E',
  POSTED_ON: '#3B82F6',
  CONNECTED_TO: '#6B7280',
}

/**
 * Container + mount point for the Cytoscape graph. Builds a fresh instance
 * whenever `data` changes, styles nodes by EntityType and edges by
 * RelationshipType using the SOC palette, and supports zoom/pan/drag plus
 * click-to-highlight-neighbors. The instance is destroyed on unmount / data
 * change to avoid leaking WebGL/canvas contexts.
 */
export function GraphPanel({ data, loading, onNodeSelect }: GraphPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  useEffect(() => {
    if (!containerRef.current || !data || data.nodes.length === 0) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...data.nodes.map((n) => ({
          data: { id: n.id, label: n.label, type: n.type, confidence: n.confidence },
        })),
        ...data.edges.map((e) => ({
          data: { id: e.id, source: e.source, target: e.target, type: e.type },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: NodeSingular) =>
              nodeColors[ele.data('type') as EntityType] ?? '#9CA3AF',
            label: 'data(label)',
            color: '#E5E7EB',
            'font-size': 10,
            'font-family': 'Inter, sans-serif',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: 26,
            height: 26,
            'border-width': 2,
            'border-color': '#111827',
            'transition-property': 'opacity, background-color, border-color',
            'transition-duration': 150,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': (ele) => edgeColors[ele.data('type') as RelationshipType] ?? '#6B7280',
            'target-arrow-color': (ele) =>
              edgeColors[ele.data('type') as RelationshipType] ?? '#6B7280',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.8,
            'curve-style': 'bezier',
            opacity: 0.6,
            'transition-property': 'opacity, width',
            'transition-duration': 150,
          },
        },
        {
          selector: '.faded',
          style: { opacity: 0.12 },
        },
        {
          selector: '.highlighted',
          style: {
            'border-color': '#E5E7EB',
            'border-width': 3,
            opacity: 1,
          },
        },
        {
          selector: 'edge.highlighted',
          style: { opacity: 1, width: 2.5 },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 30,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 90,
      },
      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.25,
    })

    function clearHighlight() {
      cy.elements().removeClass('faded highlighted')
    }

    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular
      const neighborhood = node.closedNeighborhood()
      cy.elements().addClass('faded')
      neighborhood.removeClass('faded').addClass('highlighted')
      onNodeSelect?.(node.id())
    })

    // Tapping empty canvas clears selection/highlighting.
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        clearHighlight()
        onNodeSelect?.(null)
      }
    })

    cyRef.current = cy

    return () => {
      cy.destroy()
      cyRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (loading) {
    return (
      <div className="card h-[520px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-text-muted">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-xs">Rendering graph…</p>
        </div>
      </div>
    )
  }

  if (!data || data.nodes.length === 0) {
    return (
      <EmptyState
        icon={Share2}
        title="No graph data"
        description="Select a cluster to visualize its entity relationships."
      />
    )
  }

  return (
    <div className="card h-[520px] overflow-hidden relative">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.25)}
          className="bg-surface border border-border rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors focus-ring"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
          className="bg-surface border border-border rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors focus-ring"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => cyRef.current?.fit(undefined, 30)}
          className="bg-surface border border-border rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors focus-ring"
          aria-label="Fit to view"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}
