// ─── Nutrition ─────────────────────────────────────────────────────────────
export interface NutritionData {
  calories: number
  protein: number       // grams
  carbohydrates: number // grams
  fat: number           // grams
  fiber: number         // grams
  sugar?: number        // grams
  sodium?: number       // mg
  cholesterol?: number  // mg
  vitamins?: Record<string, number>
  minerals?: Record<string, number>
}

// ─── Scan ──────────────────────────────────────────────────────────────────
export interface ScanResult extends NutritionData {
  id: string
  userId: string
  imagePath: string
  foodName: string
  confidence: number   // 0–1 float
  servingSize?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ScanHistory {
  scans: ScanResult[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AnalyzeImageRequest {
  image: File // multipart/form-data
}

// ─── Phase 5 — AI Scan types ────────────────────────────────────────────────

export type ScanStatus = 'UPLOADING' | 'PROCESSING' | 'MATCHING' | 'COMPLETED' | 'FAILED'

export type AIProvider = 'google_vision' | 'yolov8' | 'mock'

export type MatchMethod = 'exact' | 'alias' | 'fuzzy' | 'keyword'

export interface AILabel {
  description: string
  score:       number
  topicality:  number
  mid?:        string
}

export interface FoodMatchResult {
  foodItemId:    string
  foodName:      string
  nameEn:        string | null
  confidence:    number
  matchMethod:   MatchMethod
  servingSize:   number
  servingUnit:   string
  calories:      number
  protein:       number
  carbohydrates: number
  fat:           number
  fiber:         number
}

export interface FoodScan {
  id:             string
  userId:         string
  imageUrl:       string
  thumbnail:      string | null
  status:         ScanStatus
  aiProvider:     AIProvider
  matchedFoods:   FoodMatchResult[]
  topMatch:       FoodMatchResult | null
  labels:         AILabel[]
  processingMs:   number | null
  matchingMs:     number | null
  confirmedMealId:string | null
  errorMessage:   string | null
  createdAt:      string
  updatedAt:      string
}

export type ServingPreset = 'small' | 'medium' | 'large'

export interface ConfirmScanRequest {
  foodItemId:    string
  mealType:      'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  mealDate:      string
  servingPreset?: ServingPreset
  customGrams?:  number
  notes?:        string
}
