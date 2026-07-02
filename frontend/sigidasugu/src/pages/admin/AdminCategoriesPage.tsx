import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type AdminCategory,
  type CategoryPayload,
} from '../../features/admin/api'
import { useAdminRole } from '../../features/admin/useAdminRole'

const EMPTY: CategoryPayload = { name: '', description: '', is_active: true, sort_order: 0 }

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const { isAdmin } = useAdminRole()
  const [form, setForm] = useState<CategoryPayload>(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  })

  const save = useMutation({
    mutationFn: () =>
      editId !== null ? updateCategory(editId, form) : createCategory(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setShowForm(false)
      setForm(EMPTY)
      setEditId(null)
    },
  })

  const del = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })

  const openEdit = (cat: AdminCategory) => {
    setEditId(cat.id)
    setForm({
      name: cat.name,
      description: cat.description,
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    })
    setShowForm(true)
  }

  const openNew = () => {
    setEditId(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Catégories</h1>
        {isAdmin && (
          <button onClick={openNew} style={btnStyle('#6366f1')}>
            <Plus size={16} /> Nouvelle catégorie
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600 }}>{editId ? 'Modifier' : 'Nouvelle catégorie'}</span>
            <button onClick={() => setShowForm(false)} style={iconBtn}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Nom *</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nom de la catégorie"
              />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Description</label>
              <input
                style={inputStyle}
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
              />
            </div>
            <div>
              <label style={labelStyle}>Ordre</label>
              <input
                style={inputStyle}
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 2 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#94a3b8' }}>
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => save.mutate()}
              disabled={!form.name || save.isPending}
              style={btnStyle('#6366f1')}
            >
              <Check size={16} /> {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} style={btnStyle('#334155')}>
              Annuler
            </button>
          </div>
          {save.isError && (
            <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>Erreur lors de la sauvegarde.</p>
          )}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <p style={{ color: '#64748b' }}>Chargement…</p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {['Nom', 'Slug', 'Ordre', 'Active', ''].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={td}>{cat.name}</td>
                  <td style={{ ...td, color: '#64748b', fontSize: 13 }}>{cat.slug}</td>
                  <td style={td}>{cat.sort_order}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: 12, padding: '2px 8px', borderRadius: 99,
                      background: cat.is_active ? '#10b98122' : '#64748b22',
                      color: cat.is_active ? '#10b981' : '#94a3b8',
                    }}>
                      {cat.is_active ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    {isAdmin && (
                      <>
                        <button onClick={() => openEdit(cat)} style={iconBtn} title="Modifier"><Pencil size={15} /></button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer "${cat.name}" ?`)) del.mutate(cat.id)
                          }}
                          style={{ ...iconBtn, color: '#f87171' }}
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <p style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Aucune catégorie.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const btnStyle = (bg: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 6,
  background: bg, color: '#fff', border: 'none',
  padding: '8px 14px', borderRadius: 8, fontSize: 14,
  cursor: 'pointer', fontWeight: 500,
})
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: '#64748b',
  cursor: 'pointer', padding: '4px 6px',
}
const formCard: React.CSSProperties = {
  background: '#161b27', border: '1px solid #1e293b',
  borderRadius: 12, padding: 20, marginBottom: 24,
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f1117',
  border: '1px solid #1e293b', borderRadius: 8,
  padding: '8px 12px', color: '#e2e8f0', fontSize: 14,
  boxSizing: 'border-box',
}
const tableWrap: React.CSSProperties = {
  background: '#161b27', border: '1px solid #1e293b',
  borderRadius: 12, overflow: 'hidden',
}
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const th: React.CSSProperties = {
  textAlign: 'left', padding: '10px 16px', fontSize: 12,
  color: '#64748b', borderBottom: '1px solid #1e293b', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '.05em',
}
const td: React.CSSProperties = { padding: '12px 16px', fontSize: 14 }
