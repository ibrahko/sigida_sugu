import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
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
        'group relative flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand-muted)] hover:shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {/* Image — carré compact */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-warm)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-400 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-[10px] text-[var(--color-muted)]">
            Aucune image
          </div>
        )}

        {/* Hover CTA */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/55 to-transparent py-3 opacity-0 transition duration-200 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[var(--color-text)] shadow-md">
            <ShoppingCart className="h-3 w-3 text-[var(--color-brand)]" />
            Voir
          </span>
        </div>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount != null && discount > 0 && (
            <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[9px] font-extrabold text-[var(--color-brand-dark)]">
              -{discount}%
            </span>
          )}
          {product.is_featured && !discount && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[9px] font-bold text-white">
              <Star className="h-2 w-2 fill-[var(--color-accent)] text-[var(--color-accent)]" />
              Top
            </span>
          )}
        </div>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
              Rupture
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.category?.name && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-brand)]">
            {product.category.name}
          </span>
        )}

        <h3
          className="line-clamp-2 text-xs font-bold leading-snug text-[var(--color-text)] transition-colors group-hover:text-[var(--color-brand)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-1 pt-2">
          <div>
            <p className="text-sm font-extrabold text-[var(--color-text)]">
              {formatPrice(product.price, product.currency)}
            </p>
            {hasDiscount && (
              <p className="text-[10px] text-[var(--color-muted)] line-through">
                {formatPrice(product.compare_at_price!, product.currency)}
              </p>
            )}
          </div>
          {inStock && product.stock <= 5 && (
            <span className="text-[9px] font-bold text-[var(--color-accent-dark)]">
              {product.stock} restant{product.stock > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
