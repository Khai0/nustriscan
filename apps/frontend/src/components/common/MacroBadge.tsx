import { cn } from '@lib/utils'

type MacroType = 'calories' | 'protein' | 'carbs' | 'fats' | 'fiber'

interface MacroBadgeProps {
  type: MacroType
  value: number
  unit?: string
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const macroConfig: Record<MacroType, { label: string; color: string; bg: string; unit: string }> = {
  calories: { label: 'Calo',    color: 'text-calories', bg: 'bg-calories-light', unit: 'kcal' },
  protein:  { label: 'Protein', color: 'text-protein',  bg: 'bg-protein-light',  unit: 'g' },
  carbs:    { label: 'Carbs',   color: 'text-carbs',    bg: 'bg-carbs-light',    unit: 'g' },
  fats:     { label: 'Chất béo',color: 'text-fats',     bg: 'bg-fats-light',     unit: 'g' },
  fiber:    { label: 'Chất xơ', color: 'text-fiber',    bg: 'bg-fiber-light',    unit: 'g' },
}

export function MacroBadge({ type, value, unit, label, className, size = 'md' }: MacroBadgeProps) {
  const config = macroConfig[type]
  return (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      config.bg,
      config.color,
      size === 'sm' && 'px-2 py-0.5 text-xs',
      size === 'md' && 'px-2.5 py-1 text-xs',
      size === 'lg' && 'px-3 py-1.5 text-sm',
      className
    )}>
      <span className="font-bold tabular-nums">{Math.round(value)}</span>
      <span className="opacity-75">{unit ?? config.unit}</span>
      {label !== undefined && <span className="opacity-75">{label ?? config.label}</span>}
    </div>
  )
}

interface MacroRowProps {
  calories: number
  protein: number
  carbs: number
  fats: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MacroRow({ calories, protein, carbs, fats, className, size = 'sm' }: MacroRowProps) {
  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      <MacroBadge type="calories" value={calories} size={size} />
      <MacroBadge type="protein"  value={protein}  size={size} />
      <MacroBadge type="carbs"    value={carbs}    size={size} />
      <MacroBadge type="fats"     value={fats}     size={size} />
    </div>
  )
}
