
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label: string; value: string; sub?: string
  icon?: LucideIcon; iconBg?: string; iconColor?: string; valueColor?: string
}
export function MetricCard({ label, value, sub, icon: Icon, iconBg, iconColor, valueColor }: Props) {
  return (
    <div className="card-padded">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="metric-label">{label}</p>
          <p className={cn('metric-value truncate', valueColor)}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg', iconBg ?? 'bg-brand-light')}>
            <Icon className={cn('h-4 w-4', iconColor ?? 'text-brand')}/>
          </div>
        )}
      </div>
    </div>
  )
}
