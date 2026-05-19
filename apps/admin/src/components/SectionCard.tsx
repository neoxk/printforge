import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from './ui/card'

type SectionCardProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

export function SectionCard({ title, description, actions, children }: SectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
}
