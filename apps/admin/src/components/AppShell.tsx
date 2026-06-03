import {
  Gauge,
  LogOut,
  Package2,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../app/Auth'

const navigation = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/products', label: 'Products', icon: Package2 },
  { to: '/pricing', label: 'Option & Price Library', icon: Sparkles },
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col justify-between bg-[#1a1f2c]">
        <div className="flex flex-col pt-7">
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 mb-7">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-bold tracking-widest text-white">
              PF
            </span>
            <div>
              <p className="text-[15px] font-bold leading-tight tracking-tight text-white">
                PrintForge
              </p>
              <p className="text-xs text-white/40 mt-0.5">Admin Suite</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 px-3" aria-label="Primary">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary text-white'
                      : 'nav-inactive',
                  ].join(' ')
                }
              >
                {() => (
                  <>
                    <item.icon
                      className="size-[1.05rem] shrink-0 transition-colors duration-150"
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="mt-0.5 truncate text-xs text-white/40">{user?.tenantName}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex shrink-0 items-center gap-1.5 rounded-md p-1.5 text-xs text-white/40 transition-colors duration-150 hover:bg-white/[0.07] hover:text-white"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="ml-64 flex min-w-0 flex-1 flex-col bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card/95 px-7 py-3.5 backdrop-blur">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Operations workspace
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{topbarDate}</span>
            <span className="h-3.5 w-px bg-border" aria-hidden="true" />
            <span className="font-medium text-foreground">{user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-8 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
