import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Check, ShoppingCart, Truck } from 'lucide-react'
import { fetchProductById } from '../features/catalog/api'
import { api } from '../services/api'

export function ProductDetailPage() {
  const { id } = useParams()
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id as string),
    enabled: !!id,
  })

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ||
      product.variants.find((variant) => variant.is_active) ||
      null
    )
  }, [product, selectedVariantId])

  const displayImage =
    product?.images?.find((image) => image.is_primary)?.image ||
    product?.images?.[0]?.image ||
    null

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return api.post('/cart/items/add/', {
        product_id: product?.id,
        variant_id: selectedVariant?.id || null,
        quantity,
      })
    },
    onSuccess: () => {
      setSuccessMessage('Produit ajouté au panier avec succès.')
      setTimeout(() => setSuccessMessage(''), 2500)
    },
  })

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_520px]">
        <div className="aspect-square animate-pulse rounded-[32px] bg-slate-100" />
        <div className="space-y-4 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-bold text-slate-900">Produit introuvable</h1>
        <p className="mt-2 text-sm text-slate-500">
          Le produit demandé n’a pas pu être chargé.
        </p>
        <Link
          to="/produits"
          className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          Retour au catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">
        <Link to="/" className="hover:text-slate-900">Accueil</Link> /{' '}
        <Link to="/produits" className="hover:text-slate-900">Produits</Link> /{' '}
        <span className="text-slate-900">{product.name}</span>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_520px]">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="aspect-square bg-slate-100">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-400">
                Aucune image disponible
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5 lg:p-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {product.category?.name}
              </span>
              {product.brand?.name && (
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  {product.brand.name}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold leading-tight text-slate-900">
              {product.name}
            </h1>

            <p className="text-sm leading-6 text-slate-500">
              {product.description || product.short_description}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Prix</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {selectedVariant?.price || product.price} {product.currency}
            </p>
          </div>

          {product.variants?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Choisir une variante</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      selectedVariant?.id === variant.id
                        ? 'border-teal-700 bg-teal-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="font-medium text-slate-900">{variant.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {variant.price} {product.currency}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Quantité</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Disponibilité</p>
              <div className="flex h-[50px] items-center rounded-2xl bg-emerald-50 px-4 text-sm font-medium text-emerald-700">
                <Check className="mr-2 h-4 w-4" />
                En stock ({selectedVariant?.stock ?? product.stock})
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 text-teal-700" />
              <div>
                <p className="font-medium text-slate-900">Livraison rapide</p>
                <p className="mt-1 text-sm text-slate-500">
                  Livraison à Bamako et zones disponibles selon l’adresse choisie.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              <ShoppingCart className="h-4 w-4" />
              {addToCartMutation.isPending ? 'Ajout en cours...' : 'Ajouter au panier'}
            </button>

            {successMessage && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            )}

            {addToCartMutation.isError && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                Impossible d’ajouter au panier. Vérifie l’authentification ou la disponibilité.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}