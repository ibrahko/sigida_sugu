import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  User,
} from 'lucide-react'
import { api } from '../../services/api'
import {
  AccountGuestPrompt,
  AccountNav,
  getInitials,
} from '../account/AccountLayout'
import { Skeleton } from '../ui/skeleton'

type Me = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  phone?: string
}

async function fetchMe() {
  const { data } = await api.get<Me>('/accounts/me/')
  return data
}

const navItems = [
  { to: '/compte', label: 'Tableau de bord', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
  { to: '/compte/profil', label: 'Profil', icon: <User className="h-4 w-4" /> },
  { to: '/compte/adresses', label: 'Adresses', icon: <MapPin className="h-4 w-4" /> },
  { to: '/compte/commandes', label: 'Commandes', icon: <Package className="h-4 w-4" /> },
]

export function AccountShell() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const { data: me, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
  })

  if (!token || isError) {
    return <AccountGuestPrompt />
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Skeleton className="hidden h-80 rounded-[var(--radius-xl)] lg:block" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 rounded-[var(--radius-xl)]" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-36 rounded-[var(--radius-xl)]" />
            <Skeleton className="h-36 rounded-[var(--radius-xl)]" />
            <Skeleton className="h-36 rounded-[var(--radius-xl)]" />
          </div>
        </div>
      </div>
    )
  }

  const displayName =
    [me?.first_name, me?.last_name].filter(Boolean).join(' ') || me?.username || 'Mon compte'

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/connexion'
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="rounded-2xl bg-[var(--color-brand-soft)] p-4">
            <div className="flex items-center gap-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--color-brand)] text-sm font-bold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {getInitials(me?.first_name, me?.last_name, me?.username)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--color-text)]">{displayName}</p>
                <p className="truncate text-xs text-[var(--color-muted)]">@{me?.username}</p>
              </div>
            </div>
          </div>

          <AccountNav items={navItems} />

          <div className="border-t border-[var(--color-border)] pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-muted)] transition hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <div className="min-w-0 space-y-6">
        {/* En-tête mobile + nav pills */}
        <div className="space-y-4 lg:hidden">
          <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-soft)]">
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-brand)] text-sm font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {getInitials(me?.first_name, me?.last_name, me?.username)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[var(--color-text)]">{displayName}</p>
              <p className="truncate text-xs text-[var(--color-muted)]">{me?.email}</p>
            </div>
            <Settings className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
          </div>
          <AccountNav items={navItems} variant="mobile" />
        </div>

        <Outlet />
      </div>
    </div>
  )
}
