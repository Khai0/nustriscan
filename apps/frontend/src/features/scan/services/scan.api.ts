import apiClient from '@lib/axios'

export interface AILabel {
  description: string
  score: number
  topicality: number
}

export interface FoodMatch {
  foodItemId:    string
  foodName:      string
  nameEn:        string | null
  confidence:    number
  matchMethod:   'exact' | 'alias' | 'fuzzy' | 'keyword'
  servingSize:   number
  servingUnit:   string
  calories:      number
  protein:       number
  carbohydrates: number
  fat:           number
  fiber:         number
}

export interface ScanResult {
  scanId:       string
  imageUrl:     string
  thumbnail:    string | null
  status:       'UPLOADING' | 'PROCESSING' | 'MATCHING' | 'COMPLETED' | 'FAILED'
  aiProvider:   string
  processingMs: number | null
  matchingMs:   number
  matchedFoods: FoodMatch[]
  topMatch:     FoodMatch | null
  labels:       AILabel[]
}

export interface ConfirmScanPayload {
  foodItemId:    string
  mealType:      'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  mealDate:      string
  servingPreset?: 'small' | 'medium' | 'large'
  customGrams?:  number
  notes?:        string
}

export interface ConfirmResult {
  meal:          { id: string; totalCalories: number }
  scanId:        string
  confirmedFood: string
  quantity:      number
  unit:          string
  nutrition: {
    calories:      number
    protein:       number
    carbohydrates: number
    fat:           number
    fiber:         number
  }
}

export const scanApiService = {
  analyzeImage: async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<ScanResult> => {
    const form = new FormData()
    form.append('image', file)

    const res = await apiClient.post<{ data: ScanResult }>('/scans/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
    return res.data.data
  },

  confirmScan: async (
    scanId: string,
    payload: ConfirmScanPayload
  ): Promise<ConfirmResult> => {
    const res = await apiClient.post<{ data: ConfirmResult }>(
      `/scans/${scanId}/confirm`,
      payload
    )
    return res.data.data
  },

  getScanById: async (scanId: string): Promise<ScanResult> => {
    const res = await apiClient.get<{ data: ScanResult }>(`/scans/${scanId}`)
    return res.data.data
  },

  getHistory: async (page = 1, limit = 20) => {
    const res = await apiClient.get('/scans/history', { params: { page, limit } })
    return res.data
  },

  deleteScan: async (scanId: string): Promise<void> => {
    await apiClient.delete(`/scans/${scanId}`)
  },
}
