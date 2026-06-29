# NutriScan AI — Mobile App (React Native + Expo)

## Tech Stack
- **Framework**: Expo SDK 51 + Expo Router v3
- **Language**: TypeScript
- **UI**: React Native + custom design system
- **State**: Zustand + TanStack Query
- **Auth**: SecureStore (thay cookie trên mobile)
- **Camera**: expo-camera + expo-image-picker
- **Offline**: expo-sqlite + custom sync engine
- **Push**: expo-notifications
- **Charts**: victory-native

## Cấu trúc
```
apps/mobile/
├── app/
│   ├── _layout.tsx          ← Root layout, load auth từ SecureStore
│   ├── index.tsx            ← Redirect dựa vào auth state
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (tabs)/
│       ├── dashboard.tsx    ← Trang chủ: calo, macro, meals, AI rec
│       ├── scan.tsx         ← Camera + AI food recognition
│       ├── history.tsx      ← Lịch sử bữa ăn theo ngày
│       ├── analytics.tsx    ← Thống kê + achievements + challenges
│       └── profile.tsx      ← Hồ sơ + cài đặt + đăng xuất
├── src/
│   ├── components/ui/       ← Button, Card, Input, Badge, ProgressBar, Skeleton
│   ├── lib/
│   │   ├── api-client.ts   ← Axios + silent refresh với SecureStore
│   │   ├── theme.ts        ← Design tokens (colors, spacing, typography)
│   │   ├── notifications.ts← Push notifications + local reminders
│   │   └── offline/
│   │       ├── db.ts       ← expo-sqlite wrapper
│   │       └── sync.ts     ← Auto-sync khi có mạng
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── api.service.ts  ← meals, water, analysis, analytics, scan
│   └── store/
│       └── auth.store.ts   ← Zustand + SecureStore persistence
└── app.json + eas.json
```

## Tính năng khác với web
| Tính năng | Mobile | Web |
|-----------|--------|-----|
| Token storage | SecureStore (encrypted) | httpOnly cookie |
| Camera | expo-camera (native) | browser getUserMedia |
| Offline DB | expo-sqlite | IndexedDB |
| Push notifications | expo-notifications | ❌ |
| Haptic feedback | expo-haptics | ❌ |
| Image compress | expo-image-manipulator | Canvas API |

## Chạy development

```bash
cd apps/mobile
npm install
npx expo start
# Scan QR bằng Expo Go app trên điện thoại
```

Yêu cầu:
- Node.js 20+
- Expo Go app (iOS/Android)
- Backend đang chạy (mặc định http://localhost:8000)

## Build production

```bash
# Cài EAS CLI
npm install -g eas-cli
eas login

# Build Android APK (preview)
eas build --platform android --profile preview

# Build iOS (cần Apple Developer account)
eas build --platform ios --profile production
```

## Kết nối backend

Chỉnh trong `app.json`:
```json
"extra": {
  "apiUrl": "https://api.nutriscan.ai"
}
```

Hoặc dùng `.env`:
```
EXPO_PUBLIC_API_URL=https://api.nutriscan.ai
```

## Offline mode

Khi mất mạng:
- Bữa ăn + nước lưu vào SQLite
- Tự động sync khi có mạng trở lại
- Hiện badge trên tab Dashboard khi có dữ liệu chờ sync
