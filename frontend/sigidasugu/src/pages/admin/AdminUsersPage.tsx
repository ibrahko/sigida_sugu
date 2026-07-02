import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, X, Check, Search, UserX, ShieldCheck, Users, UserCheck, Mail } from 'lucide-react'
import {
  fetchAdminUsers,
  createUser,
  updateUser,
  deactivateUser,
  type AdminUser,
  type UserCreatePayload,
  type UserUpdatePayload,
} from '../../features/admin/api'

// ── Constantes rôles ──────────────────────────────────────────────────────────

const ROLES = [
  { value: 'customer', label: 'Client', color: '#10b981', bg: '#10b98122' },
  { value: 'staff', label: 'Staff', color: '#f59e0b', bg: '#f59e0b22' },
  { value: 'admin', label: 'Admin', color: '#818cf8', bg: '#6366f122' },
] as const

type Role = (typeof ROLES)[number]['value']

const roleStyle = (role: string) =>
  ROLES.find((r) => r.value === role) ?? { color: '#94a3b8', bg: '#64748b22', label: role }

// ── Formulaire vide ───────────────────────────────────────────────────────────

const EMPTY_CREATE: UserCreatePayload = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'customer',
  password: '',
  is_active: true,
}

// ── Composant ─────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [createForm, setCreateForm] = useState<UserCreatePayload>(EMPTY_CREATE)
  const [editForm, setEditForm] = useState<UserUpdatePayload>({})
  const [showPassword, setShowPassword] = useState(false)

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter],
    queryFn: () => fetchAdminUsers(roleFilter ? { role: roleFilter } : undefined),
  })

  const create = useMutation({
    mutationFn: () => createUser(createForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setShowCreate(false)
      setCreateForm(EMPTY_CREATE)
    },
  })

  const edit = useMutation({
    mutationFn: () => updateUser(editUser!.id, editForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setEditUser(null)
      setEditForm({})
    },
  })

  const deactivate = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  // ── Filtrage local ─────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q)
    )
  })

  // ── Compteurs header ───────────────────────────────────────────────────────
  const counts = {
    total: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    staff: users.filter((u) => u.role === 'staff').length,
    customer: users.filter((u) => u.role === 'customer').length,
  }

  const cf = (k: keyof UserCreatePayload, v: unknown) =>
    setCreateForm((p) => ({ ...p, [k]: v }))

  const ef = (k: keyof UserUpdatePayload, v: unknown) =>
    setEditForm((p) => ({ ...p, [k]: v }))

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Utilisateurs</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/admin/users/invite')} style={btnPrimary}>
            <Mail size={16} /> Inviter par email
          </button>
          <button onClick={() => { setShowCreate(true); setShowPassword(false) }} style={{ ...btnPrimary, background: '#1e293b', color: '#94a3b8' }}>
            <Plus size={16} /> Créer manuellement
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: counts.total, icon: Users, color: '#6366f1' },
          { label: 'Clients', value: counts.customer, icon: UserCheck, color: '#10b981' },
          { label: 'Staff', value: counts.staff, icon: ShieldCheck, color: '#f59e0b' },
          { label: 'Admins', value: counts.admin, icon: ShieldCheck, color: '#818cf8' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: '#161b27', border: '1px solid #1e293b', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>{value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtres ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input style={{ ...inputStyle, paddingLeft: 36 }} placeholder="Nom, email, username…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select style={{ ...inputStyle, flex: '0 0 160px', appearance: 'auto' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* ── Formulaire création ─────────────────────────────────────────────── */}
      {showCreate && (
        <div style={formCard}>
          <div style={formHeader}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Créer un utilisateur</span>
            <button onClick={() => setShowCreate(false)} style={iconBtn}><X size={16} /></button>
          </div>

          <div style={grid2}>
            <div>
              <label style={label}>Nom d'utilisateur *</label>
              <input style={inputStyle} value={createForm.username} onChange={(e) => cf('username', e.target.value)} placeholder="jean.dupont" />
            </div>
            <div>
              <label style={label}>Email *</label>
              <input style={inputStyle} type="email" value={createForm.email} onChange={(e) => cf('email', e.target.value)} placeholder="jean@exemple.com" />
            </div>
            <div>
              <label style={label}>Prénom</label>
              <input style={inputStyle} value={createForm.first_name ?? ''} onChange={(e) => cf('first_name', e.target.value)} placeholder="Jean" />
            </div>
            <div>
              <label style={label}>Nom</label>
              <input style={inputStyle} value={createForm.last_name ?? ''} onChange={(e) => cf('last_name', e.target.value)} placeholder="Dupont" />
            </div>
            <div>
              <label style={label}>Téléphone</label>
              <input style={inputStyle} value={createForm.phone ?? ''} onChange={(e) => cf('phone', e.target.value)} placeholder="+223 7X XX XX XX" />
            </div>
            <div>
              <label style={label}>Rôle *</label>
              <select style={{ ...inputStyle, appearance: 'auto' }} value={createForm.role} onChange={(e) => cf('role', e.target.value as Role)}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={label}>Mot de passe * <span style={{ color: '#64748b', fontSize: 12 }}>(min. 8 caractères)</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inputStyle, paddingRight: 48 }}
                  type={showPassword ? 'text' : 'password'}
                  value={createForm.password}
                  onChange={(e) => cf('password', e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12 }}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#94a3b8' }}>
                <input type="checkbox" checked={createForm.is_active ?? true} onChange={(e) => cf('is_active', e.target.checked)} />
                Compte actif
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => create.mutate()}
              disabled={!createForm.username || !createForm.email || !createForm.password || createForm.password.length < 8 || create.isPending}
              style={btnPrimary}
            >
              <Check size={16} /> {create.isPending ? 'Création…' : 'Créer le compte'}
            </button>
            <button onClick={() => setShowCreate(false)} style={btnSecondary}>Annuler</button>
          </div>
          {create.isError && <p style={errorText}>Erreur — vérifiez que l'email/username n'est pas déjà pris.</p>}
        </div>
      )}

      {/* ── Formulaire édition (modal inline) ──────────────────────────────── */}
      {editUser && (
        <div style={formCard}>
          <div style={formHeader}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Modifier — {editUser.username}</span>
            <button onClick={() => setEditUser(null)} style={iconBtn}><X size={16} /></button>
          </div>

          <div style={grid2}>
            <div>
              <label style={label}>Email</label>
              <input style={inputStyle} type="email" defaultValue={editUser.email} onChange={(e) => ef('email', e.target.value)} />
            </div>
            <div>
              <label style={label}>Téléphone</label>
              <input style={inputStyle} defaultValue={editUser.phone} onChange={(e) => ef('phone', e.target.value)} />
            </div>
            <div>
              <label style={label}>Prénom</label>
              <input style={inputStyle} defaultValue={editUser.first_name} onChange={(e) => ef('first_name', e.target.value)} />
            </div>
            <div>
              <label style={label}>Nom</label>
              <input style={inputStyle} defaultValue={editUser.last_name} onChange={(e) => ef('last_name', e.target.value)} />
            </div>
            <div>
              <label style={label}>Rôle</label>
              <select style={{ ...inputStyle, appearance: 'auto' }} defaultValue={editUser.role} onChange={(e) => ef('role', e.target.value as Role)}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#94a3b8' }}>
                <input type="checkbox" defaultChecked={editUser.is_active} onChange={(e) => ef('is_active', e.target.checked)} />
                Compte actif
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => edit.mutate()} disabled={edit.isPending} style={btnPrimary}>
              <Check size={16} /> {edit.isPending ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
            <button onClick={() => setEditUser(null)} style={btnSecondary}>Annuler</button>
          </div>
          {edit.isError && <p style={errorText}>Erreur lors de la sauvegarde.</p>}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <p style={{ color: '#64748b' }}>Chargement…</p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Commandes', 'Statut', ''].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const rs = roleStyle(u.role)
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1e293b', opacity: u.is_active ? 1 : 0.5 }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: `${rs.color}22`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: rs.color, flexShrink: 0,
                        }}>
                          {(u.first_name?.[0] ?? u.username[0]).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{u.full_name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, fontSize: 13, color: '#94a3b8' }}>{u.email || '—'}</td>
                    <td style={{ ...td, fontSize: 13, color: '#94a3b8' }}>{u.phone || '—'}</td>
                    <td style={td}>
                      <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: rs.bg, color: rs.color, fontWeight: 600 }}>
                        {rs.label}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: 'center', fontSize: 14 }}>{u.orders_count}</td>
                    <td style={td}>
                      <span style={{
                        fontSize: 12, padding: '2px 8px', borderRadius: 99,
                        background: u.is_active ? '#10b98122' : '#64748b22',
                        color: u.is_active ? '#10b981' : '#94a3b8',
                      }}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => { setEditUser(u); setEditForm({}) }} style={iconBtn} title="Modifier">
                        <Pencil size={15} />
                      </button>
                      {u.is_active && (
                        <button
                          onClick={() => {
                            if (confirm(`Désactiver le compte de "${u.username}" ?`)) deactivate.mutate(u.id)
                          }}
                          style={{ ...iconBtn, color: '#f87171' }}
                          title="Désactiver"
                        >
                          <UserX size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
              {search || roleFilter ? 'Aucun résultat.' : 'Aucun utilisateur.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: '#6366f1', color: '#fff', border: 'none',
  padding: '8px 14px', borderRadius: 8, fontSize: 14,
  cursor: 'pointer', fontWeight: 500,
}
const btnSecondary: React.CSSProperties = {
  ...{} as React.CSSProperties,
  display: 'flex', alignItems: 'center', gap: 6,
  background: '#334155', color: '#e2e8f0', border: 'none',
  padding: '8px 14px', borderRadius: 8, fontSize: 14,
  cursor: 'pointer', fontWeight: 500,
}
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: '#64748b',
  cursor: 'pointer', padding: '4px 6px',
}
const formCard: React.CSSProperties = {
  background: '#161b27', border: '1px solid #1e293b',
  borderRadius: 12, padding: 20, marginBottom: 24,
}
const formHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', marginBottom: 16,
}
const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
}
const label: React.CSSProperties = {
  display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0f1117',
  border: '1px solid #1e293b', borderRadius: 8,
  padding: '8px 12px', color: '#e2e8f0', fontSize: 14,
  boxSizing: 'border-box',
}
const errorText: React.CSSProperties = { color: '#f87171', fontSize: 13, marginTop: 8 }
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
