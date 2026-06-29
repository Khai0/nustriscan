import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { Badge } from '@components/ui/badge'
import { Skeleton } from '@components/ui/skeleton'
import { StatCard } from '@components/common/StatCard'
import {
  DailyCaloriesChart, MacroPieChart, WeightLineChart,
  HealthScoreChart, MealFrequencyChart,
} from '@components/charts/NutritionCharts'
import { SmartInsightsList } from '@features/analytics/components/SmartInsightsList'
import { LevelDisplay }      from '@features/gamification/components/LevelDisplay'
import { StreakBadge }       from '@features/gamification/components/StreakBadge'
import { WeeklyChallengeCard } from '@features/gamification/components/WeeklyChallengeCard'
import { AchievementGrid }   from '@features/gamification/components/AchievementGrid'
import {
  usePeriodSummary, useTrends, useMealFrequency, useWeightTrend,
  useSmartInsights, useUserStats, useAchievements, useChallenges,
} from '@features/analytics/hooks/useAnalytics'
import type { PeriodType } from '@features/analytics/services/analytics.api'
import {
  Flame, Apple, Droplets, Award, Trophy, Sparkles, ChevronRight,
} from 'lucide-react'

// ── Period selector ─────────────────────────────────────────────────────────────
function PeriodSelector({ value, onChange }: { value: PeriodType; onChange: (v: PeriodType) => void }) {
  const options: { value: PeriodType; label: string }[] = [
    { value: "daily",   label: "Hôm nay" },
    { value: "weekly",  label: "7 ngày" },
    { value: "monthly", label: "30 ngày" },
  ]
  return (
    <div className="inline-flex rounded-xl bg-muted p-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            value === opt.value ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Overview tab ───────────────────────────────────────────────────────────────
function OverviewTab({ period }: { period: PeriodType }) {
  const { data: summary, isLoading: loadingSummary } = usePeriodSummary(period)
  const { data: trends,  isLoading: loadingTrends }  = useTrends(period)
  const { data: insights } = useSmartInsights()

  if (loadingSummary || loadingTrends) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!summary || !trends) return null

  const macroData = [
    { name: "Protein",  value: summary.avgProtein, color: "hsl(213,94%,50%)" },
    { name: "Carbs",    value: summary.avgCarbs,   color: "hsl(38,92%,50%)" },
    { name: "Chất béo", value: summary.avgFat,     color: "hsl(291,64%,55%)" },
  ]

  const calorieChart = trends.map(t => ({
    day: new Date(t.date).toLocaleDateString("vi-VN", { weekday: "short" }),
    calories: Math.round(t.calories),
    target: summary.calorieTarget ?? 2000,
  }))

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="TB Calo"
          value={summary.avgCalories.toLocaleString("vi")}
          unit="kcal"
          icon={Flame}
          iconColor="text-calories"
          iconBg="bg-calories-light"
          subtitle={summary.calorieTarget ? `Mục tiêu: ${summary.calorieTarget}` : undefined}
        />
        <StatCard
          title="TB Protein"
          value={summary.avgProtein}
          unit="g"
          icon={Apple}
          iconColor="text-protein"
          iconBg="bg-protein-light"
          subtitle={summary.proteinTarget ? `Mục tiêu: ${summary.proteinTarget}g` : undefined}
        />
        <StatCard
          title="Điểm TB"
          value={summary.avgScore}
          unit="/100"
          icon={Award}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          progress={{ value: summary.avgScore }}
        />
        <StatCard
          title="Nước TB"
          value={(summary.avgWater / 1000).toFixed(1)}
          unit="L"
          icon={Droplets}
          iconColor="text-info"
          iconBg="bg-info/10"
          subtitle={`${summary.daysLogged} ngày ghi nhận`}
        />
      </div>

      {/* Calorie trend chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Xu hướng calo</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyCaloriesChart data={calorieChart} height={200} />
        </CardContent>
      </Card>

      {/* Health score chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Điểm sức khoẻ theo thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthScoreChart data={trends.map(t => ({ date: t.date, score: t.score }))} height={180} />
        </CardContent>
      </Card>

      {/* Macro pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tỷ lệ macro trung bình</CardTitle>
        </CardHeader>
        <CardContent>
          <MacroPieChart data={macroData} className="py-2" />
        </CardContent>
      </Card>

      {/* Smart insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Thông tin thông minh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SmartInsightsList insights={insights} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Meals & Weight tab ────────────────────────────────────────────────────────
function MealsWeightTab() {
  const { data: mealFreq, isLoading: l1 } = useMealFrequency(7)
  const { data: weightData, isLoading: l2 } = useWeightTrend(30)

  if (l1 || l2) return (
    <div className="space-y-4">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )

  const weightChartData = (weightData?.entries ?? []).map(e => ({
    date: new Date(e.date).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
    weight: e.weight,
    target: weightData?.targetWeight ?? undefined,
  }))

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tần suất bữa ăn (7 ngày)</CardTitle>
        </CardHeader>
        <CardContent>
          {mealFreq && <MealFrequencyChart data={mealFreq} height={200} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Xu hướng cân nặng</CardTitle>
            {weightData?.targetWeight && (
              <Badge variant="secondary" className="text-xs">
                Mục tiêu: {weightData.targetWeight}{weightData.weightUnit?.toLowerCase()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {weightChartData.length > 0 ? (
            <WeightLineChart data={weightChartData} height={200} />
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Chưa có dữ liệu cân nặng. Thêm cân nặng để xem xu hướng.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Achievements tab ───────────────────────────────────────────────────────────
function AchievementsTab() {
  const { data: stats, isLoading: l1 } = useUserStats()
  const { data: achievementsData, isLoading: l2 } = useAchievements()
  const { data: challenges, isLoading: l3 } = useChallenges()

  if (l1 || l2 || l3) return (
    <div className="space-y-4">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Level + Streak */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {stats && <LevelDisplay totalXp={stats.totalXp} />}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-sm font-medium">Chuỗi ngày hiện tại</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ghi nhận liên tục mỗi ngày</p>
            </div>
            {stats && <StreakBadge current={stats.currentStreak} longest={stats.longestStreak} />}
          </div>
        </CardContent>
      </Card>

      {/* Weekly challenges */}
      <div>
        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-warning" /> Thử thách tuần này
        </p>
        <div className="space-y-2.5">
          {challenges?.map(c => <WeeklyChallengeCard key={c.id} challenge={c} />)}
        </div>
      </div>

      {/* Achievements grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Thành tích</CardTitle>
        </CardHeader>
        <CardContent>
          {achievementsData && <AchievementGrid achievements={achievementsData.achievements} />}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodType>("weekly")
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Thống kê & Thành tích</h1>
          <p className="text-sm text-muted-foreground mt-1">Theo dõi tiến trình và thành tựu của bạn</p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="meals">Bữa ăn & Cân</TabsTrigger>
            <TabsTrigger value="achievements">Thành tích</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-end">
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
          <OverviewTab period={period} />
        </TabsContent>

        <TabsContent value="meals">
          <MealsWeightTab />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsTab />
        </TabsContent>
      </Tabs>

      {/* Link to detailed daily/weekly analysis */}
      <Card className="cursor-pointer hover:shadow-card-hover transition-all" onClick={() => navigate("/analytics/daily")}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Phân tích chi tiết AI</p>
              <p className="text-xs text-muted-foreground">Xem điểm số, cảnh báo và khuyến nghị hôm nay</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  )
}
