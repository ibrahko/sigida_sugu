import * as React from 'react'
import { cn } from '../../lib/cn'

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: React.ReactNode
}

export function PageHeader({
  className,
  title,
  subtitle,
  eyebrow,
  actions,
  ...props
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        'mb-6 flex flex-col gap-4 rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-[var(--color-border)] lg:flex-row lg:items-center lg:justify-between lg:p-8',
        className,
      )}
      {...props}
    >
      <div>
        {eyebrow ? (
          <p className="text-sm font-medium text-[var(--color-brand)]">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-bold text-[var(--color-text)]">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      ) : null}
    </section>
  )
}