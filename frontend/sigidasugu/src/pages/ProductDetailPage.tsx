import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Check, Minus, Package, Plus, ShoppingCart } from 'lucide-react'
import { fetchProductById, fetchProducts } from '../features/catalog/api'
import { api } from '../services/api'
import { formatPrice } from '../lib/format'
import { getProductImageUrl } from '../lib/media'
import { ProductCard } from '../components/catalog/ProductCard'

function discountPercent(price: string, compareAt?: string | null) {
  if (!compareAt) return null
  const cur = parseFloat(price)
  const orig = parseFloat(compareAt)
  if (orig <= cur || isNaN(cur) || isNaN(orig)) return null
  return Math.round(((orig - cur) / orig) * 100)
}

export function ProductDetailPage() {
  const { id } = useParams()
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [success, setSuccess] = useState(false)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id as string),
    enabled: !!id,
  })

  /* Produits similaires (même catégorie) */
  const { data: similar } = useQuery({
    queryKey: ['similar', product?.category?.slug],
    queryFn: () =>
      fetchProducts({ category: product!.category!.slug, page_size: '5' }),
    enabled: !!product?.category?.slug,
  })
  const similarProducts = similar?.results?.filter((p) => p.id !== product?.id).slice(0, 4) ?? []

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants.find((v) => v.is_active) ||
      null
    )
  }, [product, selectedVariantId])

  const images = product?.images ?? []
  const activeImage = images[activeImageIndex]?.image ?? null
  const displayPrice = selectedVariant?.price ?? product?.price ?? '0'
  const stock = selectedVariant?.stock ?? product?.stock ?? 0
  const inStock = stock > 0
  const discount = discountPercent(product?.price ?? '0', product?.compare_at_price)

  const addToCartMutation = useMutation({
    mutationFn: async () =>
      api.post('/cart/items/add/', {
        product_id: product?.id,
        variant_id: selectedVariant?.id || null,
        quantity,
      }),
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    },
  })

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="aspect-square animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-bg-warm)]" />
          <div className="space-y-4">
            {[8, 12, 6, 40, 10, 10, 12].map((h, i) => (
              <div key={i} style={{ height: `${h * 4}px` }} className="animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-bg-warm)]" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (isError || !product) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white py-20 text-center">
        <Package className="h-10 w-10 text-[var(--color-muted)]" />
        <div>
          <h1 className="text-lg font-extrabold text-[var(--color-text)]">Produit introuvable</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Ce produit n'est plus disponible.</p>
        </div>
        <Link
          to="/produits"
          className="rounded-[var(--radius-md)] bg-[var(--color-brand)] px-5 py-2.5 text-sm font-bold text-white"
        >
          Retour au catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Wrapper card principale ── */}
      <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-soft)]">

        {/* Breadcrumb interne */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <Link to="/" className="hover:text-[var(--color-brand)] transition-colors">Accueil</Link>
            <span>/</span>
            {product.category?.name && (
              <>
                <Link
                  to={`/produits?category=${product.category.slug}`}
                  className="hover:text-[var(--color-brand)] transition-colors"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="font-semibold text-[var(--color-text)]">{product.name}</span>
          </nav>
        </div>

        {/* Contenu : image + infos */}
        <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">

          {/* ── Colonne image ── */}
          <div className="border-r border-[var(--color-border)] p-6 space-y-3">
            {/* Image principale */}
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-bg-warm)]">
              <div className="aspect-square">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-[var(--color-muted)]">
                    Aucune image
                  </div>
                )}
              </div>
              {/* Badge remise */}
              {discount != null && discount > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-extrabold text-[var(--color-brand-dark)]">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Miniatures */}
            <div className="flex gap-2">
              {images.length > 0
                ? images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[var(--radius-md)] border-2 bg-[var(--color-bg-warm)] transition ${
                        i === activeImageIndex
                          ? 'border-[var(--color-brand)]'
                          : 'border-[var(--color-border)] opacity-55 hover:opacity-100'
                      }`}
                    >
                      <img src={img.image} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))
                : /* placeholders vides si pas d'images */
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-[68px] w-[68px] shrink-0 rounded-[var(--radius-md)] border-2 bg-[var(--color-bg-warm)] ${
                        i === 0 ? 'border-[var(--color-brand)]' : 'border-[var(--color-border)]'
                      }`}
                    />
                  ))}
            </div>
          </div>

          {/* ── Colonne infos ── */}
          <div className="flex flex-col gap-5 p-6 lg:p-8">

            {/* Marque · Catégorie */}
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-muted)]">
              {[product.brand?.name, product.category?.name].filter(Boolean).join(' · ')}
            </p>

            {/* Titre */}
            <h1
              className="text-2xl font-extrabold leading-tight text-[var(--color-text)] lg:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {product.name}
            </h1>

            {/* Prix */}
            <div className="flex items-center gap-3">
              <span className="text-[2rem] font-extrabold leading-none text-[var(--color-text)]">
                {formatPrice(displayPrice, product.currency)}
              </span>
              {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(displayPrice) && (
                <>
                  <span className="text-sm font-medium text-[var(--color-muted)] line-through">
                    {formatPrice(product.compare_at_price, product.currency)}
                  </span>
                  {discount != null && discount > 0 && (
                    <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-brand-dark)]">
                      -{discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Variantes */}
            {product.variants?.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[var(--color-text)]">Variante</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-semibold transition ${
                        selectedVariant?.id === variant.id
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                          : 'border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-brand)]'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantité + bouton panier */}
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center text-[var(--color-muted)] transition hover:bg-[var(--color-bg-warm)]"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-[var(--color-text)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                  className="flex h-11 w-11 items-center justify-center text-[var(--color-muted)] transition hover:bg-[var(--color-bg-warm)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* CTA principal */}
              <button
                type="button"
                onClick={() => addToCartMutation.mutate()}
                disabled={!inStock || addToCartMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {addToCartMutation.isPending ? 'Ajout…' : 'Ajouter au panier'}
              </button>
            </div>

            {/* Feedback */}
            {success && (
              <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--color-success)]">
                <Check className="h-4 w-4" />
                Produit ajouté au panier !
              </div>
            )}
            {addToCartMutation.isError && (
              <div className="rounded-[var(--radius-md)] bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600">
                Impossible d'ajouter. Connecte-toi ou réessaie.
              </div>
            )}

            {/* Stock */}
            <div className={`flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-xs font-semibold ${
              inStock ? 'bg-[var(--color-bg-warm)] text-[var(--color-text-secondary)]' : 'bg-rose-50 text-rose-600'
            }`}>
              <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand)]" />
              {inStock
                ? `En stock${stock <= 5 ? ` · ${stock} restant${stock > 1 ? 's' : ''}` : ''} — Livraison sous 24h à Bamako`
                : 'Rupture de stock'}
            </div>

            {/* Description courte */}
            {(product.description || product.short_description) && (
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                {product.description || product.short_description}
              </p>
            )}

            {/* Garanties */}
            <ul className="space-y-2.5">
              {[
                'Livraison 24h · Bamako',
                'Mobile Money ou à la livraison',
                'Retour 7 jours',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-warm)] border border-[var(--color-border)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Produits similaires ── */}
      {similarProducts.length > 0 && (
        <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)] lg:p-8">
          <div className="mb-5">
            {product.category?.name && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand)]">
                Aussi dans {product.category.name}
              </p>
            )}
            <h2
              className="mt-1 text-xl font-extrabold text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Produits similaires
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} imageUrl={getProductImageUrl(p)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
