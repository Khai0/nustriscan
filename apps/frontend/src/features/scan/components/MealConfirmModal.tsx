import { useState } from 'react'
import { Loader2, CheckCircle2, CalendarDays, Utensils } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@components/ui/drawer'
import { Button } from '@components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select'
import { Label } from '@components/ui/label'
import { ServingSizeSelector, type ServingPreset } from './ServingSizeSelector'
import type { FoodMatch } from '../services/scan.api'

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

interface MealConfirmModalProps {
  open:        boolean
  food:        FoodMatch | null
  onClose:     () => void
  onConfirm:   (payload: {
    foodItemId:    string
    mealType:      MealType
    mealDate:      string
    servingPreset?: ServingPreset
    customGrams?:  number
  }) => void
  isLoading:   boolean
}

const MEAL_OPTIONS: { value: MealType; label: string; emoji: string }[] = [
  { value: 'BREAKFAST', label: 'Bữa sáng',  emoji: '🌅' },
  { value: 'LUNCH',     label: 'Bữa trưa',  emoji: '☀️' },
  { value: 'DINNER',    label: 'Bữa tối',   emoji: '🌙' },
  { value: 'SNACK',     label: 'Bữa phụ',   emoji: '🍎' },
]

function getDefaultMealType(): MealType {
  const hour = new Date().getHours()
  if (hour < 10) return 'BREAKFAST'
  if (hour < 14) return 'LUNCH'
  if (hour < 19) return 'DINNER'
  return 'SNACK'
}

export function MealConfirmModal({ open, food, onClose, onConfirm, isLoading }: MealConfirmModalProps) {
  const [mealType,  setMealType]  = useState<MealType>(getDefaultMealType())
  const [mealDate,  setMealDate]  = useState(new Date().toISOString().split('T')[0])
  const [serving,   setServing]   = useState<{
    preset?: ServingPreset
    customGrams?: number
    calories: number
    protein: number
    carbs: number
    fat: number
  }>({
    preset: 'medium',
    calories: food?.calories ?? 0,
    protein:  food?.protein  ?? 0,
    carbs:    food?.carbohydrates ?? 0,
    fat:      food?.fat      ?? 0,
  })

  if (!food) return null

  const handleConfirm = () => {
    onConfirm({
      foodItemId:    food.foodItemId,
      mealType,
      mealDate,
      servingPreset: serving.preset,
      customGrams:   serving.customGrams,
    })
  }

  return (
    <Drawer open={open} onOpenChange={v => !v && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="text-lg">Xác nhận bữa ăn</DrawerTitle>
          <p className="text-sm text-muted-foreground">{food.foodName}</p>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-5 overflow-y-auto">
          {/* Meal type selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm">
              <Utensils className="h-3.5 w-3.5" /> Loại bữa ăn
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMealType(opt.value)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all ${
                    mealType === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date picker */}
          <div className="space-y-1.5">
            <Label htmlFor="mealDate" className="flex items-center gap-1.5 text-sm">
              <CalendarDays className="h-3.5 w-3.5" /> Ngày ăn
            </Label>
            <input
              id="mealDate"
              type="date"
              value={mealDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setMealDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Serving size */}
          <ServingSizeSelector
            food={food}
            onChange={setServing}
          />
        </div>

        <DrawerFooter>
          <Button onClick={handleConfirm} className="w-full gap-2" disabled={isLoading}>
            {isLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu…</>
              : <><CheckCircle2 className="h-4 w-4" /> Lưu bữa ăn</>
            }
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose} disabled={isLoading}>
            Huỷ
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
