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
            <p className="max-w-xs text-sm leading-6 text-white/65">
              Marketplace généraliste pour Bamako. Courses du quotidien, high-tech et équipements —
              livraison locale et paiements adaptés au Mali.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Réseaux sociaux"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Site web"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Boutique
            </h3>
            <ul className="space-y-2.5">
              {links.shop.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/65 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Mon compte
            </h3>
            <ul className="space-y-2.5">
              {links.account.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/65 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/65">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                Bamako, Mali
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                +223 XX XX XX XX
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                contact@sigidasugu.ml
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Sigida Sugu. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-[10px] font-semibold">
            {['Orange Money', 'Moov Money', 'InTouch', 'Paiement livraison'].map((label) => (
              <span key={label} className="rounded-full border border-white/15 bg-white/08 px-3 py-1 text-white/50">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
