import * as React from 'react'
import { cn } from '../../lib/cn'

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({
  className,
  size = 'md',
  ...props
}: SpinnerProps) {
  const sizes: Record<typeof size, string> = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-slate-200 border-t-slate-900',
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}