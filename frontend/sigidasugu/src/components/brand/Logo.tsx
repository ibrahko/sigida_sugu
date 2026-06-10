import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type LogoProps = {
  variant?: 'default' | 'light' | 'compact'
  className?: string
}

export function Logo({ variant = 'default', className }: LogoProps) {
  const isLight = variant === 'light'
  const isCompact = variant === 'compact'

  return (
    <Link to="/" className={cn('group flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative grid place-items-center overflow-hidden rounded-2xl shadow-md transition-transform group-hover:scale-105',
          isCompact ? 'h-9 w-9' : 'h-11 w-11',
          isLight
            ? 'bg-white/15 ring-1 ring-white/25'
            : 'bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)]',
        )}
      >
        <svg viewBox="0 0 32 32" className={isCompact ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden>
          <path
            d="M8 22V10l8-4 8 4v12l-8 4-8-4z"
            fill="none"
            stroke={isLight ? 'white' : 'white'}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 6v20M8 10l8 4 8-4M8 22l8-4 8 4"
            fill="none"
            stroke={isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.6)'}
            strokeWidth="1"
          />
          <circle cx="16" cy="16" r="2.5" fill={isLight ? 'var(--color-accent-muted)' : 'var(--color-accent-muted)'} />
        </svg>
      </div>

      {!isCompact && (
        <div>
          <p
            className={cn(
              'font-display text-base font-bold leading-tight',
              isLight ? 'text-white' : 'text-[var(--color-text)]',
            )}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Sigida Sugu
          </p>
          {variant === 'default' && (
            <p className={cn('text-xs', isLight ? 'text-white/70' : 'text-[var(--color-muted)]')}>
              Le marché de Bamako
            </p>
          )}
        </div>
      )}
    </Link>
  )
}
