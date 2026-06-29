import { Tabs, Redirect } from 'expo-router'
import { View, Platform } from 'react-native'
import { useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '@store/auth.store'
import { lightTheme, darkTheme, colors } from '@lib/theme'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface TabIconProps {
  name:    IconName
  focused: boolean
  color:   string
  primary?: boolean
}

function TabIcon({ name, focused, color, primary }: TabIconProps) {
  if (primary) {
    return (
      <View style={{
        width: 52, height: 52,
        borderRadius: 26,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Platform.OS === 'ios' ? 8 : 0,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <Ionicons name={name} size={26} color="#fff" />
      </View>
    )
  }
  return <Ionicons name={focused ? name : `${name}-outline` as IconName} size={24} color={color} />
}

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore()
  const scheme = useColorScheme()
  const theme  = scheme === 'dark' ? darkTheme : lightTheme

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown:        false,
        tabBarActiveTintColor:   theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor:  theme.tabBar,
          borderTopColor:   theme.border,
          borderTopWidth:   1,
          height:           Platform.OS === 'ios' ? 88 : 64,
          paddingBottom:    Platform.OS === 'ios' ? 28 : 8,
          paddingTop:       8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{
        title: 'Trang chủ',
        tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
      }} />

      <Tabs.Screen name="history" options={{
        title: 'Lịch sử',
        tabBarIcon: ({ focused, color }) => <TabIcon name="time" focused={focused} color={color} />,
      }} />

      <Tabs.Screen name="scan" options={{
        title: 'Quét',
        tabBarIcon: ({ focused, color }) => <TabIcon name="camera" focused={focused} color={color} primary />,
        tabBarLabel: () => null,
      }} />

      <Tabs.Screen name="analytics" options={{
        title: 'Thống kê',
        tabBarIcon: ({ focused, color }) => <TabIcon name="bar-chart" focused={focused} color={color} />,
      }} />

      <Tabs.Screen name="profile" options={{
        title: 'Hồ sơ',
        tabBarIcon: ({ focused, color }) => <TabIcon name="person" focused={focused} color={color} />,
      }} />
    </Tabs>
  )
}
