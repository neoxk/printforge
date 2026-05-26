import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <section className="flex items-start justify-between gap-4 pb-5 border-b border-border">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>}
    </section>
  )
}
