import { toast } from 'sonner'
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

export type AppAlertTone = 'error' | 'info' | 'warning'

export type AppAlertInput = {
  title?: string
  message: string
  tone: AppAlertTone
  durationMs?: number
}

type AppAlertsContextValue = {
  showAlert: (input: AppAlertInput) => string
  showError: (message: string, title?: string) => string
  showInfo: (message: string, title?: string) => string
  showWarning: (message: string, title?: string) => string
  dismissAlert: (id: string) => void
}

const AppAlertsContext = createContext<AppAlertsContextValue | null>(null)

export function AppAlertsProvider({ children }: Readonly<PropsWithChildren>) {
  const value = useMemo<AppAlertsContextValue>(
    () => ({
      showAlert: ({ tone, title, message, durationMs }) => {
        const opts = { description: message, duration: durationMs }
        let id: number | string

        if (tone === 'error') {
          id = toast.error(title ?? 'Error', opts)
        } else if (tone === 'warning') {
          id = toast.warning(title ?? 'Warning', opts)
        } else {
          id = toast.info(title ?? 'Info', opts)
        }

        return String(id)
      },
      showError: (message, title = 'Error') =>
        String(toast.error(title, { description: message })),
      showInfo: (message, title = 'Info') =>
        String(toast.info(title, { description: message })),
      showWarning: (message, title = 'Warning') =>
        String(toast.warning(title, { description: message })),
      dismissAlert: (id) => toast.dismiss(id),
    }),
    [],
  )

  return <AppAlertsContext.Provider value={value}>{children}</AppAlertsContext.Provider>
}

export function useAppAlerts() {
  const context = useContext(AppAlertsContext)
  if (!context) throw new Error('useAppAlerts must be used inside AppAlertsProvider.')
  return context
}
