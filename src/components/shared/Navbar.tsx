'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Logo } from './Logo'

interface NavbarProps {
  fullName: string
  role: 'coach' | 'client'
}

export function Navbar({ fullName, role }: NavbarProps) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="h-16 border-b border-[var(--border-8)] flex items-center px-6 justify-between bg-[var(--bg-nav)]">
      <div className="flex items-center gap-3">
        <Logo iconSize={26} wordmarkClass="text-[var(--fg)]" />
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-tint)] text-[var(--accent-fg)] font-medium uppercase tracking-wider">
          {role}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:block text-sm text-[var(--fg-50)]">{fullName}</span>
        <ThemeToggle />
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-[var(--fg-40)] hover:text-[var(--fg-70)] transition-colors px-2 py-1.5"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </nav>
  )
}
