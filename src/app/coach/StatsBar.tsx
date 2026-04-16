import { Users, CheckCircle, TrendingUp } from 'lucide-react'

interface StatsBarProps {
  totalClients: number
  checkedInToday: number
  avgCompletion: number
}

export function StatsBar({ totalClients, checkedInToday, avgCompletion }: StatsBarProps) {
  const stats = [
    {
      label: 'Total clients',
      value: totalClients,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Checked in today',
      value: checkedInToday,
      icon: CheckCircle,
      color: 'text-[var(--accent-fg)]',
      bg: 'bg-[var(--accent-tint)]',
    },
    {
      label: 'Avg. completion (30d)',
      value: `${avgCompletion}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-5 flex items-center gap-4"
        >
          <div className={`h-11 w-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <s.icon className={`h-5 w-5 ${s.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-[var(--fg-40)]">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
