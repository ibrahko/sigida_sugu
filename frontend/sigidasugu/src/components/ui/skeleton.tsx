import * as React from 'react'
import { cn } from '../../lib/cn'

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-100',
        className,
      )}
      {...props}
    />
  )
}