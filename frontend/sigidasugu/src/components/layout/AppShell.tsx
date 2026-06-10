import { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react'
import { Logo } from '../brand/Logo'
import { AnnouncementBar } from './AnnouncementBar'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { cn } from '../../lib/cn'

const navLinks = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/produits', label: 'Produits' },
  { to: '/commandes', label: 'Commandes' },
]

export function AppShell() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/produits?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col pb-20 md:pb-0">
      <AnnouncementBar />

      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:gap-6 lg:px-8 lg:py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl text-[var(--color-text)] md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo />
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-2.5 md:flex lg:max-w-xl"
          >
            <Search className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
              placeholder="Riz, huile, téléphone, électroménager..."
            />
          </form>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-warm)]',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/compte"
              className="hidden h-10 w-10 place-items-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-warm)] sm:grid"
              aria-label="Mon compte"
            >
              <User className="h-4 w-4" />
            </Link>

            <Link
              to="/panier"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-dark)]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Panier</span>
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[var(--color-border)] bg-white px-4 py-4 md:hidden">
            <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--color-muted)]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Rechercher..."
              />
            </form>
            <div className="flex flex-col gap-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-medium',
                      isActive
                        ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                        : 'text-[var(--color-text-secondary)]',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="animate-fade-up">
          <Outlet />
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
