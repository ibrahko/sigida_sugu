import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../services/api'

interface SetupForm {
  secret: string
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  confirm: string
}

const EMPTY: SetupForm = {
  secret: '',
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  confirm: '',
}

export default function SetupPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<SetupForm>({ ...EMPTY, secret: token ?? '' })
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const setup = useMutation({
    mutationFn: () =>
      api.post('/setup/', {
        secret: form.secret,
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
      }),
    onSuccess: () => setDone(true),
    onError: (err: any) => {
      const data = err?.response?.data
      if (data && typeof data === 'object') {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? (v as string[]).join(' ') : String(v)
        }
        setErrors(mapped)
      } else {
        setErrors({ global: 'Erreur inattendue.' })
      }
    },
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.secret) e.secret = 'Clé secrète requise.'
    if (form.username.length < 3) e.username = "Minimum 3 caractères."
    if (!form.email.includes('@')) e.email = 'Email invalide.'
    if (form.password.length < 8) e.password = 'Minimum 8 caractères.'
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const f = (k: keyof SetupForm, v: string) => {
    setForm((p) => ({ ...p, [k]: v }))
    setErrors((e) => { const n = { ...e }; delete n[k]; return n })
  }

  // ── Succès ─────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={iconCircle('#10b981')}>
              <CheckCircle2 size={32} style={{ color: '#10b981' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Compte créé !</h1>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
              Le compte admin <strong style={{ color: '#e2e8f0' }}>@{form.username}</strong> est prêt.
              <br />Connecte-toi pour accéder au backoffice.
            </p>
            <button onClick={() => navigate('/connexion')} style={btnPrimary}>
              Aller à la connexion →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulaire ─────────────────────────────────────────────────────────────
  return (
    <div style={pageWrap}>
      <div style={{ maxWidth: 460, width: '100%' }}>

        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={iconCircle('#6366f1')}>
            <ShieldCheck size={28} style={{ color: '#818cf8' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Créer le compte admin</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Page d'initialisation — accès réservé au propriétaire du projet.
          </p>
        </div>

        <div style={card}>
          {/* Clé secrète */}
          <div style={section}>
            <h2 style={sectionTitle}>Clé secrète</h2>
            <div>
              <input
                style={{ ...input, ...(errors.secret ? inputError : {}) }}
                type="password"
                placeholder="Clé définie dans Railway (SETUP_SECRET_KEY)"
                value={form.secret}
                onChange={(e) => f('secret', e.target.value)}
              />
              {errors.secret && <p style={errText}>{errors.secret}</p>}
            </div>
          </div>

          <div style={divider} />

          {/* Informations */}
          <div style={section}>
            <h2 style={sectionTitle}>Informations du compte</h2>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input style={input} value={form.first_name} onChange={(e) => f('first_name', e.target.value)} placeholder="Jean" />
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input style={input} value={form.last_name} onChange={(e) => f('last_name', e.target.value)} placeholder="Konaté" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Identifiant *</label>
                <input
                  style={{ ...input, ...(errors.username ? inputError : {}) }}
                  value={form.username}
                  onChange={(e) => f('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="ibrahima"
                />
                {errors.username && <p style={errText}>{errors.username}</p>}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Email *</label>
                <input
                  style={{ ...input, ...(errors.email ? inputError : {}) }}
                  type="email"
                  value={form.email}
                  onChange={(e) => f('email', e.target.value)}
                  placeholder="toi@exemple.com"
                />
                {errors.email && <p style={errText}>{errors.email}</p>}
              </div>
            </div>
          </div>

          <div style={divider} />

          {/* Mot de passe */}
          <div style={section}>
            <h2 style={sectionTitle}>Mot de passe</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Mot de passe * <span style={{ color: '#475569', fontWeight: 400 }}>(min. 8 caractères)</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...input, paddingRight: 52, ...(errors.password ? inputError : {}) }}
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => f('password', e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={errText}>{errors.password}</p>}
              </div>
              <div>
                <label style={labelStyle}>Confirmer le mot de passe *</label>
                <input
                  style={{ ...input, ...(errors.confirm ? inputError : {}) }}
                  type={showPwd ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => f('confirm', e.target.value)}
                  placeholder="••••••••"
                />
                {errors.confirm && <p style={errText}>{errors.confirm}</p>}
              </div>
            </div>
          </div>

          <div style={divider} />

          {/* Envoi */}
          <div style={{ padding: '20px 24px' }}>
            {(errors.global || errors.secret?.includes('incorrecte') || errors.secret?.includes('désactivée')) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#f8717115', border: '1px solid #f8717140',
                borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#f87171',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {errors.global || errors.secret}
              </div>
            )}

            <button
              onClick={() => validate() && setup.mutate()}
              disabled={setup.isPending}
              style={{
                ...btnPrimary,
                width: '100%', justifyContent: 'center',
                opacity: setup.isPending ? 0.7 : 1,
              }}
            >
              {setup.isPending ? 'Création en cours…' : 'Créer le compte admin'}
            </button>

            <p style={{ fontSize: 12, color: '#334155', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
              Ce compte aura accès complet au backoffice et à Django admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const pageWrap: React.CSSProperties = {
  minHeight: '100vh', background: '#0f1117',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '40px 16px',
}
const card: React.CSSProperties = {
  background: '#161b27', border: '1px solid #1e293b',
  borderRadius: 14, overflow: 'hidden',
}
const section: React.CSSProperties = { padding: '20px 24px' }
const sectionTitle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14,
}
const divider: React.CSSProperties = { borderTop: '1px solid #1e293b' }
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
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
const inputError: React.CSSProperties = { borderColor: '#f87171' }
const errText: React.CSSProperties = { fontSize: 12, color: '#f87171', marginTop: 4, marginBottom: 0 }
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: '#6366f1', color: '#fff', border: 'none',
  padding: '11px 20px', borderRadius: 8, fontSize: 15,
  cursor: 'pointer', fontWeight: 600,
}
const iconCircle = (color: string): React.CSSProperties => ({
  width: 56, height: 56, borderRadius: '50%',
  background: `${color}20`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 16px',
})
