import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { api } from '../services/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const mutation = useMutation({
    mutationFn: () => api.post('/accounts/password-reset/', { email }),
    onSuccess: () => setSent(true),
  })

  if (sent) {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white p-10 shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[var(--radius-lg)] bg-[var(--color-success-soft)] text-[var(--color-success)]">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-extrabold text-[var(--color-text)]">Email envoyé !</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Si <strong>{email}</strong> est associé à un compte, tu recevras un lien de réinitialisation dans quelques minutes.
          </p>
          <p className="mt-4 text-xs text-[var(--color-muted)]">Vérifie aussi tes spams.</p>
          <Link
            to="/connexion"
            className="mt-6 inline-block text-sm font-bold text-[var(--color-brand)] hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand)]">Compte</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Mot de passe oublié ?
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Saisis ton email et on t'envoie un lien pour le réinitialiser.
        </p>
      </div>

      <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-white p-7 shadow-[var(--shadow-card)]">
        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate() }}
          className="space-y-5"
        >
          <Input
            label="Adresse email"
            type="email"
            placeholder="toi@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            iconLeft={<Mail className="h-4 w-4 text-[var(--color-muted)]" />}
          />

          {mutation.isError && (
            <p className="text-sm text-rose-600">Une erreur est survenue. Réessaie.</p>
          )}

          <Button
            type="submit"
            variant="brand"
            fullWidth
            isLoading={mutation.isPending}
            disabled={!email.trim()}
          >
            Envoyer le lien
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          Tu te souviens ?{' '}
          <Link to="/connexion" className="font-bold text-[var(--color-brand)] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
