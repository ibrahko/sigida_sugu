import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Phone, User } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Alert } from '../components/ui/alert'

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '', email: '', phone: '', password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/accounts/register/', form)
      return data
    },
    onSuccess: () => navigate('/connexion'),
    onError: (err: any) => {
      const detail = err?.response?.data
      if (detail && typeof detail === 'object') {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(detail)) {
          mapped[k] = Array.isArray(v) ? (v as string[]).join(' ') : String(v)
        }
        setErrors(mapped)
      } else {
        setErrors({ global: "Inscription impossible. Vérifie les informations." })
      }
    },
  })

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.username.trim()) e.username = "Le nom d'utilisateur est requis."
    if (!form.first_name.trim()) e.first_name = 'Le prénom est requis.'
    if (!form.last_name.trim()) e.last_name = 'Le nom est requis.'
    if (!form.email.trim()) e.email = "L'email est requis."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email invalide.'
    if (!form.phone.trim()) e.phone = 'Le téléphone est requis.'
    if (!form.password) e.password = 'Le mot de passe est requis.'
    else if (form.password.length < 8) e.password = 'Minimum 8 caractères.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) registerMutation.mutate()
  }

  const field = (key: keyof typeof form) =>
    ({ value: form[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [key]: e.target.value })) })

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[1fr_560px]">
      {/* Panneau gauche */}
      <section className="hidden hero-dark rounded-[var(--radius-2xl)] p-10 text-white lg:block">
        <span className="inline-block rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
          Créer un compte
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Entre dans un marché digital simple, local et rapide.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
          Crée ton compte pour enregistrer tes adresses, suivre tes commandes et commander plus vite.
        </p>
        <div className="mt-10 space-y-3">
          {[
            { step: '1', label: 'Compte', desc: 'Création rapide et claire' },
            { step: '2', label: 'Commandes', desc: 'Historique et suivi centralisés' },
            { step: '3', label: 'Livraison', desc: 'Adresses prêtes pour le checkout' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4 rounded-[var(--radius-lg)] bg-white/08 border border-white/12 p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-accent)] text-xs font-extrabold text-[var(--color-brand-dark)]">
                {item.step}
              </span>
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-bold text-white">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formulaire */}
      <section className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white p-7 shadow-[var(--shadow-card)] lg:p-10">
        <div className="mx-auto max-w-lg space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">Inscription</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
              Créer mon compte
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Quelques informations suffisent pour commencer.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input name="username" label="Nom d'utilisateur" placeholder="ibrahima"
                {...field('username')} error={errors.username}
                iconLeft={<User className="h-4 w-4 text-[var(--color-muted)]" />}
              />
            </div>
            <Input name="first_name" label="Prénom" {...field('first_name')} error={errors.first_name} />
            <Input name="last_name" label="Nom" {...field('last_name')} error={errors.last_name} />
            <div className="sm:col-span-2">
              <Input name="email" type="email" label="Email" placeholder="toi@email.com"
                {...field('email')} error={errors.email}
                iconLeft={<Mail className="h-4 w-4 text-[var(--color-muted)]" />}
              />
            </div>
            <div className="sm:col-span-2">
              <Input name="phone" label="Téléphone" placeholder="+22370000000"
                {...field('phone')} error={errors.phone}
                iconLeft={<Phone className="h-4 w-4 text-[var(--color-muted)]" />}
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Input name="password" type={showPassword ? 'text' : 'password'}
                label="Mot de passe" placeholder="Minimum 8 caractères"
                {...field('password')} error={errors.password}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="flex w-full justify-end text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {errors.global && (
              <div className="sm:col-span-2">
                <Alert variant="error">{errors.global}</Alert>
              </div>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" variant="brand" fullWidth isLoading={registerMutation.isPending}>
                Créer mon compte
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-[var(--color-muted)]">
            Tu as déjà un compte ?{' '}
            <Link to="/connexion" className="font-bold text-[var(--color-brand)] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
