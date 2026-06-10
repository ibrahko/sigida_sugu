import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Phone, User } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Alert } from '../components/ui/alert'
import { PageHeader } from '../components/ui/page-header'

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/accounts/register/', form)
      return data
    },
    onSuccess: () => {
      navigate('/connexion')
    },
    onError: () => {
      setErrors((prev) => ({
        ...prev,
        global: 'Inscription impossible. Vérifie les informations puis réessaie.',
      }))
    },
  })

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!form.username.trim()) nextErrors.username = 'Le nom d’utilisateur est requis.'
    if (!form.first_name.trim()) nextErrors.first_name = 'Le prénom est requis.'
    if (!form.last_name.trim()) nextErrors.last_name = 'Le nom est requis.'

    if (!form.email.trim()) {
      nextErrors.email = 'L’adresse email est requise.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Le format de l’email est invalide.'
    }

    if (!form.phone.trim()) nextErrors.phone = 'Le numéro de téléphone est requis.'

    if (!form.password.trim()) {
      nextErrors.password = 'Le mot de passe est requis.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    registerMutation.mutate()
  }

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[1fr_600px]">
      <section className="hidden rounded-[32px] bg-gradient-to-br from-teal-800 to-slate-900 p-8 text-white shadow-xl lg:block">
        <p className="text-sm font-medium text-white/70">Créer un compte</p>
        <h1 className="mt-4 text-5xl font-bold leading-tight">
          Entre dans un marché digital simple, local et rapide.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/80">
          Crée ton compte pour enregistrer tes adresses, suivre tes commandes et commander plus vite.
        </p>

        <div className="mt-10 space-y-4">
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/70">1. Compte</p>
            <p className="mt-1 text-lg font-semibold">Création rapide et claire</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/70">2. Commandes</p>
            <p className="mt-1 text-lg font-semibold">Historique et suivi centralisés</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/70">3. Livraison</p>
            <p className="mt-1 text-lg font-semibold">Adresses prêtes pour le checkout</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5 lg:p-8">
        <div className="mx-auto max-w-lg space-y-6">
          <PageHeader
            title="Créer mon compte"
            eyebrow="Inscription"
            subtitle="Quelques informations suffisent pour commencer."
            className="p-0 shadow-none ring-0 mb-0"
          />

          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                name="username"
                label="Nom d’utilisateur"
                placeholder="ibrahima"
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, username: e.target.value }))
                }
                error={errors.username}
                iconLeft={<User className="h-4 w-4 text-slate-400" />}
              />
            </div>

            <Input
              name="first_name"
              label="Prénom"
              value={form.first_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, first_name: e.target.value }))
              }
              error={errors.first_name}
            />

            <Input
              name="last_name"
              label="Nom"
              value={form.last_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, last_name: e.target.value }))
              }
              error={errors.last_name}
            />

            <div className="sm:col-span-2">
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="toi@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                error={errors.email}
                iconLeft={<Mail className="h-4 w-4 text-slate-400" />}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                name="phone"
                label="Téléphone"
                placeholder="+22370000000"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                error={errors.phone}
                iconLeft={<Phone className="h-4 w-4 text-slate-400" />}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="Minimum 8 caractères"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                error={errors.password}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="pointer-events-auto -mt-9 mr-3 flex justify-end text-slate-400"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.global && (
              <div className="sm:col-span-2">
                <Alert variant="error">{errors.global}</Alert>
              </div>
            )}

            <div className="sm:col-span-2">
              <Button
                type="submit"
                fullWidth
                isLoading={registerMutation.isPending}
              >
                Créer mon compte
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-500">
            Tu as déjà un compte ?{' '}
            <Link to="/connexion" className="font-semibold text-teal-700">
              Se connecter
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}