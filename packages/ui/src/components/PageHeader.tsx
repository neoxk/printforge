import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, description, actions, className }: Readonly<PageHeaderProps>) {
  return (
    <section className={cn('flex items-start justify-between gap-6 border-b border-border pb-5', className)}>
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="max-w-[72ch] text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div> : null}
    </section>
  )
}
