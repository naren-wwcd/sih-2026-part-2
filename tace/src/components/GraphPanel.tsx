import { useEffect, useRef } from 'react'
import cytoscape, { type Core } from 'cytoscape'
import {
  Loader2,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react'
import type {
  EntityType,
  GraphResponse,
  RelationshipType,
} from '@/types'
import { EmptyState } from './EmptyState'

interface GraphPanelProps {
  data?: GraphResponse
  loading?: boolean
  onNodeSelect?: (nodeId: string | null) => void
}

// ============================================================
// SOC PALETTE
// ============================================================

const nodeColors: Record<EntityType, string> = {
  alias: '#3B82F6',
  wallet: '#F59E0B',
  relay: '#EF4444',
  pgp: '#22C55E',
  platform: '#9CA3AF',
}

const edgeColors: Record<RelationshipType, string> = {
  USES_WALLET: '#F59E0B',
  HAS_PGP: '#22C55E',
  POSTED_ON: '#3B82F6',
  CONNECTED_TO: '#6B7280',
}

// ============================================================
// BACKEND LABEL -> FRONTEND TYPE
// ============================================================

function getNodeType(label: string): EntityType {
  switch (label.toLowerCase()) {
    case 'alias':
      return 'alias'

    case 'wallet':
      return 'wallet'

    case 'relay':
      return 'relay'

    case 'pgp':
    case 'pgpkey':
      return 'pgp'

    case 'platform':
      return 'platform'

    default:
      return 'alias'
  }
}

// ============================================================
// DISPLAY LABEL
// ============================================================

function getDisplayLabel(
  label: string,
  id: string,
): string {
  if (label === 'Alias') {
    return id.replace('alias:', '')
  }

  if (label === 'Platform') {
    return id.replace('platform:', '')
  }

  if (label === 'Wallet') {
    return id.replace('wallet:', '')
  }

  if (label === 'Relay') {
    return id.replace('relay:', '')
  }

  if (label === 'PGPKey') {
    return id.replace('pgpkey:', '')
  }

  return label
}

// ============================================================
// GRAPH PANEL
// ============================================================

export function GraphPanel({
  data,
  loading,
  onNodeSelect,
}: GraphPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)

  // ==========================================================
  // CREATE GRAPH
  // ==========================================================

  useEffect(() => {
    if (
      !containerRef.current ||
      !data ||
      data.nodes.length === 0
    ) {
      return
    }

    // Destroy old graph
    if (cyRef.current) {
      cyRef.current.destroy()
      cyRef.current = null
    }

    // ========================================================
    // NODES
    // ========================================================

    const nodes = data.nodes.map((node) => {
      const type = getNodeType(node.label)

      return {
        data: {
          id: node.id,

          label: getDisplayLabel(
            node.label,
            node.id,
          ),

          type,

          confidence:
            node.confidence ?? 0,
        },
      }
    })

    // ========================================================
    // EDGES
    // ========================================================

    const edges = data.edges.map(
      (edge, index) => ({
        data: {
          id:
            edge.id ||
            `edge-${index}-${edge.source}-${edge.target}`,

          source: edge.source,

          target: edge.target,

          type: edge.type,
        },
      }),
    )

    // ========================================================
    // CYTOSCAPE
    // ========================================================

    const cy = cytoscape({
      container: containerRef.current,

      elements: [
        ...nodes,
        ...edges,
      ],

      // ======================================================
      // STYLE
      // ======================================================

      style: [
        // ----------------------------------------------------
        // DEFAULT NODE
        // ----------------------------------------------------

        {
          selector: 'node',

          style: {
            'background-color': '#9CA3AF',

            label: 'data(label)',

            color: '#E5E7EB',

            // Numeric values
            'font-size': 10,

            'font-family':
              'Inter, sans-serif',

            'text-valign': 'bottom',

            // Numeric value
            'text-margin-y': 6,

            // Numeric values
            width: 30,

            height: 30,

            'border-width': 2,

            'border-color': '#111827',

            'text-wrap': 'wrap',

            // String value
            'text-max-width': '100px',
          },
        },

        // ----------------------------------------------------
        // ALIAS
        // ----------------------------------------------------

        {
          selector:
            'node[type = "alias"]',

          style: {
            'background-color':
              nodeColors.alias,
          },
        },

        // ----------------------------------------------------
        // WALLET
        // ----------------------------------------------------

        {
          selector:
            'node[type = "wallet"]',

          style: {
            'background-color':
              nodeColors.wallet,
          },
        },

        // ----------------------------------------------------
        // RELAY
        // ----------------------------------------------------

        {
          selector:
            'node[type = "relay"]',

          style: {
            'background-color':
              nodeColors.relay,
          },
        },

        // ----------------------------------------------------
        // PGP
        // ----------------------------------------------------

        {
          selector:
            'node[type = "pgp"]',

          style: {
            'background-color':
              nodeColors.pgp,
          },
        },

        // ----------------------------------------------------
        // PLATFORM
        // ----------------------------------------------------

        {
          selector:
            'node[type = "platform"]',

          style: {
            'background-color':
              nodeColors.platform,
          },
        },

        // ====================================================
        // DEFAULT EDGE
        // ====================================================

        {
          selector: 'edge',

          style: {
            width: 1.5,

            'line-color':
              edgeColors.CONNECTED_TO,

            'target-arrow-color':
              edgeColors.CONNECTED_TO,

            'target-arrow-shape':
              'triangle',

            'arrow-scale': 0.8,

            'curve-style': 'bezier',

            opacity: 0.6,
          },
        },

        // ----------------------------------------------------
        // USES WALLET
        // ----------------------------------------------------

        {
          selector:
            'edge[type = "USES_WALLET"]',

          style: {
            'line-color':
              edgeColors.USES_WALLET,

            'target-arrow-color':
              edgeColors.USES_WALLET,
          },
        },

        // ----------------------------------------------------
        // HAS PGP
        // ----------------------------------------------------

        {
          selector:
            'edge[type = "HAS_PGP"]',

          style: {
            'line-color':
              edgeColors.HAS_PGP,

            'target-arrow-color':
              edgeColors.HAS_PGP,
          },
        },

        // ----------------------------------------------------
        // POSTED ON
        // ----------------------------------------------------

        {
          selector:
            'edge[type = "POSTED_ON"]',

          style: {
            'line-color':
              edgeColors.POSTED_ON,

            'target-arrow-color':
              edgeColors.POSTED_ON,
          },
        },

        // ----------------------------------------------------
        // CONNECTED TO
        // ----------------------------------------------------

        {
          selector:
            'edge[type = "CONNECTED_TO"]',

          style: {
            'line-color':
              edgeColors.CONNECTED_TO,

            'target-arrow-color':
              edgeColors.CONNECTED_TO,
          },
        },

        // ====================================================
        // FADED
        // ====================================================

        {
          selector: '.faded',

          style: {
            opacity: 0.12,
          },
        },

        // ====================================================
        // HIGHLIGHTED
        // ====================================================

        {
          selector: '.highlighted',

          style: {
            'border-color': '#E5E7EB',

            'border-width': 3,

            opacity: 1,
          },
        },

        // ====================================================
        // HIGHLIGHTED EDGE
        // ====================================================

        {
          selector:
            'edge.highlighted',

          style: {
            opacity: 1,

            width: 2.5,
          },
        },
      ],

      // ======================================================
      // LAYOUT
      // ======================================================

      layout: {
        name: 'cose',

        animate: false,

        padding: 40,

        nodeRepulsion: 8000,

        idealEdgeLength: 100,
      },

      // ======================================================
      // ZOOM
      // ======================================================

      minZoom: 0.2,

      maxZoom: 3,

      wheelSensitivity: 0.25,
    })

    // ========================================================
    // CLEAR HIGHLIGHT
    // ========================================================

    function clearHighlight() {
      cy.elements().removeClass(
        'faded highlighted',
      )
    }

    // ========================================================
    // NODE CLICK
    // ========================================================

    cy.on(
      'tap',
      'node',
      (event) => {
        const node = event.target

        const neighborhood =
          node.closedNeighborhood()

        // Fade everything
        cy.elements().addClass('faded')

        // Highlight selected node
        // and connected nodes/edges
        neighborhood
          .removeClass('faded')
          .addClass('highlighted')

        onNodeSelect?.(node.id())
      },
    )

    // ========================================================
    // EMPTY CANVAS CLICK
    // ========================================================

    cy.on(
      'tap',
      (event) => {
        if (event.target === cy) {
          clearHighlight()

          onNodeSelect?.(null)
        }
      },
    )

    // ========================================================
    // SAVE INSTANCE
    // ========================================================

    cyRef.current = cy

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      cy.destroy()
      cyRef.current = null
    }

    // onNodeSelect intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="card h-[520px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-text-muted">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <p className="text-xs">
            Rendering graph…
          </p>
        </div>
      </div>
    )
  }

  // ==========================================================
  // EMPTY
  // ==========================================================

  if (
    !data ||
    data.nodes.length === 0
  ) {
    return (
      <EmptyState
        icon={Share2}
        title="No graph data"
        description="Select a cluster to visualize its entity relationships."
      />
    )
  }

  // ==========================================================
  // GRAPH
  // ==========================================================

  return (
    <div className="card h-[520px] overflow-hidden relative">

      {/* ====================================================
          CYTOSCAPE CONTAINER
          ==================================================== */}

      <div
        ref={containerRef}
        className="w-full h-full"
      />

      {/* ====================================================
          GRAPH CONTROLS
          ==================================================== */}

      <div className="absolute top-3 right-3 flex flex-col gap-1">

        {/* --------------------------------------------------
            ZOOM IN
            -------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {
            if (!cyRef.current) {
              return
            }

            const currentZoom =
              cyRef.current.zoom()

            cyRef.current.zoom(
              Math.min(
                currentZoom * 1.25,
                3,
              ),
            )
          }}
          className="bg-surface border border-border rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors focus-ring"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>

        {/* --------------------------------------------------
            ZOOM OUT
            -------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {
            if (!cyRef.current) {
              return
            }

            const currentZoom =
              cyRef.current.zoom()

            cyRef.current.zoom(
              Math.max(
                currentZoom * 0.8,
                0.2,
              ),
            )
          }}
          className="bg-surface border border-border rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors focus-ring"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>

        {/* --------------------------------------------------
            FIT GRAPH
            -------------------------------------------------- */}

        <button
          type="button"
          onClick={() => {
            cyRef.current?.fit(
              undefined,
              30,
            )
          }}
          className="bg-surface border border-border rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors focus-ring"
          aria-label="Fit to view"
          title="Fit to view"
        >
          <Maximize2 size={14} />
        </button>

      </div>
    </div>
  )
}