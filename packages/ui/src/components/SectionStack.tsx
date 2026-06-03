import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

type SectionStackProps = ComponentProps<'div'> & {
  spacing?: 'sm' | 'default' | 'lg'
}

const spacingClasses: Record<NonNullable<SectionStackProps['spacing']>, string> = {
  sm: 'gap-3',
  default: 'gap-4',
  lg: 'gap-5',
}

export function SectionStack({
  className,
  spacing = 'default',
  ...props
}: SectionStackProps) {
  return (
    <div
      className={cn('flex flex-col', spacingClasses[spacing], className)}
      {...props}
    />
  )
}
