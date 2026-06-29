import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, RefreshControl, useColorScheme,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card, Badge, Skeleton } from '@components/ui'
import { mealService, type Meal } from '@services/api.service'
import { lightTheme, darkTheme, colors, spacing, typography, radius } from '@lib/theme'

const MEAL_EMOJI: Record<string, string> = {
  BREAKFAST: '🌅', LUNCH: '☀️', DINNER: '🌙', SNACK: '🍎',
}
const MEAL_LABEL: Record<string, string> = {
  BREAKFAST: 'Sáng', LUNCH: 'Trưa', DINNER: 'Tối', SNACK: 'Phụ',
}

function MealRow({ meal, theme }: { meal: Meal; theme: any }) {
  const foodName = meal.mealItems?.[0]?.foodItem?.name ?? 'Bữa ăn'
  const itemCount = meal.mealItems?.length ?? 0
  const time = new Date(meal.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: spacing[3],
      paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: theme.border,
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: radius.lg,
        backgroundColor: theme.inputBg, justifyContent: 'center', alignItems: 'center',
      }}>
        <Text style={{ fontSize: 22 }}>{MEAL_EMOJI[meal.mealType] ?? '🍽️'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', color: theme.text, fontSize: typography.sm.fontSize }}>
          {foodName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: 3 }}>
          <Badge variant="default" size="sm">{MEAL_LABEL[meal.mealType]}</Badge>
          <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>{time}</Text>
          {itemCount > 1 && (
            <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>
              +{itemCount - 1} món
            </Text>
          )}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontWeight: '700', color: theme.text, fontSize: typography.base.fontSize }}>
          {Math.round(meal.totalCalories)}
        </Text>
        <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>kcal</Text>
      </View>
    </View>
  )
}

interface DateGroup { date: string; meals: Meal[]; totalCal: number }

function groupByDate(meals: Meal[]): DateGroup[] {
  const map = new Map<string, Meal[]>()
  for (const m of meals) {
    const d = m.mealDate.split('T')[0]
    if (!map.has(d)) map.set(d, [])
    map.get(d)!.push(m)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, ms]) => ({
      date,
      meals: ms,
      totalCal: ms.reduce((s, m) => s + m.totalCalories, 0),
    }))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Hôm nay'
  if (dateStr === yesterday) return 'Hôm qua'
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function HistoryScreen() {
  const scheme = useColorScheme()
  const theme  = scheme === 'dark' ? darkTheme : lightTheme
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['meals', 'history'],
    queryFn:  () => mealService.list({ limit: 100 }),
  })

  const meals  = data?.data ?? []
  const groups = groupByDate(
    search
      ? meals.filter(m => m.mealItems?.some(i => i.foodItem?.name?.toLowerCase().includes(search.toLowerCase())))
      : meals
  )

  const renderGroup = useCallback(({ item }: { item: DateGroup }) => (
    <View style={{ marginBottom: spacing[4] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
        <Text style={{ fontSize: typography.xs.fontSize, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
          {formatDate(item.date)}
        </Text>
        <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>
          {Math.round(item.totalCal).toLocaleString('vi')} kcal
        </Text>
      </View>
      <Card padding={spacing[3]}>
        {item.meals.map(m => <MealRow key={m.id} meal={m} theme={theme} />)}
      </Card>
    </View>
  ), [theme])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing[4], paddingVertical: spacing[4] }}>
        <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text }}>
          Lịch sử bữa ăn
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: spacing[1] }}>
          {meals.length} bữa đã ghi nhận
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: spacing[4], marginBottom: spacing[3] }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: spacing[2],
          backgroundColor: theme.inputBg, borderRadius: radius.lg,
          paddingHorizontal: spacing[3], height: 44,
        }}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={{ flex: 1, color: theme.text, fontSize: typography.base.fontSize }}
            placeholder="Tìm kiếm món ăn…"
            placeholderTextColor={theme.placeholder}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: spacing[4], gap: spacing[3] }}>
          {[1,2,3].map(i => <Skeleton key={i} height={120} borderRadius={radius.xl} />)}
        </View>
      ) : groups.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[8] }}>
          <Text style={{ fontSize: 48, marginBottom: spacing[4] }}>🍽️</Text>
          <Text style={{ fontWeight: '600', color: theme.text, textAlign: 'center' }}>
            {search ? 'Không tìm thấy kết quả' : 'Chưa có bữa ăn nào'}
          </Text>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing[2], fontSize: typography.sm.fontSize }}>
            {search ? 'Thử từ khoá khác' : 'Quét ảnh để bắt đầu ghi nhận'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.date}
          renderItem={renderGroup}
          contentContainerStyle={{ paddingHorizontal: spacing[4], paddingBottom: spacing[8] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
        />
      )}
    </SafeAreaView>
  )
}
