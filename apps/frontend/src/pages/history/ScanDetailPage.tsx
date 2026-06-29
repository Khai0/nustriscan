import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, Edit2, Clock, Utensils } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Progress } from '@components/ui/progress'
import { MacroRow } from '@components/common/MacroBadge'
import { CircularProgress } from '@components/common/CircularProgress'

const mockMeal = {
  id: '1', name: 'Phở bò', mealType: 'BREAKFAST', mealDate: '2024-01-15', mealTime: '07:30',
  totalCalories: 450, totalProtein: 28, totalCarbohydrates: 52, totalFat: 12, totalFiber: 2.5,
  notes: 'Phở bò tái ở quán quen',
  items: [
    { id: 'i1', foodName: 'Bánh phở',    quantity: 200, unit: 'g',  calories: 210, protein: 8,  carbohydrates: 44, fat: 1 },
    { id: 'i2', foodName: 'Thịt bò tái', quantity: 100, unit: 'g',  calories: 180, protein: 18, carbohydrates: 0,  fat: 11 },
    { id: 'i3', foodName: 'Nước dùng',   quantity: 200, unit: 'ml', calories: 40,  protein: 2,  carbohydrates: 6,  fat: 0 },
    { id: 'i4', foodName: 'Rau thơm',    quantity: 20,  unit: 'g',  calories: 5,   protein: 0,  carbohydrates: 1,  fat: 0 },
  ],
}
const mealTypeLabel: Record<string, string> = {
  BREAKFAST: 'Bữa sáng', LUNCH: 'Bữa trưa', DINNER: 'Bữa tối', SNACK: 'Bữa phụ',
}

export default function ScanDetailPage() {
  const navigate = useNavigate()
  const meal = mockMeal

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl shrink-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{meal.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-xs">{mealTypeLabel[meal.mealType]}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />{meal.mealTime}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl"><Edit2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground font-medium">Tổng calo</p>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-4xl font-bold tabular-nums">{meal.totalCalories}</span>
            <span className="text-muted-foreground mb-1 text-sm">kcal</span>
          </div>
          <MacroRow calories={meal.totalCalories} protein={meal.totalProtein} carbs={meal.totalCarbohydrates} fats={meal.totalFat} className="mt-3" size="md" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Phân bổ dinh dưỡng</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Protein',  value: meal.totalProtein,       target: 160, cls: 'bg-protein', txt: 'text-protein' },
            { name: 'Carbs',    value: meal.totalCarbohydrates, target: 263, cls: 'bg-carbs',   txt: 'text-carbs' },
            { name: 'Chất béo', value: meal.totalFat,           target: 58,  cls: 'bg-fats',    txt: 'text-fats' },
            { name: 'Chất xơ',  value: meal.totalFiber,         target: 25,  cls: 'bg-fiber',   txt: 'text-fiber' },
          ].map(m => (
            <div key={m.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{m.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-bold tabular-nums ${m.txt}`}>{m.value}g</span>
                  <span className="text-xs text-muted-foreground">/ {m.target}g</span>
                </div>
              </div>
              <Progress value={Math.min(100, (m.value / m.target) * 100)} className="h-2" indicatorClassName={m.cls} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Thành phần</CardTitle>
            <span className="text-xs text-muted-foreground">{meal.items.length} món</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {meal.items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5 border-b last:border-0 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}>
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.foodName}</p>
                <p className="text-xs text-muted-foreground">{item.quantity}{item.unit}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums">{item.calories}</p>
                <p className="text-2xs text-muted-foreground">kcal</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {meal.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Ghi chú</p>
            <p className="text-sm">{meal.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
