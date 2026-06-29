import { cn } from '@lib/utils'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { Progress } from '@components/ui/progress'
import { Skeleton } from '@components/ui/skeleton'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  iconBg?: string
  progress?: { value: number; max?: number; color?: string }
  trend?: { value: number; label?: string }
  loading?: boolean
  className?: string
  onClick?: () => void
}

export function StatCard({
  title, value, unit, subtitle, icon: Icon,
  iconColor = 'text-primary', iconBg = 'bg-primary/10',
  progress, trend, loading, className, onClick,
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn('rounded-2xl border bg-card p-5 space-y-3', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-20" />
        {progress && <Skeleton className="h-2 w-full rounded-full" />}
        <Skeleton className="h-3 w-16" />
      </div>
    )
  }

  const trendIcon = trend
    ? trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus
    : null
  const trendColor = trend
    ? trend.value > 0 ? 'text-success' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground'
    : ''

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-5 space-y-3 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon className={cn('h-4.5 w-4.5', iconColor)} />
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span className="stat-value text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground mb-1">{unit}</span>}
      </div>

      {progress && (
        <Progress
          value={Math.min(100, progress.max ? (Number(value) / progress.max) * 100 : progress.value)}
          className="h-2"
          indicatorClassName={progress.color}
        />
      )}

      {(subtitle || trend) && (
        <div className="flex items-center gap-1.5">
          {trend && trendIcon && (
            <div className={cn('flex items-center gap-0.5 text-xs font-medium', trendColor)}>
              {React.createElement(trendIcon, { className: 'h-3 w-3' })}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      )}
    </div>
  )
}

import React from 'react'
