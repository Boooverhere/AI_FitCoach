'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, Bot, Bell, MessageSquare, Layers } from 'lucide-react'

const links = [
  { href: '/coach',                label: 'Dashboard',     icon: LayoutDashboard, exact: true  },
  { href: '/coach/messages',       label: 'Messages',      icon: MessageSquare,   exact: false },
  { href: '/coach/habits',         label: 'Habits',        icon: Dumbbell,        exact: false },
  { href: '/coach/programs',       label: 'Programs',      icon: Layers,          exact: false },
  { href: '/coach/notifications',  label: 'Notifications', icon: Bell,            exact: false },
  { href: '/coach/settings/ai',    label: 'AI Settings',   icon: Bot,             exact: false },
]

interface Props {
  unreadNotifications?: number
  unreadMessages?: number
}

export function CoachSidebar({ unreadNotifications = 0, unreadMessages = 0 }: Props) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 border-r border-[var(--border-8)] flex-shrink-0 flex-col gap-1 pt-4 px-3 bg-[var(--bg-nav)]">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        const badge =
          l.label === 'Notifications' && unreadNotifications > 0 ? unreadNotifications
          : l.label === 'Messages' && unreadMessages > 0 ? unreadMessages
          : 0

        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              active
                ? 'bg-[var(--bg-active-nav)] text-[var(--fg-active-nav)] font-medium'
                : 'text-[var(--fg-50)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <l.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{l.label}</span>
            {badge > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-[var(--accent)] text-[var(--accent-on-solid)] text-[10px] font-bold flex items-center justify-center leading-none">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </Link>
        )
      })}
    </aside>
  )
}
