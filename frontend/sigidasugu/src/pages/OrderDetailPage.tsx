import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Truck,
  XCircle,
} from 'lucide-react'
import { fetchOrder } from '../features/orders/api'
import { formatPrice } from '../lib/format'
import { Skeleton } from '../components/ui/skeleton'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock; bg: string }> = {
  pending:   { label: 'En attente',    color: 'text-amber-700',             icon: Clock,         bg: 'bg-amber-50'   },
  paid:      { label: 'Payée',         color: 'text-[var(--color-success)]', icon: CheckCircle2, bg: 'bg-[var(--color-success-soft)]' },
  preparing: { label: 'En préparation',color: 'text-blue-700',              icon: Package,       bg: 'bg-blue-50'    },
  shipped:   { label: 'Expédiée',      color: 'text-purple-700',            icon: Truck,         bg: 'bg-purple-50'  },
  delivered: { label: 'Livrée',        color: 'text-[var(--color-success)]', icon: CheckCircle2, bg: 'bg-[var(--color-success-soft)]' },
  cancelled: { label: 'Annulée',       color: 'text-rose-600',              icon: XCircle,       bg: 'bg-rose-50'    },
  refunded:  { label: 'Remboursée',    color: 'text-rose-600',              icon: XCircle,       bg: 'bg-rose-50'    },
}

const STEPS = ['pending', 'paid', 'preparing', 'shipped', 'delivered']

function StatusTimeline({ status }: { status: string }) {
  const currentIndex = STEPS.indexOf(status)
  if (currentIndex === -1) return null
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const cfg = STATUS_CONFIG[s]
        const Icon = cfg.icon
        const done = i <= currentIndex
        const active = i === currentIndex
        return (
          <div key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                done
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-muted)]'
              } ${active ? 'ring-2 ring-[var(--color-brand)]/20 ring-offset-2' : ''}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[9px] font-semibold text-center leading-tight ${done ? 'text-[var(--color-brand)]' : 'text-[var(--color-muted)]'}`}>
                {cfg.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mb-4 h-0.5 flex-1 ${i < currentIndex ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border)]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
    refetchInterval: (data) =>
      data && ['pending', 'paid', 'preparing', 'shipped'].includes(data.status) ? 30000 : false,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 rounded-[var(--radius-xl)]" />
        <Skeleton className="h-64 rounded-[var(--radius-xl)]" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-10 text-center">
        <Package className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
        <h1 className="mt-4 font-extrabold text-[var(--color-text)]">Commande introuvable</h1>
        <Link to="/compte/commandes" className="mt-4 inline-flex text-sm font-bold text-[var(--color-brand)] hover:underline">
          ← Mes commandes
        </Link>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
  const StatusIcon = cfg.icon
  const isCancelled = ['cancelled', 'refunded'].includes(order.status)

  return (
    <div className="mx-auto max-w-3xl space-y-5">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
        <Link to="/" className="hover:text-[var(--color-brand)]">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/compte/commandes" className="hover:text-[var(--color-brand)]">Mes commandes</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-[var(--color-text)]">{order.number}</span>
      </nav>

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">Commande</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            {order.number}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className={`flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-bold ${cfg.bg} ${cfg.color}`}>
          <StatusIcon className="h-4 w-4" />
          {cfg.label}
        </div>
      </div>

      {/* Timeline statut */}
      {!isCancelled && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">Suivi de commande</p>
          <StatusTimeline status={order.status} />
        </div>
      )}

      {/* Articles */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="font-semibold text-[var(--color-text)]">Articles commandés</h2>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              {/* Image */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bg-warm)]">
                {item.primary_image?.image ? (
                  <img src={item.primary_image.image} alt={item.product_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center">
                    <Package className="h-5 w-5 text-[var(--color-muted)]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--color-text)]">{item.product_name}</p>
                {item.variant_name && (
                  <p className="text-xs text-[var(--color-muted)]">{item.variant_name}</p>
                )}
                <p className="text-xs text-[var(--color-muted)]">SKU : {item.sku} · Qté : {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--color-text)]">{formatPrice(item.line_total, order.currency)}</p>
                <p className="text-xs text-[var(--color-muted)]">{formatPrice(item.unit_price)} / u</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="space-y-2 border-t border-[var(--color-border)] px-5 py-4 text-sm">
          <div className="flex justify-between text-[var(--color-muted)]">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-[var(--color-muted)]">
            <span>Livraison</span>
            <span>{formatPrice(order.delivery_fee, order.currency)}</span>
          </div>
          {parseFloat(order.discount_amount) > 0 && (
            <div className="flex justify-between text-[var(--color-success)]">
              <span>Réduction</span>
              <span>-{formatPrice(order.discount_amount, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-extrabold text-[var(--color-text)]">
            <span>Total</span>
            <span className="text-[var(--color-brand)]">{formatPrice(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      {/* Livraison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {order.delivery_address && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--color-brand)]" />
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">Adresse</p>
            </div>
            <p className="font-semibold text-[var(--color-text)]">{order.delivery_address.full_name}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{order.delivery_address.line1}</p>
            <p className="text-sm text-[var(--color-muted)]">{order.delivery_address.city}</p>
            <p className="text-sm text-[var(--color-muted)]">{order.delivery_address.phone}</p>
          </div>
        )}

        {order.delivery_zone && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-[var(--color-brand)]" />
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">Livraison</p>
            </div>
            <p className="font-semibold text-[var(--color-text)]">{order.delivery_zone.name}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Délai estimé : {order.delivery_zone.estimated_min_days}–{order.delivery_zone.estimated_max_days} jour{order.delivery_zone.estimated_max_days > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {order.notes && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">Instructions</p>
          <p className="mt-2 text-sm text-[var(--color-text)]">{order.notes}</p>
        </div>
      )}

      <Link
        to="/compte/commandes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à mes commandes
      </Link>
    </div>
  )
}
