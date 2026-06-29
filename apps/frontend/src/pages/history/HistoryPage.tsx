import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ChevronRight, Calendar } from 'lucide-react'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Card, CardContent } from '@components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { EmptyState } from '@components/ui/empty-state'
import { MacroRow } from '@components/common/MacroBadge'
import { SkeletonCard } from '@components/ui/skeleton'
import { cn } from '@lib/utils'

const mealTypeLabel: Record<string, { label: string; emoji: string }> = {
  BREAKFAST: { label: 'Sáng', emoji: '🌅' },
  LUNCH:     { label: 'Trưa', emoji: '☀️' },
  DINNER:    { label: 'Tối',  emoji: '🌙' },
  SNACK:     { label: 'Snack',emoji: '🍎' },
}

const mockHistory = [
  { id:'1', date:'2024-01-15', mealType:'BREAKFAST', name:'Phở bò',        calories:450, protein:28, carbs:52,  fats:12, items:2, emoji:'🍜' },
  { id:'2', date:'2024-01-15', mealType:'LUNCH',     name:'Cơm tấm sườn', calories:680, protein:35, carbs:75,  fats:25, items:3, emoji:'🍱' },
  { id:'3', date:'2024-01-15', mealType:'SNACK',     name:'Cà phê sữa đá',calories:165, protein:3,  carbs:28,  fats:5,  items:1, emoji:'☕' },
  { id:'4', date:'2024-01-14', mealType:'BREAKFAST', name:'Bánh mì thịt', calories:380, protein:18, carbs:42,  fats:15, items:1, emoji:'🥖' },
  { id:'5', date:'2024-01-14', mealType:'DINNER',    name:'Bún bò Huế',   calories:520, protein:32, carbs:58,  fats:16, items:2, emoji:'🍲' },
]

const grouped = mockHistory.reduce((acc, meal) => {
  if (!acc[meal.date]) acc[meal.date] = []
  acc[meal.date].push(meal)
  return acc
}, {} as Record<string, typeof mockHistory>)

function MealCard({ meal }: { meal: typeof mockHistory[0] }) {
  const navigate = useNavigate()
  const { label, emoji: typeEmoji } = mealTypeLabel[meal.mealType] ?? { label: meal.mealType, emoji: '🍽️' }
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-colors group"
      onClick={() => navigate(`/history/${meal.id}`)}
    >
      <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">{meal.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{meal.name}</p>
          <Badge variant="secondary" className="text-2xs px-1.5 py-0 shrink-0">{typeEmoji} {label}</Badge>
        </div>
        <MacroRow calories={meal.calories} protein={meal.protein} carbs={meal.carbs} fats={meal.fats} className="mt-1" />
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  )
}

function DateGroup({ date, meals }: { date: string; meals: typeof mockHistory }) {
  const totalCal = meals.reduce((s, m) => s + m.calories, 0)
  const d = new Date(date)
  const isToday = new Date().toDateString() === d.toDateString()
  const label = isToday ? 'Hôm nay' : d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 py-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs text-muted-foreground">{totalCal.toLocaleString('vi')} kcal</p>
      </div>
      <Card>
        <CardContent className="p-2 divide-y divide-border/50">
          {meals.map(m => <MealCard key={m.id} meal={m} />)}
        </CardContent>
      </Card>
    </div>
  )
}

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const isLoading = false

  const filtered = Object.entries(grouped).filter(([, meals]) =>
    !search || meals.some(m => m.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử bữa ăn</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockHistory.length} bữa ăn đã ghi nhận</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" /> Chọn ngày
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm kiếm món ăn…" className="pl-9 pr-4" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Không tìm thấy kết quả' : 'Chưa có bữa ăn nào'}
          description={search ? 'Thử từ khoá khác' : 'Quét ảnh món ăn để bắt đầu theo dõi dinh dưỡng'}
          icon={Search}
        />
      ) : (
        <div className="space-y-5">
          {filtered.map(([date, meals]) => <DateGroup key={date} date={date} meals={meals} />)}
        </div>
      )}
    </div>
  )
}
