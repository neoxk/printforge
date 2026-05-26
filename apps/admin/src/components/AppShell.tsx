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
  { to: '/pricing', label: 'Option & Price Library', icon: Sparkles },
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col justify-between border-r border-[#2f3647] bg-[#1a1f2c]">
        <div className="flex flex-col gap-2 pt-8">
          {/* Brand */}
          <div className="mx-5 mb-8 flex items-center gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold tracking-widest text-white">
              PF
            </span>
            <div>
              <p className="text-2xl font-bold leading-tight tracking-tight text-white">
                Admin Suite
              </p>
              <p className="mt-1 text-sm text-[#828697]">Production Control</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5" aria-label="Primary">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-4 px-5 py-4 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-[#0266ff] text-white'
                      : 'text-[#828697] hover:bg-white/[0.04] hover:text-[#e4e8f2]',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        'w-0.5 self-stretch rounded-full transition-colors',
                        isActive ? 'bg-white/60' : 'bg-transparent',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                    <item.icon className="size-[1.1rem] shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-[#2f3647] px-5 pb-6 pt-4">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{user?.name}</p>
              <p className="mt-0.5 truncate text-sm text-[#828697]">{user?.tenantName}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex shrink-0 items-center gap-1.5 border-0 bg-transparent p-0 text-sm text-[#828697] transition-colors hover:text-white"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="ml-72 flex min-w-0 flex-1 flex-col bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card/90 px-7 py-4 backdrop-blur">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Operations workspace
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{topbarDate}</span>
            <span className="font-medium text-foreground">{user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
