import { useState } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity, Alert,
  Switch, useColorScheme,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Card, Button, Badge, ProgressBar } from '@components/ui'
import { useAuthStore } from '@store/auth.store'
import { authService } from '@services/auth.service'
import { analyticsService, healthProfileService } from '@services/api.service'
import { lightTheme, darkTheme, colors, spacing, typography, radius } from '@lib/theme'

function useTheme() {
  const s = useColorScheme(); return s === 'dark' ? darkTheme : lightTheme
}

function MenuItem({ icon, label, value, onPress, danger = false, theme }: {
  icon: string; label: string; value?: string
  onPress?: () => void; danger?: boolean; theme: any
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: spacing[4],
        paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: theme.border,
      }}
      activeOpacity={0.6}
    >
      <View style={{
        width: 36, height: 36, borderRadius: radius.lg,
        backgroundColor: danger ? colors.errorLight : theme.inputBg,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Ionicons name={icon as any} size={18} color={danger ? colors.error : theme.textSecondary} />
      </View>
      <Text style={{ flex: 1, fontSize: typography.base.fontSize, fontWeight: '500', color: danger ? colors.error : theme.text }}>
        {label}
      </Text>
      {value && <Text style={{ fontSize: typography.sm.fontSize, color: theme.textSecondary }}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const router  = useRouter()
  const theme   = useTheme()
  const scheme  = useColorScheme()
  const user    = useAuthStore(s => s.user)
  const clearAuth = useAuthStore(s => s.clearAuth)
  const [notifications, setNotifications] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['analytics', 'stats'],
    queryFn:  () => analyticsService.getStats(),
  })

  const { data: profile } = useQuery({
    queryKey: ['health-profile'],
    queryFn:  () => healthProfileService.get(),
  })

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true)
            try {
              await authService.logout()
            } catch { /* ignore */ } finally {
              await clearAuth()
              router.replace('/(auth)/login')
            }
          },
        },
      ]
    )
  }

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[10] }} showsVerticalScrollIndicator={false}>
        {/* Cover + Avatar */}
        <LinearGradient
          colors={['#16a34a', '#15803d']}
          style={{ height: 120, position: 'relative' }}
        />
        <View style={{ paddingHorizontal: spacing[4], marginTop: -40, marginBottom: spacing[4] }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: colors.primary, borderWidth: 4, borderColor: theme.background,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: typography['2xl'].fontSize, fontWeight: '700' }}>
                {initials}
              </Text>
            </View>
            <Button variant="outline" size="sm" style={{ marginBottom: spacing[2] }}>
              <Ionicons name="pencil" size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: typography.xs.fontSize, marginLeft: spacing[1] }}>
                Chỉnh sửa
              </Text>
            </Button>
          </View>
          <Text style={{ fontSize: typography.xl.fontSize, fontWeight: '700', color: theme.text, marginTop: spacing[3] }}>
            {user?.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[1] }}>
            <Text style={{ color: theme.textSecondary, fontSize: typography.sm.fontSize }}>{user?.email}</Text>
            <Badge variant={user?.emailVerified ? 'success' : 'warning'} size="sm">
              {user?.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
            </Badge>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: spacing[4], gap: spacing[3], marginBottom: spacing[4] }}>
          {[
            { label: 'Bữa ăn', value: stats?.totalMealsLogged ?? 0 },
            { label: 'Lần quét', value: stats?.totalScans ?? 0 },
            { label: 'Ngày streak', value: stats?.currentStreak ?? 0 },
          ].map(s => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: theme.card, borderRadius: radius.xl,
              padding: spacing[3], alignItems: 'center', borderWidth: 1, borderColor: theme.border,
            }}>
              <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary, marginTop: 2 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Level + Weight goal */}
        <View style={{ paddingHorizontal: spacing[4], gap: spacing[3], marginBottom: spacing[4] }}>
          {stats && (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4] }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: typography.lg.fontSize, fontWeight: '800', color: '#fff' }}>
                    {stats.level}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                    <Text style={{ fontWeight: '600', color: theme.text }}>Level {stats.level}</Text>
                    <Text style={{ color: colors.primary, fontWeight: '600', fontSize: typography.sm.fontSize }}>
                      {stats.totalXp.toLocaleString('vi')} XP
                    </Text>
                  </View>
                  <ProgressBar
                    value={((stats.totalXp - Math.pow(stats.level - 1, 2) * 100) /
                           (Math.pow(stats.level, 2) * 100 - Math.pow(stats.level - 1, 2) * 100)) * 100}
                    height={6}
                  />
                </View>
              </View>
            </Card>
          )}

          {profile?.targetWeight && profile?.weight && (
            <Card>
              <Text style={{ fontWeight: '600', color: theme.text, marginBottom: spacing[3] }}>
                🎯 Mục tiêu cân nặng
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ color: theme.textSecondary, fontSize: typography.sm.fontSize }}>
                  {profile.weight} kg → {profile.targetWeight} kg
                </Text>
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: typography.sm.fontSize }}>
                  Còn {Math.abs(profile.weight - profile.targetWeight).toFixed(1)} kg
                </Text>
              </View>
              <ProgressBar
                value={Math.min(100, ((profile.weight - profile.targetWeight) /
                       (profile.weight - profile.targetWeight)) * 100)}
                height={6}
              />
            </Card>
          )}
        </View>

        {/* Settings menu */}
        <View style={{ paddingHorizontal: spacing[4] }}>
          <Card>
            <Text style={{ fontSize: typography.xs.fontSize, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing[2] }}>
              Cài đặt
            </Text>
            <MenuItem icon="person-outline" label="Hồ sơ sức khoẻ" theme={theme} onPress={() => {}} />
            <MenuItem icon="notifications-outline" label="Thông báo" theme={theme}
              value=""
              onPress={() => {}}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: theme.border, gap: spacing[4] }}>
              <View style={{ width: 36, height: 36, borderRadius: radius.lg, backgroundColor: theme.inputBg, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="notifications-outline" size={18} color={theme.textSecondary} />
              </View>
              <Text style={{ flex: 1, fontSize: typography.base.fontSize, fontWeight: '500', color: theme.text }}>
                Nhận thông báo
              </Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <MenuItem icon="lock-closed-outline" label="Đổi mật khẩu" theme={theme} onPress={() => {}} />
            <MenuItem icon="moon-outline" label="Chế độ tối" theme={theme} value={scheme === 'dark' ? 'Bật' : 'Tắt'} />
          </Card>

          <View style={{ height: spacing[3] }} />

          <Card>
            <Text style={{ fontSize: typography.xs.fontSize, fontWeight: '600', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing[2] }}>
              Tài khoản
            </Text>
            <MenuItem icon="help-circle-outline" label="Trợ giúp & FAQ" theme={theme} onPress={() => {}} />
            <MenuItem icon="document-text-outline" label="Điều khoản & Bảo mật" theme={theme} onPress={() => {}} />
            <MenuItem
              icon="log-out-outline"
              label="Đăng xuất"
              theme={theme}
              danger
              onPress={handleLogout}
            />
          </Card>

          <Text style={{ textAlign: 'center', color: theme.textSecondary, fontSize: typography.xs.fontSize, marginTop: spacing[6] }}>
            NutriScan AI v1.0.0 · © {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
