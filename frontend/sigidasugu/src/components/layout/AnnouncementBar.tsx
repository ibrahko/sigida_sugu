import { Truck, Zap } from 'lucide-react'

export function AnnouncementBar() {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-xs text-[var(--color-text-secondary)] lg:px-8">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          Paiement Mobile Money via InTouch
        </span>
        <span className="hidden h-3 w-px bg-[var(--color-border)] sm:block" />
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-[var(--color-brand)]" />
          Livraison rapide à Bamako et alentours
        </span>
        <span className="hidden h-3 w-px bg-[var(--color-border)] md:block" />
        <span className="hidden md:inline">Paiement à la livraison disponible</span>
      </div>
    </div>
  )
}
