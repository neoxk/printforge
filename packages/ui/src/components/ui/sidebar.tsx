import * as React from "react"
import { Slot } from "radix-ui"
import { PanelLeft } from "lucide-react"

import { cn } from "../../lib/utils"
import { Sheet, SheetContent } from "./sheet"
import { Button } from "./button"

type SidebarContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (globalThis.window === undefined) {
      return false
    }

    return globalThis.window.innerWidth < breakpoint
  })

  React.useEffect(() => {
    if (globalThis.window === undefined) {
      return
    }

    const mql = globalThis.window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(mql.matches)
    mql.addEventListener("change", update)
    update()
    return () => mql.removeEventListener("change", update)
  }, [breakpoint])

  return isMobile
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  className,
  ...props
}: React.ComponentProps<"div"> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile()
  const [openDesktop, setOpenDesktop] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)

  const open = isMobile ? openMobile : openDesktop
  const setOpen = (isMobile ? setOpenMobile : setOpenDesktop)

  const toggleSidebar = React.useCallback(() => {
    setOpen((v) => !v)
  }, [setOpen])

  const value = React.useMemo(
    () => ({ open, setOpen, isMobile, toggleSidebar }),
    [open, setOpen, isMobile, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={cn("flex min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  const { open, setOpen, isMobile } = useSidebar()

  const sidebarClass = cn(
    "flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
    className,
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className={cn("p-0 w-64", sidebarClass)}
        >
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-20", sidebarClass)}>
      {children}
    </aside>
  )
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col shrink-0", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  )
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col shrink-0", className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-0.5", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />
}

export function SidebarMenuButton({
  className,
  isActive = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  isActive?: boolean
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 outline-none",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleSidebar}
      className={cn("shrink-0", className)}
      aria-label="Toggle sidebar"
      {...props}
    >
      <PanelLeft className="size-4" />
    </Button>
  )
}

export function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-w-0 flex-1 flex-col md:ml-64", className)}
      {...props}
    />
  )
}
