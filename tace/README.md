# TACE — Threat Actor Correlation Engine (Frontend)

Dark SOC-style analyst frontend for the TACE FastAPI backend.

## Status: All phases (1–9) complete

**Phase 1 — Foundation**: Vite + React 18 + TypeScript scaffold, Tailwind theme
with the SOC color tokens, folder structure, React Router shell, TanStack Query
setup, typed API service layer (`src/services`), domain types (`src/types`),
app layout (Sidebar + TopNavbar), toast system, keyboard shortcuts.

**Phase 2 — Shared components**: StatCard, HealthBadge, LoadingSkeleton,
ErrorBanner, EmptyState, SearchBar, JobTable, EvidenceCard, TimelineCard,
GraphPanel (shell — Cytoscape logic lands in Phase 6).

**Phase 3 — Dashboard** (`src/pages/Dashboard.tsx`): stat cards (Total
Clusters, High Confidence Clusters, Wallets Collected, Tor Relays Indexed,
GitHub Profiles, Reddit Posts) derived from `useClusters()`, a system health
panel per service from `useHealth()`, a compact recent-jobs table from
`useJobs()`, and Quick Action buttons per collector wired to
`useStartCollection()` with per-button loading state and success/failure
toasts. Skeletons while loading, `ErrorBanner` + retry on failure.

**Phase 4 — Investigation Search** (`src/pages/InvestigationSearch.tsx`):
live search using the existing `SearchBar` (alias/wallet/pgp/relay), results
show confidence score, entity counts, and last-updated time, and clicking a
result navigates to `/clusters/:clusterId`. Skeleton while loading,
`EmptyState` for no matches, `ErrorBanner` + retry on failure. **Search
matching assumption**: the given `/clusters` endpoint (`ClusterSummary`)
only returns aggregate counts and a label per cluster — not the raw alias
handles, wallet addresses, PGP fingerprints, or relay fingerprints
themselves, and no dedicated search endpoint was specified. Until the
backend adds one (e.g. `GET /search?field=&value=`), this page filters
clusters that have at least one entity of the selected type and matches the
query text against the cluster's `label` as the closest available proxy —
called out in a code comment at the top of `InvestigationSearch.tsx`. If the
backend exposes real per-field search, only the `runSearch` function there
needs to change.

**Phase 5 — Cluster Investigation** (`src/pages/ClusterInvestigation.tsx`):
uses `useClusterDetail(clusterId)` from the route param. Header shows the
cluster label, last-updated time, and confidence badge, plus a link to
`/graph/:clusterId`. `EvidenceCard` is fed by `cluster.evidence`. Aliases,
wallets, PGP keys, and relay metadata each get their own visually distinct
scrollable panel. `TimelineCard` is embedded below using `cluster.timeline`.
Skeleton while loading, `ErrorBanner` + retry on failure, `EmptyState` if the
cluster isn't found.

**Phase 6 — Interactive Graph**: `src/components/GraphPanel.tsx` now runs a
real Cytoscape.js instance (built and destroyed per `data` change to avoid
leaking canvas contexts). Nodes are colored by `EntityType` and edges by
`RelationshipType` using the exact SOC palette hex values from
`tailwind.config.js` (Cytoscape styles need literal colors, not Tailwind
classes). Zoom (wheel + on-canvas buttons), pan, and drag-to-reposition all
work out of the box via Cytoscape defaults; a "fit to view" button is
included too. Clicking a node highlights its closed neighborhood and dims
everything else, and calls back to `src/pages/GraphView.tsx` which renders a
details side panel (type, confidence, connected entities with relationship
labels) and a legend. `GraphView.tsx` also adds a cluster picker (backed by
`useClusters()`) whenever the route has no `:clusterId`, navigating to
`/graph/:clusterId` on selection.

**Phase 7 — Timeline** (`src/pages/Timeline.tsx`): a cluster picker (backed
by `useClusters()`) syncs to a `?cluster=` query param, and
`useClusterDetail(clusterId).timeline` feeds `TimelineCard`. `EmptyState` if
no cluster is selected, skeleton while loading, `ErrorBanner` + retry on
failure.

**Phase 8 — Collection Monitor** (`src/pages/CollectionMonitor.tsx`):
`useJobs()` (already polling every 5s) feeds `JobTable` in full mode. A
manual refresh button shows a spinner while in flight and a
"Updated x ago" timestamp; filter tabs narrow by status (queued / running /
success / failed) and by collector type (Tor / GitHub / Reddit /
Blockchain). `EmptyState` for both "no jobs at all" and "no jobs match these
filters" (with a clear-filters action), `ErrorBanner` + retry on failure.

**Phase 9 — Polish**:
- Breadcrumbs (`TopNavbar.tsx`) now resolve the actual cluster label on
  `/clusters/:id` and `/graph/:id` via `useClusterDetail`, falling back to
  the raw id only until that request resolves.
- The sidebar is a static, collapsible column on `md`+ screens and an
  off-canvas overlay drawer (with backdrop, close button, and auto-close on
  navigation) below `md`, toggled from a hamburger button in `TopNavbar`.
- Every data-driven view in the app follows the same
  loading-skeleton / error-banner-with-retry / empty-state pattern — nothing
  renders silently blank.
- Global keyboard shortcuts ("/" and "g d/s/g/t/m") already skipped inputs,
  textareas, and contenteditable elements from Phase 1; verified still
  correct after the Phase 9 changes.
- Toasts now also fire on manual-refresh failures in Collection Monitor, in
  addition to the collection-trigger toasts from Phase 3.
- Fixed a duplicate `@types/node` entry in `package.json`.
- `npm install`, `tsc -b`, and `vite build` all verified clean with no
  errors after every phase.

All nine phases are complete. The app is fully wired end-to-end against the
existing FastAPI backend with no backend changes required.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. API calls go through `/api`, which
`vite.config.ts` proxies to `http://localhost:8000` (your FastAPI backend) —
no backend changes or CORS config needed for local dev.

If your backend runs elsewhere, copy `.env.example` to `.env` and set
`VITE_API_BASE_URL`.

## One assumption worth flagging

The Collection Monitor page needs a jobs-listing endpoint to poll, which
wasn't in the endpoint list you gave me. `src/services/api.ts` assumes
`GET /jobs` returning `CollectionJob[]` (see `src/types/index.ts`). If your
backend exposes job status differently (e.g. job IDs returned from
`/collect/*` need to be polled individually, or jobs live under
`/collect/status`), only `tace.getJobs` in `src/services/api.ts` needs to
change — everything else consumes it through the `useJobs()` hook.

## Folder structure

```
src/
  pages/        route-level views
  components/   reusable UI (Sidebar, StatCard, GraphPanel, etc.)
  hooks/        TanStack Query hooks, toast context
  services/     typed API client (services/api.ts, services/httpClient.ts)
  types/        shared TypeScript types
```

## All phases complete

No further phases are planned. If your backend later exposes a dedicated
search endpoint or a native `/jobs` route (see "One assumption worth
flagging" above), only `src/services/api.ts` and the relevant page need to
change.
