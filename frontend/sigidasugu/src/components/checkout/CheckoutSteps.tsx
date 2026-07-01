import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

const steps = [
  { id: 1, label: 'Livraison' },
  { id: 2, label: 'Paiement' },
  { id: 3, label: 'Confirmation' },
] as const

type CheckoutStepsProps = {
  currentStep: 1 | 2 | 3
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Étapes de commande" className="w-full">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isLast = index === steps.length - 1

          return (
            <li
              key={step.id}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition',
                    isCompleted && 'bg-[var(--color-brand)] text-white',
                    isCurrent &&
                      'bg-[var(--color-brand)] text-white ring-4 ring-[var(--color-brand)]/20',
                    !isCompleted &&
                      !isCurrent &&
                      'bg-[var(--color-bg-warm)] text-[var(--color-muted)]',
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:block',
                    isCurrent ? 'text-[var(--color-brand)]' : 'text-[var(--color-muted)]',
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded-full',
                    step.id < currentStep
                      ? 'bg-[var(--color-brand)]'
                      : 'bg-[var(--color-border)]',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
