'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--fg-70)]">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--fg)]
            placeholder:text-[var(--fg-30)] text-sm
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)]
            transition-all duration-150
            ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
