import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

type SectionCardProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
}

export function SectionCard({ title, description, actions, children, className, contentClassName }: Readonly<SectionCardProps>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {actions ? <CardAction>{actions}</CardAction> : null}
      </CardHeader>
      {children ? <CardContent className={cn(contentClassName)}>{children}</CardContent> : null}
    </Card>
  )
}
