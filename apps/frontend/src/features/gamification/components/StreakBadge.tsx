import { cn } from '@lib/utils'

interface StreakBadgeProps {
  current: number
  longest?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StreakBadge({ current, longest, size = 'md', className }: StreakBadgeProps) {
  const sizeCls = {
    sm: 'text-lg px-2.5 py-1 gap-1',
    md: 'text-2xl px-3.5 py-1.5 gap-1.5',
    lg: 'text-4xl px-5 py-2.5 gap-2',
  }[size]

  const numCls = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size]

  const isHot = current >= 7

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className={cn(
        'inline-flex items-center rounded-full font-bold',
        sizeCls,
        isHot ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-glow' : 'bg-muted text-muted-foreground'
      )}>
        <span>🔥</span>
        <span className={cn('tabular-nums', numCls)}>{current}</span>
      </div>
      {longest != null && longest > current && (
        <p className="text-2xs text-muted-foreground mt-1">Kỷ lục: {longest} ngày</p>
      )}
    </div>
  )
}
