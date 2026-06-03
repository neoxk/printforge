import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

type PageStackProps = ComponentProps<'div'> & {
  spacing?: 'default' | 'compact' | 'relaxed'
}

const spacingClasses: Record<NonNullable<PageStackProps['spacing']>, string> = {
  compact: 'gap-5',
  default: 'gap-7',
  relaxed: 'gap-9',
}

export function PageStack({
  className,
  spacing = 'default',
  ...props
}: PageStackProps) {
  return (
    <div
      className={cn('flex flex-col', spacingClasses[spacing], className)}
      {...props}
    />
  )
}
