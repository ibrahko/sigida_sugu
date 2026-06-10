import {
  Banknote,
  CreditCard,
  Link2,
  QrCode,
  Smartphone,
} from 'lucide-react'
import { cn } from '../../lib/cn'

export type PaymentMethod =
  | 'mobile_money'
  | 'cod'
  | 'payment_link'
  | 'qr_code'
  | 'card'

type PaymentOption = {
  id: PaymentMethod
  label: string
  description: string
  icon: typeof Smartphone
  priority: 'primary' | 'secondary' | 'future'
  badge?: string
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'mobile_money',
    label: 'Mobile Money',
    description: 'Orange Money, Moov Money via InTouch — paiement instantané',
    icon: Smartphone,
    priority: 'primary',
    badge: 'Recommandé',
  },
  {
    id: 'cod',
    label: 'Paiement à la livraison',
    description: 'Paye en espèces ou Mobile Money à la réception',
    icon: Banknote,
    priority: 'primary',
  },
  {
    id: 'payment_link',
    label: 'Lien de paiement',
    description: 'Reçois un lien par SMS pour payer plus tard',
    icon: Link2,
    priority: 'secondary',
    badge: 'Bientôt',
  },
  {
    id: 'qr_code',
    label: 'QR Code',
    description: 'Scanne et paie au point relais ou avec le livreur',
    icon: QrCode,
    priority: 'future',
    badge: 'Bientôt',
  },
  {
    id: 'card',
    label: 'Carte bancaire',
    description: 'Visa, Mastercard — idéal diaspora et import',
    icon: CreditCard,
    priority: 'secondary',
    badge: 'Bientôt',
  },
]

type PaymentMethodPickerProps = {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Mode de paiement
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Choisis comment tu souhaites régler ta commande.
        </p>
      </div>

      <div className="grid gap-3">
        {paymentOptions.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.id
          const isDisabled = option.priority === 'future'

          return (
            <button
              key={option.id}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(option.id)}
              className={cn(
                'relative flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition',
                isSelected
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/5 shadow-sm'
                  : 'border-[var(--color-border)] bg-white hover:border-[var(--color-brand)]/30',
                isDisabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <div
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                  isSelected
                    ? 'bg-[var(--color-brand)] text-white'
                    : 'bg-[var(--color-bg-warm)] text-[var(--color-brand)]',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--color-text)]">
                    {option.label}
                  </span>
                  {option.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                        option.badge === 'Recommandé'
                          ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                          : 'bg-[var(--color-bg-warm)] text-[var(--color-muted)]',
                      )}
                    >
                      {option.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                  {option.description}
                </p>
              </div>

              <div
                className={cn(
                  'mt-1 h-5 w-5 shrink-0 rounded-full border-2 transition',
                  isSelected
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand)]'
                    : 'border-[var(--color-border)]',
                )}
              >
                {isSelected && (
                  <div className="grid h-full place-items-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
