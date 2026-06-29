import { CheckCircle2 } from 'lucide-react'
import { Progress } from '@components/ui/progress'
import { Badge } from '@components/ui/badge'
import { cn } from '@lib/utils'
import type { WeeklyChallenge } from '../../analytics/services/analytics.api'

// Map challengeId to emoji (matches backend CHALLENGE_POOL)
const CHALLENGE_EMOJI: Record<string, string> = {
  protein_week:    '💪',
  fiber_week:      '🥦',
  hydration_week:  '💧',
  score_challenge: '⭐',
  sodium_control:  '🧂',
  no_sugar_spike:  '🚫',
  calorie_range:   '🎯',
  log_every_day:   '📝',
}

interface WeeklyChallengeCardProps {
  challenge: WeeklyChallenge
  className?: string
}

export function WeeklyChallengeCard({ challenge, className }: WeeklyChallengeCardProps) {
  const pct   = Math.min(100, (challenge.currentValue / challenge.targetValue) * 100)
  const emoji = CHALLENGE_EMOJI[challenge.challengeId] ?? '🏅'

  return (
    <div className={cn(
      'rounded-2xl border-2 p-4 transition-all',
      challenge.completed
        ? 'border-primary bg-primary/5'
        : 'border-border'
    , className)}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0',
          challenge.completed ? 'bg-primary/15' : 'bg-muted'
        )}>
          {challenge.completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{challenge.title}</p>
            <Badge variant={challenge.completed ? 'success' : 'secondary'} className="text-2xs shrink-0">
              {challenge.completed ? 'Hoàn thành' : `+${challenge.rewardXp} XP`}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>

          <div className="mt-2.5 space-y-1">
            <Progress
              value={pct}
              className="h-2"
              indicatorClassName={challenge.completed ? 'bg-primary' : 'bg-info'}
            />
            <p className="text-2xs text-muted-foreground text-right">
              {challenge.currentValue}/{challenge.targetValue} ngày
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
