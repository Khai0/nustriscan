import { AchievementBadge } from './AchievementBadge'
import type { Achievement } from '../../analytics/services/analytics.api'
import { cn } from '@lib/utils'

interface AchievementGridProps {
  achievements: Achievement[]
  className?: string
}

export function AchievementGrid({ achievements, className }: AchievementGridProps) {
  const unlocked = achievements.filter(a => a.unlocked)
  const locked   = achievements.filter(a => !a.unlocked)

  return (
    <div className={cn('space-y-5', className)}>
      {unlocked.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Đã mở khoá ({unlocked.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {unlocked.map(a => <AchievementBadge key={a.id} achievement={a} />)}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Chưa mở khoá ({locked.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {locked.map(a => <AchievementBadge key={a.id} achievement={a} />)}
          </div>
        </div>
      )}
    </div>
  )
}
