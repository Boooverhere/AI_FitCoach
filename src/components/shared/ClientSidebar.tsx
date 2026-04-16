'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Heart } from 'lucide-react'

const links = [
  { href: '/client', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/profile', label: 'Health Profile', icon: Heart },
]

export function ClientSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-[var(--border-8)] flex-shrink-0 flex flex-col gap-1 pt-4 px-3 bg-[var(--bg-nav)]">
      {links.map((l) => {
        const active = pathname === l.href
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
