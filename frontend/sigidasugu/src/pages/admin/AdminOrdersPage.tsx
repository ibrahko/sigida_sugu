import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, ChevronDown } from 'lucide-react'
import { fetchAdminOrders, updateOrderStatus } from '../../features/admin/api'
import type { Order } from '../../types/orders'

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#f59e0b22', text: '#f59e0b' },
  paid:      { bg: '#6366f122', text: '#818cf8' },
  preparing: { bg: '#3b82f622', text: '#60a5fa' },
  shipped:   { bg: '#8b5cf622', text: '#a78bfa' },
  delivered: { bg: '#10b98122', text: '#10b981' },
  cancelled: { bg: '#f8717122', text: '#f87171' },
  refunded:  { bg: '#64748b22', text: '#94a3b8' },
}

const STATUS_OPTIONS = Object.keys(STATUS_LABELS)

export default function AdminOrdersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter],
    queryFn: () => fetchAdminOrders(statusFilter ? { status: statusFilter } : undefined),
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  })

  const filtered = orders.filter((o: Order) => {
    const q = search.toLowerCase()
    return (
      o.number.toLowerCase().includes(q) ||
      (o.user?.email ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Commandes</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            style={{ ...inputStyle, paddingLeft: 36 }}
            placeholder="N° commande, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          style={{ ...inputStyle, flex: '0 0 180px', appearance: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p style={{ color: '#64748b' }}>Chargement…</p>
      ) : (
        <div style={tableWrap}>
          {filtered.map((order: Order) => {
            const colors = STATUS_COLORS[order.status] ?? { bg: '#1e293b', text: '#94a3b8' }
            const isOpen = expanded === order.id
            return (
              <div key={order.id} style={{ borderBottom: '1px solid #1e293b' }}>
                {/* Row */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                >
                  <ChevronDown size={16} style={{ color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: '.2s', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, minWidth: 130, fontSize: 14 }}>#{order.number}</span>
                  <span style={{ fontSize: 13, color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.user?.email ?? 'N/A'}
                  </span>
                  <span style={{ fontSize: 14, color: '#e2e8f0', minWidth: 100, textAlign: 'right' }}>
                    {Number(order.total).toLocaleString('fr-FR')} FCFA
                  </span>
                  <span style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 99,
                    background: colors.bg, color: colors.text, whiteSpace: 'nowrap',
                  }}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b', minWidth: 100, textAlign: 'right' }}>
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ padding: '0 16px 20px 44px' }}>
                    {/* Items */}
                    <div style={{ background: '#0f1117', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                          <span style={{ flex: 1, fontSize: 13 }}>{item.product_name}</span>
                          <span style={{ fontSize: 13, color: '#64748b' }}>× {item.quantity}</span>
                          <span style={{ fontSize: 13 }}>{Number(item.line_total).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, fontSize: 14, fontWeight: 600 }}>
                        Total : {Number(order.total).toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>

                    {/* Delivery address */}
                    {order.delivery_address && (
                      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                        <span style={{ color: '#64748b', marginRight: 8 }}>Livraison :</span>
                        {order.delivery_address.full_name} — {order.delivery_address.line1}, {order.delivery_address.city}
                      </div>
                    )}

                    {/* Status change */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>Changer le statut :</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (s !== order.status) changeStatus.mutate({ id: order.id, status: s })
                            }}
                            style={{
                              fontSize: 12, padding: '4px 10px', borderRadius: 99,
                              border: 'none', cursor: 'pointer',
                              background: s === order.status ? STATUS_COLORS[s]?.bg ?? '#1e293b' : '#1e293b',
                              color: s === order.status ? STATUS_COLORS[s]?.text ?? '#94a3b8' : '#64748b',
                              fontWeight: s === order.status ? 600 : 400,
                              transition: 'all .15s',
                            }}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Aucune commande.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#161b27',
  border: '1px solid #1e293b', borderRadius: 8,
  padding: '8px 12px', color: '#e2e8f0', fontSize: 14,
  boxSizing: 'border-box',
}
const tableWrap: React.CSSProperties = {
  background: '#161b27', border: '1px solid #1e293b',
  borderRadius: 12, overflow: 'hidden',
}
