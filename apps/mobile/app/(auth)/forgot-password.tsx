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
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Input, Card } from '@components/ui'
import { authService } from '@services/auth.service'
import { lightTheme, darkTheme, colors, spacing, typography, radius } from '@lib/theme'

const schema = z.object({
  email: z.string().email('Email không hợp lệ').toLowerCase().trim(),
})
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordScreen() {
  const router   = useRouter()
  const scheme   = useColorScheme()
  const theme    = scheme === 'dark' ? darkTheme : lightTheme
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSubmitted(true)
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message ?? 'Vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: spacing[6] }}>
        <View style={{ alignItems: 'center', gap: spacing[4] }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
          }}>
            <Ionicons name="mail" size={38} color={colors.primary} />
          </View>
          <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
            Kiểm tra email
          </Text>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 22 }}>
            Chúng tôi đã gửi link đặt lại mật khẩu đến{' '}
            <Text style={{ color: theme.text, fontWeight: '600' }}>{getValues('email')}</Text>.
            Link hết hạn sau 30 phút.
          </Text>
          <Card style={{ width: '100%' }}>
            <Text style={{ fontWeight: '600', color: theme.text, marginBottom: spacing[2] }}>
              Không nhận được email?
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: typography.sm.fontSize, lineHeight: 20 }}>
              • Kiểm tra thư mục spam / junk{'\n'}
              • Đảm bảo địa chỉ email chính xác{'\n'}
              • Chờ vài phút rồi thử lại
            </Text>
          </Card>
          <Button variant="outline" onPress={() => setSubmitted(false)} fullWidth>
            Thử email khác
          </Button>
          <Button variant="ghost" onPress={() => router.back()} fullWidth>
            Quay lại đăng nhập
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView contentContainerStyle={{ padding: spacing[6], paddingTop: spacing[8] }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[6] }}>
            <Ionicons name="arrow-back" size={20} color={theme.textSecondary} />
            <Text style={{ color: theme.textSecondary }}>Quay lại</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text, marginBottom: spacing[2] }}>
            Quên mật khẩu?
          </Text>
          <Text style={{ color: theme.textSecondary, marginBottom: spacing[8], lineHeight: 22 }}>
            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Địa chỉ email"
                placeholder="ban@email.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                error={errors.email?.message}
                leftIcon={<Ionicons name="mail-outline" size={18} color={theme.textSecondary} />}
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            style={{ marginTop: spacing[6] }}
          >
            Gửi link đặt lại mật khẩu
          </Button>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

import { TouchableOpacity } from 'react-native'
