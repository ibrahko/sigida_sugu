import { api } from '../../services/api'
import type { PaginatedResponse } from '../../types/catalog'
import type { AccountSummary, Address, AddressFormData, AuthTokens, User } from '../../types/accounts'

export async function login(username: string, password: string): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>('/accounts/login/', { username, password })
  return data
}

export async function register(payload: {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}): Promise<User> {
  const { data } = await api.post<User>('/accounts/register/', payload)
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/accounts/me/')
  return data
}

export async function fetchAccountSummary(): Promise<AccountSummary> {
  const { data } = await api.get<AccountSummary>('/accounts/summary/')
  return data
}

export async function fetchAddresses(): Promise<Address[]> {
  const { data } = await api.get<Address[] | PaginatedResponse<Address>>('/accounts/addresses/')
  if (Array.isArray(data)) return data
  return data.results ?? []
}

export async function createAddress(payload: AddressFormData): Promise<Address> {
  const { data } = await api.post<Address>('/accounts/addresses/', payload)
  return data
}

export async function updateAddress(id: number, payload: AddressFormData): Promise<Address> {
  const { data } = await api.put<Address>(`/accounts/addresses/${id}/`, payload)
  return data
}

export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`/accounts/addresses/${id}/`)
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/accounts/password-reset/', { email })
}

export async function confirmPasswordReset(payload: {
  uid: string
  token: string
  new_password: string
}): Promise<void> {
  await api.post('/accounts/password-reset/confirm/', payload)
}
