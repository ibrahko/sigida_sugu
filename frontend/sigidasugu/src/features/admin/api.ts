import { api } from '../../services/api'
import type { Order } from '../../types/orders'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminCategory {
  id: number
  name: string
  slug: string
  description: string
  image: string | null
  is_active: boolean
  sort_order: number
}

export interface AdminProduct {
  id: number
  name: string
  slug: string
  sku: string
  short_description: string
  description: string
  price: string
  compare_at_price: string | null
  cost_price: string | null
  stock: number
  track_stock: boolean
  is_active: boolean
  is_featured: boolean
  weight: string | null
  meta_title: string
  meta_description: string
  category: { id: number; name: string } | null
  brand: { id: number; name: string } | null
  images: { id: number; image: string; alt_text: string; is_primary: boolean; sort_order: number }[]
  variants: { id: number; name: string; sku: string; price: string; stock: number; is_active: boolean }[]
  created_at: string
}

export type ProductPayload = {
  name: string
  slug?: string
  sku: string
  short_description?: string
  description?: string
  price: string
  compare_at_price?: string | null
  cost_price?: string | null
  stock?: number
  track_stock?: boolean
  is_active?: boolean
  is_featured?: boolean
  weight?: string | null
  category_id: number
  brand_id?: number | null
}

export type CategoryPayload = {
  name: string
  slug?: string
  description?: string
  is_active?: boolean
  sort_order?: number
}

// ── Categories ────────────────────────────────────────────────────────────────

export const fetchAdminCategories = async (): Promise<AdminCategory[]> => {
  const { data } = await api.get<AdminCategory[]>('/admin/catalog/categories/')
  return data
}

export const createCategory = async (payload: CategoryPayload): Promise<AdminCategory> => {
  const { data } = await api.post<AdminCategory>('/admin/catalog/categories/', payload)
  return data
}

export const updateCategory = async (id: number, payload: Partial<CategoryPayload>): Promise<AdminCategory> => {
  const { data } = await api.patch<AdminCategory>(`/admin/catalog/categories/${id}/`, payload)
  return data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/admin/catalog/categories/${id}/`)
}

// ── Products ──────────────────────────────────────────────────────────────────

export const fetchAdminProducts = async (params?: Record<string, string>): Promise<AdminProduct[]> => {
  const { data } = await api.get<AdminProduct[]>('/admin/catalog/products/', { params })
  return data
}

export const fetchAdminProduct = async (id: number): Promise<AdminProduct> => {
  const { data } = await api.get<AdminProduct>(`/admin/catalog/products/${id}/`)
  return data
}

export const createProduct = async (payload: ProductPayload): Promise<AdminProduct> => {
  const { data } = await api.post<AdminProduct>('/admin/catalog/products/', payload)
  return data
}

export const updateProduct = async (id: number, payload: Partial<ProductPayload>): Promise<AdminProduct> => {
  const { data } = await api.patch<AdminProduct>(`/admin/catalog/products/${id}/`, payload)
  return data
}

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/admin/catalog/products/${id}/`)
}

// ── Orders ────────────────────────────────────────────────────────────────────

export const fetchAdminOrders = async (params?: Record<string, string>): Promise<Order[]> => {
  const { data } = await api.get<Order[]>('/admin/orders/', { params })
  return data
}

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
  const { data } = await api.patch<Order>(`/admin/orders/${id}/`, { status })
  return data
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone: string
  role: 'customer' | 'staff' | 'admin'
  is_active: boolean
  is_staff: boolean
  date_joined: string
  orders_count: number
}

export type UserCreatePayload = {
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  role: 'customer' | 'staff' | 'admin'
  password: string
  is_active?: boolean
}

export type UserUpdatePayload = Partial<Omit<UserCreatePayload, 'username' | 'password'>>

export const fetchAdminUsers = async (params?: Record<string, string>): Promise<AdminUser[]> => {
  const { data } = await api.get<AdminUser[]>('/admin/users/', { params })
  return data
}

export const createUser = async (payload: UserCreatePayload): Promise<AdminUser> => {
  const { data } = await api.post<AdminUser>('/admin/users/', payload)
  return data
}

export const updateUser = async (id: number, payload: UserUpdatePayload): Promise<AdminUser> => {
  const { data } = await api.patch<AdminUser>(`/admin/users/${id}/`, payload)
  return data
}

export const deactivateUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}/`)
}

export type UserInvitePayload = {
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  role: 'customer' | 'staff' | 'admin'
}

export const inviteUser = async (payload: UserInvitePayload): Promise<AdminUser> => {
  const { data } = await api.post<AdminUser>('/admin/users/invite/', payload)
  return data
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  totalRevenue: string
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const [orders, products] = await Promise.all([
    fetchAdminOrders(),
    fetchAdminProducts(),
  ])
  const pending = orders.filter((o) => o.status === 'pending').length
  const revenue = orders
    .filter((o) => ['paid', 'preparing', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + parseFloat(o.total), 0)
  return {
    totalOrders: orders.length,
    pendingOrders: pending,
    totalProducts: products.length,
    totalRevenue: revenue.toFixed(0),
  }
}
