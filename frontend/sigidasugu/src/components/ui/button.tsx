// src/components/ui/button.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)] focus-visible:ring-[var(--color-brand)] shadow-sm',
        brand:
          'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)] focus-visible:ring-[var(--color-brand)] shadow-md',
        accent:
          'bg-[var(--color-accent)] text-white hover:opacity-90 focus-visible:ring-[var(--color-accent)] shadow-sm',
        secondary:
          'border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-[var(--color-border)]',
        ghost:
          'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-warm)] focus-visible:ring-[var(--color-border)]',
        link: 'text-[var(--color-brand)] underline-offset-4 hover:underline focus-visible:ring-[var(--color-brand)]',
        danger:
          'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-600',
      },
      size: {
        sm: 'h-9 px-4 py-2 rounded-xl',
        md: 'h-11 px-5 py-3',
        lg: 'h-12 px-6 py-3 text-base rounded-2xl',
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

    // mode normal: <button>
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

    // mode asChild: on applique juste les classes au wrapper,
    // le Link est passé en children
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