import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import Dashboard from '@/pages/Dashboard'
import InvestigationSearch from '@/pages/InvestigationSearch'
import ClusterInvestigation from '@/pages/ClusterInvestigation'
import GraphView from '@/pages/GraphView'
import Timeline from '@/pages/Timeline'
import CollectionMonitor from '@/pages/CollectionMonitor'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<InvestigationSearch />} />
        <Route path="/clusters/:clusterId" element={<ClusterInvestigation />} />
        <Route path="/graph" element={<GraphView />} />
        <Route path="/graph/:clusterId" element={<GraphView />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/jobs" element={<CollectionMonitor />} />
      </Route>
    </Routes>
  )
}
