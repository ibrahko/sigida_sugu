export interface DeliveryZone {
  id: number
  name: string
  code: string
  fee: string
  estimated_min_days: number
  estimated_max_days: number
  is_active?: boolean
}
