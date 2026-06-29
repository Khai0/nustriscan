import { cn } from '@lib/utils'
import { Progress } from '@components/ui/progress'
import type { DailyNutrition } from '../services/analysis.api'

interface NutritionProgressProps {
  nutrition: DailyNutrition
  targets: {
    calorieTarget?: number
    proteinTarget?: number
    carbTarget?: number
    fatTarget?: number
  }
  className?: string
}

const rows: Array<{
  key:    keyof DailyNutrition
  label:  string
  unit:   string
  targetKey?: 'calorieTarget' | 'proteinTarget' | 'carbTarget' | 'fatTarget'
  defaultTarget?: number
  barColor: string
  higherIsBad?: boolean
}> = [
  { key: 'calories',     label: 'Calo',          unit: 'kcal', targetKey: 'calorieTarget',                             barColor: 'bg-calories' },
  { key: 'protein',      label: 'Protein',        unit: 'g',    targetKey: 'proteinTarget',                             barColor: 'bg-protein' },
  { key: 'carbohydrates',label: 'Carbohydrate',   unit: 'g',    targetKey: 'carbTarget',                                barColor: 'bg-carbs' },
  { key: 'fat',          label: 'Chất béo',       unit: 'g',    targetKey: 'fatTarget',                                 barColor: 'bg-fats' },
  { key: 'fiber',        label: 'Chất xơ',        unit: 'g',    defaultTarget: 25,                                      barColor: 'bg-fiber' },
  { key: 'sugar',        label: 'Đường',          unit: 'g',    defaultTarget: 50,   higherIsBad: true,                 barColor: 'bg-carbs' },
  { key: 'sodium',       label: 'Natri',          unit: 'mg',   defaultTarget: 2300, higherIsBad: true,                 barColor: 'bg-info' },
  { key: 'water',        label: 'Nước',           unit: 'ml',   defaultTarget: 2000,                                    barColor: 'bg-primary' },
]

function getBarColor(pct: number, higherIsBad: boolean, baseColor: string): string {
  if (!higherIsBad) {
    // Higher is better: green when >=80%, yellow when 50-80%, red <50%
    if (pct >= 80) return baseColor
    if (pct >= 50) return 'bg-warning'
    return 'bg-muted-foreground/40'
  } else {
    // Lower is better: green ≤70%, yellow 70-100%, red >100%
    if (pct <= 70) return 'bg-success'
    if (pct <= 100) return 'bg-warning'
    return 'bg-destructive'
  }
}

export function NutritionProgress({ nutrition, targets, className }: NutritionProgressProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {rows.map(row => {
        const actual = nutrition[row.key] ?? 0
        const target = row.targetKey ? (targets[row.targetKey] ?? row.defaultTarget) : row.defaultTarget
        const pct    = target ? Math.min(150, (actual / target) * 100) : null
        const displayPct = pct ? Math.min(100, pct) : 0
        const barCls = pct != null ? getBarColor(pct, row.higherIsBad ?? false, row.barColor) : row.barColor

        return (
          <div key={row.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{row.label}</span>
              <div className="flex items-center gap-1.5 text-right">
                <span className="font-bold tabular-nums">{Math.round(actual)}</span>
                <span className="text-muted-foreground text-xs">{row.unit}</span>
                {target && (
                  <span className="text-muted-foreground text-xs">
                    / {target}{row.unit}
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <Progress value={displayPct} className="h-2.5" indicatorClassName={barCls} />
              {pct != null && pct > 100 && (
                <div
                  className="absolute top-0 right-0 h-2.5 w-0.5 bg-destructive/60 rounded-full"
                  style={{ right: `${Math.max(0, 100 - Math.min(150, pct) * (100/150))}%` }}
                />
              )}
            </div>

            {pct != null && (
              <p className={cn(
                'text-2xs text-right',
                pct >= 100 && !row.higherIsBad ? 'text-success' :
                pct > 100  &&  row.higherIsBad ? 'text-destructive' :
                'text-muted-foreground'
              )}>
                {Math.round(pct)}% {row.higherIsBad ? 'giới hạn' : 'mục tiêu'}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
