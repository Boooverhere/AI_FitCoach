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
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4"
        >
          <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg sm:text-2xl font-bold leading-none">{s.value}</p>
            <p className="text-[10px] sm:text-sm text-[var(--fg-40)] mt-0.5 leading-tight">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
