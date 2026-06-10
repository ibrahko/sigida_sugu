import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { api } from '../services/api'

type CartItem = {
  id: number
  product_name: string
  quantity: number
  unit_price: string
  total_price: string
  product_image?: string | null
}

type CartResponse = {
  id: number
  items: CartItem[]
  total_quantity: number
  subtotal: string
}

async function fetchCart() {
  const { data } = await api.get<CartResponse>('/cart/me/')
  return data
}

export function CartPage() {
  const queryClient = useQueryClient()

  const { data: cart, isLoading, isError } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  })

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const { data } = await api.patch(`/cart/items/${itemId}/`, { quantity })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const { data } = await api.delete(`/cart/items/${itemId}/`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-100" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-black/5" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-black/5" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-bold text-slate-900">Impossible de charger le panier</h1>
        <p className="mt-2 text-sm text-slate-500">
          Connecte-toi et vérifie que le backend est bien disponible.
        </p>
      </div>
    )
  }

  if (!cart?.items?.length) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <h1 className="text-3xl font-bold text-slate-900">Ton panier est vide</h1>
        <p className="mt-3 text-sm text-slate-500">
          Parcours les produits et ajoute ce dont tu as besoin pour commencer la commande.
        </p>
        <Link
          to="/produits"
          className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          Voir les produits
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <p className="text-sm font-medium text-teal-700">Panier</p>
        <h1 className="text-3xl font-bold text-slate-900">Vérifie ta commande</h1>
        <p className="text-sm text-slate-500">
          Ajuste les quantités puis passe à la validation de la commande.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:grid-cols-[96px_1fr]"
            >
              <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-slate-400">
                    Pas d’image
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{item.product_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Prix unitaire: {item.unit_price} XOF
                    </p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{item.total_price} XOF</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        updateItemMutation.mutate({
                          itemId: item.id,
                          quantity: Math.max(1, item.quantity - 1),
                        })
                      }
                      className="px-4 py-3 text-slate-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-sm font-medium text-slate-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateItemMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                      className="px-4 py-3 text-slate-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-medium text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="text-lg font-semibold text-slate-900">Résumé</h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Articles</span>
              <span>{cart.total_quantity}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Sous-total</span>
              <span>{cart.subtotal} XOF</span>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">Total estimé</span>
                <span className="text-xl font-bold text-slate-900">{cart.subtotal} XOF</span>
              </div>
            </div>

            <Link
              to="/commande"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white"
            >
              Passer à la commande
            </Link>

            <Link
              to="/produits"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-4 text-sm font-medium text-slate-700"
            >
              Continuer mes achats
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}