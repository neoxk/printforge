import type { PropsWithChildren, ReactNode } from 'react'

type SectionCardProps = PropsWithChildren<{
  title: string
  description?: string
  actions?: ReactNode
}>

export function SectionCard({
  title,
  description,
  actions,
  children,
}: SectionCardProps) {
  return (
    <section className="section-card">
      <header className="section-card-header">
        <div>
          <h4>{title}</h4>
          {description ? <p className="muted-copy">{description}</p> : null}
        </div>
        {actions ? <div className="section-card-actions">{actions}</div> : null}
      </header>
      {children}
    </section>
  )
}
