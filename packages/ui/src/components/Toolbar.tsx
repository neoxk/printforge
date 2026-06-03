import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

export function Toolbar({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    />
  )
}
