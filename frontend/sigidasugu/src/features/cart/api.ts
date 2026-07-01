import { api } from '../../services/api'
import type { Cart } from '../../types/cart'

export async function fetchCart(): Promise<Cart> {
  const { data } = await api.get<Cart>('/cart/me/')
  return data
}

export async function addToCart(payload: {
  product_id: number
  quantity: number
  variant_id?: number
}): Promise<Cart> {
  const { data } = await api.post<Cart>('/cart/add/', payload)
  return data
}

export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
  const { data } = await api.patch<Cart>(`/cart/items/${itemId}/`, { quantity })
  return data
}

export async function deleteCartItem(itemId: number): Promise<Cart> {
  const { data } = await api.delete<Cart>(`/cart/items/${itemId}/`)
  return data
}
