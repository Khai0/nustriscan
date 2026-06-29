import { useState } from 'react'
import { cn } from '@lib/utils'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import type { FoodMatch } from '../services/scan.api'

export type ServingPreset = 'small' | 'medium' | 'large'

interface ServingSizeSelectorProps {
  food:     FoodMatch
  onChange: (serving: { preset?: ServingPreset; customGrams?: number; calories: number; protein: number; carbs: number; fat: number }) => void
}

const PRESETS: { key: ServingPreset; label: string; emoji: string; mult: number; desc: string }[] = [
  { key: 'small',  label: 'Nhỏ',  emoji: '🥢', mult: 0.6, desc: '60%' },
  { key: 'medium', label: 'Vừa',  emoji: '🍽️', mult: 1.0, desc: 'Tiêu chuẩn' },
  { key: 'large',  label: 'Lớn',  emoji: '🫕', mult: 1.5, desc: '150%' },
]

export function ServingSizeSelector({ food, onChange }: ServingSizeSelectorProps) {
  const [mode,   setMode]   = useState<'preset' | 'custom'>('preset')
  const [preset, setPreset] = useState<ServingPreset>('medium')
  const [grams,  setGrams]  = useState<string>(String(food.servingSize))

  const computeNutrition = (mult: number) => ({
    calories: Math.round(food.calories      * mult),
    protein:  Math.round(food.protein       * mult * 10) / 10,
    carbs:    Math.round(food.carbohydrates * mult * 10) / 10,
    fat:      Math.round(food.fat           * mult * 10) / 10,
  })

  const handlePreset = (p: ServingPreset) => {
    setPreset(p)
    setMode('preset')
    const mult = PRESETS.find(x => x.key === p)!.mult
    onChange({ preset: p, ...computeNutrition(mult) })
  }

  const handleGrams = (val: string) => {
    setGrams(val)
    const g = parseFloat(val)
    if (isNaN(g) || g <= 0) return
    const mult = g / food.servingSize
    onChange({ customGrams: g, ...computeNutrition(mult) })
  }

  // Init with medium
  const currentMult = mode === 'custom'
    ? (parseFloat(grams) || food.servingSize) / food.servingSize
    : PRESETS.find(p => p.key === preset)!.mult

  const nutrition = computeNutrition(currentMult)
  const quantity  = mode === 'custom'
    ? parseFloat(grams) || food.servingSize
    : food.servingSize * currentMult

  return (
    <div className="space-y-4">
      {/* Preset buttons */}
      <div>
        <p className="text-sm font-medium mb-2">Chọn kích thước khẩu phần</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePreset(p.key)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all duration-150',
                mode === 'preset' && preset === p.key
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <span className="text-xl">{p.emoji}</span>
              <span className="text-sm font-semibold">{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.desc}</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(food.servingSize * p.mult)}g
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom grams */}
      <div
        className={cn(
          'rounded-xl border p-3 transition-all',
          mode === 'custom' ? 'border-primary bg-primary/5' : 'border-border'
        )}
        onClick={() => setMode('custom')}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">
              Hoặc nhập gram tuỳ chỉnh
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="2000"
                step="10"
                value={grams}
                onChange={e => handleGrams(e.target.value)}
                onClick={e => { e.stopPropagation(); setMode('custom') }}
                className="h-9 w-24 text-sm"
                placeholder="150"
              />
              <span className="text-sm text-muted-foreground">gram</span>
            </div>
          </div>
          {mode === 'custom' && (
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Live nutrition preview */}
      <div className="rounded-xl bg-muted/50 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Dinh dưỡng ({Math.round(quantity)}{food.servingUnit})
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Calo',    value: nutrition.calories, unit: 'kcal', cls: 'text-calories' },
            { label: 'Protein', value: nutrition.protein,  unit: 'g',    cls: 'text-protein' },
            { label: 'Carbs',   value: nutrition.carbs,    unit: 'g',    cls: 'text-carbs' },
            { label: 'Fat',     value: nutrition.fat,      unit: 'g',    cls: 'text-fats' },
          ].map(n => (
            <div key={n.label} className="text-center">
              <p className={cn('text-base font-bold tabular-nums leading-none', n.cls)}>
                {n.value}
              </p>
              <p className="text-2xs text-muted-foreground mt-0.5">{n.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
