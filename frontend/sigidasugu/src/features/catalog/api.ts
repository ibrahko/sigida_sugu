import { api } from '../../services/api'
import type {
  PaginatedResponse,
  ProductDetail,
  ProductListItem,
  Category,
  Brand,
} from '../../types/catalog'

export async function fetchFeaturedProducts() {
  const { data } = await api.get<PaginatedResponse<ProductListItem>>(
    '/catalog/products/?featured=true'
  )
  return data
}

export async function fetchProducts(params?: Record<string, string>) {
  const query = new URLSearchParams(params || {}).toString()
  const { data } = await api.get<PaginatedResponse<ProductListItem>>(
    `/catalog/products/${query ? `?${query}` : ''}`
  )
  return data
}

export async function fetchProductById(id: string | number) {
  const { data } = await api.get<ProductDetail>(`/catalog/products/${id}/`)
  return data
}

export async function fetchCategories() {
  const { data } = await api.get<PaginatedResponse<Category> | Category[]>(
    '/catalog/categories/'
  )

  if (Array.isArray(data)) {
    return data
  }

  return data.results ?? []
}

export async function fetchBrands() {
  const { data } = await api.get<PaginatedResponse<Brand> | Brand[]>(
    '/catalog/brands/'
  )

  if (Array.isArray(data)) {
    return data
  }

  return data.results ?? []
}