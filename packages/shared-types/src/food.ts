// ─── Food & Meal Types ─────────────────────────────────────────────────────
export type FoodCategory = 
  | 'VIETNAMESE' | 'ASIAN' | 'WESTERN' | 'BEVERAGE'
  | 'FRUIT' | 'VEGETABLE' | 'PROTEIN' | 'GRAIN' | 'DAIRY' | 'SNACK' | 'OTHER'

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

export interface FoodItem {
  id: string
  name: string
  nameEn: string | null
  category: FoodCategory
  brand: string | null
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  cholesterol: number
  saturatedFat: number
  transFat: number
  vitaminA: number | null
  vitaminC: number | null
  vitaminD: number | null
  calcium: number | null
  iron: number | null
  potassium: number | null
  isVerified: boolean
  imageUrl: string | null
  createdAt: string
}

export interface MealItem {
  id: string
  foodItemId: string
  foodName: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
}

export interface Meal {
  id: string
  userId: string
  mealType: MealType
  mealDate: string
  mealTime: string | null
  notes: string | null
  totalCalories: number
  totalProtein: number
  totalCarbohydrates: number
  totalFat: number
  totalFiber: number
  items: MealItem[]
  createdAt: string
  updatedAt: string
}

export interface DailySummary {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbohydrates: number
  totalFat: number
  totalFiber: number
  totalWaterMl: number
  calorieTarget: number | null
  proteinTarget: number | null
  carbTarget: number | null
  fatTarget: number | null
  meals: Meal[]
}

export interface WaterEntry {
  id: string
  amount: number
  logDate: string
  logTime: string | null
  notes: string | null
  createdAt: string
}

export interface WeightEntry {
  id: string
  weight: number
  weightUnit: 'KG' | 'LB'
  logDate: string
  notes: string | null
  bodyFat: number | null
  muscleMass: number | null
  bmi: number | null
  createdAt: string
}
