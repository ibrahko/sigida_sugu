import { api } from '../../services/api'
import type { PaginatedResponse } from '../../types/catalog'
import type { DeliveryZone } from '../../types/delivery'

export async function fetchDeliveryZones(): Promise<DeliveryZone[]> {
  const { data } = await api.get<DeliveryZone[] | PaginatedResponse<DeliveryZone>>('/delivery/')
  if (Array.isArray(data)) return data
  return data.results ?? []
}
