import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from './ui/card'

type StatCardProps = {
  label: string
  value: string
  trend: string
  icon?: ReactNode
  progress?: number
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        {icon && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&>svg]:size-4">
            {icon}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  )
}
