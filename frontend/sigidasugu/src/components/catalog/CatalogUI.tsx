import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { cn } from '../../lib/cn'
import { getMediaUrl } from '../../lib/media'
import type { Category } from '../../types/catalog'

type CategoryRailProps = {
  categories: Category[]
  activeSlug?: string
  onSelect: (slug: string) => void
}

export function CategoryRail({ categories, activeSlug, onSelect }: CategoryRailProps) {
  const items = [{ slug: '', name: 'Tous', id: 0 }, ...categories]

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent" />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((category) => {
          const isActive = (activeSlug || '') === category.slug
          const imageUrl = getMediaUrl(
            (category as { image_url?: string; image?: string }).image_url ||
              (category as { image?: string }).image,
          )

          return (
            <button
              key={category.slug || 'all'}
              type="button"
              onClick={() => onSelect(category.slug)}
              className={cn(
                'group flex shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-sm'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-brand-muted)] hover:bg-[var(--color-surface-soft)]',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-xl',
                  isActive ? 'bg-white/20' : 'bg-[var(--color-bg-warm)]',
                )}
              >
                {imageUrl && category.slug ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <LayoutGrid
                    className={cn('h-4 w-4', isActive ? 'text-white' : 'text-[var(--color-brand)]')}
                  />
                )}
              </span>
              {category.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const SORT_OPTIONS = [
  { value: '-created_at', label: 'Nouveautés' },
  { value: 'price', label: 'Prix ↑' },
  { value: '-price', label: 'Prix ↓' },
  { value: 'name', label: 'A → Z' },
] as const

type SortPillsProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SortPills({ value, onChange, className }: SortPillsProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-1',
        className,
      )}
    >
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-xl px-3 py-1.5 text-xs font-semibold transition',
            value === option.value
              ? 'bg-white text-[var(--color-brand)] shadow-sm'
              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

type ActiveFilter = {
  key: string
  label: string
  onRemove: () => void
}

export function ActiveFilterChips({ filters }: { filters: ActiveFilter[] }) {
  if (!filters.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-[var(--color-muted)]">Filtres :</span>
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={filter.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-muted)] bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-brand)] hover:text-white"
        >
          {filter.label}
          <span aria-hidden>×</span>
        </button>
      ))}
    </div>
  )
}

type CatalogPaginationProps = {
  count: number
  page: number
  pageSize?: number
  onPageChange: (page: number) => void
}

export function CatalogPagination({
  count,
  page,
  pageSize = 20,
  onPageChange,
}: CatalogPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1
    if (page <= 3) return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 pt-4"
      aria-label="Pagination du catalogue"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-soft)] disabled:opacity-40"
      >
        Précédent
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={cn(
            'grid h-10 w-10 place-items-center rounded-xl text-sm font-semibold transition',
            p === page
              ? 'bg-[var(--color-brand)] text-white shadow-sm'
              : 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-brand-muted)]',
          )}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-soft)] disabled:opacity-40"
      >
        Suivant
      </button>
    </nav>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white">
      <div className="aspect-[4/5] animate-pulse bg-[var(--color-bg-warm)]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded-full bg-[var(--color-bg-warm)]" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--color-bg-warm)]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-bg-warm)]" />
        <div className="h-5 w-24 animate-pulse rounded bg-[var(--color-bg-warm)]" />
      </div>
    </div>
  )
}

export function CatalogEmptyState({
  title,
  description,
  onReset,
}: {
  title: string
  description: string
  onReset?: () => void
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-xl)] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
        <LayoutGrid className="h-7 w-7" />
      </div>
      <h3
        className="mt-5 text-lg font-bold text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">{description}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 text-sm font-semibold text-[var(--color-brand)] hover:underline"
        >
          Réinitialiser les filtres
        </button>
      )}
      <Link
        to="/"
        className="mt-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-brand)]"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
