import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react'
import { fetchDashboardStats } from '../../features/admin/api'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchDashboardStats,
  })

  const cards = [
    {
      label: 'Commandes totales',
      value: data?.totalOrders ?? '—',
      icon: ShoppingCart,
      color: '#6366f1',
    },
    {
      label: 'En attente',
      value: data?.pendingOrders ?? '—',
      icon: Clock,
      color: '#f59e0b',
    },
    {
      label: 'Produits',
      value: data?.totalProducts ?? '—',
      icon: Package,
      color: '#10b981',
    },
    {
      label: 'Chiffre d\'affaires',
      value: data ? `${Number(data.totalRevenue).toLocaleString('fr-FR')} FCFA` : '—',
      icon: TrendingUp,
      color: '#3b82f6',
    },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>

      {isLoading ? (
        <p style={{ color: '#64748b' }}>Chargement…</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{
              background: '#161b27',
              border: '1px solid #1e293b',
              borderRadius: 12,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{value}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
