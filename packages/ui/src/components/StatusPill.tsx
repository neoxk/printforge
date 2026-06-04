import { cn } from '../lib/utils'

export type StatusTone = 'success' | 'warning' | 'neutral' | 'info' | 'danger'

type StatusPillProps = {
  label: string
  tone: StatusTone
}

const toneClasses: Record<StatusTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
  neutral: 'border-border bg-muted/70 text-muted-foreground',
}

export function StatusPill({ label, tone }: Readonly<StatusPillProps>) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium whitespace-nowrap',
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  )
}
