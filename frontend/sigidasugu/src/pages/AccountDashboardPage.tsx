import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Package, ShoppingBag, Wallet } from 'lucide-react'
import { fetchAccountSummary, fetchAddresses } from '../features/accounts/api'
import { AccountPageHeader } from '../components/account/AccountLayout'
import {
  AccountStatCard,
  formatOrderTotal,
  orderStatusLabel,
} from '../components/account/AccountStatCard'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { formatPrice } from '../lib/format'

async function fetchAddressCount() {
  const addresses = await fetchAddresses()
  return addresses.length
}

export function AccountDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['account-summary'],
    queryFn: fetchAccountSummary,
  })

  const { data: addressCount } = useQuery({
    queryKey: ['account-addresses-count'],
    queryFn: fetchAddressCount,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-[var(--radius-xl)]" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-[var(--radius-xl)]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Mon espace"
        title="Tableau de bord"
        subtitle="Vue d'ensemble de ton activité sur Sigida Sugu."
        actions={
          <Button asChild variant="brand" size="sm">
            <Link to="/produits">
              <ShoppingBag className="h-4 w-4" />
              Continuer mes achats
            </Link>
          </Button>
        }
      />

      {isError && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          Certaines statistiques sont indisponibles. Tu peux quand même accéder à ton profil et tes commandes.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AccountStatCard
          label="Commandes"
          value={String(data?.orders_count ?? 0)}
          hint="commandes passées sur la plateforme"
          icon={Package}
          href="/compte/commandes"
          linkLabel="Voir l'historique"
        />
        <AccountStatCard
          label="Dépenses"
          value={formatPrice(data?.total_spent ?? '0')}
          hint="total cumulé de tes achats"
          icon={Wallet}
          tone="accent"
          href="/compte/commandes"
          linkLabel="Détails"
        />
        <AccountStatCard
          label="Adresses"
          value={String(addressCount ?? 0)}
          hint="adresses enregistrées pour la livraison"
          icon={MapPin}
          tone="neutral"
          href="/compte/adresses"
          linkLabel="Gérer mes adresses"
        />
      </div>

      {/* Dernière commande */}
      <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-[var(--color-text)]">Activité récente</h2>
          <Link
            to="/compte/commandes"
            className="text-sm font-medium text-[var(--color-brand)] hover:underline"
          >
            Tout voir
          </Link>
        </div>

        <div className="p-5 sm:p-6">
          {data?.last_order ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    Commande {data.last_order.number}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {new Date(data.last_order.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[var(--color-brand-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-brand)]">
                    {orderStatusLabel(data.last_order.status)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <p className="text-lg font-bold text-[var(--color-text)]">
                  {formatOrderTotal(data.last_order.total, data.last_order.currency)}
                </p>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/compte/commandes">
                    Suivre
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-bg-warm)] text-[var(--color-muted)]">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold text-[var(--color-text)]">
                Aucune commande pour l&apos;instant
              </p>
              <p className="mt-1 max-w-sm text-sm text-[var(--color-muted)]">
                Parcours le catalogue et passe ta première commande — elle apparaîtra ici.
              </p>
              <Button asChild variant="brand" className="mt-5" size="sm">
                <Link to="/produits">Découvrir les produits</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Raccourcis */}
      <section className="grid gap-3 sm:grid-cols-2">
        {[
          { to: '/compte/profil', title: 'Profil & sécurité', desc: 'Informations personnelles' },
          { to: '/compte/adresses', title: 'Mes adresses', desc: 'Livraison à Bamako et alentours' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)] transition hover:border-[var(--color-brand-muted)] hover:shadow-[var(--shadow-card)]"
          >
            <div>
              <p className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-brand)]">
                {item.title}
              </p>
              <p className="mt-0.5 text-sm text-[var(--color-muted)]">{item.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[var(--color-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-brand)]" />
          </Link>
        ))}
      </section>
    </div>
  )
}
