export interface OrderItem {
  id: number
  product: number
  product_name: string
  variant_name?: string
  sku: string
  unit_price: string
  quantity: number
  line_total: string
  total_price?: string
  primary_image?: { image: string } | null
}

export interface Order {
  id: number
  number: string
  status: string
  subtotal: string
  delivery_fee: string
  discount_amount: string
  total: string
  currency: string
  notes?: string
  created_at: string
  updated_at?: string
  user?: { id: number; email: string; first_name: string; last_name: string } | null
  items: OrderItem[]
  delivery_address?: {
    label: string
    full_name: string
    phone: string
    line1: string
    city: string
    region: string
  } | null
  delivery_zone?: {
    name: string
    estimated_min_days: number
    estimated_max_days: number
    fee: string
  } | null
}

export interface OrdersResponse {
  count: number
  results: Order[]
}

export interface CreateOrderPayload {
  items: { product_id: number; quantity: number; variant_id?: number }[]
  delivery_address_id: number
  delivery_zone_id: number
  delivery_fee: string
  discount_amount?: string
  notes?: string
}
