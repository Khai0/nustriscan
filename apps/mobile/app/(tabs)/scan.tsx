import { useState, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
  ActivityIndicator, useColorScheme, Dimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Card, ProgressBar, Badge } from '@components/ui'
import { scanService } from '@services/api.service'
import { lightTheme, darkTheme, colors, spacing, typography, radius } from '@lib/theme'

const { width: SCREEN_W } = Dimensions.get('window')

type ScanStep = 'idle' | 'camera' | 'preview' | 'analyzing' | 'result' | 'confirming' | 'confirmed' | 'error'

const SERVING_PRESETS = [
  { key: 'small',  label: 'Nhỏ',  desc: '60%', mult: 0.6 },
  { key: 'medium', label: 'Vừa',  desc: '100%',mult: 1.0 },
  { key: 'large',  label: 'Lớn',  desc: '150%',mult: 1.5 },
]

const MEAL_TYPES = [
  { key: 'BREAKFAST', label: '🌅 Sáng' },
  { key: 'LUNCH',     label: '☀️ Trưa' },
  { key: 'DINNER',    label: '🌙 Tối' },
  { key: 'SNACK',     label: '🍎 Phụ' },
]

function getDefaultMealType() {
  const h = new Date().getHours()
  if (h < 10) return 'BREAKFAST'
  if (h < 14) return 'LUNCH'
  if (h < 19) return 'DINNER'
  return 'SNACK'
}

export default function ScanScreen() {
  const router      = useRouter()
  const qc          = useQueryClient()
  const scheme      = useColorScheme()
  const theme       = scheme === 'dark' ? darkTheme : lightTheme
  const cameraRef   = useRef<CameraView>(null)

  const [permission, requestPermission] = useCameraPermissions()
  const [step,        setStep]          = useState<ScanStep>('idle')
  const [imageUri,    setImageUri]      = useState<string | null>(null)
  const [scanResult,  setScanResult]    = useState<any>(null)
  const [selectedFood,setSelectedFood]  = useState<any>(null)
  const [serving,     setServing]       = useState('medium')
  const [mealType,    setMealType]      = useState(getDefaultMealType())
  const [confirming,  setConfirming]    = useState(false)
  const [errorMsg,    setErrorMsg]      = useState('')

  const reset = useCallback(() => {
    setStep('idle'); setImageUri(null); setScanResult(null)
    setSelectedFood(null); setServing('medium'); setMealType(getDefaultMealType())
  }, [])

  // ── Compress + analyze ────────────────────────────────────────────────────
  const analyzeImage = useCallback(async (uri: string) => {
    setStep('analyzing')
    try {
      // Compress to 1200px JPEG
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG, base64: false }
      )

      const result = await scanService.analyze(compressed.uri, '')
      setScanResult(result)
      setSelectedFood(result.topMatch)
      setStep('result')
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message ?? 'Phân tích thất bại. Vui lòng thử lại.')
      setStep('error')
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [])

  // ── Camera capture ────────────────────────────────────────────────────────
  const capture = useCallback(async () => {
    if (!cameraRef.current) return
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 })
    if (!photo) return
    setImageUri(photo.uri)
    setStep('preview')
  }, [])

  // ── Pick from gallery ─────────────────────────────────────────────────────
  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.85,
      allowsEditing: true,
      aspect:     [4, 3],
    })
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri)
      setStep('preview')
    }
  }, [])

  // ── Confirm meal ──────────────────────────────────────────────────────────
  const confirmMeal = useCallback(async () => {
    if (!scanResult || !selectedFood) return
    setConfirming(true)
    try {
      await scanService.confirm(scanResult.scanId, {
        foodItemId:   selectedFood.foodItemId,
        mealType,
        mealDate:     new Date().toISOString().split('T')[0],
        servingPreset:serving as any,
      })
      qc.invalidateQueries({ queryKey: ['meals'] })
      qc.invalidateQueries({ queryKey: ['analysis'] })
      setStep('confirmed')
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu bữa ăn. Vui lòng thử lại.')
    } finally {
      setConfirming(false)
    }
  }, [scanResult, selectedFood, mealType, serving, qc])

  // ── Render helpers ────────────────────────────────────────────────────────
  const bg = theme.background

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (step === 'idle') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing[6] }}>
          <View style={{ alignItems: 'center', marginBottom: spacing[10] }}>
            <View style={{
              width: 96, height: 96, borderRadius: 48,
              backgroundColor: colors.primaryLight,
              justifyContent: 'center', alignItems: 'center',
              marginBottom: spacing[5],
            }}>
              <Text style={{ fontSize: 44 }}>🍜</Text>
            </View>
            <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
              Quét món ăn
            </Text>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing[2], lineHeight: 22 }}>
              Chụp ảnh hoặc chọn ảnh từ thư viện để AI phân tích dinh dưỡng
            </Text>
          </View>

          <View style={{ gap: spacing[3] }}>
            <Button
              onPress={async () => {
                if (!permission?.granted) {
                  const { granted } = await requestPermission()
                  if (!granted) { Alert.alert('Cần quyền camera', 'Vui lòng cho phép truy cập camera trong Cài đặt.'); return }
                }
                setStep('camera')
              }}
              fullWidth
              style={{ height: 56, gap: spacing[2] }}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: typography.base.fontSize }}>
                Chụp ảnh
              </Text>
            </Button>

            <Button variant="outline" onPress={pickImage} fullWidth style={{ height: 56, gap: spacing[2] }}>
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: typography.base.fontSize }}>
                Chọn từ thư viện
              </Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // ── CAMERA ────────────────────────────────────────────────────────────────
  if (step === 'camera') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          {/* Overlay frame */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
              width: SCREEN_W - 80, height: SCREEN_W - 80,
              borderRadius: radius.xl,
              borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
              borderStyle: 'dashed',
            }} />
            <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: spacing[4], fontSize: typography.sm.fontSize }}>
              Đặt món ăn vào khung
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={{ padding: spacing[8], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={reset} style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Shutter button */}
            <TouchableOpacity
              onPress={capture}
              style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: '#fff',
                borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)',
                justifyContent: 'center', alignItems: 'center',
              }}
            >
              <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={pickImage} style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="images-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    )
  }

  // ── PREVIEW ───────────────────────────────────────────────────────────────
  if (step === 'preview' && imageUri) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Image source={{ uri: imageUri }} style={{ flex: 1 }} contentFit="contain" />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing[6], gap: spacing[3], backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <Button onPress={() => analyzeImage(imageUri)} fullWidth style={{ height: 52 }}>
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: typography.base.fontSize, marginLeft: spacing[2] }}>
              Phân tích với AI
            </Text>
          </Button>
          <Button variant="outline" onPress={reset} fullWidth style={{ height: 52, borderColor: 'rgba(255,255,255,0.5)' }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Chụp lại</Text>
          </Button>
        </View>
      </View>
    )
  }

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (step === 'analyzing') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        {imageUri && <Image source={{ uri: imageUri }} style={{ ...StyleSheet.absoluteFillObject, opacity: 0.5 }} contentFit="cover" />}
        <View style={{ alignItems: 'center', gap: spacing[4] }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', fontSize: typography.lg.fontSize, fontWeight: '600' }}>
            AI đang phân tích…
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: typography.sm.fontSize }}>
            Google Vision đang nhận diện món ăn
          </Text>
        </View>
      </View>
    )
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (step === 'result' && scanResult) {
    const noMatch = !scanResult.matchedFoods?.length
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[4] }}>
          {/* Image preview */}
          {imageUri && (
            <View style={{ borderRadius: radius.xl, overflow: 'hidden', height: 200 }}>
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <View style={{ position: 'absolute', top: spacing[3], right: spacing[3] }}>
                <Badge variant="success">{scanResult.aiProvider?.replace('_',' ')}</Badge>
              </View>
            </View>
          )}

          {/* AI labels */}
          {scanResult.labels?.length > 0 && (
            <Card>
              <Text style={{ fontWeight: '600', color: theme.text, marginBottom: spacing[3] }}>
                ⚡ AI nhận diện
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                {scanResult.labels.slice(0, 6).map((l: any, i: number) => (
                  <View key={i} style={{
                    backgroundColor: theme.inputBg, borderRadius: radius.full,
                    paddingHorizontal: spacing[3], paddingVertical: spacing[1],
                    flexDirection: 'row', gap: spacing[1], alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: typography.xs.fontSize, color: theme.text }}>{l.description}</Text>
                    <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>
                      {Math.round(l.score * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {noMatch ? (
            <Card>
              <View style={{ alignItems: 'center', padding: spacing[6] }}>
                <Text style={{ fontSize: 40, marginBottom: spacing[3] }}>🤔</Text>
                <Text style={{ fontWeight: '600', color: theme.text, textAlign: 'center' }}>
                  Không tìm thấy món phù hợp
                </Text>
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing[2], fontSize: typography.sm.fontSize }}>
                  Thử chụp gần hơn hoặc góc độ khác
                </Text>
              </View>
            </Card>
          ) : (
            <View style={{ gap: spacing[3] }}>
              <Text style={{ fontWeight: '600', color: theme.text }}>
                Kết quả phù hợp ({scanResult.matchedFoods.length})
              </Text>
              {scanResult.matchedFoods.map((food: any, i: number) => {
                const selected = selectedFood?.foodItemId === food.foodItemId
                return (
                  <TouchableOpacity
                    key={food.foodItemId}
                    onPress={() => { setSelectedFood(food); Haptics.selectionAsync() }}
                    style={{
                      backgroundColor: selected ? colors.primaryLight : theme.card,
                      borderRadius: radius.xl,
                      borderWidth: 2,
                      borderColor: selected ? colors.primary : theme.border,
                      padding: spacing[4],
                      gap: spacing[3],
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] }}>
                      <View style={{
                        width: 32, height: 32, borderRadius: radius.full,
                        backgroundColor: selected ? colors.primary : theme.inputBg,
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        <Text style={{ fontWeight: '700', color: selected ? '#fff' : theme.textSecondary, fontSize: typography.sm.fontSize }}>
                          {i + 1}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', color: theme.text, fontSize: typography.base.fontSize }}>
                          {food.foodName}
                        </Text>
                        {food.nameEn && (
                          <Text style={{ color: theme.textSecondary, fontSize: typography.xs.fontSize }}>{food.nameEn}</Text>
                        )}
                      </View>
                      <Badge variant={food.confidence >= 0.85 ? 'success' : 'warning'}>
                        {Math.round(food.confidence * 100)}%
                      </Badge>
                    </View>

                    <ProgressBar value={food.confidence * 100} color={colors.primary} height={4} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {[
                        { label: 'Calo', value: Math.round(food.calories), unit: 'kcal', color: colors.calories },
                        { label: 'P',    value: Math.round(food.protein),  unit: 'g',    color: colors.protein },
                        { label: 'C',    value: Math.round(food.carbohydrates), unit: 'g', color: colors.carbs },
                        { label: 'F',    value: Math.round(food.fat),      unit: 'g',    color: colors.fats },
                      ].map(n => (
                        <View key={n.label} style={{ alignItems: 'center' }}>
                          <Text style={{ fontWeight: '700', color: n.color, fontSize: typography.base.fontSize }}>
                            {n.value}
                          </Text>
                          <Text style={{ fontSize: typography.xs.fontSize, color: theme.textSecondary }}>{n.label}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[2] }}>
            <Button variant="outline" onPress={reset} style={{ flex: 1 }}>Quét lại</Button>
            <Button
              onPress={() => setStep('confirming')}
              style={{ flex: 1 }}
              disabled={!selectedFood}
            >
              Xác nhận
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── CONFIRMING ────────────────────────────────────────────────────────────
  if (step === 'confirming' && selectedFood) {
    const preset   = SERVING_PRESETS.find(p => p.key === serving)!
    const calories = Math.round(selectedFood.calories * preset.mult)
    const protein  = Math.round(selectedFood.protein  * preset.mult * 10) / 10
    const carbs    = Math.round(selectedFood.carbohydrates * preset.mult * 10) / 10
    const fat      = Math.round(selectedFood.fat       * preset.mult * 10) / 10

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <ScrollView contentContainerStyle={{ padding: spacing[5], gap: spacing[5] }}>
          <Text style={{ fontSize: typography.xl.fontSize, fontWeight: '700', color: theme.text }}>
            Xác nhận bữa ăn
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: -spacing[3] }}>{selectedFood.foodName}</Text>

          {/* Meal type */}
          <View>
            <Text style={{ fontWeight: '600', color: theme.text, marginBottom: spacing[3] }}>Loại bữa ăn</Text>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              {MEAL_TYPES.map(mt => (
                <TouchableOpacity
                  key={mt.key}
                  onPress={() => { setMealType(mt.key); Haptics.selectionAsync() }}
                  style={{
                    flex: 1, padding: spacing[3],
                    backgroundColor: mealType === mt.key ? colors.primary : theme.inputBg,
                    borderRadius: radius.lg, alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: typography.xs.fontSize, fontWeight: '600',
                    color: mealType === mt.key ? '#fff' : theme.text }}>
                    {mt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Serving size */}
          <View>
            <Text style={{ fontWeight: '600', color: theme.text, marginBottom: spacing[3] }}>Khẩu phần</Text>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              {SERVING_PRESETS.map(p => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => { setServing(p.key); Haptics.selectionAsync() }}
                  style={{
                    flex: 1, padding: spacing[3],
                    backgroundColor: serving === p.key ? colors.primaryLight : theme.inputBg,
                    borderRadius: radius.lg, alignItems: 'center',
                    borderWidth: 2, borderColor: serving === p.key ? colors.primary : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: typography.lg.fontSize, marginBottom: 2 }}>
                    {p.key === 'small' ? '🥢' : p.key === 'medium' ? '🍽️' : '🫕'}
                  </Text>
                  <Text style={{ fontWeight: '700', color: theme.text, fontSize: typography.sm.fontSize }}>{p.label}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: typography.xs.fontSize }}>{p.desc}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: typography.xs.fontSize }}>
                    {Math.round(selectedFood.servingSize * p.mult)}{selectedFood.servingUnit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nutrition preview */}
          <Card style={{ backgroundColor: colors.primaryLight }}>
            <Text style={{ fontWeight: '600', color: colors.primaryDark, marginBottom: spacing[3] }}>
              Dinh dưỡng ({Math.round(selectedFood.servingSize * preset.mult)}{selectedFood.servingUnit})
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[
                { label: 'Calo', value: calories, unit: 'kcal', color: colors.calories },
                { label: 'Protein', value: protein, unit: 'g', color: colors.protein },
                { label: 'Carbs',   value: carbs,   unit: 'g', color: colors.carbs },
                { label: 'Fat',     value: fat,     unit: 'g', color: colors.fats },
              ].map(n => (
                <View key={n.label} style={{ alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: typography.lg.fontSize, color: n.color }}>{n.value}</Text>
                  <Text style={{ fontSize: typography.xs.fontSize, color: colors.primaryDark, opacity: 0.7 }}>{n.unit}</Text>
                  <Text style={{ fontSize: typography.xs.fontSize, color: colors.primaryDark }}>{n.label}</Text>
                </View>
              ))}
            </View>
          </Card>

          <View style={{ flexDirection: 'row', gap: spacing[3] }}>
            <Button variant="outline" onPress={() => setStep('result')} style={{ flex: 1 }}>Quay lại</Button>
            <Button onPress={confirmMeal} loading={confirming} style={{ flex: 1 }}>
              Lưu bữa ăn
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // ── CONFIRMED ─────────────────────────────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', padding: spacing[6] }}>
        <View style={{
          width: 96, height: 96, borderRadius: 48,
          backgroundColor: colors.successLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[5],
        }}>
          <Ionicons name="checkmark-circle" size={52} color={colors.success} />
        </View>
        <Text style={{ fontSize: typography['2xl'].fontSize, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
          Đã lưu bữa ăn!
        </Text>
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing[2], marginBottom: spacing[8] }}>
          {selectedFood?.foodName} đã được ghi nhận vào nhật ký.
        </Text>
        <View style={{ gap: spacing[3], width: '100%' }}>
          <Button onPress={reset} fullWidth>Quét tiếp</Button>
          <Button variant="outline" onPress={() => router.push('/(tabs)/dashboard')} fullWidth>
            Về Trang chủ
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center', padding: spacing[6] }}>
      <View style={{
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.errorLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[5],
      }}>
        <Ionicons name="close-circle" size={44} color={colors.error} />
      </View>
      <Text style={{ fontSize: typography.xl.fontSize, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
        Có lỗi xảy ra
      </Text>
      <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing[2], marginBottom: spacing[8] }}>
        {errorMsg}
      </Text>
      <Button onPress={reset} fullWidth>Thử lại</Button>
    </SafeAreaView>
  )
}

import { StyleSheet } from 'react-native'
