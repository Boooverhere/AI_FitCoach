'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, Bot } from 'lucide-react'

const links = [
  { href: '/coach', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/coach/habits', label: 'Habits', icon: Dumbbell },
  { href: '/coach/settings/ai', label: 'AI Settings', icon: Bot },
]

export function CoachSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 border-r border-[var(--border-8)] flex-shrink-0 flex-col gap-1 pt-4 px-3 bg-[var(--bg-nav)]">
      {links.map((l) => {
        const active = l.href === '/coach' ? pathname === l.href : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              active
                ? 'bg-[var(--accent-wash)] text-[var(--accent-fg)] font-medium'
                : 'text-[var(--fg-50)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </Link>
        )
      })}
    </aside>
  )
}
