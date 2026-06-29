import { cn } from '@lib/utils'
import { Progress } from '@components/ui/progress'

// Mirror backend xpToLevel/levelToXpRequired logic
function xpToLevel(xp: number): number {
  return Math.floor(1 + Math.sqrt(xp / 100))
}
function levelToXpRequired(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

interface LevelDisplayProps {
  totalXp: number
  className?: string
  compact?: boolean
}

export function LevelDisplay({ totalXp, className, compact = false }: LevelDisplayProps) {
  const level     = xpToLevel(totalXp)
  const currXpMin = levelToXpRequired(level)
  const nextXpMin = levelToXpRequired(level + 1)
  const progress  = ((totalXp - currXpMin) / (nextXpMin - currXpMin)) * 100

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shrink-0 shadow-glow-sm">
          <span className="text-xs font-bold text-primary-foreground">{level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Progress value={progress} className="h-1.5" />
        </div>
        <span className="text-2xs text-muted-foreground tabular-nums shrink-0">{totalXp} XP</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shrink-0 shadow-glow">
          <span className="text-lg font-bold text-primary-foreground">{level}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Level {level}</p>
          <p className="text-xs text-muted-foreground">
            {totalXp - currXpMin} / {nextXpMin - currXpMin} XP đến level {level + 1}
          </p>
        </div>
        <p className="text-sm font-bold tabular-nums text-primary">{totalXp} XP</p>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
