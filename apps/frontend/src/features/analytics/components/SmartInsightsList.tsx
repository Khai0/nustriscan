import { TrendingUp, TrendingDown, Lightbulb, Info } from 'lucide-react'
import { cn } from '@lib/utils'
import type { SmartInsight } from '../services/analytics.api'

const typeConfig = {
  positive: { icon: TrendingUp,   bg: 'bg-success/10',  text: 'text-success',     border: 'border-success/20' },
  negative: { icon: TrendingDown, bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
  neutral:  { icon: Info,         bg: 'bg-info/10',     text: 'text-info',        border: 'border-info/20' },
  tip:      { icon: Lightbulb,    bg: 'bg-warning/10',  text: 'text-warning-foreground', border: 'border-warning/20' },
}

interface SmartInsightsListProps {
  insights: SmartInsight[]
  className?: string
}

export function SmartInsightsList({ insights, className }: SmartInsightsListProps) {
  if (!insights.length) return null

  return (
    <div className={cn('space-y-2.5', className)}>
      {insights.map((insight, i) => {
        const cfg = typeConfig[insight.type]
        const Icon = cfg.icon
        return (
          <div
            key={insight.id}
            className={cn('flex items-start gap-3 p-3.5 rounded-xl border animate-slide-up', cfg.bg, cfg.border)}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
              <Icon className={cn('h-4 w-4', cfg.text)} />
            </div>
            <div className="min-w-0">
              <p className={cn('text-sm font-semibold', cfg.text)}>{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
