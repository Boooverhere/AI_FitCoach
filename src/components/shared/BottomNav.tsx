'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, Bot, Heart } from 'lucide-react'

const coachLinks = [
  { href: '/coach', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/coach/habits', label: 'Habits', icon: Dumbbell, exact: false },
  { href: '/coach/settings/ai', label: 'AI', icon: Bot, exact: false },
]

const clientLinks = [
  { href: '/client', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/client/profile', label: 'Health', icon: Heart, exact: false },
]

export function BottomNav({ role }: { role: 'coach' | 'client' }) {
  const pathname = usePathname()
  const links = role === 'coach' ? coachLinks : clientLinks

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-nav)] border-t border-[var(--border-8)] flex items-stretch safe-area-pb">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
              active ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-40)]'
            }`}
          >
            <l.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">{l.label}</span>
            {active && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-[var(--accent)] rounded-t-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
