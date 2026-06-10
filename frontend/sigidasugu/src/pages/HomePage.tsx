import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
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

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts,
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
      {/* Hero — clair et épuré */}
      <section className="pattern-kente relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white px-6 py-10 shadow-[var(--shadow-card)] lg:px-12 lg:py-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-brand-soft)] blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[var(--color-accent-soft)] blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-muted)] bg-[var(--color-brand-soft)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" />
              Marketplace Bamako
            </span>

            <h1
              className="max-w-2xl text-4xl font-extrabold leading-[1.1] text-[var(--color-text)] lg:text-[3.25rem]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Le marché de Bamako,{' '}
              <span className="text-[var(--color-brand)]">dans ta poche.</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-[var(--color-text-secondary)]">
              Courses du quotidien, high-tech et équipements maison. Commande en quelques
              clics, paie en Mobile Money et reçois chez toi.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="brand">
                <Link to="/produits">
                  Commencer mes courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/produits?ordering=-created_at">Nouveautés</Link>
              </Button>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {[
                { icon: Truck, text: 'Livraison locale' },
                { icon: Wallet, text: 'Mobile Money InTouch' },
                { icon: ShieldCheck, text: 'Paiement sécurisé' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <Icon className="h-4 w-4 shrink-0 text-[var(--color-brand-light)]" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card space-y-4 rounded-[var(--radius-xl)] p-6">
            <p className="text-sm font-semibold text-[var(--color-text)]">Recherche rapide</p>
            <Input
              placeholder="Riz, huile, téléphone..."
              onChange={(e) => handleSearch(e.target.value)}
              className="border-[var(--color-border)] bg-[var(--color-surface-soft)]"
              iconLeft={<Search className="h-4 w-4 text-[var(--color-muted)]" />}
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '500+', label: 'Produits actifs' },
                { value: '4,8/5', label: 'Satisfaction' },
                { value: '24h', label: 'Livraison express' },
                { value: 'XOF', label: 'Paiement local' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-[var(--color-bg-warm)] px-4 py-3"
                >
                  <p className="text-xl font-bold text-[var(--color-text)]">{stat.value}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand)]">
              Catalogue
            </p>
            <h2
              className="mt-1 text-2xl font-bold text-[var(--color-text)] lg:text-3xl"
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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-[var(--radius-xl)] lg:h-64" />
            ))}
          </div>
        ) : categories?.length ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
                  className="group relative block h-48 overflow-hidden rounded-[var(--radius-xl)] lg:h-64"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: imageUrl
                        ? `url(${imageUrl})`
                        : 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand-light))',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />
                  <div className="relative z-10 flex h-full items-end p-5">
                    <div>
                      <h3
                        className="text-xl font-bold text-white lg:text-2xl"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {category.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-white/75 lg:text-sm">
                        {category.description || 'Découvrir les produits'}
                      </p>
                    </div>
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

      {/* Featured products */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand)]">
              Populaires
            </p>
            <h2
              className="mt-1 text-2xl font-bold text-[var(--color-text)] lg:text-3xl"
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-[var(--radius-xl)]" />
            ))}
          </div>
        ) : products?.results?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                imageUrl={getProductImageUrl(product)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Aucun produit vedette" description="Configure des produits en vedette." />
        )}
      </section>

      {/* How it works */}
      <section className="rounded-[var(--radius-2xl)] bg-[var(--color-bg-warm)] p-8 lg:p-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand)]">
            Simple et rapide
          </p>
          <h2
            className="mt-2 text-2xl font-bold text-[var(--color-text)] lg:text-3xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Comment ça marche ?
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="relative rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <span className="absolute -top-3 left-6 grid h-8 w-8 place-items-center rounded-full bg-[var(--color-brand)] text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="mb-4 mt-2 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-[var(--color-text)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment trust band — SRS 8.7 */}
      <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white">
        <div className="grid lg:grid-cols-[1fr_2fr]">
          <div className="bg-[var(--color-ink)] p-8 text-white lg:p-10">
            <Package className="mb-4 h-8 w-8 text-[var(--color-accent-muted)]" />
            <h2
              className="text-xl font-bold lg:text-2xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Paiements adaptés au Mali
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
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
                className={`flex flex-col justify-center bg-white p-5 ${item.active ? '' : 'opacity-60'}`}
              >
                <p className="text-sm font-semibold text-[var(--color-text)]">{item.label}</p>
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
