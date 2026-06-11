import { Gauge, LogOut, Package2, Settings, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../app/Auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@printforge/ui/components/ui/sidebar'

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
    <SidebarProvider>
      <Sidebar>
        {/* Brand */}
        <SidebarHeader className="px-5 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="PF"
              className="size-9 shrink-0 rounded-lg object-contain"
            />
            <div>
              <p className="text-[15px] font-bold leading-tight tracking-tight text-sidebar-foreground">
                PrintForge
              </p>
              <p className="text-xs text-sidebar-foreground/40 mt-0.5">Admin Suite</p>
            </div>
          </div>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent className="px-3">
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.to}>
                <NavLink to={item.to} end={item.to === '/'}>
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
                      <item.icon className="size-[1.05rem] shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        {/* User footer */}
        <SidebarFooter className="border-t border-sidebar-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {user?.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-sidebar-foreground/40">
                {user?.tenantName}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex shrink-0 items-center gap-1.5 rounded-md p-1.5 text-sidebar-foreground/40 transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only">Log out</span>
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main workspace */}
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card/95 px-6 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Operations workspace
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{topbarDate}</span>
            <span className="h-3.5 w-px bg-border" aria-hidden="true" />
            <span className="font-medium text-foreground">{user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
