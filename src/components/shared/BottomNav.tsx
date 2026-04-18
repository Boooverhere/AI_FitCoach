'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, Bot, Heart, Bell, MessageSquare } from 'lucide-react'

const coachLinks = [
  { href: '/coach',               label: 'Dashboard', icon: LayoutDashboard, exact: true  },
  { href: '/coach/messages',      label: 'Messages',  icon: MessageSquare,   exact: false },
  { href: '/coach/habits',        label: 'Habits',    icon: Dumbbell,        exact: false },
  { href: '/coach/notifications', label: 'Alerts',    icon: Bell,            exact: false },
  { href: '/coach/settings/ai',   label: 'AI',        icon: Bot,             exact: false },
]

const clientLinks = [
  { href: '/client',          label: 'Dashboard', icon: LayoutDashboard, exact: true  },
  { href: '/client/messages', label: 'Messages',  icon: MessageSquare,   exact: false },
  { href: '/client/profile',  label: 'Health',    icon: Heart,           exact: false },
]

interface Props {
  role: 'coach' | 'client'
  unreadNotifications?: number
  unreadMessages?: number
}

export function BottomNav({ role, unreadNotifications = 0, unreadMessages = 0 }: Props) {
  const pathname = usePathname()
  const links = role === 'coach' ? coachLinks : clientLinks

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-nav)] border-t border-[var(--border-8)] flex items-stretch">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        const badge =
          l.href === '/coach/notifications' && unreadNotifications > 0 ? unreadNotifications
          : l.label === 'Messages' && unreadMessages > 0 ? unreadMessages
          : 0

        return (
          <Link
            key={l.href}
            href={l.href}
            prefetch
            className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-3 select-none active:opacity-50 ${
              active ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-40)]'
            }`}
          >
            <span className="relative">
              <l.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
              {badge > 0 && (
                <span className="absolute -top-1 -right-1.5 h-3.5 min-w-3.5 px-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-on-solid)] text-[8px] font-bold flex items-center justify-center leading-none">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">{l.label}</span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--accent)] rounded-b-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
