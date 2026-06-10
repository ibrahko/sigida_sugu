export interface Category {
    id: number
    name: string
    slug: string
    description?: string
  }
  
  export interface Brand {
    id: number
    name: string
    slug: string
  }
  
  export interface ProductImage {
    id: number
    image: string
    alt_text: string
    is_primary: boolean
    sort_order: number
  }
  
  export interface ProductVariant {
    id: number
    name: string
    sku: string
    price: string
    stock: number
    is_active: boolean
  }
  
  export interface ProductListItem {
    id: number
    name: string
    slug: string
    sku: string
    short_description: string
    price: string
    compare_at_price?: string | null
    sale_price?: string | null
    currency: string
    stock: number
    is_featured: boolean
    is_active: boolean
    category: Category
    brand: Brand
    primary_image?: string | null
  }
  
  export interface ProductDetail extends ProductListItem {
    description?: string
    images: ProductImage[]
    variants: ProductVariant[]
  }
  
  export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
  }