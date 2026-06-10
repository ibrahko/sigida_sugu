import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, User } from 'lucide-react'
import { api } from '../services/api'
import { AccountPageHeader } from '../components/account/AccountLayout'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/ui/empty-state'

type Me = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  phone?: string
}

type Address = {
  id: number
  label: string
  full_name: string
  phone: string
  line1: string
  line2?: string
  city: string
  region: string
  country: string
  landmark?: string
  is_default: boolean
}

type PaginatedResponse<T> = {
  count: number
  results: T[]
}

async function fetchMe() {
  const { data } = await api.get<Me>('/accounts/me/')
  return data
}

async function fetchAddresses() {
  const { data } = await api.get<Address[] | PaginatedResponse<Address>>(
    '/accounts/addresses/',
  )
  if (Array.isArray(data)) return data
  return data.results ?? []
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-[var(--color-surface-soft)] px-4 py-4">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[var(--color-brand)] shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  )
}

export function AccountPage() {
  const { data: me, isLoading: meLoading, isError: meError } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  })

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['account-addresses'],
    queryFn: fetchAddresses,
  })

  if (meLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-72 rounded-[var(--radius-xl)]" />
      </div>
    )
  }

  if (meError || !me) {
    return (
      <EmptyState
        title="Profil indisponible"
        description="Impossible de charger tes informations."
        action={
          <Button asChild variant="brand">
            <Link to="/connexion">Se connecter</Link>
          </Button>
        }
      />
    )
  }

  const defaultAddress = addresses?.find((a) => a.is_default) || addresses?.[0]

  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Compte"
        title="Profil & sécurité"
        subtitle="Tes informations personnelles utilisées pour les commandes."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link to="/compte/adresses">
              <MapPin className="h-4 w-4" />
              Gérer les adresses
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informations */}
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-5 flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--color-brand)]" />
            <h2 className="font-semibold text-[var(--color-text)]">Informations personnelles</h2>
          </div>
          <div className="space-y-3">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Nom complet"
              value={`${me.first_name} ${me.last_name}`.trim() || me.username}
            />
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={me.email || '—'}
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Téléphone"
              value={me.phone || 'Non renseigné'}
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Identifiant"
              value={`@${me.username}`}
            />
          </div>
        </section>

        {/* Adresse principale */}
        <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--color-brand)]" />
              <h2 className="font-semibold text-[var(--color-text)]">Adresse principale</h2>
            </div>
            <span className="text-xs text-[var(--color-muted)]">
              {addresses?.length || 0} enregistrée(s)
            </span>
          </div>

          {addressesLoading ? (
            <Skeleton className="h-32 rounded-2xl" />
          ) : defaultAddress ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-[var(--color-text)]">{defaultAddress.label}</p>
                {defaultAddress.is_default && (
                  <span className="rounded-full bg-[var(--color-brand-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--color-brand)]">
                    Par défaut
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-1 text-sm text-[var(--color-text-secondary)]">
                <p className="font-medium text-[var(--color-text)]">{defaultAddress.full_name}</p>
                <p>{defaultAddress.phone}</p>
                <p>{defaultAddress.line1}</p>
                <p>
                  {defaultAddress.city}, {defaultAddress.region}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="mt-4 px-0">
                <Link to="/compte/adresses">Voir toutes les adresses →</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 text-center">
              <p className="text-sm text-[var(--color-muted)]">
                Aucune adresse enregistrée pour le moment.
              </p>
              <Button asChild variant="brand" size="sm" className="mt-4">
                <Link to="/compte/adresses">Ajouter une adresse</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
