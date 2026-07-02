import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react'
import {
  fetchAdminProducts,
  fetchAdminCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  type AdminProduct,
  type ProductPayload,
} from '../../features/admin/api'
import { useAdminRole } from '../../features/admin/useAdminRole'

const EMPTY_FORM: ProductPayload = {
  name: '', sku: '', price: '', short_description: '',
  description: '', stock: 0, is_active: true, is_featured: false,
  track_stock: true, category_id: 0,
}

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const { isAdmin } = useAdminRole()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<ProductPayload>(EMPTY_FORM)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => fetchAdminProducts(),
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  })

  const save = useMutation({
    mutationFn: () =>
      editId !== null ? updateProduct(editId, form) : createProduct(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      setShowForm(false)
      setForm(EMPTY_FORM)
      setEditId(null)
    },
  })

  const del = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const openEdit = (p: AdminProduct) => {
    setEditId(p.id)
    setForm({
      name: p.name,
      sku: p.sku,
      price: p.price,
      short_description: p.short_description,
      description: p.description,
      stock: p.stock,
      is_active: p.is_active,
      is_featured: p.is_featured,
      track_stock: p.track_stock,
      category_id: p.category?.id ?? 0,
      compare_at_price: p.compare_at_price ?? undefined,
      cost_price: p.cost_price ?? undefined,
      weight: p.weight ?? undefined,
    })
    setShowForm(true)
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const f = (k: keyof ProductPayload, v: unknown) => setForm((prev) => ({ ...prev, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Produits</h1>
        {isAdmin && (
          <button
            onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true) }}
            style={btnStyle('#6366f1')}
          >
            <Plus size={16} /> Nouveau produit
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 340 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          style={{ ...inputStyle, paddingLeft: 36 }}
          placeholder="Rechercher nom, SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Form */}
      {showForm && (
        <div style={formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600 }}>{editId ? 'Modifier le produit' : 'Nouveau produit'}</span>
            <button onClick={() => setShowForm(false)} style={iconBtn}><X size={16} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Nom *</label>
              <input style={inputStyle} value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="Nom du produit" />
            </div>
            <div>
              <label style={labelStyle}>SKU *</label>
              <input style={inputStyle} value={form.sku} onChange={(e) => f('sku', e.target.value)} placeholder="SKU-001" />
            </div>
            <div>
              <label style={labelStyle}>Catégorie *</label>
              <select
                style={{ ...inputStyle, appearance: 'auto' }}
                value={form.category_id}
                onChange={(e) => f('category_id', Number(e.target.value))}
              >
                <option value={0}>-- Choisir --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prix (FCFA) *</label>
              <input style={inputStyle} value={form.price} onChange={(e) => f('price', e.target.value)} placeholder="5000" />
            </div>
            <div>
              <label style={labelStyle}>Prix barré</label>
              <input style={inputStyle} value={form.compare_at_price ?? ''} onChange={(e) => f('compare_at_price', e.target.value || null)} placeholder="Optionnel" />
            </div>
            <div>
              <label style={labelStyle}>Coût</label>
              <input style={inputStyle} value={form.cost_price ?? ''} onChange={(e) => f('cost_price', e.target.value || null)} placeholder="Optionnel" />
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input style={inputStyle} type="number" value={form.stock ?? 0} onChange={(e) => f('stock', Number(e.target.value))} />
            </div>
            <div>
              <label style={labelStyle}>Poids (kg)</label>
              <input style={inputStyle} value={form.weight ?? ''} onChange={(e) => f('weight', e.target.value || null)} placeholder="0.5" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Description courte</label>
              <input style={inputStyle} value={form.short_description ?? ''} onChange={(e) => f('short_description', e.target.value)} placeholder="Résumé en 1-2 phrases" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                value={form.description ?? ''}
                onChange={(e) => f('description', e.target.value)}
                placeholder="Description complète"
              />
            </div>
            <div style={{ display: 'flex', gap: 20, gridColumn: '1/-1' }}>
              {[
                { key: 'is_active', label: 'Actif' },
                { key: 'is_featured', label: 'Mis en avant' },
                { key: 'track_stock', label: 'Gérer stock' },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#94a3b8' }}>
                  <input
                    type="checkbox"
                    checked={!!form[key as keyof ProductPayload]}
                    onChange={(e) => f(key as keyof ProductPayload, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => save.mutate()}
              disabled={!form.name || !form.sku || !form.price || !form.category_id || save.isPending}
              style={btnStyle('#6366f1')}
            >
              <Check size={16} /> {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} style={btnStyle('#334155')}>Annuler</button>
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
                {['Produit', 'SKU', 'Catégorie', 'Prix', 'Stock', 'Actif', ''].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const img = p.images.find((i) => i.is_primary) ?? p.images[0]
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {img ? (
                          <img src={img.image} alt={img.alt_text} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, background: '#1e293b' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 6, background: '#1e293b' }} />
                        )}
                        <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ ...td, color: '#64748b', fontSize: 13 }}>{p.sku}</td>
                    <td style={{ ...td, fontSize: 13 }}>{p.category?.name ?? '—'}</td>
                    <td style={td}>{Number(p.price).toLocaleString('fr-FR')}</td>
                    <td style={td}>{p.stock}</td>
                    <td style={td}>
                      <span style={{
                        fontSize: 12, padding: '2px 8px', borderRadius: 99,
                        background: p.is_active ? '#10b98122' : '#64748b22',
                        color: p.is_active ? '#10b981' : '#94a3b8',
                      }}>
                        {p.is_active ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(p)} style={iconBtn} title="Modifier"><Pencil size={15} /></button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer "${p.name}" ?`)) del.mutate(p.id)
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
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
              {search ? 'Aucun résultat.' : 'Aucun produit.'}
            </p>
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
