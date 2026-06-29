import { Redirect } from 'expo-router'
import { useAuthStore } from '@store/auth.store'
import { View, ActivityIndicator } from 'react-native'
import { colors } from '@lib/theme'

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    )
  }

  return <Redirect href={isAuthenticated ? '/(tabs)/dashboard' : '/(auth)/login'} />
}
