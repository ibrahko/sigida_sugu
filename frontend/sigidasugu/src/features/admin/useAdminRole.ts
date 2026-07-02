import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '../accounts/api'

export type AdminRole = 'staff' | 'admin'

export function useAdminRole() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 60_000,
  })

  const role = user?.role as AdminRole | undefined
  const isAdmin = role === 'admin'
  const isStaff = role === 'staff' || role === 'admin'

  return { role, isAdmin, isStaff, user }
}
