import { ScrollView, View, Text, TouchableOpacity, RefreshControl, useColorScheme } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Card, ProgressBar, Skeleton, Badge } from '@components/ui'
import { useAuthStore } from '@store/auth.store'
import { analysisService, mealService, waterService } from '@services/api.service'
import { lightTheme, darkTheme, colors, spacing, typography, radius } from '@lib/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

function useTheme() {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkTheme : lightTheme
}

const MEAL_TYPE_LABEL: Record<string, string> = {
  BREAKFAST: '🌅 Sáng', LUNCH: '☀️ Trưa', DINNER: '🌙 Tối', SNACK: '🍎 Phụ',
}

export default function DashboardScreen() {
  const router  = useRouter()
  const theme   = useTheme()
  const user    = useAuthStore(s => s.user)
  const today   = new Date().toISOString().split('T')[0]

  const { data: analysis, isLoading: loadingAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ['analysis', 'daily', today],
    queryFn:  () => analysisService.getDaily(today),
  })

  const { data: mealsData, isLoading: loadingMeals, refetch: refetchMeals } = useQuery({
    queryKey: ['meals', today],
    queryFn:  () => mealService.list({ startDate: today, endDate: today, limit: 5 }),
  })

  const isLoading = loadingAnalysis || loadingMeals
  const onRefresh = () => { refetchAnalysis(); refetchMeals() }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  const calories    = analysis?.nutrition?.calories ?? 0
  const calTarget   = analysis?.targets?.calorieTarget ?? 2000
  const calPct      = Math.min(100, (calories / calTarget) * 100)
  const protein     = analysis?.nutrition?.protein ?? 0
  const carbs       = analysis?.nutrition?.carbohydrates ?? 0
  const fat         = analysis?.nutrition?.fat ?? 0
  const score       = analysis?.scoring?.scores?.overall ?? 0
  const alerts      = analysis?.scoring?.alerts ?? []
  const meals       = mealsData?.data ?? []

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#16a34a', '#15803d']}
          style={{ paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[8] }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: typography.sm.fontSize }}>
                {greeting},
              </Text>
              <Text style={{ color: '#fff', fontSize: typography.xl.fontSize, fontWeight: '700' }}>
                {user?.name ?? 'bạn'} 👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/scan')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: radius.xl,
                padding: spacing[3],
                flexDirection: 'row', alignItems: 'center', gap: spacing[2],
              }}
            >
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: typography.sm.fontSize }}>Quét ngay</Text>
            </TouchableOpacity>
          </View>

          {/* Calorie hero */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: radius.xl,
            padding: spacing[4],
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: typography.sm.fontSize, marginBottom: spacing[1] }}>
              Calo hôm nay
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2], marginBottom: spacing[3] }}>
              <Text style={{ color: '#fff', fontSize: 38, fontWeight: '800', lineHeight: 44 }}>
                {Math.round(calories).toLocaleString('vi')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', marginBottom: spacing[1], fontSize: typography.sm.fontSize }}>
                / {calTarget.toLocaleString('vi')} kcal
              </Text>
            </View>
            <ProgressBar
              value={calPct}
              color="rgba(255,255,255,0.9)"
              height={8}
            />
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: typography.xs.fontSize, marginTop: spacing[2] }}>
              {Math.round(calPct)}% mục tiêu · còn {Math.max(0, calTarget - Math.round(calories)).toLocaleString('vi')} kcal
            </Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: spacing[4], marginTop: -spacing[4], gap: spacing[4] }}>
          {/* ── Macro row ───────────────────────────────────────────────── */}
          <Card>
            <Text style={{ fontSize: typography.sm.fontSize, fontWeight: '600', color: theme.text, marginBottom: spacing[4] }}>
              Macro hôm nay
            </Text>
            {isLoading ? (
              <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                {[1,2,3].map(i => <Skeleton key={i} width="30%" height={72} />)}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                {[
                  { label: 'Protein', value: protein, color: colors.protein, unit: 'g' },
                  { label: 'Carbs',   value: carbs,   color: colors.carbs,   unit: 'g' },
                  { label: 'Fat',     value: fat,     color: colors.fats,    unit: 'g' },
                ].map(macro => (
                  <View key={macro.label} style={{
                    flex: 1, backgroundColor: theme.inputBg, borderRadius: radius.lg, padding: spacing[3], alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: typography.xl.fontSize, fontWeight: '700', color: macro.color }}>
                      {Math.round(macro.value)}
                    </Text>
                    <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary, marginTop: 2 }}>
                      {macro.unit}
                    </Text>
                    <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary, fontWeight: '500' }}>
                      {macro.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          {/* ── Health score ─────────────────────────────────────────────── */}
          {score > 0 && (
            <Card onPress={() => router.push('/(tabs)/analytics')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] }}>
                <Text style={{ fontSize: typography.sm.fontSize, fontWeight: '600', color: theme.text }}>
                  Điểm sức khoẻ hôm nay
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4] }}>
                <View style={{
                  width: 64, height: 64, borderRadius: 32,
                  backgroundColor: score >= 85 ? colors.successLight : score >= 70 ? '#fef3c7' : colors.errorLight,
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: typography.xl.fontSize, fontWeight: '800',
                    color: score >= 85 ? colors.success : score >= 70 ? '#b45309' : colors.error,
                  }}>{score}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={score} color={score >= 85 ? colors.success : score >= 70 ? colors.warning : colors.error} height={8} />
                  <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary, marginTop: spacing[2] }}>
                    {score >= 85 ? '🌟 Xuất sắc' : score >= 70 ? '✅ Tốt' : score >= 50 ? '⚠️ Trung bình' : '❌ Cần cải thiện'}
                  </Text>
                  {alerts.length > 0 && (
                    <Text style={{ fontSize: typography.xs.fontSize, color: colors.warning, marginTop: 2 }}>
                      ⚠️ {alerts.length} cảnh báo
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          )}

          {/* ── Recent meals ─────────────────────────────────────────────── */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
              <Text style={{ fontSize: typography.base.fontSize, fontWeight: '600', color: theme.text }}>
                Bữa ăn hôm nay
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={{ fontSize: typography.sm.fontSize, color: colors.primary, fontWeight: '500' }}>
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>

            {loadingMeals ? (
              <View style={{ gap: spacing[3] }}>
                {[1,2].map(i => <Skeleton key={i} height={72} borderRadius={radius.xl} />)}
              </View>
            ) : meals.length === 0 ? (
              <Card>
                <View style={{ alignItems: 'center', padding: spacing[6] }}>
                  <Text style={{ fontSize: 32, marginBottom: spacing[3] }}>🍽️</Text>
                  <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: typography.sm.fontSize }}>
                    Chưa có bữa ăn nào hôm nay.{'\n'}Quét ảnh để bắt đầu!
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/scan')}
                    style={{
                      marginTop: spacing[4], flexDirection: 'row',
                      alignItems: 'center', gap: spacing[2],
                      backgroundColor: colors.primaryLight,
                      borderRadius: radius.lg, paddingHorizontal: spacing[4], paddingVertical: spacing[2],
                    }}
                  >
                    <Ionicons name="camera" size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: typography.sm.fontSize }}>
                      Quét ảnh
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              <View style={{ gap: spacing[3] }}>
                {meals.map(meal => (
                  <Card key={meal.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                    <View style={{
                      width: 44, height: 44, borderRadius: radius.lg,
                      backgroundColor: theme.inputBg, justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 22 }}>
                        {meal.mealType === 'BREAKFAST' ? '🌅' : meal.mealType === 'LUNCH' ? '☀️' : meal.mealType === 'DINNER' ? '🌙' : '🍎'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: theme.text, fontSize: typography.sm.fontSize }}>
                        {meal.mealItems?.[0]?.foodItem?.name ?? 'Bữa ăn'}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: 2 }}>
                        <Badge variant="default" size="sm">{MEAL_TYPE_LABEL[meal.mealType]}</Badge>
                        <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>
                          {new Date(meal.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontWeight: '700', color: theme.text, fontSize: typography.base.fontSize }}>
                        {Math.round(meal.totalCalories)}
                      </Text>
                      <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>kcal</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>

          {/* ── AI Recommendation ─────────────────────────────────────── */}
          {analysis?.recommendation && (
            <Card style={{ backgroundColor: colors.primaryLight, borderColor: 'transparent' }}>
              <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                <View style={{
                  width: 36, height: 36, borderRadius: radius.lg,
                  backgroundColor: 'rgba(22,163,74,0.15)', justifyContent: 'center', alignItems: 'center',
                }}>
                  <Ionicons name="flash" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.primaryDark, marginBottom: spacing[1] }}>
                    Gợi ý từ AI 💡
                  </Text>
                  <Text style={{ color: colors.primaryDark, fontSize: typography.sm.fontSize, lineHeight: 20, opacity: 0.85 }}>
                    {analysis.recommendation}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
