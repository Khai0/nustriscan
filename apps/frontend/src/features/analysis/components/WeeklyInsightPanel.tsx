import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@lib/utils'
import { Badge } from '@components/ui/badge'
import type { WeeklyTrend, NutrientDeficiency, DetectedHabit } from '../services/analysis.api'

// ── Trend item ─────────────────────────────────────────────────────────────────
function TrendItem({ trend }: { trend: WeeklyTrend }) {
  const cfg = {
    improving: { icon: TrendingUp,   color: 'text-success',     bg: 'bg-success/10',     badge: 'success' as const },
    declining: { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10', badge: 'destructive' as const },
    stable:    { icon: Minus,        color: 'text-muted-foreground', bg: 'bg-muted',      badge: 'secondary' as const },
  }[trend.direction]

  const Icon = cfg.icon

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-xl', cfg.bg)}>
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', cfg.color)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{trend.label}</p>
          {trend.change !== 0 && (
            <Badge variant={cfg.badge} className="text-2xs px-1.5 py-0">
              {trend.change > 0 ? '+' : ''}{trend.change}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{trend.message}</p>
      </div>
    </div>
  )
}

// ── Deficiency item ────────────────────────────────────────────────────────────
function DeficiencyItem({ def }: { def: NutrientDeficiency }) {
  const severityColors = {
    mild:     'bg-warning/10 border-warning/30',
    moderate: 'bg-orange-500/10 border-orange-500/30',
    severe:   'bg-destructive/10 border-destructive/30',
  }

  return (
    <div className={cn('rounded-xl border p-3', severityColors[def.severity])}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-semibold">{def.label} thấp</p>
        <Badge variant="outline" className="text-2xs">
          -{def.deficitPct}% mục tiêu
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        TB: {def.avgValue} / Cần: {def.target} — Thiếu {def.daysDeficient} ngày
      </p>
      <p className="text-xs text-foreground/75 mt-1.5">💡 {def.recommendation}</p>
    </div>
  )
}

// ── Habit item ─────────────────────────────────────────────────────────────────
function HabitItem({ habit }: { habit: DetectedHabit }) {
  const cfg = {
    positive: { icon: CheckCircle2, color: 'text-success',     bg: 'bg-success/10' },
    negative: { icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/10' },
    neutral:  { icon: AlertCircle,  color: 'text-info',        bg: 'bg-info/10' },
  }[habit.type]
  const Icon = cfg.icon

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-xl', cfg.bg)}>
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', cfg.color)} />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{habit.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{habit.description}</p>
        <p className="text-2xs text-muted-foreground mt-1">📅 {habit.frequency}</p>
      </div>
    </div>
  )
}

// ── Main panel ─────────────────────────────────────────────────────────────────
interface WeeklyInsightPanelProps {
  trends:       WeeklyTrend[]
  deficiencies: NutrientDeficiency[]
  habits:       DetectedHabit[]
  className?:   string
}

export function WeeklyInsightPanel({ trends, deficiencies, habits, className }: WeeklyInsightPanelProps) {
  const significantTrends = trends.filter(t => t.direction !== 'stable')

  return (
    <div className={cn('space-y-6', className)}>
      {/* Trends */}
      {significantTrends.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            📈 Xu hướng tuần này
          </p>
          <div className="space-y-2">
            {significantTrends.map(t => <TrendItem key={t.nutrient} trend={t} />)}
          </div>
        </div>
      )}

      {/* Deficiencies */}
      {deficiencies.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            ⚠️ Thiếu hụt dinh dưỡng
          </p>
          <div className="space-y-2">
            {deficiencies.map(d => <DeficiencyItem key={d.nutrient} def={d} />)}
          </div>
        </div>
      )}

      {/* Habits */}
      {habits.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            🔄 Thói quen phát hiện
          </p>
          <div className="space-y-2">
            {habits.map(h => <HabitItem key={h.id} habit={h} />)}
          </div>
        </div>
      )}

      {significantTrends.length === 0 && deficiencies.length === 0 && habits.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <p className="text-2xl mb-2">📊</p>
          <p>Cần ít nhất 3 ngày dữ liệu để phân tích xu hướng.</p>
        </div>
      )}
    </div>
  )
}
