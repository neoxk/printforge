import { Badge } from './ui/badge'
import { cn } from '../lib/utils'

export type StatusTone = 'success' | 'warning' | 'neutral' | 'info' | 'danger'

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
  info: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50',
  danger: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
  neutral: 'bg-muted text-muted-foreground border-border hover:bg-muted',
}

type StatusPillProps = {
  label: string
  tone: StatusTone
}

export function StatusPill({ label, tone }: StatusPillProps) {
  return (
    <Badge variant="outline" className={cn(toneClasses[tone])}>
      {label}
    </Badge>
  )
}
