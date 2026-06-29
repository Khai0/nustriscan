import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

// ── Configure how notifications appear when app is in foreground ──────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
})

// ── Request permission + get push token ───────────────────────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:       'NutriScan Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:  '#16a34a',
      sound:       'default',
    })

    await Notifications.setNotificationChannelAsync('reminders', {
      name:       'Nhắc nhở ăn uống',
      importance: Notifications.AndroidImportance.DEFAULT,
      description:'Nhắc nhở ghi nhận bữa ăn và uống nước',
    })
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync()
    return token.data
  } catch {
    return null
  }
}

// ── Schedule local notification reminders ────────────────────────────────────
export async function scheduleWaterReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()

  // Remind every 2 hours from 8am to 8pm
  const hours = [8, 10, 12, 14, 16, 18, 20]
  for (const hour of hours) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Nhắc uống nước',
        body:  'Đã đến giờ uống nước! Uống 1 ly để đạt mục tiêu hôm nay.',
        sound: 'default',
        data:  { type: 'water_reminder' },
      },
      trigger: {
        hour,
        minute:  0,
        repeats: true,
      } as Notifications.DailyTriggerInput,
    })
  }
}

export async function scheduleMealReminder(
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER',
  hour: number,
  minute: number
): Promise<void> {
  const messages = {
    BREAKFAST: { title: '🌅 Bữa sáng', body: 'Đừng quên ghi nhận bữa sáng của bạn!' },
    LUNCH:     { title: '☀️ Bữa trưa', body: 'Đã đến giờ ăn trưa. Ghi nhận bữa ăn ngay!' },
    DINNER:    { title: '🌙 Bữa tối',  body: 'Nhớ ghi nhận bữa tối và hoàn thành mục tiêu hôm nay.' },
  }

  const msg = messages[mealType]
  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body:  msg.body,
      sound: 'default',
      data:  { type: 'meal_reminder', mealType },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  })
}

export async function sendImmediateNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: null,
  })
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}
