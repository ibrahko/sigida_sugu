import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User } from 'lucide-react'
import { login } from '../features/accounts/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Alert } from '../components/ui/alert'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loginMutation = useMutation({
    mutationFn: async () => {
      const tokens = await login(form.username, form.password)
      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      return tokens
    },
    onSuccess: (tokens) => {
      const role = tokens.user?.role
      if (role === 'admin' || role === 'staff') {
        navigate('/admin')
      } else {
        navigate('/compte')
      }
    },
    onError: () =>
      setErrors({ global: 'Connexion impossible. Vérifie tes identifiants.' }),
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.username.trim()) e.username = "Le nom d'utilisateur est requis."
    if (!form.password.trim()) e.password = 'Le mot de passe est requis.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) loginMutation.mutate()
  }

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[1fr_480px]">
      {/* Panneau gauche */}
      <section className="hidden hero-dark rounded-[var(--radius-2xl)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <span className="inline-block rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
            Sigida Sugu
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Reprends tes achats là où tu les as laissés.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
            Connecte-toi pour retrouver ton panier, suivre tes commandes et gérer tes adresses de livraison.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Commande', desc: 'Suivi plus simple' },
            { label: 'Paiement', desc: 'Rapide et rassurant' },
          ].map((item) => (
            <div key={item.label} className="rounded-[var(--radius-lg)] bg-white/08 border border-white/12 p-5">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{item.label}</p>
              <p className="mt-2 text-base font-bold text-white">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formulaire */}
      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white p-7 shadow-[var(--shadow-card)] lg:p-10">
        <div className="mx-auto max-w-md space-y-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">Connexion</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              Bon retour 👋
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Accède à ton compte Sigida Sugu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="username"
              label="Nom d'utilisateur"
              placeholder="ibrahima"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              error={errors.username}
              iconLeft={<User className="h-4 w-4 text-[var(--color-muted)]" />}
            />

            <div className="space-y-1">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex w-full justify-end text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {errors.global && <Alert variant="error">{errors.global}</Alert>}

            <div className="flex justify-end">
              <Link to="/mot-de-passe-oublie" className="text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-brand)] transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" variant="brand" fullWidth isLoading={loginMutation.isPending}>
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--color-muted)]">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="font-bold text-[var(--color-brand)] hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
