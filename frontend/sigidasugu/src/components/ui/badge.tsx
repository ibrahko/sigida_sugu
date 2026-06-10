import * as React from 'react'
import { cn } from '../../lib/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'info'
}

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: BadgeProps) {
  const base =
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium'

  const variants: Record<typeof variant, string> = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-800',
    info: 'bg-sky-50 text-sky-700',
  }

  return (
    <span
      className={cn(base, variants[variant], className)}
      {...props}
    />
  )
}