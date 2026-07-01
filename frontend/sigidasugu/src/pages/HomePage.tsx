import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wallet,
} from 'lucide-react'
import { fetchCategories, fetchFeaturedProducts } from '../features/catalog/api'
import { ProductCard } from '../components/catalog/ProductCard'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/ui/empty-state'
import { Input } from '../components/ui/input'
import { getMediaUrl, getProductImageUrl } from '../lib/media'

export function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [featuredPage, setFeaturedPage] = useState(1)

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products', featuredPage],
    queryFn: () => fetchFeaturedProducts(featuredPage),
  })

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/produits?search=${encodeURIComponent(value.trim())}`)
    } else {
      const next = new URLSearchParams(searchParams)
      next.delete('search')
      setSearchParams(next)
    }
  }

  const steps = [
    {
      icon: ShoppingBag,
      title: 'Choisis tes produits',
      desc: 'Parcours les catégories ou recherche par nom, SKU ou marque.',
    },
    {
      icon: Wallet,
      title: 'Paie comme tu veux',
      desc: 'Mobile Money InTouch, paiement à la livraison ou carte bancaire.',
    },
    {
      icon: Truck,
      title: 'Reçois chez toi',
      desc: 'Livraison à Bamako avec suivi de commande en temps réel.',
    },
  ]

  return (
    <div className="space-y-14">
      {/* ── Hero sombre ── */}
      <section className="relative overflow-hidden rounded-[var(--radius-2xl)] hero-dark">
        <div className="relative grid gap-10 px-7 py-12 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:px-12 lg:py-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              Marketplace Bamako
            </span>

            <h1
              className="max-w-2xl text-4xl font-extrabold leading-[1.1] text-white lg:text-[3.25rem]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Le marché de Bamako,{' '}
              <span className="text-[var(--color-accent)]">dans ta poche.</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/65">
              Courses du quotidien, high-tech et équipements maison. Commande en quelques
              clics, paie en Mobile Money et reçois chez toi.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="gold">
                <Link to="/produits">
                  Commencer mes courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary-dark" size="lg">
                <Link to="/produits?ordering=-created_at">Nouveautés</Link>
              </Button>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {[
                { icon: Truck, text: 'Livraison locale' },
                { icon: Wallet, text: 'Mobile Money InTouch' },
                { icon: ShieldCheck, text: 'Paiement sécurisé' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-white/55">
                  <Icon className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Search card flottante */}
          <div className="glass-card space-y-4 rounded-[var(--radius-xl)] p-6">
            <p className="text-sm font-bold text-white">Accès rapide</p>
            <Input
              placeholder="Riz, huile, téléphone..."
              onChange={(e) => handleSearch(e.target.value)}
              className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-[var(--color-accent)]/60"
              iconLeft={<Search className="h-4 w-4 text-white/50" />}
            />
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { value: '500+', label: 'Produits actifs' },
                { value: '4,8/5', label: 'Satisfaction' },
                { value: '24h', label: 'Livraison express' },
                { value: 'XOF', label: 'Paiement local' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[var(--radius-md)] bg-white/08 border border-white/10 px-4 py-3"
                >
                  <p className="text-xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-[11px] text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="-mt-8 flex flex-wrap divide-x divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-soft)]">
        {[
          { icon: Truck, text: 'Livraison Bamako' },
          { icon: Wallet, text: 'Mobile Money' },
          { icon: ShieldCheck, text: 'Paiement sécurisé' },
          { icon: Package, text: 'Service client 7j/7' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex flex-1 items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-[var(--color-text-secondary)]">
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-brand)]" />
            {text}
          </div>
        ))}
      </div>

      {/* ── Categories ── */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">
              Catalogue
            </p>
            <h2
              className="mt-1.5 text-2xl font-extrabold text-[var(--color-text)] lg:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Catégories principales
            </h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/produits">
              Tout voir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : categories?.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const imageUrl =
                getMediaUrl(
                  (category as { image_url?: string; image?: string }).image_url ||
                    (category as { image?: string }).image,
                ) || ''

              return (
                <Link
                  key={category.id}
                  to={`/produits?category=${category.slug}`}
                  className="group relative block h-24 overflow-hidden rounded-[var(--radius-md)]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: imageUrl
                        ? `url(${imageUrl})`
                        : 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="relative z-10 flex h-full items-end px-3 pb-2.5">
                    <h3 className="text-sm font-bold leading-tight text-white">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="Aucune catégorie"
            description="Les catégories apparaîtront ici une fois configurées."
          />
        )}
      </section>

      {/* ── Featured products ── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">
              Populaires
            </p>
            <h2
              className="mt-1.5 text-2xl font-extrabold text-[var(--color-text)] lg:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Sélection du moment
            </h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/produits">Voir tout</Link>
          </Button>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : products?.results?.length ? (
          <>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageUrl={getProductImageUrl(product)}
                />
              ))}
            </div>

            {/* Pagination */}
            {(products.previous || products.next) && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setFeaturedPage((p) => Math.max(1, p - 1))}
                  disabled={!products.previous}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-[var(--color-muted)]">
                  Page {featuredPage}
                </span>
                <button
                  onClick={() => setFeaturedPage((p) => p + 1)}
                  disabled={!products.next}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState title="Aucun produit vedette" description="Configure des produits en vedette." />
        )}
      </section>

      {/* ── Comment ça marche ── */}
      <section className="rounded-[var(--radius-2xl)] bg-[var(--color-bg-warm)] p-8 lg:p-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">
            Simple et rapide
          </p>
          <h2
            className="mt-2 text-2xl font-extrabold text-[var(--color-text)] lg:text-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Comment ça marche ?
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="relative rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <span className="absolute -top-3.5 left-6 grid h-7 w-7 place-items-center rounded-full bg-[var(--color-brand)] text-xs font-extrabold text-white shadow-md">
                {i + 1}
              </span>
              <div className="mb-4 mt-2 grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[var(--color-text)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Paiements Mali ── */}
      <section className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white">
        <div className="grid lg:grid-cols-[1fr_2fr]">
          <div className="hero-dark p-8 text-white lg:p-10">
            <Package className="mb-4 h-8 w-8 text-[var(--color-accent)]" />
            <h2
              className="text-xl font-extrabold lg:text-2xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Paiements adaptés au Mali
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Intégration InTouch pour Mobile Money, avec fallback paiement à la livraison
              pour une adoption rapide.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--color-border)] sm:grid-cols-4">
            {[
              { label: 'Mobile Money', sub: 'Priorité haute', active: true },
              { label: 'À la livraison', sub: 'Priorité haute', active: true },
              { label: 'Lien de paiement', sub: 'Phase 2', active: false },
              { label: 'Carte bancaire', sub: 'Phase 2', active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex flex-col justify-center bg-white p-5 ${item.active ? '' : 'opacity-50'}`}
              >
                <p className="text-sm font-bold text-[var(--color-text)]">{item.label}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{item.sub}</p>
                {item.active && (
                  <span className="mt-2 w-fit rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-success)]">
                    Disponible
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
