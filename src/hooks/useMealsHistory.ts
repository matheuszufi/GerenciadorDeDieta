import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import type { DailyMeals, MacroTotals } from './useMeals'

export interface DayStats {
  date: string
  consumed: MacroTotals
  goals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  percentages: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  mealsCount: number
}

export interface HistoryStats {
  averageCalories: number
  averageProtein: number
  averageCarbs: number
  averageFat: number
  averageFiber: number
  daysWithCompleteData: number
  totalDays: number
  streak: number // dias consecutivos com registro
}

export const useMealsHistory = () => {
  const { user } = useAuth()
  const [historyData, setHistoryData] = useState<DayStats[]>([])
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para formatar data
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Função para obter array de datas dos últimos N dias
  const getLastDays = (days: number): string[] => {
    const dates: string[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(formatDate(date))
    }
    return dates.reverse() // Ordenar do mais antigo para o mais recente
  }

  // Função para buscar metas do usuário
  const getUserGoals = async () => {
    if (!user?.id) return null

    try {
      const profileDoc = await getDoc(doc(db, 'profiles', user.id))
      if (profileDoc.exists()) {
        const data = profileDoc.data()
        return {
          calories: data.dailyGoal || 2000,
          protein: data.macroGoals?.protein || 150,
          carbs: data.macroGoals?.carbs || 250,
          fat: data.macroGoals?.fat || 67,
          fiber: data.macroGoals?.fiber || 25
        }
      }
      return null
    } catch (err) {
      console.error('Erro ao buscar metas do usuário:', err)
      return null
    }
  }

  // Carregar histórico dos últimos dias
  const loadHistory = async (days: number = 30) => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const dates = getLastDays(days)
      const goals = await getUserGoals()
      
      if (!goals) {
        setError('Não foi possível carregar as metas do usuário')
        return
      }

      const historyPromises = dates.map(async (date) => {
        try {
          const docRef = doc(db, 'daily-meals', `${user.id}_${date}`)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            const data = docSnap.data() as DailyMeals
            
            const percentages = {
              calories: goals.calories > 0 ? (data.dailyTotals.calories / goals.calories) * 100 : 0,
              protein: goals.protein > 0 ? (data.dailyTotals.protein / goals.protein) * 100 : 0,
              carbs: goals.carbs > 0 ? (data.dailyTotals.carbs / goals.carbs) * 100 : 0,
              fat: goals.fat > 0 ? (data.dailyTotals.fat / goals.fat) * 100 : 0,
              fiber: goals.fiber > 0 ? (data.dailyTotals.fiber / goals.fiber) * 100 : 0
            }

            return {
              date,
              consumed: data.dailyTotals,
              goals,
              percentages,
              mealsCount: data.meals.length
            } as DayStats
          } else {
            // Dia sem dados
            return {
              date,
              consumed: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sodium: 0,
                sugar: 0,
                water: 0
              },
              goals,
              percentages: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0
              },
              mealsCount: 0
            } as DayStats
          }
        } catch (err) {
          console.error(`Erro ao carregar dados do dia ${date}:`, err)
          return null
        }
      })

      const results = await Promise.all(historyPromises)
      const validResults = results.filter(Boolean) as DayStats[]
      
      setHistoryData(validResults)
      calculateStats(validResults)

    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
      setError('Erro ao carregar histórico de metas')
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular estatísticas do histórico
  const calculateStats = (data: DayStats[]) => {
    if (data.length === 0) {
      setStats(null)
      return
    }

    const daysWithData = data.filter(day => day.mealsCount > 0)
    const totalDays = data.length
    const daysWithCompleteData = daysWithData.length

    if (daysWithCompleteData === 0) {
      setStats({
        averageCalories: 0,
        averageProtein: 0,
        averageCarbs: 0,
        averageFat: 0,
        averageFiber: 0,
        daysWithCompleteData: 0,
        totalDays,
        streak: 0
      })
      return
    }

    // Calcular médias
    const totals = daysWithData.reduce((acc, day) => ({
      calories: acc.calories + day.consumed.calories,
      protein: acc.protein + day.consumed.protein,
      carbs: acc.carbs + day.consumed.carbs,
      fat: acc.fat + day.consumed.fat,
      fiber: acc.fiber + day.consumed.fiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

    // Calcular streak (dias consecutivos com registro a partir de hoje)
    let streak = 0
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].mealsCount > 0) {
        streak++
      } else {
        break
      }
    }

    setStats({
      averageCalories: Math.round(totals.calories / daysWithCompleteData),
      averageProtein: Math.round((totals.protein / daysWithCompleteData) * 10) / 10,
      averageCarbs: Math.round((totals.carbs / daysWithCompleteData) * 10) / 10,
      averageFat: Math.round((totals.fat / daysWithCompleteData) * 10) / 10,
      averageFiber: Math.round((totals.fiber / daysWithCompleteData) * 10) / 10,
      daysWithCompleteData,
      totalDays,
      streak
    })
  }

  // Obter dados de um dia específico
  const getDayData = (date: string): DayStats | null => {
    return historyData.find(day => day.date === date) || null
  }

  // Obter dados dos últimos N dias
  const getLastDaysData = (days: number): DayStats[] => {
    return historyData.slice(-days)
  }

  return {
    historyData,
    stats,
    isLoading,
    error,
    loadHistory,
    getDayData,
    getLastDaysData
  }
}