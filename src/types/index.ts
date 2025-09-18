// Types for the Diet Management App

export interface Dish {
  id: string
  name: string
  description?: string
  category?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
  sodium?: number
  servingSize?: string
  ingredients?: Ingredient[]
  createdAt?: Date
  updatedAt?: Date
  userId?: string
}

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
}

export interface MealDish {
  dish: Dish
  servings: number
  addedAt?: Date
}

export interface Meal {
  id: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string // YYYY-MM-DD format
  dishes: MealDish[]
  createdAt?: Date
  updatedAt?: Date
  userId?: string
}

export interface UserProfile {
  id: string
  name?: string
  email: string
  weight?: number // kg
  height?: number // cm
  age?: number
  gender?: 'male' | 'female'
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight'
  createdAt?: Date
  updatedAt?: Date
}

export interface NutritionTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface DailyNutrition {
  date: string
  meals: Meal[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
  totalSugar: number
  targets: NutritionTargets
}

export interface WeeklyStats {
  startDate: string
  endDate: string
  averageCalories: number
  averageProtein: number
  averageCarbs: number
  averageFat: number
  dailyData: DailyNutrition[]
}

// Form interfaces
export interface DishFormData {
  name: string
  description: string
  category: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  servingSize: string
  ingredients: IngredientFormData[]
}

export interface IngredientFormData {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MealFormData {
  type: Meal['type']
  dishId: string
  servings: number
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter and search interfaces
export interface DishFilters {
  category?: string
  minCalories?: number
  maxCalories?: number
  minProtein?: number
  maxProtein?: number
  search?: string
}

export interface MealFilters {
  type?: Meal['type']
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Chart and visualization data
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface MacroDistribution {
  protein: number
  carbs: number
  fat: number
  other?: number
}

export interface ProgressData {
  current: number
  target: number
  percentage: number
  trend?: 'up' | 'down' | 'stable'
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
export type WeightGoal = 'lose_weight' | 'maintain_weight' | 'gain_weight'
export type Gender = 'male' | 'female'