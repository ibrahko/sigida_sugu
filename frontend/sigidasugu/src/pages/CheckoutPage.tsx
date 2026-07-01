import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Shield } from 'lucide-react'
import { CheckoutSteps } from '../components/checkout/CheckoutSteps'
import { SandboxPaymentSimulator } from '../components/checkout/SandboxPaymentSimulator'
import {
  PaymentMethodPicker,
  type PaymentDetails,
  type PaymentMethod,
} from '../components/checkout/PaymentMethodPicker'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { formatPrice } from '../lib/format'
import { fetchAddresses, createAddress } from '../features/accounts/api'
import { fetchCart } from '../features/cart/api'
import { fetchDeliveryZones } from '../features/delivery/api'
import { createOrder } from '../features/orders/api'
import type { Order } from '../types/orders'
import { initializeIntouchPayment } from '../features/payments/api'

type InlineAddress = {
  full_name: string
  phone: string
  line1: string
  city: string
}

const emptyInline: InlineAddress = { full_name: '', phone: '', line1: '', city: '' }

export function CheckoutPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedAddressId, setSelectedAddressId] = useState<number | ''>('')
  const [inlineAddress, setInlineAddress] = useState<InlineAddress>(emptyInline)
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'mobile_money',
    data: { operator: '', phone: '' },
  })
  const [notes, setNotes] = useState('')
  const [orderResult, setOrderResult] = useState<Order | null>(null)
  const [sandboxTx, setSandboxTx] = useState<{ ref: string; amount: string } | null>(null)

  const { data: addresses, isLoading: addrLoading } = useQuery({
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
  const hasAddresses = (addresses?.length ?? 0) > 0

  /* Adresse sélectionnée (sauvegardée) */
  const selectedAddress = useMemo(
    () => addresses?.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId],
  )

  /* Zone sélectionnée */
  const selectedZone = useMemo(
    () => zoneList.find((z) => z.id === selectedZoneId),
    [zoneList, selectedZoneId],
  )

  const orderTotal = useMemo(() => {
    const subtotal = Number(cart?.subtotal || 0)
    const fee = Number(selectedZone?.fee || 0)
    return subtotal + fee
  }, [cart?.subtotal, selectedZone?.fee])

  /* Validation étape 1 */
  const inlineValid =
    inlineAddress.full_name.trim() !== '' &&
    inlineAddress.phone.trim() !== '' &&
    inlineAddress.line1.trim() !== '' &&
    inlineAddress.city.trim() !== ''

  const addressOk = hasAddresses ? Boolean(selectedAddressId) : inlineValid
  const canProceedStep1 = addressOk && Boolean(selectedZoneId)

  /* Mutation : créer adresse inline si besoin puis créer commande */
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!cart?.items?.length) throw new Error('Panier vide')
      if (!selectedZoneId) throw new Error('Zone requise')

      let addressId = selectedAddressId as number

      /* Créer l'adresse à la volée si pas d'adresses sauvegardées */
      if (!hasAddresses) {
        if (!inlineValid) throw new Error('Adresse incomplète')
        const newAddr = await createAddress({
          label: 'Adresse de livraison',
          full_name: inlineAddress.full_name,
          phone: inlineAddress.phone,
          line1: inlineAddress.line1,
          city: inlineAddress.city,
          region: 'Bamako',
          country: 'ML',
          is_default: true,
        })
        addressId = newAddr.id
      }

      return createOrder({
        items: cart.items.map((item) => ({
          product_id: item.product,
          quantity: item.quantity,
        })),
        delivery_address_id: addressId,
        delivery_zone_id: selectedZoneId as number,
        delivery_fee: selectedZone?.fee || '0.00',
        discount_amount: '0.00',
        notes,
      })
    },
    onSuccess: async (order) => {
      if (paymentMethod === 'mobile_money') {
        const mmData = paymentDetails.method === 'mobile_money' ? paymentDetails.data : null
        try {
          const txData = await initializeIntouchPayment({
            order_id: order.id,
            phone: mmData?.phone || '',
            operator: mmData?.operator || '',
          })
          // Mode sandbox : afficher le simulateur de confirmation
          const isSandbox = txData?.transaction?.status === 'pending' && import.meta.env.DEV
          if (isSandbox && txData?.transaction?.internal_reference) {
            setSandboxTx({
              ref: txData.transaction.internal_reference,
              amount: txData.transaction.amount,
            })
            setOrderResult(order)
            return // ne pas passer à step 3 tout de suite
          }
        } catch {
          /* paiement non bloquant — la commande est créée */
        }
      }
      setOrderResult(order)
      setStep(3)
    },
  })

  /* ── Loading cart ── */
  if (cartLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--color-bg-warm)]" />
        <div className="h-64 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-bg-warm)]" />
      </div>
    )
  }

  /* ── Panier vide ── */
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

  /* ── Confirmation commande ── */
  if (step === 3 && orderResult) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-[var(--shadow-card)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[var(--radius-md)] bg-[var(--color-success-soft)] text-[var(--color-success)]">
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
              <Link to={`/commandes/${orderResult.id}`}>Suivre ma commande</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/produits">Continuer mes achats</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Simulateur sandbox Mobile Money ── */
  if (sandboxTx && orderResult) {
    const mmData = paymentDetails.method === 'mobile_money' ? paymentDetails.data : null
    return (
      <>
        {/* Fond page confirmation en arrière-plan */}
        <div className="pointer-events-none mx-auto max-w-lg space-y-6 text-center opacity-20 blur-sm">
          <div className="rounded-[var(--radius-2xl)] bg-white p-10">
            <h1 className="text-2xl font-bold">Commande créée</h1>
          </div>
        </div>
        <SandboxPaymentSimulator
          transactionRef={sandboxTx.ref}
          phone={mmData?.phone || ''}
          amount={sandboxTx.amount}
          operator={mmData?.operator || ''}
          onSuccess={() => { setSandboxTx(null); setStep(3) }}
          onFailure={() => { setSandboxTx(null); setStep(3) }}
        />
      </>
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
            Checkout
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

          {/* ── Étape 1 : Livraison ── */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--color-text)]">Adresse de livraison</h2>
                  <p className="text-sm text-[var(--color-muted)]">Où souhaitez-vous être livré ?</p>
                </div>
              </div>

              {/* Adresses sauvegardées */}
              {!addrLoading && hasAddresses && (
                <div className="space-y-2">
                  {addresses!.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setSelectedAddressId(address.id)}
                      className={`w-full rounded-[var(--radius-md)] border-2 p-4 text-left transition ${
                        selectedAddressId === address.id
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-brand-muted)]'
                      }`}
                    >
                      <p className="font-semibold text-[var(--color-text)]">{address.label}</p>
                      <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                        {address.full_name} · {address.phone}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        {address.line1}, {address.city}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Formulaire inline si pas d'adresses */}
              {!addrLoading && !hasAddresses && (
                <div className="space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-warm)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                    Informations de livraison
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Nom complet"
                      placeholder="Ibrahima Kouyaté"
                      value={inlineAddress.full_name}
                      onChange={(e) => setInlineAddress((p) => ({ ...p, full_name: e.target.value }))}
                    />
                    <Input
                      label="Téléphone"
                      placeholder="+22370000000"
                      value={inlineAddress.phone}
                      onChange={(e) => setInlineAddress((p) => ({ ...p, phone: e.target.value }))}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Adresse"
                        placeholder="Rue, quartier, point de repère"
                        value={inlineAddress.line1}
                        onChange={(e) => setInlineAddress((p) => ({ ...p, line1: e.target.value }))}
                      />
                    </div>
                    <Input
                      label="Ville"
                      placeholder="Bamako"
                      value={inlineAddress.city}
                      onChange={(e) => setInlineAddress((p) => ({ ...p, city: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Zone de livraison */}
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
                      className={`flex w-full items-center justify-between rounded-[var(--radius-md)] border-2 p-4 text-left transition ${
                        selectedZoneId === zone.id
                          ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-brand-muted)]'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-[var(--color-text)]">{zone.name}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {zone.estimated_min_days}–{zone.estimated_max_days} jour{zone.estimated_max_days > 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="font-bold text-[var(--color-brand)]">
                        {formatPrice(zone.fee)}
                      </p>
                    </button>
                  ))}
                  {zoneList.length === 0 && (
                    <p className="text-sm text-[var(--color-muted)]">Chargement des zones…</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--color-text)]">
                  Instructions (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Point de repère, créneau préféré…"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-brand)]"
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

              {!canProceedStep1 && (
                <p className="text-center text-xs text-[var(--color-muted)]">
                  {!addressOk
                    ? hasAddresses
                      ? 'Sélectionne une adresse de livraison.'
                      : 'Remplis tous les champs de livraison.'
                    : 'Sélectionne une zone de livraison.'}
                </p>
              )}
            </>
          )}

          {/* ── Étape 2 : Paiement ── */}
          {step === 2 && (
            <>
              <PaymentMethodPicker
                value={paymentMethod}
                onChange={setPaymentMethod}
                details={paymentDetails}
                onDetailsChange={setPaymentDetails}
              />

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-warm)] p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-[var(--color-brand)]" />
                  <div className="text-sm">
                    <p className="font-semibold text-[var(--color-text)]">Paiement sécurisé</p>
                    <p className="mt-1 text-[var(--color-muted)]">
                      Transaction tracée. Données sensibles masquées côté serveur.
                    </p>
                  </div>
                </div>
              </div>

              {createOrderMutation.isError && (
                <div className="rounded-[var(--radius-md)] bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  Impossible de finaliser. Vérifie tes informations et ta connexion.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button
                  variant="gold"
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

        {/* ── Récapitulatif ── */}
        <aside className="h-fit space-y-4 rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-28">
          <h2 className="font-semibold text-[var(--color-text)]">Récapitulatif</h2>

          {(selectedAddress || (!hasAddresses && inlineAddress.full_name)) && (
            <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-warm)] p-3 text-sm">
              <p className="font-medium text-[var(--color-text)]">
                {selectedAddress?.label || 'Adresse saisie'}
              </p>
              <p className="mt-0.5 text-[var(--color-muted)]">
                {selectedAddress
                  ? `${selectedAddress.line1}, ${selectedAddress.city}`
                  : `${inlineAddress.line1}, ${inlineAddress.city}`}
              </p>
            </div>
          )}

          <div className="max-h-52 space-y-3 overflow-y-auto">
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
              <span>{selectedZone ? formatPrice(selectedZone.fee) : '—'}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[var(--color-text)]">
              <span>Total</span>
              <span className="text-[var(--color-brand)]">{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
