import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, useColorScheme,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Button, Input, Card } from '@components/ui'
import { authService } from '@services/auth.service'
import { useAuthStore } from '@store/auth.store'
import { lightTheme, darkTheme, colors, spacing, typography, radius } from '@lib/theme'

const schema = z.object({
  email:    z.string().email('Email không hợp lệ').toLowerCase().trim(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})
type FormValues = z.infer<typeof schema>

export default function LoginScreen() {
  const router  = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const scheme  = useColorScheme()
  const theme   = scheme === 'dark' ? darkTheme : lightTheme
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const res = await authService.login(data)
      await setAuth(res.user, res.accessToken, res.refreshToken)
      router.replace('/(tabs)/dashboard')
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err?.response?.data?.message ?? 'Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#16a34a', '#15803d']}
        style={{ height: 240, justifyContent: 'flex-end', paddingHorizontal: spacing[6], paddingBottom: spacing[8] }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] }}>
          <View style={{ width: 44, height: 44, borderRadius: radius.xl, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>🥗</Text>
          </View>
          <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '800', color: '#fff' }}>
            NutriScan AI
          </Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: typography.base.fontSize }}>
          Theo dõi dinh dưỡng thông minh
        </Text>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ padding: spacing[6], paddingTop: spacing[8] }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text, marginBottom: spacing[2] }}>
          Đăng nhập
        </Text>
        <Text style={{ color: theme.textSecondary, marginBottom: spacing[8] }}>
          Chưa có tài khoản?{' '}
          <Text
            style={{ color: colors.primary, fontWeight: '600' }}
            onPress={() => router.push('/(auth)/register')}
          >
            Đăng ký ngay
          </Text>
        </Text>

        <View style={{ gap: spacing[4] }}>
          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="ban@email.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email?.message}
                leftIcon={<Ionicons name="mail-outline" size={18} color={theme.textSecondary} />}
              />
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mật khẩu"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPwd}
                error={errors.password?.message}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />}
              />
            )}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end' }}>
            <Text style={{ color: colors.primary, fontSize: typography.sm.fontSize, fontWeight: '500' }}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          <Button onPress={handleSubmit(onSubmit)} loading={loading} fullWidth style={{ marginTop: spacing[2] }}>
            Đăng nhập
          </Button>
        </View>

        {/* Demo account */}
        <Card style={{ marginTop: spacing[8] }} padding={spacing[4]}>
          <Text style={{ fontWeight: '600', color: theme.text, marginBottom: spacing[2] }}>
            🧪 Tài khoản demo
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: typography.sm.fontSize }}>
            Email: demo@nutriscan.ai
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: typography.sm.fontSize }}>
            Password: Password123!
          </Text>
          <Button
            variant="outline"
            size="sm"
            style={{ marginTop: spacing[3] }}
            onPress={() => {
              authService.login({ email: 'demo@nutriscan.ai', password: 'Password123!' })
                .then(res => setAuth(res.user, res.accessToken, res.refreshToken))
                .then(() => router.replace('/(tabs)/dashboard'))
                .catch(() => Alert.alert('Lỗi', 'Không thể đăng nhập demo'))
            }}
          >
            Đăng nhập Demo
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
