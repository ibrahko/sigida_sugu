import { Link, NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

type AccountNavItem = {
  to: string
  label: string
  icon: React.ReactNode
  end?: boolean
}

type AccountNavProps = {
  items: AccountNavItem[]
  variant?: 'sidebar' | 'mobile'
}

export function AccountNav({ items, variant = 'sidebar' }: AccountNavProps) {
  const isMobile = variant === 'mobile'

  return (
    <nav
      className={cn(
        isMobile
          ? 'flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'space-y-1',
      )}
      aria-label="Navigation du compte"
    >
      {items.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-2.5 font-medium transition',
              isMobile
                ? cn(
                    'rounded-full border px-4 py-2 text-sm',
                    isActive
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-brand-muted)]',
                  )
                : cn(
                    'rounded-xl px-3 py-2.5 text-sm',
                    isActive
                      ? 'bg-[var(--color-brand)] text-white shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-text)]',
                  ),
            )
          }
        >
          {icon}
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AccountPageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            'font-bold text-[var(--color-text)]',
            eyebrow ? 'mt-1 text-2xl lg:text-3xl' : 'text-2xl lg:text-3xl',
          )}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[var(--color-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function getInitials(firstName?: string, lastName?: string, username?: string) {
  const a = firstName?.trim()?.[0] || ''
  const b = lastName?.trim()?.[0] || ''
  if (a || b) return `${a}${b}`.toUpperCase()
  return (username?.trim()?.[0] || '?').toUpperCase()
}

export function AccountGuestPrompt() {
  return (
    <div className="mx-auto max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
      <div
        className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--color-brand-soft)] text-xl font-bold text-[var(--color-brand)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        SS
      </div>
      <h1
        className="mt-6 text-2xl font-bold text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Ton espace client
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
        Connecte-toi pour suivre tes commandes, gérer tes adresses et retrouver ton historique d&apos;achats.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/connexion"
          className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-dark)]"
        >
          Se connecter
        </Link>
        <Link
          to="/inscription"
          className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-soft)]"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  )
}
