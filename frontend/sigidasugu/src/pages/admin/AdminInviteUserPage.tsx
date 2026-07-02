import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle2, UserPlus } from 'lucide-react'
import { inviteUser, type UserInvitePayload } from '../../features/admin/api'

const ROLES = [
  {
    value: 'customer',
    label: 'Client',
    description: 'Accès boutique uniquement. Peut commander et gérer ses informations.',
    color: '#10b981',
    bg: '#10b98115',
    border: '#10b98140',
  },
  {
    value: 'staff',
    label: 'Staff',
    description: 'Accès backoffice limité. Peut consulter et gérer les commandes.',
    color: '#f59e0b',
    bg: '#f59e0b15',
    border: '#f59e0b40',
  },
  {
    value: 'admin',
    label: 'Administrateur',
    description: 'Accès complet. Gestion produits, catégories, commandes et utilisateurs.',
    color: '#818cf8',
    bg: '#6366f115',
    border: '#6366f140',
  },
] as const

type Role = (typeof ROLES)[number]['value']

const EMPTY: UserInvitePayload = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'customer',
}

export default function AdminInviteUserPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState<UserInvitePayload>(EMPTY)
  const [success, setSuccess] = useState(false)
  const [createdUser, setCreatedUser] = useState<{ username: string; email: string; role: string } | null>(null)

  const invite = useMutation({
    mutationFn: () => inviteUser(form),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      setCreatedUser({ username: user.username, email: user.email, role: user.role })
      setSuccess(true)
    },
  })

  const f = (k: keyof UserInvitePayload, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  const selectedRole = ROLES.find((r) => r.value === form.role)!

  const canSubmit =
    form.username.trim().length >= 3 &&
    form.email.includes('@') &&
    !invite.isPending

  // ── Écran succès ───────────────────────────────────────────────────────────
  if (success && createdUser) {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#10b98122', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={32} style={{ color: '#10b981' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Invitation envoyée !
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
              Le compte <strong style={{ color: '#e2e8f0' }}>@{createdUser.username}</strong> a été créé
              et un email avec les identifiants de connexion a été envoyé à{' '}
              <strong style={{ color: '#e2e8f0' }}>{createdUser.email}</strong>.
            </p>

            <div style={{
              background: '#0f1117', border: '1px solid #1e293b',
              borderRadius: 10, padding: '16px 20px', textAlign: 'left', marginBottom: 28,
            }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Récapitulatif
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { k: 'Identifiant', v: `@${createdUser.username}` },
                  { k: 'Email', v: createdUser.email },
                  { k: 'Rôle', v: ROLES.find((r) => r.value === createdUser.role)?.label ?? createdUser.role },
                ].map(({ k, v }) => (
                  <div key={k} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 13, color: '#64748b', minWidth: 100 }}>{k}</span>
                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => { setSuccess(false); setForm(EMPTY) }}
                style={btnPrimary}
              >
                <UserPlus size={16} /> Inviter un autre
              </button>
              <button onClick={() => navigate('/admin/users')} style={btnSecondary}>
                Voir la liste
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulaire ─────────────────────────────────────────────────────────────
  return (
    <div style={pageWrap}>
      {/* Retour */}
      <button
        onClick={() => navigate('/admin/users')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, marginBottom: 24, padding: 0 }}
      >
        <ArrowLeft size={16} /> Retour aux utilisateurs
      </button>

      <div style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Inviter un utilisateur</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Un mot de passe sécurisé sera généré automatiquement et envoyé par email.
          </p>
        </div>

        <div style={card}>
          {/* ── Informations personnelles ─────────────────────────────────── */}
          <section style={section}>
            <h2 style={sectionTitle}>Informations</h2>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input style={input} value={form.first_name ?? ''} onChange={(e) => f('first_name', e.target.value)} placeholder="Jean" />
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input style={input} value={form.last_name ?? ''} onChange={(e) => f('last_name', e.target.value)} placeholder="Konaté" />
              </div>
              <div>
                <label style={labelStyle}>Identifiant * <span style={{ color: '#475569', fontWeight: 400 }}>(min. 3 caractères)</span></label>
                <input
                  style={input}
                  value={form.username}
                  onChange={(e) => f('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="jean.konate"
                />
              </div>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input style={input} value={form.phone ?? ''} onChange={(e) => f('phone', e.target.value)} placeholder="+223 7X XX XX XX" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Email * <span style={{ color: '#475569', fontWeight: 400 }}>(les identifiants seront envoyés ici)</span></label>
                <input style={input} type="email" value={form.email} onChange={(e) => f('email', e.target.value)} placeholder="jean.konate@exemple.com" />
              </div>
            </div>
          </section>

          <div style={{ borderTop: '1px solid #1e293b', margin: '4px 0' }} />

          {/* ── Choix du rôle ─────────────────────────────────────────────── */}
          <section style={section}>
            <h2 style={sectionTitle}>Rôle</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ROLES.map((role) => {
                const isSelected = form.role === role.value
                return (
                  <label
                    key={role.value}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${isSelected ? role.border : '#1e293b'}`,
                      background: isSelected ? role.bg : 'transparent',
                      transition: 'all .15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={isSelected}
                      onChange={() => f('role', role.value as Role)}
                      style={{ marginTop: 3, accentColor: role.color }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? role.color : '#e2e8f0', marginBottom: 3 }}>
                        {role.label}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                        {role.description}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </section>

          <div style={{ borderTop: '1px solid #1e293b', margin: '4px 0' }} />

          {/* ── Résumé + Envoi ────────────────────────────────────────────── */}
          <section style={{ ...section, paddingBottom: 0 }}>
            <div style={{
              background: '#0f1117', border: '1px solid #1e293b',
              borderRadius: 10, padding: '14px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `${selectedRole.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: selectedRole.color }}>
                  {(form.first_name?.[0] ?? form.username?.[0] ?? '?').toUpperCase()}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                  {form.first_name || form.last_name
                    ? `${form.first_name} ${form.last_name}`.trim()
                    : form.username || 'Nouveau compte'}
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  {form.email || 'email non renseigné'} ·{' '}
                  <span style={{ color: selectedRole.color }}>{selectedRole.label}</span>
                </div>
              </div>
            </div>

            {invite.isError && (
              <div style={{
                background: '#f8717115', border: '1px solid #f8717140',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171',
              }}>
                Erreur — vérifiez que l'email ou l'identifiant n'est pas déjà utilisé.
              </div>
            )}

            <button onClick={() => invite.mutate()} disabled={!canSubmit} style={{
              ...btnPrimary,
              width: '100%', justifyContent: 'center',
              opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed',
              padding: '12px 20px', fontSize: 15,
            }}>
              <Send size={16} />
              {invite.isPending ? 'Envoi en cours…' : 'Créer le compte et envoyer l\'invitation'}
            </button>

            <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
              Un mot de passe sera généré automatiquement et envoyé à l'email renseigné.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const pageWrap: React.CSSProperties = { maxWidth: 680 }
const card: React.CSSProperties = {
  background: '#161b27', border: '1px solid #1e293b',
  borderRadius: 14, overflow: 'hidden',
}
const section: React.CSSProperties = { padding: '24px 24px 20px' }
const sectionTitle: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '.06em',
  marginBottom: 16,
}
const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500,
  color: '#94a3b8', marginBottom: 6,
}
const input: React.CSSProperties = {
  width: '100%', background: '#0f1117',
  border: '1px solid #1e293b', borderRadius: 8,
  padding: '9px 12px', color: '#e2e8f0', fontSize: 14,
  boxSizing: 'border-box', outline: 'none',
}
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: '#6366f1', color: '#fff', border: 'none',
  padding: '9px 18px', borderRadius: 8, fontSize: 14,
  cursor: 'pointer', fontWeight: 600,
}
const btnSecondary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: '#1e293b', color: '#e2e8f0', border: 'none',
  padding: '9px 18px', borderRadius: 8, fontSize: 14,
  cursor: 'pointer', fontWeight: 500,
}
