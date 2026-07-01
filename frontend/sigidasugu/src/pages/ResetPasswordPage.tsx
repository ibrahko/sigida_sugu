import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export function ResetPasswordPage() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/accounts/password-reset/confirm/', { uid, token, new_password: password }),
    onSuccess: () => {
      setDone(true)
      setTimeout(() => navigate('/connexion'), 2500)
    },
  })

  if (done) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white p-10 shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[var(--radius-lg)] bg-[var(--color-success-soft)] text-[var(--color-success)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-[var(--color-text)]">Mot de passe mis à jour !</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Redirection vers la connexion…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">Sécurité</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Nouveau mot de passe
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Choisis un mot de passe sécurisé d'au moins 8 caractères.</p>
      </div>

      <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white p-7 shadow-[var(--shadow-card)]">
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
          className="space-y-5"
        >
          <div className="space-y-1">
            <Input
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="flex w-full justify-end text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mutation.isError && (
            <p className="text-sm text-rose-600">
              {(mutation.error as any)?.response?.data?.detail || 'Lien invalide ou expiré.'}
            </p>
          )}

          <Button
            type="submit"
            variant="brand"
            fullWidth
            isLoading={mutation.isPending}
            disabled={password.length < 8}
          >
            Réinitialiser le mot de passe
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          <Link to="/connexion" className="font-bold text-[var(--color-brand)] hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
