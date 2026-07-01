import { api } from '../../services/api'
import type { CreateOrderPayload, Order, OrdersResponse } from '../../types/orders'

export async function fetchOrders(): Promise<OrdersResponse> {
  const { data } = await api.get<OrdersResponse>('/orders/')
  return data
}

export async function fetchOrder(id: string | number): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}/`)
  return data
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<Order>('/orders/', payload)
  return data
}
