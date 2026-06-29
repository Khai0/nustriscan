import { cn } from '@lib/utils'
import { Progress } from '@components/ui/progress'
import type { ScoreBreakdown } from '../services/analysis.api'

const scoreItems: Array<{
  key:    keyof ScoreBreakdown
  label:  string
  emoji:  string
  color:  string
  desc:   (s: number) => string
}> = [
  { key: 'calorie',   label: 'Cân bằng calo',  emoji: '🔥', color: 'bg-calories', desc: s => s >= 85 ? 'Đạt mục tiêu' : s >= 65 ? 'Gần đạt mục tiêu' : 'Cần điều chỉnh' },
  { key: 'protein',   label: 'Chất đạm',        emoji: '💪', color: 'bg-protein',  desc: s => s >= 85 ? 'Đủ protein' : s >= 65 ? 'Gần đủ' : 'Thiếu protein' },
  { key: 'sugar',     label: 'Kiểm soát đường', emoji: '🍬', color: 'bg-carbs',    desc: s => s >= 85 ? 'Đường thấp tốt' : s >= 65 ? 'Đường ở mức trung bình' : 'Đường quá cao' },
  { key: 'sodium',    label: 'Kiểm soát muối',  emoji: '🧂', color: 'bg-info',     desc: s => s >= 85 ? 'Natri thấp tốt' : s >= 65 ? 'Natri trung bình' : 'Natri quá cao' },
  { key: 'fiber',     label: 'Chất xơ',          emoji: '🥦', color: 'bg-fiber',    desc: s => s >= 85 ? 'Đủ chất xơ' : s >= 65 ? 'Gần đủ chất xơ' : 'Thiếu chất xơ' },
  { key: 'diversity', label: 'Đa dạng bữa ăn',  emoji: '🍽️', color: 'bg-fats',     desc: s => s >= 85 ? 'Đa dạng tốt' : s >= 65 ? 'Khá đa dạng' : 'Cần thêm bữa' },
]

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-primary'
  if (score >= 65) return 'text-warning-foreground'
  return 'text-destructive'
}

interface ScoreBreakdownCardProps {
  scores:    ScoreBreakdown
  className?: string
}

export function ScoreBreakdownCard({ scores, className }: ScoreBreakdownCardProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {scoreItems.map(item => {
        const score = scores[item.key]
        return (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{item.emoji}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{item.desc(score)}</span>
                <span className={cn('text-sm font-bold tabular-nums w-8 text-right', getScoreColor(score))}>
                  {score}
                </span>
              </div>
            </div>
            <Progress
              value={score}
              className="h-2"
              indicatorClassName={cn(
                item.color,
                score >= 85 ? 'opacity-100' : score >= 65 ? 'opacity-80' : 'opacity-60'
              )}
            />
          </div>
        )
      })}
    </div>
  )
}
