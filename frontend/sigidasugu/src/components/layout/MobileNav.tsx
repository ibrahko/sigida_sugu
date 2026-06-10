import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react'
import { cn } from '../../lib/cn'

const items = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/produits', label: 'Produits', icon: LayoutGrid },
  { to: '/panier', label: 'Panier', icon: ShoppingCart },
  { to: '/compte', label: 'Compte', icon: User },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white/95 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition',
                isActive
                  ? 'text-[var(--color-brand)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-2xl transition',
                    isActive && 'bg-[var(--color-brand)]/10',
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
