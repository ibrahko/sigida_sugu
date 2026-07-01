export interface CartItem {
  id: number
  product: number
  product_name: string
  variant?: number | null
  variant_name?: string
  quantity: number
  unit_price: string
  total_price: string
  product_image?: string | null
}

export interface Cart {
  id: number
  items: CartItem[]
  total_quantity: number
  subtotal: string
}
