import { Link } from 'react-router-dom'
import { Globe, Mail, MapPin, Phone, Share2 } from 'lucide-react'
import { Logo } from '../brand/Logo'

const links = {
  shop: [
    { label: 'Tous les produits', to: '/produits' },
    { label: 'Catégories', to: '/produits' },
    { label: 'Promotions', to: '/produits?ordering=-created_at' },
  ],
  account: [
    { label: 'Mon compte', to: '/compte' },
    { label: 'Mes commandes', to: '/commandes' },
    { label: 'Mes adresses', to: '/compte/adresses' },
  ],
  help: [
    { label: 'Comment commander', to: '/' },
    { label: 'Modes de paiement', to: '/commande' },
    { label: 'Livraison', to: '/' },
  ],
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-ink)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Logo variant="light" />
            <p className="max-w-xs text-sm leading-6 text-white/70">
              Marketplace généraliste pour Bamako. Courses du quotidien, high-tech et équipements —
              livraison locale et paiements adaptés au Mali.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20"
                aria-label="Réseaux sociaux"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20"
                aria-label="Site web"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-accent-muted)]">
              Boutique
            </h3>
            <ul className="space-y-2.5">
              {links.shop.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/70 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-accent-muted)]">
              Mon compte
            </h3>
            <ul className="space-y-2.5">
              {links.account.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/70 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-accent-muted)]">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-light)]" />
                Bamako, Mali
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[var(--color-brand-light)]" />
                +223 XX XX XX XX
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[var(--color-brand-light)]" />
                contact@sigidasugu.ml
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Sigida Sugu. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white/50">
            <span className="rounded-full bg-white/10 px-3 py-1">Orange Money</span>
            <span className="rounded-full bg-white/10 px-3 py-1">Moov Money</span>
            <span className="rounded-full bg-white/10 px-3 py-1">InTouch</span>
            <span className="rounded-full bg-white/10 px-3 py-1">Paiement à la livraison</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
