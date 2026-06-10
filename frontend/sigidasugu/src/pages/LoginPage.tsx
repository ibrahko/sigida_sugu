import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Alert } from '../components/ui/alert'
import { PageHeader } from '../components/ui/page-header'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/accounts/login/', {
        username: form.username,
        password: form.password,
      })
      // data.access, data.refresh, data.user
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      return data
    },
    onSuccess: () => {
      navigate('/compte')
    },
    onError: () => {
      setErrors((prev) => ({
        ...prev,
        global: 'Connexion impossible. Vérifie tes identifiants.',
      }))
    },
  })

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!form.username.trim()) {
      nextErrors.username = 'Le nom d’utilisateur ou email est requis.'
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Le mot de passe est requis.'
    } else if (form.password.length < 6) {
      nextErrors.password = 'Le mot de passe semble trop court.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    loginMutation.mutate()
  }

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[1fr_520px]">
      <section className="hidden rounded-[32px] bg-gradient-to-br from-slate-900 to-teal-700 p-8 text-white shadow-xl lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">Sigida Sugu</p>
          <h1 className="mt-3 text-5xl font-bold leading-tight">
            Reprends tes achats là où tu les as laissés.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/80">
            Connecte-toi pour retrouver ton panier, suivre tes commandes et gérer tes adresses de livraison.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Commande</p>
            <p className="mt-2 text-xl font-semibold">Suivi plus simple</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Paiement</p>
            <p className="mt-2 text-xl font-semibold">Plus rapide et rassurant</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5 lg:p-8">
        <div className="mx-auto max-w-md space-y-6">
          <PageHeader
            title="Bon retour"
            eyebrow="Connexion"
            subtitle="Accède à ton compte pour gérer tes commandes et ton profil."
            className="p-0 shadow-none ring-0 mb-0"
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="username"
              label="Nom d’utilisateur"
              placeholder="ex: ibrahima"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              error={errors.username}
              iconLeft={<Mail className="h-4 w-4 text-slate-400" />}
            />

            <div className="space-y-1.5">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="••••••••"
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
              <Alert variant="error">{errors.global}</Alert>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={loginMutation.isPending}
            >
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="font-semibold text-teal-700">
              Créer un compte
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}