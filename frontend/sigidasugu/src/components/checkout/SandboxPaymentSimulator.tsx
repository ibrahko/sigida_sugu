import { useState } from 'react'
import { CheckCircle2, Loader2, Smartphone, XCircle } from 'lucide-react'
import { api } from '../../services/api'

type Props = {
  transactionRef: string
  phone: string
  amount: string
  operator: string
  onSuccess: () => void
  onFailure: () => void
}

const OPERATOR_LABELS: Record<string, { label: string; color: string }> = {
  orange_money: { label: 'Orange Money', color: '#FF6B00' },
  moov_money: { label: 'Moov Money', color: '#0055A4' },
  sama_money: { label: 'Sama Money', color: '#006D3C' },
  '': { label: 'Mobile Money', color: '#1c3a2d' },
}

export function SandboxPaymentSimulator({
  transactionRef,
  phone,
  amount,
  operator,
  onSuccess,
  onFailure,
}: Props) {
  const [loading, setLoading] = useState<'success' | 'failed' | null>(null)
  const [done, setDone] = useState<'success' | 'failed' | null>(null)

  const op = OPERATOR_LABELS[operator] ?? OPERATOR_LABELS['']

  const simulate = async (outcome: 'success' | 'failed') => {
    setLoading(outcome)
    try {
      await api.post('/payments/sandbox/simulate/', {
        transaction_id: transactionRef,
        outcome,
      })
      setDone(outcome)
      setTimeout(() => {
        if (outcome === 'success') onSuccess()
        else onFailure()
      }, 1500)
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-[var(--radius-2xl)] bg-white shadow-2xl">

        {/* Header simulateur */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-amber-50 px-5 py-3">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Mode Sandbox — Test uniquement
          </span>
        </div>

        {/* Corps : fausse notification téléphone */}
        <div className="p-6">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)]"
            style={{ backgroundColor: `${op.color}18` }}>
            <Smartphone className="h-8 w-8" style={{ color: op.color }} />
          </div>

          <h2
            className="text-center text-lg font-extrabold text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Notification {op.label}
          </h2>

          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-warm)] p-4 text-sm">
            <p className="text-[var(--color-muted)]">Demande de paiement de</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--color-text)]">{amount} FCFA</p>
            {phone && (
              <p className="mt-1 text-xs text-[var(--color-muted)]">Depuis le numéro {phone}</p>
            )}
            <p className="mt-3 text-xs font-semibold text-[var(--color-text-secondary)]">
              Ref: {transactionRef.slice(0, 12).toUpperCase()}
            </p>
          </div>

          {/* Résultat */}
          {done === 'success' && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-success-soft)] py-3 text-sm font-bold text-[var(--color-success)]">
              <CheckCircle2 className="h-5 w-5" />
              Paiement confirmé !
            </div>
          )}
          {done === 'failed' && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-rose-50 py-3 text-sm font-bold text-rose-600">
              <XCircle className="h-5 w-5" />
              Paiement refusé
            </div>
          )}

          {/* Boutons */}
          {!done && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => simulate('failed')}
                disabled={!!loading}
                className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
              >
                {loading === 'failed' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Refuser
              </button>
              <button
                type="button"
                onClick={() => simulate('success')}
                disabled={!!loading}
                className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand)] py-3 text-sm font-bold text-white transition hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
              >
                {loading === 'success' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirmer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
