import type { InlineAlert } from '../../shared/types'

function InlineAlertIcon({ tone }: { tone: InlineAlert['tone'] }) {
  if (tone === 'error') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="inline-alert-icon">
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
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="inline-alert-icon">
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
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="inline-alert-icon">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="5.75" r="1" fill="currentColor" />
    </svg>
  )
}

export function InlineZoneAlerts({ alerts }: { alerts: InlineAlert[] }) {
  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="inline-alert-stack">
      {alerts.map((alert, index) => (
        <p key={`${alert.tone}-${index}`} className={`inline-alert inline-alert-${alert.tone}`}>
          <InlineAlertIcon tone={alert.tone} />
          <span>{alert.message}</span>
        </p>
      ))}
    </div>
  )
}
