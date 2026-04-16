'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cta'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary:
    'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-on-solid)] font-semibold shadow-lg shadow-[var(--accent-shadow)]',
  cta:
    'bg-[var(--cta)] hover:bg-[var(--cta-hover)] text-[var(--cta-on-solid)] font-semibold shadow-lg shadow-[var(--cta-shadow)]',
  secondary:
    'bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--fg)] border border-[var(--border)]',
  ghost: 'bg-transparent hover:bg-[var(--bg-hover)] text-[var(--fg-70)] hover:text-[var(--fg)]',
  danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
