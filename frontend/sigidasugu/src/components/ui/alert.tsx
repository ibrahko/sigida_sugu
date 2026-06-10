import * as React from 'react'
import { cn } from '../../lib/cn'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error'
}

export function Alert({
  className,
  variant = 'info',
  ...props
}: AlertProps) {
  const base = 'rounded-2xl px-4 py-3 text-sm'

  const variants: Record<typeof variant, string> = {
    info: 'bg-sky-50 text-sky-800',
    success: 'bg-emerald-50 text-emerald-800',
    warning: 'bg-amber-50 text-amber-800',
    error: 'bg-rose-50 text-rose-800',
  }

  return (
    <div
      role="alert"
      className={cn(base, variants[variant], className)}
      {...props}
    />
  )
}