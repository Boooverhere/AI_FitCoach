import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ glow, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl
        ${glow ? 'shadow-lg shadow-[var(--accent-shadow)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
