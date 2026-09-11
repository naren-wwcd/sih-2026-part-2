import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Share2,
  UserRound,
  Wallet,
  Radio,
  Fingerprint,
  Globe2,
  Server,
  X,
} from 'lucide-react'
import clsx from 'clsx'

type EntityType =
  | 'alias'
  | 'wallet'
  | 'relay'
  | 'pgp'
  | 'platform'
  | 'server'

type GraphNode = {
  id: string
  label: string
  type: EntityType
  confidence?: number
  x: number
  y: number
}

type GraphEdge = {
  id: string
  source: string
  target: string
  type: string
  weight?: number
}

type DemoCluster = {
  id: number
  label: string
  confidence: number
  nodes: GraphNode[]
  edges: GraphEdge[]
}

const entityIcon: Record<EntityType, typeof UserRound> = {
  alias: UserRound,
  wallet: Wallet,
  relay: Radio,
  pgp: Fingerprint,
  platform: Globe2,
  server: Server,
}

const entityTone: Record<EntityType, string> = {
  alias: 'text-accent bg-accent-muted/30',
  wallet: 'text-warning bg-warning-muted/40',
  relay: 'text-danger bg-danger-muted/40',
  pgp: 'text-success bg-success-muted/40',
  platform: 'text-text-secondary bg-white/5',
  server: 'text-purple-400 bg-purple-500/10',
}

const nodeFill: Record<EntityType, string> = {
  alias: '#111827',
  wallet: '#1c1917',
  relay: '#1f1720',
  pgp: '#102019',
  platform: '#18181b',
  server: '#171426',
}

const edgeLabels: Record<string, string> = {
  CONNECTED_TO: 'Connected To',
  USES_WALLET: 'Uses Wallet',
  HAS_PGP: 'Has PGP',
  POSTED_ON: 'Posted On',
  HOSTED_ON: 'Hosted On',
  ROUTED_THROUGH: 'Routed Through',
}

function makeEdge(
  id: string,
  source: string,
  target: string,
  type: string,
  weight = 1,
): GraphEdge {
  return {
    id,
    source,
    target,
    type,
    weight,
  }
}

/* ========================================================================
   DEMO CLUSTERS
   ======================================================================== */

const clusters: DemoCluster[] = [
  /* ======================================================================
     CLUSTER 1
     ====================================================================== */
  {
    id: 1,
    label: 'Alpha Threat Actor',
    confidence: 91,

    nodes: [
      {
        id: 'a1',
        label: '0x4m4',
        type: 'alias',
        confidence: 94,
        x: 130,
        y: 190,
      },
      {
        id: 'a2',
        label: '0x4143',
        type: 'alias',
        confidence: 91,
        x: 300,
        y: 100,
      },
      {
        id: 'a3',
        label: 'alpha_ops',
        type: 'alias',
        confidence: 87,
        x: 310,
        y: 280,
      },
      {
        id: 'a4',
        label: 'darkalpha',
        type: 'alias',
        confidence: 83,
        x: 470,
        y: 190,
      },

      {
        id: 'w1',
        label: 'Wallet 0x7F3A',
        type: 'wallet',
        x: 450,
        y: 70,
      },
      {
        id: 'w2',
        label: 'Wallet 0x91BC',
        type: 'wallet',
        x: 570,
        y: 310,
      },

      {
        id: 'p1',
        label: 'PGP 7A91',
        type: 'pgp',
        x: 680,
        y: 80,
      },
      {
        id: 'p2',
        label: 'PGP 4F82',
        type: 'pgp',
        x: 220,
        y: 390,
      },
      {
        id: 'p3',
        label: 'PGP A712',
        type: 'pgp',
        x: 520,
        y: 410,
      },

      {
        id: 'r1',
        label: 'Relay A91F',
        type: 'relay',
        x: 700,
        y: 200,
      },

      {
        id: 'g1',
        label: 'GitHub',
        type: 'platform',
        x: 80,
        y: 360,
      },

      {
        id: 's1',
        label: 'C2 Server',
        type: 'server',
        x: 820,
        y: 300,
      },
    ],

    edges: [
      makeEdge('a-e1', 'a1', 'a2', 'CONNECTED_TO', 0.91),
      makeEdge('a-e2', 'a1', 'a3', 'CONNECTED_TO', 0.78),
      makeEdge('a-e3', 'a2', 'a3', 'CONNECTED_TO', 0.84),
      makeEdge('a-e4', 'a2', 'a4', 'CONNECTED_TO', 0.73),
      makeEdge('a-e5', 'a3', 'a4', 'CONNECTED_TO', 0.81),

      makeEdge('a-e6', 'a1', 'w1', 'USES_WALLET', 0.89),
      makeEdge('a-e7', 'a2', 'w1', 'USES_WALLET', 0.94),
      makeEdge('a-e8', 'a3', 'w2', 'USES_WALLET', 0.76),
      makeEdge('a-e9', 'a4', 'w2', 'USES_WALLET', 0.88),
      makeEdge('a-e10', 'a2', 'w2', 'USES_WALLET', 0.68),

      makeEdge('a-e11', 'a3', 'p1', 'HAS_PGP', 0.82),
      makeEdge('a-e12', 'a4', 'p1', 'HAS_PGP', 0.91),

      makeEdge('a-e13', 'a1', 'p2', 'HAS_PGP', 0.86),
      makeEdge('a-e14', 'a3', 'p2', 'HAS_PGP', 0.79),

      makeEdge('a-e15', 'a2', 'p3', 'HAS_PGP', 0.82),
      makeEdge('a-e16', 'a4', 'p3', 'HAS_PGP', 0.88),

      makeEdge('a-e17', 'a1', 'g1', 'POSTED_ON', 0.72),
      makeEdge('a-e18', 'a2', 'g1', 'POSTED_ON', 0.83),

      makeEdge('a-e19', 'w1', 'r1', 'ROUTED_THROUGH', 0.69),
      makeEdge('a-e20', 'w2', 'r1', 'ROUTED_THROUGH', 0.77),

      makeEdge('a-e21', 'r1', 's1', 'HOSTED_ON', 0.86),
      makeEdge('a-e22', 'a4', 's1', 'CONNECTED_TO', 0.71),
    ],
  },

  /* ======================================================================
     CLUSTER 2
     ====================================================================== */
  {
    id: 2,
    label: 'Night Raven',
    confidence: 84,

    nodes: [
      {
        id: 'b1',
        label: 'raven_x',
        type: 'alias',
        confidence: 88,
        x: 130,
        y: 190,
      },
      {
        id: 'b2',
        label: 'nightowl',
        type: 'alias',
        confidence: 84,
        x: 300,
        y: 100,
      },
      {
        id: 'b3',
        label: 'raven_77',
        type: 'alias',
        confidence: 81,
        x: 310,
        y: 280,
      },
      {
        id: 'b4',
        label: 'nraven',
        type: 'alias',
        confidence: 79,
        x: 470,
        y: 190,
      },

      {
        id: 'bw1',
        label: 'Wallet 0xAA21',
        type: 'wallet',
        x: 450,
        y: 70,
      },
      {
        id: 'bw2',
        label: 'Wallet 0xBC91',
        type: 'wallet',
        x: 570,
        y: 310,
      },

      {
        id: 'bp1',
        label: 'PGP 91AA',
        type: 'pgp',
        x: 680,
        y: 80,
      },
      {
        id: 'bp2',
        label: 'PGP 4B72',
        type: 'pgp',
        x: 220,
        y: 390,
      },
      {
        id: 'bp3',
        label: 'PGP C812',
        type: 'pgp',
        x: 520,
        y: 410,
      },

      {
        id: 'br1',
        label: 'Relay 91BC',
        type: 'relay',
        x: 700,
        y: 200,
      },

      {
        id: 'bg1',
        label: 'Reddit',
        type: 'platform',
        x: 80,
        y: 360,
      },
    ],

    edges: [
      makeEdge('b-e1', 'b1', 'b2', 'CONNECTED_TO', 0.86),
      makeEdge('b-e2', 'b1', 'b3', 'CONNECTED_TO', 0.75),
      makeEdge('b-e3', 'b2', 'b3', 'CONNECTED_TO', 0.82),
      makeEdge('b-e4', 'b2', 'b4', 'CONNECTED_TO', 0.79),
      makeEdge('b-e5', 'b3', 'b4', 'CONNECTED_TO', 0.72),

      makeEdge('b-e6', 'b1', 'bw1', 'USES_WALLET', 0.81),
      makeEdge('b-e7', 'b2', 'bw1', 'USES_WALLET', 0.91),
      makeEdge('b-e8', 'b3', 'bw2', 'USES_WALLET', 0.76),
      makeEdge('b-e9', 'b4', 'bw2', 'USES_WALLET', 0.84),

      makeEdge('b-e10', 'b2', 'bp1', 'HAS_PGP', 0.89),
      makeEdge('b-e11', 'b4', 'bp1', 'HAS_PGP', 0.78),

      makeEdge('b-e12', 'b1', 'bp2', 'HAS_PGP', 0.77),
      makeEdge('b-e13', 'b3', 'bp2', 'HAS_PGP', 0.74),

      makeEdge('b-e14', 'b2', 'bp3', 'HAS_PGP', 0.81),
      makeEdge('b-e15', 'b4', 'bp3', 'HAS_PGP', 0.76),

      makeEdge('b-e16', 'b1', 'bg1', 'POSTED_ON', 0.83),
      makeEdge('b-e17', 'b3', 'bg1', 'POSTED_ON', 0.74),

      makeEdge('b-e18', 'bw1', 'br1', 'ROUTED_THROUGH', 0.71),
      makeEdge('b-e19', 'bw2', 'br1', 'ROUTED_THROUGH', 0.69),

      makeEdge('b-e20', 'b4', 'br1', 'CONNECTED_TO', 0.65),
    ],
  },

  /* ======================================================================
     CLUSTER 3
     ====================================================================== */
  {
    id: 3,
    label: 'Crimson Hydra',
    confidence: 76,

    nodes: [
      {
        id: 'c1',
        label: 'hydra_red',
        type: 'alias',
        confidence: 81,
        x: 120,
        y: 190,
      },
      {
        id: 'c2',
        label: 'crimson01',
        type: 'alias',
        confidence: 77,
        x: 280,
        y: 90,
      },
      {
        id: 'c3',
        label: 'hydra_dev',
        type: 'alias',
        confidence: 74,
        x: 300,
        y: 280,
      },
      {
        id: 'c4',
        label: 'redhydra',
        type: 'alias',
        confidence: 71,
        x: 460,
        y: 190,
      },
      {
        id: 'c5',
        label: 'hydra_admin',
        type: 'alias',
        confidence: 68,
        x: 620,
        y: 100,
      },

      {
        id: 'cw1',
        label: 'Wallet 0xCC41',
        type: 'wallet',
        x: 500,
        y: 330,
      },
      {
        id: 'cw2',
        label: 'Wallet 0xDD72',
        type: 'wallet',
        x: 680,
        y: 280,
      },

      {
        id: 'cp1',
        label: 'PGP C91D',
        type: 'pgp',
        x: 690,
        y: 390,
      },
      {
        id: 'cp2',
        label: 'PGP 33AF',
        type: 'pgp',
        x: 220,
        y: 400,
      },
      {
        id: 'cp3',
        label: 'PGP D991',
        type: 'pgp',
        x: 500,
        y: 430,
      },

      {
        id: 'cr1',
        label: 'Relay C442',
        type: 'relay',
        x: 800,
        y: 160,
      },

      {
        id: 'cg1',
        label: 'GitHub',
        type: 'platform',
        x: 70,
        y: 350,
      },
    ],

    edges: [
      makeEdge('c-e1', 'c1', 'c2', 'CONNECTED_TO', 0.78),
      makeEdge('c-e2', 'c1', 'c3', 'CONNECTED_TO', 0.81),
      makeEdge('c-e3', 'c2', 'c3', 'CONNECTED_TO', 0.73),
      makeEdge('c-e4', 'c2', 'c4', 'CONNECTED_TO', 0.76),
      makeEdge('c-e5', 'c3', 'c4', 'CONNECTED_TO', 0.70),
      makeEdge('c-e6', 'c4', 'c5', 'CONNECTED_TO', 0.67),
      makeEdge('c-e7', 'c2', 'c5', 'CONNECTED_TO', 0.64),

      makeEdge('c-e8', 'c1', 'cw1', 'USES_WALLET', 0.72),
      makeEdge('c-e9', 'c3', 'cw1', 'USES_WALLET', 0.84),
      makeEdge('c-e10', 'c4', 'cw2', 'USES_WALLET', 0.79),
      makeEdge('c-e11', 'c5', 'cw2', 'USES_WALLET', 0.81),

      makeEdge('c-e12', 'c3', 'cp1', 'HAS_PGP', 0.75),
      makeEdge('c-e13', 'c5', 'cp1', 'HAS_PGP', 0.68),

      makeEdge('c-e14', 'c1', 'cp2', 'HAS_PGP', 0.70),
      makeEdge('c-e15', 'c2', 'cp2', 'HAS_PGP', 0.76),

      makeEdge('c-e16', 'c4', 'cp3', 'HAS_PGP', 0.72),
      makeEdge('c-e17', 'c5', 'cp3', 'HAS_PGP', 0.69),

      makeEdge('c-e18', 'c1', 'cg1', 'POSTED_ON', 0.71),
      makeEdge('c-e19', 'c2', 'cg1', 'POSTED_ON', 0.79),

      makeEdge('c-e20', 'cw1', 'cr1', 'ROUTED_THROUGH', 0.73),
      makeEdge('c-e21', 'cw2', 'cr1', 'ROUTED_THROUGH', 0.77),

      makeEdge('c-e22', 'c5', 'cr1', 'CONNECTED_TO', 0.65),
    ],
  },

  /* ======================================================================
     CLUSTER 4
     ====================================================================== */
  {
    id: 4,
    label: 'Black Lotus',
    confidence: 68,

    nodes: [
      {
        id: 'd1',
        label: 'lotus_black',
        type: 'alias',
        confidence: 72,
        x: 130,
        y: 190,
      },
      {
        id: 'd2',
        label: 'lotus_x',
        type: 'alias',
        confidence: 69,
        x: 300,
        y: 100,
      },
      {
        id: 'd3',
        label: 'blackroot',
        type: 'alias',
        confidence: 65,
        x: 310,
        y: 280,
      },
      {
        id: 'd4',
        label: 'lotus_dev',
        type: 'alias',
        confidence: 61,
        x: 470,
        y: 190,
      },

      {
        id: 'dw1',
        label: 'Wallet 0xEE11',
        type: 'wallet',
        x: 450,
        y: 70,
      },
      {
        id: 'dw2',
        label: 'Wallet 0xFF82',
        type: 'wallet',
        x: 570,
        y: 310,
      },

      {
        id: 'dp1',
        label: 'PGP B771',
        type: 'pgp',
        x: 690,
        y: 80,
      },
      {
        id: 'dp2',
        label: 'PGP 81CC',
        type: 'pgp',
        x: 220,
        y: 400,
      },
      {
        id: 'dp3',
        label: 'PGP E442',
        type: 'pgp',
        x: 520,
        y: 420,
      },

      {
        id: 'dr1',
        label: 'Relay F812',
        type: 'relay',
        x: 750,
        y: 180,
      },

      {
        id: 'dg1',
        label: 'Forum',
        type: 'platform',
        x: 80,
        y: 360,
      },
    ],

    edges: [
      makeEdge('d-e1', 'd1', 'd2', 'CONNECTED_TO', 0.71),
      makeEdge('d-e2', 'd1', 'd3', 'CONNECTED_TO', 0.68),
      makeEdge('d-e3', 'd2', 'd3', 'CONNECTED_TO', 0.73),
      makeEdge('d-e4', 'd2', 'd4', 'CONNECTED_TO', 0.66),
      makeEdge('d-e5', 'd3', 'd4', 'CONNECTED_TO', 0.64),

      makeEdge('d-e6', 'd1', 'dw1', 'USES_WALLET', 0.69),
      makeEdge('d-e7', 'd2', 'dw1', 'USES_WALLET', 0.74),
      makeEdge('d-e8', 'd3', 'dw2', 'USES_WALLET', 0.67),
      makeEdge('d-e9', 'd4', 'dw2', 'USES_WALLET', 0.71),

      makeEdge('d-e10', 'd2', 'dp1', 'HAS_PGP', 0.68),
      makeEdge('d-e11', 'd4', 'dp1', 'HAS_PGP', 0.63),

      makeEdge('d-e12', 'd1', 'dp2', 'HAS_PGP', 0.65),
      makeEdge('d-e13', 'd3', 'dp2', 'HAS_PGP', 0.61),

      makeEdge('d-e14', 'd2', 'dp3', 'HAS_PGP', 0.70),
      makeEdge('d-e15', 'd4', 'dp3', 'HAS_PGP', 0.66),

      makeEdge('d-e16', 'd1', 'dg1', 'POSTED_ON', 0.72),
      makeEdge('d-e17', 'd3', 'dg1', 'POSTED_ON', 0.66),

      makeEdge('d-e18', 'dw1', 'dr1', 'ROUTED_THROUGH', 0.62),
      makeEdge('d-e19', 'dw2', 'dr1', 'ROUTED_THROUGH', 0.69),

      makeEdge('d-e20', 'd4', 'dr1', 'CONNECTED_TO', 0.60),
    ],
  },

  /* ======================================================================
     CLUSTER 5
     ====================================================================== */
  {
    id: 5,
    label: 'Ghost Protocol',
    confidence: 62,

    nodes: [
      {
        id: 'f1',
        label: 'ghost_x',
        type: 'alias',
        confidence: 68,
        x: 110,
        y: 190,
      },
      {
        id: 'f2',
        label: 'phantom_9',
        type: 'alias',
        confidence: 65,
        x: 280,
        y: 90,
      },
      {
        id: 'f3',
        label: 'ghost_ops',
        type: 'alias',
        confidence: 62,
        x: 290,
        y: 280,
      },
      {
        id: 'f4',
        label: 'protocol_0',
        type: 'alias',
        confidence: 59,
        x: 460,
        y: 190,
      },
      {
        id: 'f5',
        label: 'shadowghost',
        type: 'alias',
        confidence: 57,
        x: 620,
        y: 100,
      },

      {
        id: 'fw1',
        label: 'Wallet 0x1212',
        type: 'wallet',
        x: 470,
        y: 330,
      },
      {
        id: 'fw2',
        label: 'Wallet 0x3434',
        type: 'wallet',
        x: 670,
        y: 290,
      },

      {
        id: 'fp1',
        label: 'PGP G721',
        type: 'pgp',
        x: 720,
        y: 390,
      },
      {
        id: 'fp2',
        label: 'PGP 22AC',
        type: 'pgp',
        x: 200,
        y: 400,
      },
      {
        id: 'fp3',
        label: 'PGP 91EF',
        type: 'pgp',
        x: 500,
        y: 430,
      },
      {
        id: 'fp4',
        label: 'PGP 77BD',
        type: 'pgp',
        x: 700,
        y: 450,
      },

      {
        id: 'fr1',
        label: 'Relay 12AF',
        type: 'relay',
        x: 800,
        y: 170,
      },

      {
        id: 'fg1',
        label: 'GitHub',
        type: 'platform',
        x: 70,
        y: 350,
      },

      {
        id: 'fs1',
        label: 'C2 Server',
        type: 'server',
        x: 850,
        y: 280,
      },
    ],

    edges: [
      makeEdge('f-e1', 'f1', 'f2', 'CONNECTED_TO', 0.65),
      makeEdge('f-e2', 'f1', 'f3', 'CONNECTED_TO', 0.61),
      makeEdge('f-e3', 'f2', 'f3', 'CONNECTED_TO', 0.68),
      makeEdge('f-e4', 'f2', 'f4', 'CONNECTED_TO', 0.64),
      makeEdge('f-e5', 'f3', 'f4', 'CONNECTED_TO', 0.59),
      makeEdge('f-e6', 'f4', 'f5', 'CONNECTED_TO', 0.57),
      makeEdge('f-e7', 'f2', 'f5', 'CONNECTED_TO', 0.55),

      makeEdge('f-e8', 'f1', 'fw1', 'USES_WALLET', 0.63),
      makeEdge('f-e9', 'f3', 'fw1', 'USES_WALLET', 0.67),
      makeEdge('f-e10', 'f4', 'fw2', 'USES_WALLET', 0.61),
      makeEdge('f-e11', 'f5', 'fw2', 'USES_WALLET', 0.66),

      makeEdge('f-e12', 'f3', 'fp1', 'HAS_PGP', 0.60),
      makeEdge('f-e13', 'f5', 'fp1', 'HAS_PGP', 0.58),

      makeEdge('f-e14', 'f1', 'fp2', 'HAS_PGP', 0.59),
      makeEdge('f-e15', 'f3', 'fp2', 'HAS_PGP', 0.63),

      makeEdge('f-e16', 'f2', 'fp3', 'HAS_PGP', 0.61),
      makeEdge('f-e17', 'f4', 'fp3', 'HAS_PGP', 0.57),

      makeEdge('f-e18', 'f4', 'fp4', 'HAS_PGP', 0.55),
      makeEdge('f-e19', 'f5', 'fp4', 'HAS_PGP', 0.60),

      makeEdge('f-e20', 'f1', 'fg1', 'POSTED_ON', 0.64),
      makeEdge('f-e21', 'f4', 'fg1', 'POSTED_ON', 0.56),

      makeEdge('f-e22', 'fw1', 'fr1', 'ROUTED_THROUGH', 0.58),
      makeEdge('f-e23', 'fw2', 'fr1', 'ROUTED_THROUGH', 0.62),

      makeEdge('f-e24', 'fr1', 'fs1', 'HOSTED_ON', 0.67),
      makeEdge('f-e25', 'f5', 'fs1', 'CONNECTED_TO', 0.55),
    ],
  },
]

/* ========================================================================
   HELPERS
   ======================================================================== */

function getInitialCluster(clusterId?: string) {
  const id = Number(clusterId)

  return (
    clusters.find((cluster) => cluster.id === id) ??
    clusters[0]
  )
}

/* ========================================================================
   COMPONENT
   ======================================================================== */

export default function GraphView() {
  const { clusterId } = useParams()
  const navigate = useNavigate()

  const currentCluster = getInitialCluster(clusterId)

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null)

  const selectedNode = useMemo(
    () =>
      currentCluster.nodes.find(
        (node) => node.id === selectedNodeId,
      ) ?? null,
    [currentCluster, selectedNodeId],
  )

  const connectedEdges = useMemo(() => {
    if (!selectedNodeId) return []

    return currentCluster.edges.filter(
      (edge) =>
        edge.source === selectedNodeId ||
        edge.target === selectedNodeId,
    )
  }, [currentCluster, selectedNodeId])

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>()

    if (!selectedNodeId) {
      return ids
    }

    connectedEdges.forEach((edge) => {
      ids.add(edge.source)
      ids.add(edge.target)
    })

    return ids
  }, [connectedEdges, selectedNodeId])

  function selectCluster(id: string) {
    setSelectedNodeId(null)

    navigate(
      `/graph/${encodeURIComponent(id)}`,
    )
  }

  function getNode(id: string) {
    return currentCluster.nodes.find(
      (node) => node.id === id,
    )
  }

  return (
    <div className="space-y-4">
      {/* ================================================================
          HEADER
          ================================================================ */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">
            Interactive Threat Graph
          </h1>

          <p className="text-sm text-text-secondary mt-0.5">
            Explore aliases, wallets, PGP identities,
            infrastructure and correlation evidence.
          </p>
        </div>

        <select
          value={currentCluster.id}
          onChange={(e) =>
            selectCluster(e.target.value)
          }
          className="w-full sm:w-72 bg-surface border border-border rounded-md text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
        >
          {clusters.map((cluster) => (
            <option
              key={cluster.id}
              value={cluster.id}
            >
              {cluster.label} — {cluster.confidence}%
            </option>
          ))}
        </select>
      </div>

      {/* ================================================================
          SUMMARY
          ================================================================ */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3">
          <p className="text-xs text-text-muted">
            Cluster
          </p>

          <p className="text-sm font-semibold mt-1">
            {currentCluster.label}
          </p>
        </div>

        <div className="card p-3">
          <p className="text-xs text-text-muted">
            Confidence
          </p>

          <p className="text-sm font-semibold mono-num mt-1">
            {currentCluster.confidence}%
          </p>
        </div>

        <div className="card p-3">
          <p className="text-xs text-text-muted">
            Entities
          </p>

          <p className="text-sm font-semibold mono-num mt-1">
            {currentCluster.nodes.length}
          </p>
        </div>

        <div className="card p-3">
          <p className="text-xs text-text-muted">
            Relationships
          </p>

          <p className="text-sm font-semibold mono-num mt-1">
            {currentCluster.edges.length}
          </p>
        </div>
      </div>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ==============================================================
            GRAPH
            ============================================================== */}

        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="card-header">
              <div>
                <h2 className="text-sm font-medium">
                  {currentCluster.label}
                </h2>

                <p className="text-xs text-text-muted mt-0.5">
                  {currentCluster.nodes.length} entities
                  {' · '}
                  {currentCluster.edges.length}{' '}
                  relationships
                </p>
              </div>

              {selectedNode && (
                <button
                  onClick={() =>
                    setSelectedNodeId(null)
                  }
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  Clear selection
                </button>
              )}
            </div>

            <div className="relative bg-[#070b12]">
              <svg
                viewBox="0 0 950 500"
                className="w-full h-[540px]"
              >
                {/* ======================================================
                    GRID
                    ====================================================== */}

                <defs>
                  <pattern
                    id="graph-grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth="0.5"
                      opacity="0.35"
                    />
                  </pattern>
                </defs>

                <rect
                  width="950"
                  height="500"
                  fill="url(#graph-grid)"
                />

                {/* ======================================================
                    EDGES
                    ====================================================== */}

                {currentCluster.edges.map(
                  (edge) => {
                    const source = getNode(
                      edge.source,
                    )

                    const target = getNode(
                      edge.target,
                    )

                    if (!source || !target) {
                      return null
                    }

                    const active =
                      !selectedNodeId ||
                      edge.source ===
                        selectedNodeId ||
                      edge.target ===
                        selectedNodeId

                    return (
                      <g key={edge.id}>
                        <line
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={
                            active
                              ? '#64748b'
                              : '#334155'
                          }
                          strokeWidth={
                            active
                              ? 1.5 +
                                (edge.weight ??
                                  1) *
                                  1.5
                              : 1
                          }
                          opacity={
                            active ? 0.85 : 0.12
                          }
                        />

                        {active && (
                          <text
                            x={
                              (source.x +
                                target.x) /
                              2
                            }
                            y={
                              (source.y +
                                target.y) /
                                2 -
                              6
                            }
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="8"
                            pointerEvents="none"
                          >
                            {edgeLabels[
                              edge.type
                            ] ?? edge.type}
                          </text>
                        )}
                      </g>
                    )
                  },
                )}

                {/* ======================================================
                    NODES
                    ====================================================== */}

                {currentCluster.nodes.map(
                  (node) => {
                    const Icon =
                      entityIcon[node.type]

                    const selected =
                      selectedNodeId ===
                      node.id

                    const connected =
                      connectedNodeIds.has(
                        node.id,
                      )

                    const faded =
                      !!selectedNodeId &&
                      !selected &&
                      !connected

                    return (
                      <g
                        key={node.id}
                        onClick={() =>
                          setSelectedNodeId(
                            node.id,
                          )
                        }
                        className="cursor-pointer"
                        opacity={
                          faded ? 0.2 : 1
                        }
                      >
                        {/* Selection ring */}
                        {selected && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="34"
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="2"
                            opacity="0.8"
                          />
                        )}

                        {/* Connected ring */}
                        {!selected &&
                          selectedNodeId &&
                          connected && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r="29"
                              fill="none"
                              stroke="#475569"
                              strokeWidth="1"
                              opacity="0.8"
                            />
                          )}

                        {/* Main node */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="25"
                          fill={
                            nodeFill[
                              node.type
                            ]
                          }
                          stroke={
                            selected
                              ? '#60a5fa'
                              : '#475569'
                          }
                          strokeWidth={
                            selected
                              ? 2.5
                              : 1.5
                          }
                        />

                        {/* Icon */}
                        <foreignObject
                          x={node.x - 10}
                          y={node.y - 10}
                          width="20"
                          height="20"
                          pointerEvents="none"
                        >
                          <div className="flex items-center justify-center w-full h-full">
                            <Icon
                              size={15}
                              className={
                                entityTone[
                                  node.type
                                ].split(
                                  ' ',
                                )[0]
                              }
                            />
                          </div>
                        </foreignObject>

                        {/* Name */}
                        <text
                          x={node.x}
                          y={node.y + 42}
                          textAnchor="middle"
                          fill="#e5e7eb"
                          fontSize="11"
                          fontWeight="500"
                        >
                          {node.label}
                        </text>

                        {/* Confidence */}
                        {typeof node.confidence ===
                          'number' && (
                          <text
                            x={node.x}
                            y={node.y + 55}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="9"
                          >
                            {node.confidence}%
                          </text>
                        )}
                      </g>
                    )
                  },
                )}
              </svg>

              {/* Graph helper */}
              <div className="absolute bottom-3 left-3 px-3 py-2 rounded-md bg-black/60 border border-border/50 backdrop-blur">
                <p className="text-xs text-text-muted">
                  Click any entity to highlight
                  its network
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================
              LEGEND
              ============================================================ */}

          <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-text-muted">
            <span className="font-medium text-text-secondary">
              Legend:
            </span>

            {(
              Object.keys(
                entityIcon,
              ) as EntityType[]
            ).map((type) => {
              const Icon =
                entityIcon[type]

              return (
                <span
                  key={type}
                  className="flex items-center gap-1.5 capitalize"
                >
                  <span
                    className={clsx(
                      'rounded-full p-1',
                      entityTone[type],
                    )}
                  >
                    <Icon size={10} />
                  </span>

                  {type}
                </span>
              )
            })}
          </div>
        </div>

        {/* ==============================================================
            ENTITY DETAILS
            ============================================================== */}

        <div className="lg:col-span-1">
          {selectedNode ? (
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-medium">
                  Entity Details
                </h3>

                <button
                  onClick={() =>
                    setSelectedNodeId(null)
                  }
                  className="text-text-muted hover:text-text-primary"
                  aria-label="Close details"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Entity */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={clsx(
                      'rounded-md p-2',
                      entityTone[
                        selectedNode.type
                      ],
                    )}
                  >
                    {(() => {
                      const Icon =
                        entityIcon[
                          selectedNode.type
                        ]

                      return (
                        <Icon size={16} />
                      )
                    })()}
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedNode.label}
                    </p>

                    <p className="text-xs text-text-muted capitalize">
                      {selectedNode.type}
                    </p>
                  </div>
                </div>

                {/* Confidence */}
                {typeof selectedNode.confidence ===
                  'number' && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">
                      Confidence
                    </p>

                    <p className="text-sm font-semibold mono-num">
                      {selectedNode.confidence}%
                    </p>
                  </div>
                )}

                {/* Connections */}
                <div>
                  <p className="text-xs text-text-muted mb-2">
                    Connections (
                    {connectedEdges.length})
                  </p>

                  {connectedEdges.length ===
                  0 ? (
                    <p className="text-xs text-text-muted">
                      No connections.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {connectedEdges.map(
                        (edge) => {
                          const otherId =
                            edge.source ===
                            selectedNode.id
                              ? edge.target
                              : edge.source

                          const otherNode =
                            getNode(otherId)

                          if (!otherNode) {
                            return null
                          }

                          return (
                            <li
                              key={edge.id}
                              className="border-b border-border last:border-0 pb-2"
                            >
                              <p className="text-[11px] text-text-muted">
                                {edgeLabels[
                                  edge.type
                                ] ??
                                  edge.type}
                              </p>

                              <p className="text-xs text-text-primary font-medium mt-0.5">
                                {
                                  otherNode.label
                                }
                              </p>

                              {typeof edge.weight ===
                                'number' && (
                                <p className="text-[10px] text-text-muted mt-0.5">
                                  Evidence
                                  weight:{' '}
                                  {Math.round(
                                    edge.weight *
                                      100,
                                  )}
                                  %
                                </p>
                              )}
                            </li>
                          )
                        },
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <Share2
                size={28}
                className="mx-auto text-text-muted mb-3"
              />

              <h3 className="text-sm font-medium">
                No entity selected
              </h3>

              <p className="text-xs text-text-muted mt-1">
                Click an entity in the graph to
                inspect its relationships.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}