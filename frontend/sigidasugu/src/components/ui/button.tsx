import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-light)] focus-visible:ring-[var(--color-brand)] shadow-sm',
        brand:
          'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-light)] focus-visible:ring-[var(--color-brand)] shadow-md',
        gold:
          'bg-[var(--color-accent)] text-[var(--color-brand-dark)] hover:bg-[var(--color-accent-dark)] focus-visible:ring-[var(--color-accent)] shadow-md font-bold',
        accent:
          'bg-[var(--color-accent)] text-[var(--color-brand-dark)] hover:bg-[var(--color-accent-dark)] focus-visible:ring-[var(--color-accent)] shadow-sm font-bold',
        secondary:
          'border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-[var(--color-border)]',
        'secondary-dark':
          'border border-white/30 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white/40',
        ghost:
          'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-warm)] focus-visible:ring-[var(--color-border)]',
        link: 'text-[var(--color-brand)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-brand)]',
        danger:
          'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-600',
      },
      size: {
        sm: 'h-9 px-4 py-2 rounded-[var(--radius-sm)] text-xs',
        md: 'h-11 px-5 py-3',
        lg: 'h-12 px-6 py-3 text-base rounded-[var(--radius-lg)]',
        pill: 'h-10 px-5 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      asChild,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp: any = asChild ? 'span' : 'button'

    const content = (
      <>
        {leftIcon ? (
          <span className="inline-flex items-center justify-center">
            {leftIcon}
          </span>
        ) : null}
        <span>{children}</span>
        {isLoading ? (
          <span className="inline-flex items-center">
            <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </span>
        ) : rightIcon ? (
          <span className="inline-flex items-center justify-center">
            {rightIcon}
          </span>
        ) : null}
      </>
    )

    if (!asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(
            buttonVariants({ variant, size, fullWidth }),
            isLoading && 'cursor-wait',
            className,
          )}
          disabled={disabled || isLoading}
          {...props}
        >
          {content}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          className,
        )}
      >
        {children}
      </Comp>
    )
  },
)

Button.displayName = 'Button'
