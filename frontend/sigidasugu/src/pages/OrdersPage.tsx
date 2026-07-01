import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { fetchOrders } from '../features/orders/api'
import { AccountPageHeader } from '../components/account/AccountLayout'
import { orderStatusLabel } from '../components/account/AccountStatCard'
import { PageHeader } from '../components/ui/page-header'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/ui/empty-state'
import { Alert } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { formatPrice } from '../lib/format'

function getStatusVariant(status: string): 'info' | 'success' | 'warning' {
  if (status === 'delivered' || status === 'paid') return 'success'
  if (status === 'cancelled' || status === 'refunded') return 'warning'
  return 'info'
}

export function OrdersPage() {
  const location = useLocation()
  const inAccount = location.pathname.startsWith('/compte')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })

  const header = inAccount ? (
    <AccountPageHeader
      eyebrow="Achats"
      title="Mes commandes"
      subtitle="Historique et suivi de toutes tes commandes."
    />
  ) : (
    <PageHeader
      title="Historique et suivi"
      eyebrow="Mes commandes"
      subtitle="Retrouve toutes tes commandes, leur statut et les produits concernés."
    />
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {header}
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-[var(--radius-xl)]" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {header}
        <Alert variant="error">
          Impossible de charger les commandes. Connecte-toi et vérifie l&apos;accès à ton compte.
        </Alert>
      </div>
    )
  }

  if (!data?.results?.length) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          title="Aucune commande pour le moment"
          description="Quand tu passeras une commande, elle apparaîtra ici avec son statut."
          action={
            <Button asChild variant="brand">
              <Link to="/produits">Commencer mes achats</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="space-y-4">
        {data.results.map((order) => (
          <article
            key={order.id}
            className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-soft)]"
          >
            <Link
              to={`/compte/commandes/${order.id}`}
              className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4 transition hover:bg-[var(--color-bg-warm)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-[var(--color-text)]">
                    Commande {order.number}
                  </h2>
                  <Badge variant={getStatusVariant(order.status)}>
                    {orderStatusLabel(order.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <p className="text-xl font-bold text-[var(--color-brand)]">
                {formatPrice(order.total, order.currency)}
              </p>
            </Link>

            <div className="space-y-2 p-5 sm:p-6">
              {order.items?.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{item.product_name}</p>
                    <p className="text-[var(--color-muted)]">Quantité : {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {formatPrice(item.total_price)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
