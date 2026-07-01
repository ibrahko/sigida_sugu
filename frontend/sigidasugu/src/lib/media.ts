const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://127.0.0.1:8000'

export function getMediaUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export function getProductImageUrl(product: {
  primary_image?: string | null | { image?: string }
  images?: { image: string; is_primary?: boolean }[]
}): string {
  if (!product.primary_image && product.images?.length) {
    const primary = product.images.find((i) => i.is_primary) || product.images[0]
    return getMediaUrl(primary?.image)
  }
  if (typeof product.primary_image === 'string') {
    return getMediaUrl(product.primary_image)
  }
  if (product.primary_image && typeof product.primary_image === 'object') {
    return getMediaUrl(product.primary_image.image)
  }
  return ''
}
