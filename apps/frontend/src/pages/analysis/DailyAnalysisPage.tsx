import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { Skeleton } from '@components/ui/skeleton'
import { Button } from '@components/ui/button'
import { HealthScoreRing }     from '@features/analysis/components/HealthScoreRing'
import { AlertList }           from '@features/analysis/components/AlertList'
import { ScoreBreakdownCard }  from '@features/analysis/components/ScoreBreakdownCard'
import { NutritionProgress }   from '@features/analysis/components/NutritionProgress'
import { useDailyAnalysis }    from '@features/analysis/hooks/useAnalysis'
import { ChevronLeft, ChevronRight, Zap, RefreshCw } from 'lucide-react'

function DateNavigator({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today

  const shift = (days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    onChange(d.toISOString().split('T')[0])
  }

  const displayDate = new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shift(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex-1 text-center">
        <p className="text-sm font-medium capitalize">{isToday ? 'Hôm nay' : displayDate}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shift(1)} disabled={isToday}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function DailyAnalysisPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const { data, isLoading, isError, refetch } = useDailyAnalysis(date)

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )

  if (isError) return (
    <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
      <p className="text-destructive">Không tải được phân tích. Vui lòng thử lại.</p>
      <Button variant="outline" className="gap-2" onClick={() => refetch()}>
        <RefreshCw className="h-4 w-4" /> Thử lại
      </Button>
    </div>
  )

  if (!data) return null

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Phân tích dinh dưỡng</h1>
        <p className="text-sm text-muted-foreground mt-1">Đánh giá chi tiết chế độ ăn của bạn</p>
      </div>

      {/* Date navigator */}
      <Card>
        <CardContent className="py-3 px-4">
          <DateNavigator date={date} onChange={setDate} />
        </CardContent>
      </Card>

      {data.mealCount === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-medium">Chưa có bữa ăn nào được ghi nhận</p>
            <p className="text-sm mt-1">Quét ảnh hoặc thêm bữa ăn để xem phân tích</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Score hero */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5">
              <div className="flex items-center gap-6">
                <HealthScoreRing
                  score={data.scoring.scores.overall}
                  grade={data.scoring.grade}
                  size={110}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">Điểm sức khoẻ hôm nay</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>🍽️</span>
                      <span>{data.mealCount} bữa ăn</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>🔥</span>
                      <span>{Math.round(data.nutrition.calories)} kcal{data.targets.calorieTarget ? ` / ${data.targets.calorieTarget}` : ''}</span>
                    </div>
                    {data.conditions.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>⚕️</span>
                        <span>{data.conditions.map(c => c.condition).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Recommendation */}
          {data.recommendation && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Zap className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Nhận xét từ AI 🤖</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{data.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed tabs */}
          <Tabs defaultValue="alerts">
            <TabsList className="w-full">
              <TabsTrigger value="alerts" className="flex-1">
                Cảnh báo {data.scoring.alerts.length > 0 && `(${data.scoring.alerts.length})`}
              </TabsTrigger>
              <TabsTrigger value="scores" className="flex-1">Chi tiết điểm</TabsTrigger>
              <TabsTrigger value="nutrition" className="flex-1">Dinh dưỡng</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Cảnh báo & Khuyến nghị</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertList alerts={data.scoring.alerts} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scores">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Phân tích chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreBreakdownCard scores={data.scoring.scores} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">So sánh với mục tiêu</CardTitle>
                </CardHeader>
                <CardContent>
                  <NutritionProgress nutrition={data.nutrition} targets={data.targets} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
