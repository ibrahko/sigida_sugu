import * as React from 'react'
import { cn } from '../../lib/cn'

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  className,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-[32px] bg-white p-10 text-center shadow-sm ring-1 ring-black/5',
        className,
      )}
      {...props}
    >
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}