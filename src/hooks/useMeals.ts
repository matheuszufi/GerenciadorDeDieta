import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export interface Food {
  id: string
  name: string
  calories: number // por 100g
  protein: number // gramas por 100g
  carbs: number // gramas por 100g
  fat: number // gramas por 100g
  fiber: number // gramas por 100g
  sodium: number // mg por 100g
  sugar: number // gramas por 100g
}

export interface MealItem {
  id: string
  foodId: string
  foodName: string
  quantity: number // em gramas
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
  sugar: number
}

export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
  sugar: number
  water: number
}

export interface Meal {
  id: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  name: string
  items: MealItem[]
  totals: MacroTotals
  createdAt: string
}

export interface DailyMeals {
  date: string
  meals: Meal[]
  dailyTotals: MacroTotals
  userId: string
}

export const useMeals = () => {
  const { user } = useAuth()
  const [dailyMeals, setDailyMeals] = useState<DailyMeals | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Função para calcular totais de macronutrientes
  const calculateMealTotals = (meals: Meal[]): MacroTotals => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.totals.calories,
      protein: totals.protein + meal.totals.protein,
      carbs: totals.carbs + meal.totals.carbs,
      fat: totals.fat + meal.totals.fat,
      fiber: totals.fiber + meal.totals.fiber,
      sodium: totals.sodium + meal.totals.sodium,
      sugar: totals.sugar + meal.totals.sugar,
      water: totals.water + (meal.totals.water || 0)
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0,
      water: 0
    })
  }

  // Carregar refeições do dia atual
  const loadTodayMeals = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const mealsDoc = await getDoc(doc(db, 'daily-meals', `${user.id}_${today}`))
      
      if (mealsDoc.exists()) {
        const data = mealsDoc.data() as DailyMeals
        setDailyMeals(data)
      } else {
        // Criar estrutura vazia para o dia
        const emptyDayMeals: DailyMeals = {
          date: today,
          meals: [],
          dailyTotals: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sodium: 0,
            sugar: 0,
            water: 0
          },
          userId: user.id
        }
        setDailyMeals(emptyDayMeals)
      }
    } catch (err) {
      console.error('Erro ao carregar refeições:', err)
      setError('Erro ao carregar refeições do dia')
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar nova refeição
  const addMeal = async (meal: Omit<Meal, 'id' | 'createdAt'>) => {
    if (!user?.id || !dailyMeals) return

    try {
      const newMeal: Meal = {
        ...meal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }

      const updatedMeals = [...dailyMeals.meals, newMeal]
      const dailyTotals = calculateMealTotals(updatedMeals)

      const updatedDailyMeals: DailyMeals = {
        ...dailyMeals,
        meals: updatedMeals,
        dailyTotals
      }

      // Salvar no Firestore
      await setDoc(doc(db, 'daily-meals', `${user.id}_${today}`), updatedDailyMeals)
      
      setDailyMeals(updatedDailyMeals)
    } catch (err) {
      console.error('Erro ao adicionar refeição:', err)
      setError('Erro ao adicionar refeição')
    }
  }

  // Remover refeição
  const removeMeal = async (mealId: string) => {
    if (!user?.id || !dailyMeals) return

    try {
      const updatedMeals = dailyMeals.meals.filter(meal => meal.id !== mealId)
      const dailyTotals = calculateMealTotals(updatedMeals)

      const updatedDailyMeals: DailyMeals = {
        ...dailyMeals,
        meals: updatedMeals,
        dailyTotals
      }

      await setDoc(doc(db, 'daily-meals', `${user.id}_${today}`), updatedDailyMeals)
      
      setDailyMeals(updatedDailyMeals)
    } catch (err) {
      console.error('Erro ao remover refeição:', err)
      setError('Erro ao remover refeição')
    }
  }

  // Obter refeições por tipo
  const getMealsByType = (type: Meal['type']) => {
    return dailyMeals?.meals.filter(meal => meal.type === type) || []
  }

  // Calcular progresso da meta
  const calculateProgress = (dailyGoal: number) => {
    if (!dailyMeals || !dailyGoal) return 0
    return Math.min((dailyMeals.dailyTotals.calories / dailyGoal) * 100, 100)
  }

  useEffect(() => {
    loadTodayMeals()
  }, [user?.id, today])

  return {
    dailyMeals,
    isLoading,
    error,
    addMeal,
    removeMeal,
    getMealsByType,
    calculateProgress,
    refreshMeals: loadTodayMeals
  }
}