import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Skeleton } from '@components/ui/skeleton'
import { Badge } from '@components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { HealthScoreRing }    from '@features/analysis/components/HealthScoreRing'
import { WeeklyInsightPanel } from '@features/analysis/components/WeeklyInsightPanel'
import { NutritionWeekChart } from '@components/charts/NutritionCharts'
import { DailyCaloriesChart } from '@components/charts/NutritionCharts'
import { useWeeklyAnalysis }  from '@features/analysis/hooks/useAnalysis'
import { Zap, Flame, Activity, Target, Award } from 'lucide-react'

function StatPill({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string; color: string
}) {
  return (
    <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl p-3">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export default function WeeklyAnalysisPage() {
  const { data, isLoading, isError } = useWeeklyAnalysis()

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )

  if (isError || !data) return (
    <div className="max-w-2xl mx-auto text-center py-16 text-muted-foreground">
      <p>Không tải được phân tích tuần. Hãy thêm bữa ăn để xem dữ liệu.</p>
    </div>
  )

  const { insight, avgNutrition, aiInsight, targets, days, weekStart, weekEnd } = data

  // Prepare chart data
  const calorieChartData = days.map(d => ({
    day: new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
    calories: Math.round(d.calories),
    target: targets.calories ?? 2000,
  }))

  const nutritionChartData = days.map(d => ({
    day: new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
    protein: Math.round(d.protein),
    carbs:   Math.round(d.carbohydrates ?? 0),
    fats:    Math.round(d.fat ?? 0),
  }))

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Báo cáo tuần</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(weekStart).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })} –
          {' '}{new Date(weekEnd).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Score + stats hero */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            <HealthScoreRing
              score={insight.avgScore}
              grade={
                insight.avgScore >= 85 ? 'excellent' :
                insight.avgScore >= 70 ? 'good' :
                insight.avgScore >= 50 ? 'fair' : 'poor'
              }
              size={96}
            />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <StatPill icon={Activity} label="Ngày ghi nhận" value={`${insight.daysLogged}/7 ngày`} color="bg-primary/10 text-primary" />
              <StatPill icon={Award}    label="Chuỗi ngày"    value={`${insight.streakDays} ngày 🔥`} color="bg-warning/10 text-warning-foreground" />
              <StatPill icon={Flame}    label="TB calo/ngày"  value={`${Math.round(avgNutrition.calories)} kcal`} color="bg-calories-light text-calories" />
              <StatPill icon={Target}   label="TB protein"    value={`${Math.round(avgNutrition.protein)}g`} color="bg-protein-light text-protein" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Weekly Insight */}
      {aiInsight && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1.5">Nhận xét AI tuần này 🤖</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{aiInsight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts + insights tabs */}
      <Tabs defaultValue="charts">
        <TabsList className="w-full">
          <TabsTrigger value="charts" className="flex-1">Biểu đồ</TabsTrigger>
          <TabsTrigger value="insights" className="flex-1">Phân tích</TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1">Dinh dưỡng</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Calo mỗi ngày</CardTitle>
                {targets.calories && (
                  <Badge variant="secondary" className="text-xs">
                    Mục tiêu: {targets.calories} kcal
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent><DailyCaloriesChart data={calorieChartData} height={200} /></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Macro mỗi ngày</CardTitle></CardHeader>
            <CardContent><NutritionWeekChart data={nutritionChartData} height={200} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Phân tích chuyên sâu</CardTitle></CardHeader>
            <CardContent>
              <WeeklyInsightPanel
                trends={insight.trends}
                deficiencies={insight.deficiencies}
                habits={insight.habits}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Trung bình dinh dưỡng / ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Calo',      value: Math.round(avgNutrition.calories), unit: 'kcal', target: targets.calories,  color: 'text-calories', bg: 'bg-calories-light' },
                  { label: 'Protein',   value: Math.round(avgNutrition.protein),  unit: 'g',    target: targets.protein,   color: 'text-protein',  bg: 'bg-protein-light' },
                  { label: 'Natri',     value: Math.round(avgNutrition.sodium),   unit: 'mg',   target: 2300,              color: 'text-info',     bg: 'bg-info/10' },
                  { label: 'Đường',     value: Math.round(avgNutrition.sugar),    unit: 'g',    target: 50,                color: 'text-carbs',    bg: 'bg-carbs-light' },
                  { label: 'Chất xơ',  value: Math.round(avgNutrition.fiber),    unit: 'g',    target: 25,                color: 'text-fiber',    bg: 'bg-fiber-light' },
                ].map(n => (
                  <div key={n.label} className={`rounded-xl p-3.5 ${n.bg}`}>
                    <p className={`text-xl font-bold tabular-nums ${n.color}`}>{n.value}</p>
                    <p className={`text-xs font-medium ${n.color} opacity-80`}>{n.unit}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.label}</p>
                    {n.target && (
                      <p className="text-2xs text-muted-foreground mt-1">
                        Mục tiêu: {n.target}{n.unit}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
