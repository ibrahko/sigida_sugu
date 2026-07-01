export interface PaymentTransaction {
  id: number
  order: number
  provider: string
  status: string
  amount: string
  currency: string
  internal_reference: string
  provider_reference?: string
}

export interface InitPaymentResponse {
  transaction: PaymentTransaction
  status: string
  message: string
}
