import { api } from '../../services/api'
import type { InitPaymentResponse, PaymentTransaction } from '../../types/payments'

export async function initializeIntouchPayment(payload: {
  order_id: number
  phone?: string
  operator?: string
}): Promise<InitPaymentResponse> {
  const { data } = await api.post<InitPaymentResponse>('/payments/intouch/initialize/', payload)
  return data
}

export async function simulateSandboxPayment(payload: {
  transaction_id: string
  outcome: 'success' | 'failed'
}): Promise<{ transaction_id: string; new_status: string; message: string }> {
  const { data } = await api.post('/payments/sandbox/simulate/', payload)
  return data
}

export async function fetchPaymentStatus(id: number): Promise<PaymentTransaction> {
  const { data } = await api.get<PaymentTransaction>(`/payments/${id}/status/`)
  return data
}
