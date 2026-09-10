import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'

// Minimal global keyboard shortcuts:
//   "/"     focus / jump to Investigation Search
//   "g d"   go to Dashboard
//   "g s"   go to Search
//   "g g"   go to Graph
//   "g t"   go to Timeline
//   "g m"   go to Collection Monitor
function useGlobalShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    let pendingG = false
    let timeout: ReturnType<typeof setTimeout>

    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (isTyping) return

      if (e.key === '/') {
        e.preventDefault()
        navigate('/search')
        return
      }

      if (pendingG) {
        pendingG = false
        clearTimeout(timeout)
        switch (e.key) {
          case 'd':
            navigate('/')
            break
          case 's':
            navigate('/search')
            break
          case 'g':
            navigate('/graph')
            break
          case 't':
            navigate('/timeline')
            break
          case 'm':
            navigate('/jobs')
            break
        }
        return
      }

      if (e.key === 'g') {
        pendingG = true
        timeout = setTimeout(() => {
          pendingG = false
        }, 800)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])
}

export function AppLayout() {
  useGlobalShortcuts()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile drawer whenever the route changes (e.g. after tapping a
  // nav link), so it never stays open over the next page.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
