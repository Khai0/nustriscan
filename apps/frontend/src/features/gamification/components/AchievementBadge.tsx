import { cn } from '@lib/utils'
import { Lock } from 'lucide-react'
import type { Achievement } from '../../analytics/services/analytics.api'

const RARITY_STYLES: Record<string, { ring: string; bg: string; label: string; labelColor: string }> = {
  common:    { ring: 'ring-muted-foreground/20',  bg: 'bg-muted',          label: 'Phổ biến',   labelColor: 'text-muted-foreground' },
  rare:      { ring: 'ring-info/40',               bg: 'bg-info/10',        label: 'Hiếm',       labelColor: 'text-info' },
  epic:      { ring: 'ring-purple-500/40',         bg: 'bg-purple-500/10',  label: 'Sử thi',     labelColor: 'text-purple-500' },
  legendary: { ring: 'ring-warning/50',            bg: 'bg-warning/10',     label: 'Huyền thoại',labelColor: 'text-warning-foreground' },
}

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
}

export function AchievementBadge({ achievement, size = 'md', showDetails = true }: AchievementBadgeProps) {
  const rarity = RARITY_STYLES[achievement.rarity] ?? RARITY_STYLES.common
  const dimensions = { sm: 'h-12 w-12 text-xl', md: 'h-16 w-16 text-2xl', lg: 'h-20 w-20 text-3xl' }[size]

  return (
    <div className={cn(
      'flex flex-col items-center text-center gap-2 p-3 rounded-2xl transition-all',
      achievement.unlocked ? 'opacity-100' : 'opacity-50 grayscale'
    )}>
      <div className={cn(
        'rounded-2xl flex items-center justify-center ring-2 transition-all',
        dimensions,
        achievement.unlocked ? rarity.bg : 'bg-muted',
        achievement.unlocked ? rarity.ring : 'ring-transparent'
      )}>
        {achievement.unlocked
          ? <span>{achievement.emoji}</span>
          : <Lock className="h-5 w-5 text-muted-foreground" />
        }
      </div>
      {showDetails && (
        <div>
          <p className="text-xs font-semibold leading-tight">{achievement.title}</p>
          {size !== 'sm' && (
            <p className="text-2xs text-muted-foreground mt-0.5 leading-tight max-w-[100px]">
              {achievement.description}
            </p>
          )}
          <p className={cn('text-2xs font-medium mt-1', rarity.labelColor)}>
            {rarity.label} · +{achievement.xp} XP
          </p>
        </div>
      )}
    </div>
  )
}
