import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { fetchBrands, fetchCategories, fetchProducts } from '../features/catalog/api'
import { ProductCard } from '../components/catalog/ProductCard'
import {
  ActiveFilterChips,
  CatalogEmptyState,
  CatalogPagination,
  CategoryRail,
  ProductCardSkeleton,
  SortPills,
} from '../components/catalog/CatalogUI'
import { Button } from '../components/ui/button'
import { getProductImageUrl } from '../lib/media'
import type { Brand, Category } from '../types/catalog'

function findCategoryName(categories: Category[] | undefined, slug: string) {
  return categories?.find((c) => c.slug === slug)?.name || slug
}

function findBrandName(brands: Brand[] | undefined, slug: string) {
  return brands?.find((b) => b.slug === slug)?.name || slug
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const currentCategory = searchParams.get('category') || ''
  const currentBrand = searchParams.get('brand') || ''
  const currentOrdering = searchParams.get('ordering') || '-created_at'
  const currentSearch = searchParams.get('search') || ''
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      ordering: currentOrdering,
      page: String(currentPage),
    }
    if (currentCategory) params.category = currentCategory
    if (currentBrand) params.brand = currentBrand
    if (currentSearch) params.search = currentSearch
    return params
  }, [currentCategory, currentBrand, currentOrdering, currentSearch, currentPage])

  const { data: products, isLoading, isError, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => fetchProducts(queryParams),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  })

  const updateParam = (key: string, value: string, resetPage = true) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (resetPage && key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const setPage = (page: number) => updateParam('page', page > 1 ? String(page) : '', false)

  const resetFilters = () => {
    setSearch('')
    setSearchParams({})
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('search', search.trim())
  }

  const activeFilters = [
    currentCategory && {
      key: 'category',
      label: findCategoryName(categories, currentCategory),
      onRemove: () => updateParam('category', ''),
    },
    currentBrand && {
      key: 'brand',
      label: findBrandName(brands, currentBrand),
      onRemove: () => updateParam('brand', ''),
    },
    currentSearch && {
      key: 'search',
      label: `« ${currentSearch} »`,
      onRemove: () => {
        setSearch('')
        updateParam('search', '')
      },
    },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[]

  const activeFiltersCount = activeFilters.length
  const categoryTitle = currentCategory
    ? findCategoryName(categories, currentCategory)
    : 'Tous les produits'

  const sidebarFilters = (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Catégories
        </p>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => updateParam('category', '')}
              className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                !currentCategory
                  ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-warm)]'
              }`}
            >
              Toutes les catégories
            </button>
          </li>
          {categories?.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => updateParam('category', cat.slug)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  currentCategory === cat.slug
                    ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-warm)]'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {brands && brands.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Marques
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateParam('brand', '')}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                !currentBrand
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                  : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-brand-muted)]'
              }`}
            >
              Toutes
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => updateParam('brand', brand.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  currentBrand === brand.slug
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-brand-muted)]'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Trier par
        </p>
        <SortPills value={currentOrdering} onChange={(v) => updateParam('ordering', v)} />
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="secondary" fullWidth size="sm" onClick={resetFilters}>
          Effacer les filtres
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumb + titre */}
      <div className="space-y-4">
        <nav className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
          <Link to="/" className="hover:text-[var(--color-brand)]">
            Accueil
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-[var(--color-text)]">Produits</span>
          {currentCategory && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-[var(--color-brand)]">{categoryTitle}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)]">
              Catalogue
            </p>
            <h1
              className="mt-1 text-3xl font-bold text-[var(--color-text)] lg:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {categoryTitle}
            </h1>
            {!isLoading && products && (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {products.count} produit{products.count !== 1 ? 's' : ''} disponible
                {products.count !== 1 ? 's' : ''}
                {isFetching && !isLoading ? ' · mise à jour…' : ''}
              </p>
            )}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full max-w-lg items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-2.5 shadow-[var(--shadow-soft)] focus-within:border-[var(--color-brand-muted)] focus-within:ring-2 focus-within:ring-[var(--color-brand)]/10"
          >
            <Search className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher riz, téléphone, huile…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  updateParam('search', '')
                }}
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button type="submit" size="sm" variant="brand">
              Chercher
            </Button>
          </form>
        </div>
      </div>

      {/* Catégories rapides */}
      {categories && categories.length > 0 && (
        <CategoryRail
          categories={categories}
          activeSlug={currentCategory}
          onSelect={(slug) => updateParam('category', slug)}
        />
      )}

      {/* Mobile toolbar */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFiltersOpen(true)}
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
        >
          Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
        <SortPills
          value={currentOrdering}
          onChange={(v) => updateParam('ordering', v)}
          className="max-w-[60vw] overflow-x-auto"
        />
      </div>

      {activeFilters.length > 0 && <ActiveFilterChips filters={activeFilters} />}

      {/* Drawer mobile filtres */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
            aria-label="Fermer"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-[var(--radius-2xl)] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-text)]">Filtres</h2>
              <button type="button" onClick={() => setFiltersOpen(false)}>
                <X className="h-5 w-5 text-[var(--color-muted)]" />
              </button>
            </div>
            {sidebarFilters}
            <Button
              variant="brand"
              fullWidth
              className="mt-6"
              onClick={() => setFiltersOpen(false)}
            >
              Voir les résultats
            </Button>
          </div>
        </div>
      )}

      {/* Layout principal */}
      <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-5 flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
              <SlidersHorizontal className="h-4 w-4 text-[var(--color-brand)]" />
              <h2 className="font-semibold text-[var(--color-text)]">Affiner</h2>
            </div>
            {sidebarFilters}
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {/* Toolbar desktop */}
          <div className="hidden items-center justify-between lg:flex">
            <SortPills value={currentOrdering} onChange={(v) => updateParam('ordering', v)} />
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-[var(--color-brand)] hover:underline"
              >
                Tout effacer
              </button>
            )}
          </div>

          {/* Grille produits */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <CatalogEmptyState
              title="Catalogue indisponible"
              description="Impossible de joindre le serveur. Vérifie que le backend Django tourne sur le port 8000."
            />
          ) : products?.results?.length ? (
            <>
              <div
                className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${
                  isFetching ? 'opacity-70 transition-opacity' : ''
                }`}
              >
                {products.results.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    imageUrl={getProductImageUrl(product)}
                  />
                ))}
              </div>

              <CatalogPagination
                count={products.count}
                page={currentPage}
                onPageChange={setPage}
              />
            </>
          ) : (
            <CatalogEmptyState
              title="Aucun produit trouvé"
              description="Essaie une autre recherche ou modifie tes filtres pour découvrir plus de produits."
              onReset={activeFiltersCount > 0 ? resetFilters : undefined}
            />
          )}
        </div>
      </section>
    </div>
  )
}
