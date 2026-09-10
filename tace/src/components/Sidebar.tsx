import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  Share2,
  Clock,
  ListChecks,
  ShieldAlert,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  shortcut?: string
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'G D' },
  { to: '/search', label: 'Investigation Search', icon: Search, shortcut: 'G S' },
  { to: '/graph', label: 'Graph', icon: Share2, shortcut: 'G G' },
  { to: '/timeline', label: 'Timeline', icon: Clock, shortcut: 'G T' },
  { to: '/jobs', label: 'Collection Monitor', icon: ListChecks, shortcut: 'G M' },
]

interface SidebarProps {
  /** Mobile-only: whether the off-canvas drawer is open below the md breakpoint. */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const content = (
    <>
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
        <ShieldAlert size={20} className="text-accent shrink-0" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight truncate">TACE</p>
            <p className="text-[10px] text-text-muted leading-tight truncate">
              Threat Actor Correlation
            </p>
          </div>
        )}
        <button
          onClick={onMobileClose}
          className="md:hidden shrink-0 text-text-secondary hover:text-text-primary focus-ring rounded p-1"
          aria-label="Close navigation menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onMobileClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-ring',
                isActive
                  ? 'bg-accent-muted/40 text-accent'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && (
              <span className="flex-1 flex items-center justify-between min-w-0">
                <span className="truncate">{item.label}</span>
                {item.shortcut && (
                  <kbd className="text-[10px] text-text-muted font-mono ml-2 shrink-0">
                    {item.shortcut}
                  </kbd>
                )}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden md:flex items-center gap-2 px-4 h-11 border-t border-border text-text-secondary hover:text-text-primary hover:bg-white/5 text-xs font-medium focus-ring shrink-0"
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        {!collapsed && 'Collapse'}
      </button>
    </>
  )

  return (
    <>
      {/* Desktop / tablet: static, collapsible sidebar */}
      <aside
        className={clsx(
          'hidden md:flex h-screen sticky top-0 shrink-0 bg-surface border-r border-border flex-col transition-all duration-150',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {content}
      </aside>

      {/* Mobile: off-canvas overlay drawer below the md breakpoint */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="relative z-50 h-full w-64 bg-surface border-r border-border flex flex-col animate-in">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
