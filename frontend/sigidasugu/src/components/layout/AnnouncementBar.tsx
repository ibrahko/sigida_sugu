import { Truck, Zap } from 'lucide-react'

export function AnnouncementBar() {
  return (
    <div className="bg-[var(--color-brand)] text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-xs lg:px-8">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          Paiement Mobile Money via InTouch
        </span>
        <span className="hidden h-3 w-px bg-white/20 sm:block" />
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          Livraison gratuite à Bamako dès 25 000 FCFA
        </span>
        <span className="hidden h-3 w-px bg-white/20 md:block" />
        <span className="hidden md:inline text-white/80">Paiement à la livraison disponible</span>
      </div>
    </div>
  )
}
