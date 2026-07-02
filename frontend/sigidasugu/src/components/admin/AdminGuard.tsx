import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { fetchMe } from '../../features/accounts/api'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  })

  if (!token) return <Navigate to="/connexion" replace />

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f1117',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#64748b', fontSize: 14,
      }}>
        Vérification des droits…
      </div>
    )
  }

  const role = user?.role
  if (isError || (role !== 'staff' && role !== 'admin')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
