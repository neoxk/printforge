import '../assets/style.css'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type AppAlertTone = 'error' | 'info' | 'warning'

export type AppAlertInput = {
  title?: string
  message: string
  tone: AppAlertTone
  durationMs?: number
}

type AppAlertRecord = AppAlertInput & {
  id: string
  isLeaving: boolean
}

type AppAlertsContextValue = {
  showAlert: (input: AppAlertInput) => string
  showError: (message: string, title?: string) => string
  showInfo: (message: string, title?: string) => string
  showWarning: (message: string, title?: string) => string
  dismissAlert: (id: string) => void
}

const AppAlertsContext = createContext<AppAlertsContextValue | null>(null)

const EXIT_DURATION_MS = 220

function createAlertId() {
  return `pf-alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function AppAlertIcon({ tone }: { tone: AppAlertTone }) {
  if (tone === 'error') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="pf-alert-icon">
        <path
          d="M10 2.5L18 17.5H2L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 7V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14.25" r="1" fill="currentColor" />
      </svg>
    )
  }

  if (tone === 'warning') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="pf-alert-icon">
        <path
          d="M10 2.5L18 17.5H2L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 7.25V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 14.25H10.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="pf-alert-icon">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="5.75" r="1" fill="currentColor" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" width="16" height="16">
      <path
        d="M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function AppAlertToast({
  alert,
  onDismiss,
  onExited,
}: {
  alert: AppAlertRecord
  onDismiss: (id: string) => void
  onExited: (id: string) => void
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(alert.id)
    }, alert.durationMs ?? 5000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [alert.durationMs, alert.id, onDismiss])

  useEffect(() => {
    if (!alert.isLeaving) {
      return
    }

    setIsVisible(false)

    const timeoutId = window.setTimeout(() => {
      onExited(alert.id)
    }, EXIT_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [alert.id, alert.isLeaving, onExited])

  return (
    <article
      className={[
        'pf-alert-card',
        `pf-alert-card-${alert.tone}`,
        isVisible ? 'pf-alert-card-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      <AppAlertIcon tone={alert.tone} />
      <div className="pf-alert-copy">
        {alert.title ? <p className="pf-alert-title">{alert.title}</p> : null}
        <p className="pf-alert-message">{alert.message}</p>
      </div>
      <button
        type="button"
        className="pf-alert-close"
        aria-label="Dismiss alert"
        onClick={() => onDismiss(alert.id)}
      >
        <CloseIcon />
      </button>
    </article>
  )
}

export function AppAlertsProvider({ children }: PropsWithChildren) {
  const [alerts, setAlerts] = useState<AppAlertRecord[]>([])

  const dismissAlert = useCallback((id: string) => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id ? { ...alert, isLeaving: true } : alert,
      ),
    )
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== id))
  }, [])

  const showAlert = useCallback((input: AppAlertInput) => {
    const id = createAlertId()

    setAlerts((currentAlerts) => [
      ...currentAlerts,
      {
        ...input,
        durationMs: input.durationMs ?? 5000,
        id,
        isLeaving: false,
      },
    ])

    return id
  }, [])

  const value = useMemo<AppAlertsContextValue>(
    () => ({
      showAlert,
      showError: (message: string, title = 'Error') =>
        showAlert({ tone: 'error', title, message }),
      showInfo: (message: string, title = 'Info') =>
        showAlert({ tone: 'info', title, message }),
      showWarning: (message: string, title = 'Warning') =>
        showAlert({ tone: 'warning', title, message }),
      dismissAlert,
    }),
    [dismissAlert, showAlert],
  )

  return (
    <AppAlertsContext.Provider value={value}>
      {children}
      <div className="pf-alert-viewport" aria-live="polite" aria-atomic="false">
        {alerts.map((alert) => (
          <AppAlertToast
            key={alert.id}
            alert={alert}
            onDismiss={dismissAlert}
            onExited={removeAlert}
          />
        ))}
      </div>
    </AppAlertsContext.Provider>
  )
}

export function useAppAlerts() {
  const context = useContext(AppAlertsContext)

  if (!context) {
    throw new Error('useAppAlerts must be used inside AppAlertsProvider.')
  }

  return context
}
