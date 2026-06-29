import { useState } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity,
  RefreshControl, useColorScheme,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card, ProgressBar, Badge, Skeleton } from '@components/ui'
import { analyticsService } from '@services/api.service'
import { lightTheme, darkTheme, colors, spacing, typography, radius } from '@lib/theme'

type Period = 'daily' | 'weekly' | 'monthly'

function useTheme() {
  const s = useColorScheme(); return s === 'dark' ? darkTheme : lightTheme
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color, bg }: {
  label: string; value: string | number; unit: string; color: string; bg: string
}) {
  const theme = useTheme()
  return (
    <View style={{
      flex: 1, backgroundColor: bg, borderRadius: radius.xl,
      padding: spacing[4], alignItems: 'center',
    }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: typography.xs.fontSize, color, opacity: 0.75 }}>{unit}</Text>
      <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary, marginTop: 2 }}>{label}</Text>
    </View>
  )
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const ringColor =
    grade === 'excellent' ? colors.success :
    grade === 'good'      ? colors.primary :
    grade === 'fair'      ? colors.warning : colors.error

  const label =
    grade === 'excellent' ? '🌟 Xuất sắc' :
    grade === 'good'      ? '✅ Tốt' :
    grade === 'fair'      ? '⚠️ Trung bình' : '❌ Cần cải thiện'

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        width: 96, height: 96, borderRadius: 48,
        borderWidth: 7, borderColor: ringColor,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: `${ringColor}15`,
      }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: ringColor }}>{score}</Text>
        <Text style={{ fontSize: 9, color: ringColor }}>/100</Text>
      </View>
      <Text style={{ marginTop: spacing[2], fontWeight: '600', color: ringColor, fontSize: typography.sm.fontSize }}>
        {label}
      </Text>
    </View>
  )
}

// ── Smart Insight Item ────────────────────────────────────────────────────────
function InsightItem({ insight, theme }: { insight: any; theme: any }) {
  const cfg = {
    positive: { icon: 'trending-up',   color: colors.success, bg: `${colors.success}15` },
    negative: { icon: 'trending-down', color: colors.error,   bg: `${colors.error}15` },
    neutral:  { icon: 'information-circle', color: colors.info, bg: `${colors.info}15` },
    tip:      { icon: 'bulb',          color: colors.warning, bg: `${colors.warning}15` },
  }[insight.type as string] ?? { icon: 'information-circle', color: colors.info, bg: `${colors.info}15` }

  return (
    <View style={{
      flexDirection: 'row', gap: spacing[3], padding: spacing[3],
      backgroundColor: cfg.bg, borderRadius: radius.lg,
    }}>
      <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', color: cfg.color, fontSize: typography.sm.fontSize }}>
          {insight.title}
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: typography.xs.fontSize, marginTop: 2, lineHeight: 18 }}>
          {insight.message}
        </Text>
      </View>
    </View>
  )
}

// ── Achievement Badge ─────────────────────────────────────────────────────────
function AchievementBadge({ a }: { a: any }) {
  const theme = useTheme()
  const rarityColor = {
    common: theme.textSecondary, rare: colors.info,
    epic: '#a855f7', legendary: colors.warning,
  }[a.rarity as string] ?? theme.textSecondary

  return (
    <View style={{ alignItems: 'center', width: 80, opacity: a.unlocked ? 1 : 0.4 }}>
      <View style={{
        width: 56, height: 56, borderRadius: radius.xl,
        backgroundColor: a.unlocked ? `${colors.primary}15` : theme.inputBg,
        borderWidth: 2, borderColor: a.unlocked ? rarityColor : theme.border,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Text style={{ fontSize: a.unlocked ? 26 : 20 }}>
          {a.unlocked ? a.emoji : '🔒'}
        </Text>
      </View>
      <Text style={{ fontSize: 10, fontWeight: '600', color: theme.text, textAlign: 'center', marginTop: spacing[1], lineHeight: 13 }}>
        {a.title}
      </Text>
      <Text style={{ fontSize: 9, color: rarityColor, fontWeight: '600' }}>
        +{a.xp} XP
      </Text>
    </View>
  )
}

// ── Weekly Challenge ──────────────────────────────────────────────────────────
function ChallengeCard({ c, theme }: { c: any; theme: any }) {
  const pct = Math.min(100, (c.currentValue / c.targetValue) * 100)
  return (
    <View style={{
      padding: spacing[4], backgroundColor: theme.card,
      borderRadius: radius.xl, borderWidth: c.completed ? 2 : 1,
      borderColor: c.completed ? colors.primary : theme.border,
      gap: spacing[3],
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
          <View style={{
            width: 40, height: 40, borderRadius: radius.lg,
            backgroundColor: c.completed ? colors.primaryLight : theme.inputBg,
            justifyContent: 'center', alignItems: 'center',
          }}>
            {c.completed
              ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              : <Text style={{ fontSize: 20 }}>🏆</Text>
            }
          </View>
          <View>
            <Text style={{ fontWeight: '600', color: theme.text, fontSize: typography.sm.fontSize }}>
              {c.title}
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: typography.xs.fontSize }}>
              {c.description}
            </Text>
          </View>
        </View>
        <Badge variant={c.completed ? 'success' : 'default'}>+{c.rewardXp} XP</Badge>
      </View>
      <ProgressBar value={pct} color={c.completed ? colors.primary : colors.info} height={6} />
      <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary, textAlign: 'right' }}>
        {c.currentValue}/{c.targetValue} ngày
      </Text>
    </View>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const theme  = useTheme()
  const [period, setPeriod] = useState<Period>('weekly')

  const { data: summary, isLoading: l1, refetch: r1 } = useQuery({
    queryKey: ['analytics', 'period', period],
    queryFn:  () => analyticsService.getPeriod(period),
  })
  const { data: insights,    isLoading: l2, refetch: r2 } = useQuery({ queryKey: ['analytics','insights'], queryFn: analyticsService.getInsights })
  const { data: statsData,   isLoading: l3, refetch: r3 } = useQuery({ queryKey: ['analytics','stats'],    queryFn: analyticsService.getStats })
  const { data: achData,     isLoading: l4, refetch: r4 } = useQuery({ queryKey: ['analytics','achievements'], queryFn: analyticsService.getAchievements })
  const { data: challenges,  isLoading: l5, refetch: r5 } = useQuery({ queryKey: ['analytics','challenges'],   queryFn: analyticsService.getChallenges })

  const isLoading = l1 || l2 || l3 || l4 || l5
  const onRefresh = () => { r1(); r2(); r3(); r4(); r5() }

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'daily', label: 'Hôm nay' },
    { key: 'weekly', label: '7 ngày' },
    { key: 'monthly', label: '30 ngày' },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2] }}>
          <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text }}>
            Thống kê & Thành tích
          </Text>
        </View>

        {/* Period selector */}
        <View style={{ flexDirection: 'row', paddingHorizontal: spacing[4], gap: spacing[2], marginBottom: spacing[4] }}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={{
                flex: 1, paddingVertical: spacing[2], borderRadius: radius.lg,
                backgroundColor: period === p.key ? colors.primary : theme.inputBg,
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: typography.xs.fontSize, fontWeight: '600',
                color: period === p.key ? '#fff' : theme.textSecondary,
              }}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing[4], gap: spacing[4] }}>

          {/* Stat cards */}
          {isLoading ? (
            <View style={{ flexDirection: 'row', gap: spacing[3] }}>
              {[1,2,3].map(i => <Skeleton key={i} height={90} style={{ flex: 1 }} borderRadius={radius.xl} />)}
            </View>
          ) : summary && (
            <>
              <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                <StatCard label="TB Calo" value={summary.avgCalories} unit="kcal" color={colors.calories} bg={colors.caloriesLight} />
                <StatCard label="TB Protein" value={summary.avgProtein} unit="g" color={colors.protein} bg={colors.proteinLight} />
                <StatCard label="TB Điểm" value={summary.avgScore} unit="/100" color={colors.primary} bg={colors.primaryLight} />
              </View>
              <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                <StatCard label="Ngày ghi" value={summary.daysLogged} unit="ngày" color={colors.info} bg={colors.infoLight} />
                <StatCard label="Tổng bữa" value={summary.totalMeals} unit="bữa" color={colors.fats} bg={colors.fatsLight} />
                <StatCard label="TB Nước" value={(summary.avgWater / 1000).toFixed(1)} unit="L" color={colors.fiber} bg={colors.fiberLight} />
              </View>
            </>
          )}

          {/* Streak + Level */}
          {statsData && (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[5] }}>
                {/* Streak */}
                <View style={{ alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: statsData.currentStreak >= 7 ? '#fed7aa' : theme.inputBg,
                    borderRadius: radius.xl, paddingHorizontal: spacing[4], paddingVertical: spacing[2],
                    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
                  }}>
                    <Text style={{ fontSize: 20 }}>🔥</Text>
                    <Text style={{
                      fontSize: typography['2xl'].fontSize, fontWeight: '800',
                      color: statsData.currentStreak >= 7 ? '#ea580c' : theme.text,
                    }}>{statsData.currentStreak}</Text>
                  </View>
                  <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary, marginTop: spacing[1] }}>
                    Chuỗi ngày
                  </Text>
                </View>

                <View style={{ width: 1, height: 60, backgroundColor: theme.border }} />

                {/* Level */}
                <View style={{ flex: 1, gap: spacing[2] }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ fontWeight: '800', color: '#fff', fontSize: typography.sm.fontSize }}>
                        {statsData.level}
                      </Text>
                    </View>
                    <Text style={{ fontWeight: '700', color: colors.primary, fontSize: typography.sm.fontSize }}>
                      {statsData.totalXp.toLocaleString('vi')} XP
                    </Text>
                  </View>
                  <ProgressBar
                    value={((statsData.totalXp - Math.pow(statsData.level - 1, 2) * 100) /
                            (Math.pow(statsData.level, 2) * 100 - Math.pow(statsData.level - 1, 2) * 100)) * 100}
                    height={6}
                  />
                  <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>
                    Level {statsData.level}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Smart Insights */}
          {insights && insights.length > 0 && (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
                <Ionicons name="flash" size={18} color={colors.primary} />
                <Text style={{ fontWeight: '600', color: theme.text, fontSize: typography.base.fontSize }}>
                  Phân tích thông minh
                </Text>
              </View>
              <View style={{ gap: spacing[2] }}>
                {insights.map((insight: any) => (
                  <InsightItem key={insight.id} insight={insight} theme={theme} />
                ))}
              </View>
            </Card>
          )}

          {/* Weekly challenges */}
          {challenges && challenges.length > 0 && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
                <Ionicons name="trophy" size={18} color={colors.warning} />
                <Text style={{ fontWeight: '600', color: theme.text, fontSize: typography.base.fontSize }}>
                  Thử thách tuần này
                </Text>
              </View>
              <View style={{ gap: spacing[3] }}>
                {challenges.map((c: any) => <ChallengeCard key={c.id} c={c} theme={theme} />)}
              </View>
            </View>
          )}

          {/* Achievements */}
          {achData?.achievements && (
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                <Text style={{ fontWeight: '600', color: theme.text, fontSize: typography.base.fontSize }}>
                  Thành tích
                </Text>
                <Text style={{ fontSize: typography.sm.fontSize, color: theme.textSecondary }}>
                  {achData.achievements.filter((a: any) => a.unlocked).length}/{achData.achievements.length}
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: spacing[3], paddingBottom: spacing[2] }}>
                  {achData.achievements.map((a: any) => <AchievementBadge key={a.id} a={a} />)}
                </View>
              </ScrollView>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
