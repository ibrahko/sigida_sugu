export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
  is_staff?: boolean
}

export interface Address {
  id: number
  label: string
  full_name: string
  phone: string
  line1: string
  line2?: string
  city: string
  region: string
  country: string
  landmark?: string
  is_default: boolean
}

export type AddressFormData = Omit<Address, 'id' | 'is_default'> & {
  is_default?: boolean
}

export interface AccountSummary {
  orders_count: number
  total_spent: string
  last_order: {
    id: number
    number: string
    status: string
    total: string
    currency: string
    created_at: string
  } | null
}

export interface AuthTokens {
  access: string
  refresh: string
}
