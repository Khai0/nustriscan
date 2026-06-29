import { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { cn } from '@lib/utils'
import { useHealthConditions, useUpsertCondition, useRemoveCondition } from '../hooks/useAnalysis'
// Frontend DTO labels import alias (we re-declare locally to avoid backend import)
const CONDITIONS: Array<{ value: string; label: string; emoji: string; description: string }> = [
  { value: 'DIABETES',           label: 'Tiểu đường',             emoji: '🩸', description: 'Theo dõi đường huyết' },
  { value: 'HYPERTENSION',       label: 'Huyết áp cao',           emoji: '💓', description: 'Giảm natri' },
  { value: 'OBESITY',            label: 'Béo phì',                emoji: '⚖️', description: 'Kiểm soát calo' },
  { value: 'HIGH_CHOLESTEROL',   label: 'Mỡ máu cao',             emoji: '🫀', description: 'Hạn chế chất béo bão hoà' },
  { value: 'CELIAC',             label: 'Không dung nạp gluten',  emoji: '🌾', description: 'Tránh gluten' },
  { value: 'LACTOSE_INTOLERANT', label: 'Không dung nạp lactose', emoji: '🥛', description: 'Hạn chế sữa' },
]

interface ConditionSelectorProps {
  className?: string
  onUpdate?:  () => void
}

export function ConditionSelector({ className, onUpdate }: ConditionSelectorProps) {
  const { data: conditions = [], isLoading } = useHealthConditions()
  const upsertMutation = useUpsertCondition()
  const removeMutation = useRemoveCondition()
  const [adding, setAdding] = useState(false)

  const activeSet = new Set(conditions.map(c => c.condition))

  const toggle = async (value: string) => {
    if (activeSet.has(value)) {
      await removeMutation.mutateAsync(value)
    } else {
      await upsertMutation.mutateAsync({ condition: value })
    }
    onUpdate?.()
  }

  if (isLoading) return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
    </div>
  )

  return (
    <div className={cn('space-y-3', className)}>
      {/* Active conditions */}
      {conditions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {conditions.map(c => {
            const cfg = CONDITIONS.find(x => x.value === c.condition)
            if (!cfg) return null
            return (
              <div key={c.condition} className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full pl-3 pr-2 py-1.5">
                <span className="text-sm">{cfg.emoji}</span>
                <span className="text-xs font-medium">{cfg.label}</span>
                <button
                  onClick={() => toggle(c.condition)}
                  disabled={removeMutation.isPending}
                  className="h-4 w-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setAdding(a => !a)}
      >
        <Plus className="h-3.5 w-3.5" />
        {conditions.length === 0 ? 'Thêm tình trạng sức khoẻ' : 'Quản lý'}
      </Button>

      {/* Picker */}
      {adding && (
        <div className="grid grid-cols-1 gap-2 pt-1 animate-slide-up">
          {CONDITIONS.map(opt => {
            const active = activeSet.has(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                disabled={upsertMutation.isPending || removeMutation.isPending}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <span className="text-xl shrink-0">{opt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
                {active && <Badge variant="default" className="text-2xs shrink-0">Đang áp dụng</Badge>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
