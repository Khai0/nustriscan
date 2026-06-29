import { useState } from 'react'
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Alert, useColorScheme,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'
import { Button, Input } from '@components/ui'
import { authService } from '@services/auth.service'
import { useAuthStore } from '@store/auth.store'
import { lightTheme, darkTheme, colors, spacing, typography } from '@lib/theme'

const schema = z.object({
  name:            z.string().min(2, 'Tên tối thiểu 2 ký tự').trim(),
  email:           z.string().email('Email không hợp lệ').toLowerCase().trim(),
  password:        z.string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Cần ít nhất 1 số')
    .regex(/[^A-Za-z0-9]/, 'Cần ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path:    ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

export default function RegisterScreen() {
  const router  = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const scheme  = useColorScheme()
  const theme   = scheme === 'dark' ? darkTheme : lightTheme
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async ({ name, email, password }: FormValues) => {
    setLoading(true)
    try {
      const res = await authService.register({ name, email, password })
      await setAuth(res.user, res.accessToken, res.refreshToken)
      router.replace('/(tabs)/dashboard')
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err?.response?.data?.message ?? 'Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ padding: spacing[6], paddingTop: spacing[16] }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text, marginBottom: spacing[2] }}>
          Tạo tài khoản
        </Text>
        <Text style={{ color: theme.textSecondary, marginBottom: spacing[8] }}>
          Đã có tài khoản?{' '}
          <Text
            style={{ color: colors.primary, fontWeight: '600' }}
            onPress={() => router.back()}
          >
            Đăng nhập
          </Text>
        </Text>

        <View style={{ gap: spacing[4] }}>
          <Controller control={control} name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Họ và tên" placeholder="Nguyễn Văn A"
                value={value} onChangeText={onChange} onBlur={onBlur}
                error={errors.name?.message}
                leftIcon={<Ionicons name="person-outline" size={18} color={theme.textSecondary} />}
              />
            )}
          />

          <Controller control={control} name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Email" placeholder="ban@email.com"
                value={value} onChangeText={onChange} onBlur={onBlur}
                keyboardType="email-address" autoCapitalize="none"
                error={errors.email?.message}
                leftIcon={<Ionicons name="mail-outline" size={18} color={theme.textSecondary} />}
              />
            )}
          />

          <Controller control={control} name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Mật khẩu" placeholder="Tối thiểu 8 ký tự"
                value={value} onChangeText={onChange} onBlur={onBlur}
                secureTextEntry error={errors.password?.message}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />}
              />
            )}
          />

          <Controller control={control} name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu"
                value={value} onChangeText={onChange} onBlur={onBlur}
                secureTextEntry error={errors.confirmPassword?.message}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />}
              />
            )}
          />

          <Button onPress={handleSubmit(onSubmit)} loading={loading} fullWidth style={{ marginTop: spacing[2] }}>
            Tạo tài khoản
          </Button>
        </View>

        <Text style={{ marginTop: spacing[6], textAlign: 'center', fontSize: typography.xs.fontSize, color: theme.textSecondary }}>
          Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của NutriScan AI.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
