import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { fetchCart, updateCartItem, deleteCartItem } from '../features/cart/api'
import { formatPrice } from '../lib/format'

export function CartPage() {
  const queryClient = useQueryClient()

  const { data: cart, isLoading, isError } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => deleteCartItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-bg-warm)]" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)]" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-[var(--radius-xl)] bg-white p-10 text-center border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Impossible de charger le panier</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Connecte-toi et vérifie que le backend est bien disponible.
        </p>
      </div>
    )
  }

  if (!cart?.items?.length) {
    return (
      <div className="rounded-[var(--radius-xl)] bg-white p-12 text-center border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[var(--radius-md)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Ton panier est vide</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Parcours les produits et ajoute ce dont tu as besoin pour commencer la commande.
        </p>
        <Link
          to="/produits"
          className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--color-brand-light)]"
        >
          Voir les produits
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">Panier</p>
        <h1 className="mt-1.5 text-3xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Vérifie ta commande
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Ajuste les quantités puis passe à la validation.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-soft)] transition hover:border-[var(--color-brand-muted)]"
            >
              <div className="aspect-square h-20 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-bg-warm)] flex-shrink-0">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-[var(--color-muted)]">—</div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-bold text-[var(--color-text)]">{item.product_name}</h2>
                  <p className="shrink-0 text-sm font-extrabold text-[var(--color-text)]">
                    {formatPrice(item.total_price)}
                  </p>
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Prix unitaire : {formatPrice(item.unit_price)}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-warm)]">
                    <button
                      type="button"
                      onClick={() => updateItemMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      className="px-3 py-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[var(--color-text)]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateItemMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      className="px-3 py-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
          <h2 className="text-base font-extrabold text-[var(--color-text)]">Résumé de commande</h2>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>Articles ({cart.total_quantity})</span>
              <span className="font-medium text-[var(--color-text)]">{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
              <span>Livraison</span>
              <span className="font-medium text-[var(--color-text)]">Calculée au checkout</span>
            </div>

            <div className="border-t border-[var(--color-border)] pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--color-text)]">Total estimé</span>
                <span className="text-xl font-extrabold text-[var(--color-text)]">{formatPrice(cart.subtotal)}</span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">En FCFA (XOF) · hors livraison</p>
            </div>

            <Link
              to="/commande"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-brand-light)]"
            >
              Passer la commande →
            </Link>

            <Link
              to="/produits"
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-warm)] transition"
            >
              Continuer mes achats
            </Link>

            <div className="pt-2 space-y-1.5">
              <p className="text-xs font-bold text-[var(--color-muted)]">Modes de paiement</p>
              <div className="flex gap-2">
                <span className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-brand-muted)] bg-[var(--color-brand-soft)] px-2 py-1.5 text-center text-[9px] font-bold text-[var(--color-brand)]">
                  📱 Mobile Money
                </span>
                <span className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1.5 text-center text-[9px] font-semibold text-[var(--color-muted)]">
                  🚚 À la livraison
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
