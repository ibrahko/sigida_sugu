import { Banknote, CreditCard, Link2, MessageSquare, Smartphone } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Input } from '../ui/input'

export type PaymentMethod = 'mobile_money' | 'cod' | 'payment_link' | 'card'

/* ── Types pour les données de paiement ── */
export type MobileMoneyData = {
  operator: 'orange_money' | 'moov_money' | 'sama_money' | ''
  phone: string
}

export type CardData = {
  number: string
  name: string
  expiry: string
  cvv: string
}

export type PaymentLinkData = {
  phone: string
}

export type PaymentDetails =
  | { method: 'mobile_money'; data: MobileMoneyData }
  | { method: 'card'; data: CardData }
  | { method: 'payment_link'; data: PaymentLinkData }
  | { method: 'cod'; data: Record<string, never> }

type PaymentOption = {
  id: PaymentMethod
  label: string
  description: string
  icon: typeof Smartphone
  badge?: string
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'mobile_money',
    label: 'Mobile Money',
    description: 'Orange Money, Moov Money, Sama Money via InTouch',
    icon: Smartphone,
    badge: 'Recommandé',
  },
  {
    id: 'cod',
    label: 'Paiement à la livraison',
    description: 'Paye en espèces ou Mobile Money à la réception',
    icon: Banknote,
  },
  {
    id: 'payment_link',
    label: 'Lien par SMS',
    description: 'Reçois un lien de paiement par SMS sur ton téléphone',
    icon: MessageSquare,
  },
  {
    id: 'card',
    label: 'Carte bancaire',
    description: 'Visa, Mastercard — paiement sécurisé',
    icon: CreditCard,
  },
]

/* ── Opérateurs InTouch ── */
const OPERATORS = [
  {
    id: 'orange_money' as const,
    label: 'Orange Money',
    color: '#FF6B00',
    bg: '#FFF3E8',
    prefix: '+22376',
  },
  {
    id: 'moov_money' as const,
    label: 'Moov Money',
    color: '#0055A4',
    bg: '#E8F0FA',
    prefix: '+22370',
  },
  {
    id: 'sama_money' as const,
    label: 'Sama Money',
    color: '#006D3C',
    bg: '#E6F4EE',
    prefix: '+223',
  },
]

type Props = {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  details: PaymentDetails
  onDetailsChange: (details: PaymentDetails) => void
}

export function PaymentMethodPicker({ value, onChange, details, onDetailsChange }: Props) {
  const mobileMoney = details.method === 'mobile_money' ? details.data : { operator: '' as const, phone: '' }
  const card = details.method === 'card' ? details.data : { number: '', name: '', expiry: '', cvv: '' }
  const link = details.method === 'payment_link' ? details.data : { phone: '' }

  const setMobile = (patch: Partial<MobileMoneyData>) =>
    onDetailsChange({ method: 'mobile_money', data: { ...mobileMoney, ...patch } })

  const setCard = (patch: Partial<CardData>) =>
    onDetailsChange({ method: 'card', data: { ...card, ...patch } })

  const setLink = (patch: Partial<PaymentLinkData>) =>
    onDetailsChange({ method: 'payment_link', data: { ...link, ...patch } })

  const select = (method: PaymentMethod) => {
    onChange(method)
    if (method === 'mobile_money') onDetailsChange({ method: 'mobile_money', data: { operator: '', phone: '' } })
    else if (method === 'card') onDetailsChange({ method: 'card', data: { number: '', name: '', expiry: '', cvv: '' } })
    else if (method === 'payment_link') onDetailsChange({ method: 'payment_link', data: { phone: '' } })
    else onDetailsChange({ method: 'cod', data: {} })
  }

  /* Format numéro de carte avec espaces */
  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  /* Format expiry MM/AA */
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-text)]">Mode de paiement</h2>
        <p className="mt-0.5 text-sm text-[var(--color-muted)]">
          Choisis comment tu veux régler ta commande.
        </p>
      </div>

      <div className="grid gap-2">
        {paymentOptions.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.id

          return (
            <div key={option.id}>
              {/* Bouton de sélection */}
              <button
                type="button"
                onClick={() => select(option.id)}
                className={cn(
                  'relative flex w-full items-center gap-4 rounded-[var(--radius-md)] border-2 px-4 py-3.5 text-left transition',
                  isSelected
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                    : 'border-[var(--color-border)] bg-white hover:border-[var(--color-brand-muted)]',
                )}
              >
                <div className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)]',
                  isSelected ? 'bg-[var(--color-brand)] text-white' : 'bg-[var(--color-bg-warm)] text-[var(--color-brand)]',
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{option.label}</span>
                    {option.badge && (
                      <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--color-accent-dark)]">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">{option.description}</p>
                </div>

                {/* Radio indicator */}
                <div className={cn(
                  'h-4.5 w-4.5 shrink-0 rounded-full border-2 transition',
                  isSelected ? 'border-[var(--color-brand)] bg-[var(--color-brand)]' : 'border-[var(--color-border)]',
                )}>
                  {isSelected && <div className="grid h-full place-items-center"><div className="h-1.5 w-1.5 rounded-full bg-white" /></div>}
                </div>
              </button>

              {/* ── Sous-formulaire Mobile Money ── */}
              {isSelected && option.id === 'mobile_money' && (
                <div className="mt-2 space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
                    Choisir l'opérateur
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {OPERATORS.map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setMobile({ operator: op.id })}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border-2 px-3 py-3 text-center transition',
                          mobileMoney.operator === op.id
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-brand-muted)]',
                        )}
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                          style={{ backgroundColor: op.color }}
                        >
                          {op.label.slice(0, 1)}
                        </span>
                        <span className="text-[10px] font-semibold leading-tight text-[var(--color-text)]">
                          {op.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <Input
                    label="Numéro Mobile Money"
                    placeholder="+22376000000"
                    value={mobileMoney.phone}
                    onChange={(e) => setMobile({ phone: e.target.value })}
                  />

                  <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-warm)] px-3 py-2.5 text-xs text-[var(--color-muted)]">
                    Tu recevras une notification de paiement InTouch sur ce numéro. Confirme le paiement depuis ton téléphone.
                  </div>
                </div>
              )}

              {/* ── Sous-formulaire Carte bancaire ── */}
              {isSelected && option.id === 'card' && (
                <div className="mt-2 space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
                    Informations de la carte
                  </p>

                  {/* Logos Visa / Mastercard */}
                  <div className="flex gap-2">
                    {['VISA', 'MC'].map((b) => (
                      <span
                        key={b}
                        className="rounded border border-[var(--color-border)] bg-[var(--color-bg-warm)] px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-[var(--color-muted)]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <Input
                    label="Numéro de carte"
                    placeholder="1234 5678 9012 3456"
                    value={card.number}
                    onChange={(e) => setCard({ number: formatCard(e.target.value) })}
                    inputMode="numeric"
                  />
                  <Input
                    label="Nom sur la carte"
                    placeholder="IBRAHIMA KOUYATÉ"
                    value={card.name}
                    onChange={(e) => setCard({ name: e.target.value.toUpperCase() })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Expiration (MM/AA)"
                      placeholder="12/27"
                      value={card.expiry}
                      onChange={(e) => setCard({ expiry: formatExpiry(e.target.value) })}
                      inputMode="numeric"
                    />
                    <Input
                      label="CVV"
                      placeholder="123"
                      value={card.cvv}
                      onChange={(e) => setCard({ cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      inputMode="numeric"
                    />
                  </div>

                  <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-warm)] px-3 py-2.5 text-xs text-[var(--color-muted)]">
                    <CreditCard className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand)]" />
                    Paiement sécurisé — tes données ne sont jamais stockées.
                  </div>
                </div>
              )}

              {/* ── Sous-formulaire Lien SMS ── */}
              {isSelected && option.id === 'payment_link' && (
                <div className="mt-2 space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
                    Numéro pour le lien SMS
                  </p>
                  <Input
                    label="Téléphone"
                    placeholder="+22376000000"
                    value={link.phone}
                    onChange={(e) => setLink({ phone: e.target.value })}
                  />
                  <div className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-warm)] px-3 py-2.5 text-xs text-[var(--color-muted)]">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-brand)]" />
                    Tu recevras un SMS avec un lien sécurisé pour finaliser le paiement après confirmation de ta commande.
                  </div>
                </div>
              )}

              {/* ── Info Paiement à la livraison ── */}
              {isSelected && option.id === 'cod' && (
                <div className="mt-2 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-muted)]">
                  <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand)]" />
                  Le livreur accepte les espèces (FCFA) ou un paiement Mobile Money au moment de la remise du colis.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
