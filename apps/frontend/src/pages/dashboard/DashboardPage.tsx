import { useAuthStore } from '@store/auth.store'
import { PageHeader } from '@components/common/PageHeader'
import { StatCard } from '@components/common/StatCard'
import { MacroRing } from '@components/common/CircularProgress'
import { DailyCaloriesChart, MacroPieChart } from '@components/charts/NutritionCharts'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Progress } from '@components/ui/progress'
import { Skeleton } from '@components/ui/skeleton'
import {
  Flame, Droplets, Apple, TrendingUp, Camera,
  Plus, ChevronRight, Zap, Target, Activity,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDailyAnalysis }   from '@features/analysis/hooks/useAnalysis'
import { HealthScoreRing }   from '@features/analysis/components/HealthScoreRing'
import { AlertList }         from '@features/analysis/components/AlertList'

import { cn } from '@lib/utils'

// ── Mock data (replace with real API hooks in production) ────────────────────
const todaySummary = {
  calories: 1420, calorieTarget: 2100,
  protein: 85, proteinTarget: 160,
  carbs: 180,  carbTarget: 263,
  fats: 42,    fatTarget: 58,
  water: 1200, waterTarget: 2450,
}

const weeklyCalories = [
  { day: 'T2', calories: 1850, target: 2100 },
  { day: 'T3', calories: 2200, target: 2100 },
  { day: 'T4', calories: 1600, target: 2100 },
  { day: 'T5', calories: 1950, target: 2100 },
  { day: 'T6', calories: 2100, target: 2100 },
  { day: 'T7', calories: 1420, target: 2100 },
  { day: 'CN', calories: 0,    target: 2100 },
]

const macroDistribution = [
  { name: 'Protein', value: 85,  color: 'hsl(213,94%,50%)' },
  { name: 'Carbs',   value: 180, color: 'hsl(38,92%,50%)' },
  { name: 'Chất béo',value: 42,  color: 'hsl(291,64%,55%)' },
]

const recentMeals = [
  { id: '1', name: 'Phở bò', type: 'Sáng', calories: 450, time: '7:30',  emoji: '🍜' },
  { id: '2', name: 'Cơm tấm sườn', type: 'Trưa', calories: 680, time: '12:00', emoji: '🍱' },
  { id: '3', name: 'Cà phê sữa đá', type: 'Snack', calories: 165, time: '15:30', emoji: '☕' },
]

const caloriePercent = Math.round((todaySummary.calories / todaySummary.calorieTarget) * 100)
const waterPercent   = Math.round((todaySummary.water    / todaySummary.waterTarget)    * 100)


function HealthScoreWidget() {
  const navigate = useNavigate()
  const { data, isLoading } = useDailyAnalysis()
  if (isLoading || !data || data.mealCount === 0) return null

  return (
    <Card
      className="cursor-pointer hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
      onClick={() => navigate('/analytics/daily')}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <HealthScoreRing
            score={data.scoring.scores.overall}
            grade={data.scoring.grade}
            size={72}
            showLabel={false}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Điểm sức khoẻ hôm nay</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{data.scoring.summary}</p>
            {data.scoring.alerts.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-xs text-warning-foreground font-medium">
                  ⚠️ {data.scoring.alerts.length} cảnh báo
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const user     = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl font-bold text-foreground">{user?.name ?? 'bạn'} 👋</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button onClick={() => navigate('/scan')} className="gap-2 shadow-glow-sm" size="sm">
          <Camera className="h-4 w-4" /> Quét ngay
        </Button>
      </div>


      {/* ── Health Score Widget ────────────────────────────────────── */}
      <HealthScoreWidget />

      {/* ── Calorie hero card ───────────────────────────────────────────── */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground shadow-glow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/75 text-sm font-medium">Calo hôm nay</p>
              <div className="flex items-end gap-1.5 mt-1">
                <span className="text-4xl font-bold tabular-nums">{todaySummary.calories.toLocaleString('vi')}</span>
                <span className="text-primary-foreground/70 mb-1">/ {todaySummary.calorieTarget.toLocaleString('vi')} kcal</span>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary-foreground/70">{caloriePercent}% mục tiêu</span>
                  <span className="font-medium">{todaySummary.calorieTarget - todaySummary.calories} kcal còn lại</span>
                </div>
                <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-foreground rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, caloriePercent)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <MacroRing
                label="Đạt được"
                current={todaySummary.calories}
                target={todaySummary.calorieTarget}
                unit="kcal"
                color="hsl(0 0% 100% / 0.9)"
                size={88}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Macro rings ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Macro hôm nay</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 px-2" onClick={() => navigate('/analytics')}>
              Chi tiết <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around py-2">
            <MacroRing label="Protein"  current={todaySummary.protein} target={todaySummary.proteinTarget} color="hsl(213,94%,50%)" />
            <MacroRing label="Carbs"    current={todaySummary.carbs}   target={todaySummary.carbTarget}    color="hsl(38,92%,50%)" />
            <MacroRing label="Chất béo" current={todaySummary.fats}    target={todaySummary.fatTarget}     color="hsl(291,64%,55%)" />
          </div>
        </CardContent>
      </Card>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Water */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-info/10 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-info" />
              </div>
              <span className="text-sm font-medium">Nước</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('/profile#water')}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-2xl font-bold tabular-nums">{(todaySummary.water / 1000).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">L</span></p>
          <Progress value={waterPercent} className="mt-2 h-1.5" indicatorClassName="bg-info" />
          <p className="text-xs text-muted-foreground mt-1">{waterPercent}% mục tiêu</p>
        </Card>

        {/* Streak */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-warning/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-warning" />
            </div>
            <span className="text-sm font-medium">Chuỗi ngày</span>
          </div>
          <p className="text-2xl font-bold tabular-nums">7 <span className="text-sm font-normal text-muted-foreground">ngày 🔥</span></p>
          <p className="text-xs text-muted-foreground mt-2">Tiếp tục duy trì!</p>
        </Card>
      </div>

      {/* ── Weekly chart ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Calo 7 ngày qua</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyCaloriesChart data={weeklyCalories} height={180} />
        </CardContent>
      </Card>

      {/* ── Recent meals ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Bữa ăn hôm nay</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 px-2" onClick={() => navigate('/history')}>
              Xem tất cả <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentMeals.map((meal, i) => (
            <div
              key={meal.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-colors animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => navigate(`/history/${meal.id}`)}
            >
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                {meal.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{meal.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-2xs px-1.5 py-0">{meal.type}</Badge>
                  <span className="text-xs text-muted-foreground">{meal.time}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums">{meal.calories}</p>
                <p className="text-2xs text-muted-foreground">kcal</p>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full gap-2 mt-1 border-dashed"
            onClick={() => navigate('/scan')}
          >
            <Plus className="h-4 w-4" /> Thêm bữa ăn
          </Button>
        </CardContent>
      </Card>

      {/* ── AI Tips ──────────────────────────────────────────────────────── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Gợi ý từ AI 💡</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Bạn đã đạt {caloriePercent}% mục tiêu calo. Hãy bổ sung thêm <strong className="text-foreground">{todaySummary.calorieTarget - todaySummary.calories} kcal</strong> từ các bữa ăn nhẹ giàu protein để đạt mục tiêu hôm nay.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
