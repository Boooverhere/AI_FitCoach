interface LogoProps {
  /** Icon width/height in px. Default 28. */
  iconSize?: number
  /** Tailwind class for the wordmark text colour. Default adapts to theme. */
  wordmarkClass?: string
  /** Extra class on the outer wrapper div. */
  className?: string
}

/**
 * Coacheckin brand mark.
 * SVG icon: dark-green rounded square, outer teal ring, filled green inner
 * circle, white checkmark, small teal dot at the top of the ring.
 */
export function Logo({
  iconSize = 28,
  wordmarkClass = 'text-[var(--fg)]',
  className = '',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CoachCheckinIcon size={iconSize} />
      <span className={`font-bold tracking-tight leading-none ${wordmarkClass}`}>
        Coacheckin
      </span>
    </div>
  )
}

/** Just the SVG icon, no wordmark. */
export function CoachCheckinIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Coacheckin logo"
    >
      {/* Dark teal rounded square background */}
      <rect width="32" height="32" rx="7" fill="#042F2E" />
      {/* Outer ring */}
      <circle cx="16" cy="16" r="11" stroke="#2DD4BF" strokeWidth="1.5" />
      {/* Inner filled circle */}
      <circle cx="16" cy="16" r="7.5" fill="#0D9488" />
      {/* White checkmark */}
      <path
        d="M11.5 16.5L14.5 19.5L20.5 13.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Light teal dot at top of outer ring */}
      <circle cx="16" cy="5" r="1.8" fill="#2DD4BF" />
    </svg>
  )
}
