import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Shield } from 'lucide-react'
import { CheckoutSteps } from '../components/checkout/CheckoutSteps'
import {
  PaymentMethodPicker,
  type PaymentMethod,
} from '../components/checkout/PaymentMethodPicker'
import { Button } from '../components/ui/button'
import { formatPrice } from '../lib/format'
import { api } from '../services/api'

type Address = {
  id: number
  label: string
  full_name: string
  phone: string
  line1: string
  city: string
  region: string
  country: string
  is_default: boolean
}

type DeliveryZone = {
  id: number
  name: string
  code: string
  fee: string
  estimated_min_days: number
  estimated_max_days: number
}

type CartItem = {
  id: number
  product_name: string
  quantity: number
  unit_price: string
  total_price: string
}

type CartResponse = {
  id: number
  items: CartItem[]
  total_quantity: number
  subtotal: string
}

type OrderResponse = {
  id: number
  number: string
  total: string
}

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

async function fetchAddresses() {
  const { data } = await api.get<Address[] | PaginatedResponse<Address>>(
    '/accounts/addresses/',
  )
  if (Array.isArray(data)) return data
  return data.results ?? []
}

async function fetchDeliveryZones() {
  const { data } = await api.get<DeliveryZone[] | { results: DeliveryZone[] }>(
    '/delivery/',
  )
  if (Array.isArray(data)) return data
  return data.results ?? []
}

async function fetchCart() {
  const { data } = await api.get<CartResponse>('/cart/me/')
  return data
}

export function CheckoutPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedAddressId, setSelectedAddressId] = useState<number | ''>('')
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money')
  const [notes, setNotes] = useState('')
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null)

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
  })

  const { data: zones } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: fetchDeliveryZones,
  })

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  })

  const zoneList = zones ?? []

  const selectedZone = useMemo(
    () => zoneList.find((zone) => zone.id === selectedZoneId),
    [zoneList, selectedZoneId],
  )

  const selectedAddress = useMemo(
    () => addresses?.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId],
  )

  const orderTotal = useMemo(() => {
    const subtotal = Number(cart?.subtotal || 0)
    const fee = Number(selectedZone?.fee || 0)
    return subtotal + fee
  }, [cart?.subtotal, selectedZone?.fee])

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!cart?.items?.length) throw new Error('Panier vide')
      if (!selectedAddressId) throw new Error('Adresse requise')
      if (!selectedZoneId) throw new Error('Zone requise')

      const payload = {
        items: cart.items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        delivery_address_id: selectedAddressId,
        delivery_zone_id: selectedZoneId,
        delivery_fee: selectedZone?.fee || '0.00',
        discount_amount: '0.00',
        notes,
      }

      const { data } = await api.post<OrderResponse>('/orders/', payload)
      return data
    },
    onSuccess: async (order) => {
      if (paymentMethod === 'mobile_money') {
        await api.post('/payments/intouch/initialize/', { order_id: order.id })
      }
      setOrderResult(order)
      setStep(3)
    },
  })

  const canProceedStep1 = selectedAddressId && selectedZoneId

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--color-bg-warm)]" />
        <div className="h-64 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-bg-warm)]" />
      </div>
    )
  }

  if (!cart?.items?.length && step !== 3) {
    return (
      <div className="mx-auto max-w-lg rounded-[var(--radius-xl)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Panier vide</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Ajoute des produits avant de finaliser ta commande.
        </p>
        <Button asChild className="mt-6">
          <Link to="/produits">Voir les produits</Link>
        </Button>
      </div>
    )
  }

  if (step === 3 && orderResult) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-[var(--shadow-card)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1
            className="mt-6 text-2xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Commande confirmée !
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Ta commande <strong>{orderResult.number}</strong> a été enregistrée.
            {paymentMethod === 'mobile_money'
              ? ' Le paiement Mobile Money a été initialisé.'
              : ' Tu paieras à la livraison.'}
          </p>
          <p className="mt-4 text-2xl font-bold text-[var(--color-brand)]">
            {formatPrice(orderResult.total)}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="brand">
              <Link to="/commandes">Suivre ma commande</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/produits">Continuer mes achats</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-4">
        <Link
          to="/panier"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-brand)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au panier
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand)]">
            Checkout mobile-first
          </p>
          <h1
            className="mt-1 text-3xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Finaliser l&apos;achat
          </h1>
        </div>
        <CheckoutSteps currentStep={step} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6 rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-soft)] lg:p-8">
          {step === 1 && (
            <>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--color-text)]">Livraison</h2>
                  <p className="text-sm text-[var(--color-muted)]">
                    Adresse et zone de livraison (SRS §8.6)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--color-text)]">
                  Adresse de livraison
                </label>
                <select
                  value={selectedAddressId}
                  onChange={(e) =>
                    setSelectedAddressId(e.target.value ? Number(e.target.value) : '')
                  }
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
                >
                  <option value="">Choisir une adresse</option>
                  {addresses?.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} — {address.line1}, {address.city}
                    </option>
                  ))}
                </select>
                {!addresses?.length && (
                  <p className="text-sm text-amber-700">
                    <Link to="/compte/adresses" className="font-semibold underline">
                      Ajoute une adresse
                    </Link>{' '}
                    pour continuer.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--color-text)]">
                  Zone de livraison
                </label>
                <div className="grid gap-3">
                  {zoneList.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition ${
                        selectedZoneId === zone.id
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5'
                          : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/30'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-[var(--color-text)]">{zone.name}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {zone.estimated_min_days}–{zone.estimated_max_days} jours ouvrés
                        </p>
                      </div>
                      <p className="font-bold text-[var(--color-brand)]">
                        {formatPrice(zone.fee)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--color-text)]">
                  Instructions (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Point de repère, créneau préféré..."
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4 text-sm outline-none focus:border-[var(--color-brand)]"
                />
              </div>

              <Button
                variant="brand"
                size="lg"
                fullWidth
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continuer vers le paiement
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-[var(--color-brand)]" />
                  <div className="text-sm">
                    <p className="font-semibold text-[var(--color-text)]">Paiement sécurisé</p>
                    <p className="mt-1 text-[var(--color-muted)]">
                      Transaction tracée avec identifiants internes et externes (SRS §8.7).
                      Données sensibles masquées côté serveur.
                    </p>
                  </div>
                </div>
              </div>

              {createOrderMutation.isError && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  Impossible de finaliser. Vérifie tes informations et ta connexion.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button
                  variant="brand"
                  size="lg"
                  fullWidth
                  isLoading={createOrderMutation.isPending}
                  onClick={() => createOrderMutation.mutate()}
                >
                  Confirmer la commande
                </Button>
              </div>
            </>
          )}
        </section>

        <aside className="h-fit space-y-4 rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-28">
          <h2 className="font-semibold text-[var(--color-text)]">Récapitulatif</h2>

          {selectedAddress && (
            <div className="rounded-2xl bg-[var(--color-surface-soft)] p-4 text-sm">
              <p className="font-medium text-[var(--color-text)]">{selectedAddress.label}</p>
              <p className="mt-1 text-[var(--color-muted)]">
                {selectedAddress.line1}, {selectedAddress.city}
              </p>
            </div>
          )}

          <div className="max-h-48 space-y-3 overflow-y-auto">
            {cart?.items?.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-[var(--color-text)]">{item.product_name}</p>
                  <p className="text-[var(--color-muted)]">×{item.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(item.total_price)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
            <div className="flex justify-between text-[var(--color-muted)]">
              <span>Sous-total</span>
              <span>{formatPrice(cart?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-muted)]">
              <span>Livraison</span>
              <span>{formatPrice(selectedZone?.fee || 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[var(--color-text)]">
              <span>Total</span>
              <span className="text-[var(--color-brand)]">{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
