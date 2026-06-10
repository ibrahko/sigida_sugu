import { Link } from 'react-router-dom'
import { ArrowUpRight, ShoppingBag, Star } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatPrice } from '../../lib/format'
import type { ProductListItem } from '../../types/catalog'

type ProductCardProps = {
  product: ProductListItem
  imageUrl?: string
  className?: string
}

function discountPercent(price: string, compareAt?: string | null) {
  if (!compareAt) return null
  const current = parseFloat(price)
  const original = parseFloat(compareAt)
  if (original <= current || Number.isNaN(current) || Number.isNaN(original)) return null
  return Math.round(((original - current) / original) * 100)
}

export function ProductCard({ product, imageUrl, className }: ProductCardProps) {
  const hasDiscount =
    product.compare_at_price &&
    parseFloat(product.compare_at_price) > parseFloat(product.price)
  const discount = discountPercent(product.price, product.compare_at_price)
  const inStock = product.stock > 0

  return (
    <Link
      to={`/produits/${product.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-brand-muted)] hover:shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-[var(--color-muted)]">
            Aucune image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--color-text)] shadow-lg">
            Voir le produit
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Badges top */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              <Star className="h-3 w-3 fill-[var(--color-accent-muted)] text-[var(--color-accent-muted)]" />
              Vedette
            </span>
          )}
          {discount != null && discount > 0 && (
            <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          {product.category?.name && (
            <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)]">
              {product.category.name}
            </span>
          )}
          {product.brand?.name && (
            <span className="truncate text-[10px] text-[var(--color-muted)]">{product.brand.name}</span>
          )}
        </div>

        <h3
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-brand)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {product.name}
        </h3>

        {product.short_description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-muted)]">
            {product.short_description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-[var(--color-border)] pt-3">
          <div>
            <p className="text-base font-bold text-[var(--color-text)]">
              {formatPrice(product.price, product.currency)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-[var(--color-muted)] line-through">
                {formatPrice(product.compare_at_price!, product.currency)}
              </p>
            )}
          </div>

          {inStock ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
              <ShoppingBag className="h-3 w-3" />
              En stock
            </span>
          ) : null}
        </div>

        {inStock && product.stock <= 5 && (
          <p className="text-[10px] font-medium text-[var(--color-accent)]">
            Plus que {product.stock} disponible(s)
          </p>
        )}
      </div>
    </Link>
  )
}
