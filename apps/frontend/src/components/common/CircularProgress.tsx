import { cn } from '@lib/utils'

interface CircularProgressProps {
  value: number        // 0–100
  size?: number        // px
  strokeWidth?: number
  color?: string
  trackColor?: string
  className?: string
  children?: React.ReactNode
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 7,
  color = 'hsl(var(--primary))',
  trackColor = 'hsl(var(--muted))',
  className,
  children,
}: CircularProgressProps) {
  const radius  = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, value))
  const offset  = circumference - (clamped / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

interface MacroRingProps {
  label: string
  current: number
  target: number
  unit?: string
  color: string
  size?: number
}

export function MacroRing({ label, current, target, unit = 'g', color, size = 72 }: MacroRingProps) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-1.5">
      <CircularProgress value={pct} size={size} strokeWidth={6} color={color}>
        <div className="text-center">
          <p className="text-xs font-bold tabular-nums leading-none">{Math.round(current)}</p>
          <p className="text-2xs text-muted-foreground leading-none mt-0.5">{unit}</p>
        </div>
      </CircularProgress>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </div>
  )
}
