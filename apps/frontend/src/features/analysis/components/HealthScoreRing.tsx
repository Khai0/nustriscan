import { CircularProgress } from '@components/common/CircularProgress'
import { cn } from '@lib/utils'

interface HealthScoreRingProps {
  score:  number
  grade:  'excellent' | 'good' | 'fair' | 'poor'
  size?:  number
  showLabel?: boolean
  className?: string
}

const gradeConfig = {
  excellent: { color: 'hsl(var(--primary))',     label: 'Xuất sắc',      emoji: '🌟', textCls: 'text-primary' },
  good:      { color: 'hsl(var(--success))',     label: 'Tốt',           emoji: '✅', textCls: 'text-success' },
  fair:      { color: 'hsl(var(--warning))',     label: 'Trung bình',    emoji: '⚠️', textCls: 'text-warning-foreground' },
  poor:      { color: 'hsl(var(--destructive))', label: 'Cần cải thiện', emoji: '❌', textCls: 'text-destructive' },
}

export function HealthScoreRing({ score, grade, size = 120, showLabel = true, className }: HealthScoreRingProps) {
  const cfg = gradeConfig[grade]

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <CircularProgress
        value={score}
        size={size}
        strokeWidth={Math.round(size * 0.075)}
        color={cfg.color}
        trackColor="hsl(var(--muted))"
      >
        <div className="text-center">
          <p className={cn('font-bold tabular-nums leading-none', size >= 100 ? 'text-3xl' : 'text-xl', cfg.textCls)}>
            {score}
          </p>
          <p className="text-2xs text-muted-foreground mt-0.5">/100</p>
        </div>
      </CircularProgress>
      {showLabel && (
        <div className="text-center">
          <p className={cn('text-sm font-semibold', cfg.textCls)}>
            {cfg.emoji} {cfg.label}
          </p>
        </div>
      )}
    </div>
  )
}
