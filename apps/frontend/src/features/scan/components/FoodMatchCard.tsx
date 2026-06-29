import { cn } from '@lib/utils'
import { Badge } from '@components/ui/badge'
import { Check } from 'lucide-react'
import type { FoodMatch } from '../services/scan.api'

interface FoodMatchCardProps {
  match:      FoodMatch
  selected:   boolean
  rank:       number
  onSelect:   () => void
}

const methodLabel: Record<string, { label: string; color: string }> = {
  exact:   { label: 'Khớp chính xác', color: 'text-primary' },
  alias:   { label: 'Alias',           color: 'text-info' },
  fuzzy:   { label: 'Gần giống',       color: 'text-warning-foreground' },
  keyword: { label: 'Từ khoá',         color: 'text-muted-foreground' },
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color =
    pct >= 85 ? 'bg-primary' :
    pct >= 65 ? 'bg-warning' :
    'bg-muted-foreground'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-8 text-right">{pct}%</span>
    </div>
  )
}

export function FoodMatchCard({ match, selected, rank, onSelect }: FoodMatchCardProps) {
  const method = methodLabel[match.matchMethod] ?? { label: match.matchMethod, color: 'text-muted-foreground' }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-2xl border-2 p-4 transition-all duration-150',
        selected
          ? 'border-primary bg-primary/5 shadow-glow-sm'
          : 'border-border hover:border-primary/40 hover:bg-accent/30'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className={cn(
          'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
          rank === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}>
          {selected ? <Check className="h-3.5 w-3.5" /> : rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground leading-tight">{match.foodName}</p>
              {match.nameEn && (
                <p className="text-xs text-muted-foreground mt-0.5">{match.nameEn}</p>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn('text-2xs shrink-0 border-0 bg-transparent px-0', method.color)}
            >
              {method.label}
            </Badge>
          </div>

          {/* Confidence bar */}
          <div className="mt-2.5">
            <ConfidenceBar value={match.confidence} />
          </div>

          {/* Nutrition preview */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: 'Calo', value: match.calories, unit: 'kcal', color: 'text-calories' },
              { label: 'P',    value: match.protein,  unit: 'g',    color: 'text-protein' },
              { label: 'C',    value: match.carbohydrates, unit: 'g', color: 'text-carbs' },
              { label: 'F',    value: match.fat,      unit: 'g',    color: 'text-fats' },
            ].map(n => (
              <div key={n.label} className="text-center">
                <p className={cn('text-sm font-bold tabular-nums leading-none', n.color)}>
                  {Math.round(n.value)}
                </p>
                <p className="text-2xs text-muted-foreground mt-0.5">{n.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Khẩu phần: {match.servingSize}{match.servingUnit}
          </p>
        </div>
      </div>
    </button>
  )
}
