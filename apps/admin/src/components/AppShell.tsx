import {
  Gauge,
  LogOut,
  Package2,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../app/Auth'

const navigation = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/products', label: 'Products', icon: Package2 },
  { to: '/pricing', label: 'General Definitions', icon: Sparkles },
  { to: '/validation', label: 'Validation', icon: ShieldCheck },
  { to: '/settings', label: 'Integration', icon: Settings },
]

export function AppShell() {
  const { logout, user } = useAuth()
  const topbarDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
      }).format(new Date()),
    [],
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-main">
          <div className="brand-block">
            <span className="brand-mark">PF</span>
            <div>
              <h1>Admin Suite</h1>
              <p className="sidebar-subtitle">Production Control</p>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
              >
                <span className="nav-link-marker" aria-hidden="true" />
                <item.icon className="nav-link-icon" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-copy">
              <strong>{user?.name}</strong>
              <p>{user?.tenantName}</p>
            </div>
            <button type="button" className="logout-link" onClick={logout}>
              <LogOut className="button-icon" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <h2>Operations workspace</h2>
          <div className="topbar-user">
            <span className="topbar-date">{topbarDate}</span>
            <span className="topbar-user-email">{user?.email}</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
