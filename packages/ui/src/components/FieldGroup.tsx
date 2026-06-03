import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../lib/utils'

type FieldGroupProps = ComponentProps<'div'> & {
  label?: ReactNode
  helper?: ReactNode
}

export function FieldGroup({
  className,
  label,
  helper,
  children,
  ...props
}: FieldGroupProps) {
  return (
    <div className={cn('grid gap-2', className)} {...props}>
      {label}
      {children}
      {helper ? <div className="text-xs text-muted-foreground">{helper}</div> : null}
    </div>
  )
}
