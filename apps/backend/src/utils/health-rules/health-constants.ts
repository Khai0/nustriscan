// ============================================================
// Health Rules Constants
// Sources:
//   WHO Dietary Guidelines 2023
//   USDA Dietary Reference Intakes (DRI)
//   Vietnamese Ministry of Health recommendations
// ============================================================

// ── Daily Reference Intakes (DRI) for average adult ──────────────────────────
export const DRI = {
  // Macros
  FIBER_MIN_G:      25,    // g/day (WHO: 25–30g)
  SUGAR_MAX_G:      50,    // g/day (WHO: <10% of 2000kcal = 50g, ideally <25g)
  SUGAR_IDEAL_G:    25,    // g/day (ideal <5%)
  SODIUM_MAX_MG:    2300,  // mg/day (WHO: <2000mg, US: <2300mg)
  SODIUM_IDEAL_MG:  1500,  // mg/day (ideal for most adults)
  CHOLESTEROL_MAX_MG: 300, // mg/day
  SAT_FAT_MAX_PCT:  10,    // % of total calories

  // Micronutrients
  CALCIUM_MG:       1000,
  IRON_MG:          8,     // male; 18 for female
  POTASSIUM_MG:     3500,
  VITAMIN_C_MG:     90,

  // Water
  WATER_MIN_ML:     2000,  // ml/day (minimum)
} as const

// ── Condition-specific overrides ───────────────────────────────────────────────
export const CONDITION_OVERRIDES = {
  DIABETES: {
    SUGAR_MAX_G:       25,   // Very strict
    SUGAR_IDEAL_G:     10,
    CARB_MAX_PCT:      45,   // Low-carb recommendation
    HIGH_GI_WARNING:   true,
    description: 'Theo dõi đường huyết — hạn chế đường và tinh bột',
  },
  HYPERTENSION: {
    SODIUM_MAX_MG:     1500, // Strict sodium
    SODIUM_IDEAL_MG:   1000,
    POTASSIUM_TARGET_MG: 4700, // Potassium helps lower BP
    description: 'Huyết áp cao — giảm muối, tăng kali',
  },
  OBESITY: {
    CALORIE_DEFICIT_MAX: 750, // Max deficit for safe weight loss
    FAT_MAX_PCT:          25,
    FIBER_MIN_G:          30, // High fiber for satiety
    description: 'Béo phì — kiểm soát calo, tăng chất xơ',
  },
  HIGH_CHOLESTEROL: {
    SAT_FAT_MAX_PCT:    7,
    CHOLESTEROL_MAX_MG: 200,
    FIBER_MIN_G:        28,
    description: 'Mỡ máu cao — hạn chế chất béo bão hoà',
  },
} as const

// ── Scoring thresholds ────────────────────────────────────────────────────────
export const SCORE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD:      70,
  FAIR:      50,
  POOR:      30,
} as const

export const SCORE_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  excellent: { label: 'Xuất sắc', color: 'text-primary',     emoji: '🌟' },
  good:      { label: 'Tốt',      color: 'text-success',     emoji: '✅' },
  fair:      { label: 'Trung bình',color: 'text-warning-foreground', emoji: '⚠️' },
  poor:      { label: 'Cần cải thiện', color: 'text-destructive', emoji: '❌' },
}

// ── Macro scoring weights ──────────────────────────────────────────────────────
// Must sum to 1.0
export const SCORE_WEIGHTS = {
  calorie:   0.25,
  protein:   0.20,
  sugar:     0.18,
  sodium:    0.15,
  fiber:     0.12,
  diversity: 0.10,
} as const

// ── Alert rule definitions ─────────────────────────────────────────────────────
export interface AlertRule {
  id:       string
  nutrient: string
  severity: 'INFO' | 'WARNING' | 'DANGER'
  title:    string
  messageTemplate: (value: number, limit: number) => string
  recommendation: string
  conditions?: string[]  // only trigger for these conditions
}

export const ALERT_RULES: AlertRule[] = [
  {
    id: 'high_sodium',
    nutrient: 'sodium',
    severity: 'WARNING',
    title: 'Natri cao',
    messageTemplate: (v, l) => `Bạn đã nạp ${v.toFixed(0)}mg natri (giới hạn ${l}mg)`,
    recommendation: 'Hạn chế thực phẩm chế biến sẵn, nước mắm, muối. Tăng rau xanh và uống đủ nước.',
    conditions: ['HYPERTENSION'],
  },
  {
    id: 'very_high_sodium',
    nutrient: 'sodium',
    severity: 'DANGER',
    title: 'Natri rất cao',
    messageTemplate: (v, l) => `Natri ${v.toFixed(0)}mg vượt ${((v/l-1)*100).toFixed(0)}% giới hạn khuyến nghị`,
    recommendation: 'Cần giảm ngay lượng muối và thực phẩm mặn. Tham khảo bác sĩ nếu tình trạng kéo dài.',
  },
  {
    id: 'high_sugar',
    nutrient: 'sugar',
    severity: 'WARNING',
    title: 'Đường cao',
    messageTemplate: (v, l) => `Đường ${v.toFixed(0)}g (khuyến nghị <${l}g/ngày)`,
    recommendation: 'Giảm nước ngọt, bánh kẹo. Chọn trái cây tươi thay vì nước ép đóng hộp.',
    conditions: ['DIABETES'],
  },
  {
    id: 'low_fiber',
    nutrient: 'fiber',
    severity: 'INFO',
    title: 'Chất xơ thấp',
    messageTemplate: (v, l) => `Chỉ đạt ${v.toFixed(0)}g chất xơ (mục tiêu ${l}g)`,
    recommendation: 'Thêm rau xanh, đậu, ngũ cốc nguyên hạt vào bữa ăn. Mỗi bữa cần ít nhất 1 phần rau.',
  },
  {
    id: 'low_protein',
    nutrient: 'protein',
    severity: 'WARNING',
    title: 'Protein không đủ',
    messageTemplate: (v, l) => `Protein ${v.toFixed(0)}g (mục tiêu ${l}g)`,
    recommendation: 'Bổ sung thịt nạc, cá, trứng, đậu phụ, hoặc sữa chua vào các bữa ăn.',
  },
  {
    id: 'calorie_excess',
    nutrient: 'calories',
    severity: 'WARNING',
    title: 'Vượt calo mục tiêu',
    messageTemplate: (v, l) => `${v.toFixed(0)} kcal — vượt ${(v-l).toFixed(0)} kcal so với mục tiêu`,
    recommendation: 'Giảm khẩu phần hoặc chọn thực phẩm ít calo hơn trong bữa tối.',
  },
  {
    id: 'calorie_deficit_extreme',
    nutrient: 'calories',
    severity: 'WARNING',
    title: 'Calo quá thấp',
    messageTemplate: (v, l) => `Chỉ ${v.toFixed(0)} kcal — thiếu ${(l-v).toFixed(0)} kcal`,
    recommendation: 'Ăn không đủ calo có thể gây mất cơ và chậm trao đổi chất. Thêm bữa phụ lành mạnh.',
  },
]
