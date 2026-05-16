export type StatusTone = 'success' | 'warning' | 'neutral' | 'info' | 'danger'

type StatusPillProps = {
  label: string
  tone: StatusTone
}

export function StatusPill({ label, tone }: StatusPillProps) {
  return <span className={`status-pill status-${tone}`}>{label}</span>
}
