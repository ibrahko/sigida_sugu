import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { formatPrice } from '../../lib/format'

type StatCardProps = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  href?: string
  linkLabel?: string
  tone?: 'brand' | 'accent' | 'neutral'
}

export function AccountStatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  linkLabel,
  tone = 'brand',
}: StatCardProps) {
  const iconBg = {
    brand: 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]',
    accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
    neutral: 'bg-[var(--color-bg-warm)] text-[var(--color-text-secondary)]',
  }[tone]

  return (
    <div className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('grid h-10 w-10 place-items-center rounded-xl', iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {label}
        </p>
      </div>

      <p
        className="mt-4 text-2xl font-bold text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{hint}</p>

      {href && linkLabel && (
        <Link
          to={href}
          className="mt-4 text-sm font-semibold text-[var(--color-brand)] hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}

export function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Brouillon',
    pending: 'En attente',
    paid: 'Payée',
    preparing: 'En préparation',
    processing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée',
    confirmed: 'Confirmée',
  }
  return map[status] || status
}

export function formatOrderTotal(total: string, currency = 'XOF') {
  return formatPrice(total, currency)
}
