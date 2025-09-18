import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

interface ProfileData {
  name: string
  age?: number
  weight?: number
  height?: number
  gender: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete'
  goal: 'lose' | 'maintain' | 'gain' | 'muscle'
  tmb?: number
  get?: number
  updatedAt?: string
}

export interface MacroGoals {
  calories: number
  protein: number // gramas
  carbs: number // gramas
  fat: number // gramas
  fiber: number // gramas
  sodium: number // mg
  sugar: number // gramas
  water: number // ml
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        const profileDoc = await getDoc(doc(db, 'profiles', user.id))
        
        if (profileDoc.exists()) {
          const data = profileDoc.data() as ProfileData
          setProfile(data)
        } else {
          // Se não existe perfil, criar um básico
          setProfile({
            name: user.name,
            gender: 'male',
            activityLevel: 'sedentary',
            goal: 'maintain'
          })
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
        setError('Erro ao carregar dados do perfil')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user?.id, user?.name])

  // Função para calcular TMB se os dados estiverem disponíveis
  const calculateTMB = (profileData: ProfileData): number | null => {
    const { age, weight, height, gender } = profileData
    
    if (!age || !weight || !height) return null
    
    let tmb = 0
    
    if (gender === 'male') {
      tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5
    } else {
      tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161
    }
    
    return Math.round(tmb)
  }

  // Função para calcular GET se TMB estiver disponível
  const calculateGET = (profileData: ProfileData): number | null => {
    const tmb = calculateTMB(profileData)
    if (!tmb) return null
    
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      intense: 1.725,
      athlete: 1.9
    }
    
    const factor = activityFactors[profileData.activityLevel]
    return Math.round(tmb * factor)
  }

  // Calcular TMB e GET atuais
  const currentTMB = profile ? calculateTMB(profile) : null
  const currentGET = profile ? calculateGET(profile) : null

  // Função para calcular meta diária baseada no objetivo
  const calculateDailyGoal = (get: number, goal: string): number => {
    if (!get) return get
    
    switch (goal) {
      case 'lose':
        return Math.round(get * 0.8) // Déficit de 20%
      case 'gain':
        return Math.round(get * 1.2) // Superávit de 20%
      case 'muscle':
        return Math.round(get * 1.15) // Superávit de 15%
      case 'maintain':
      default:
        return get
    }
  }

  const dailyGoal = currentGET && profile ? calculateDailyGoal(currentGET, profile.goal) : null

  // Função para calcular metas de macronutrientes
  const calculateMacroGoals = (calories: number, goal: string, weight?: number): MacroGoals => {
    if (!calories) return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0,
      water: 0
    }

    // Distribuição de macronutrientes baseada no objetivo
    let proteinPercentage = 0.25 // 25% padrão
    let fatPercentage = 0.25 // 25% padrão
    let carbPercentage = 0.50 // 50% padrão

    switch (goal) {
      case 'lose':
        proteinPercentage = 0.30 // Mais proteína para preservar massa muscular
        fatPercentage = 0.25
        carbPercentage = 0.45
        break
      case 'muscle':
        proteinPercentage = 0.30 // Alta proteína para ganho muscular
        fatPercentage = 0.20
        carbPercentage = 0.50
        break
      case 'gain':
        proteinPercentage = 0.20
        fatPercentage = 0.30
        carbPercentage = 0.50
        break
      default: // maintain
        proteinPercentage = 0.25
        fatPercentage = 0.25
        carbPercentage = 0.50
    }

    // Cálculos dos macronutrientes
    const proteinCalories = calories * proteinPercentage
    const fatCalories = calories * fatPercentage
    const carbCalories = calories * carbPercentage

    // Conversão para gramas (proteína = 4kcal/g, carbo = 4kcal/g, gordura = 9kcal/g)
    const protein = Math.round(proteinCalories / 4)
    const carbs = Math.round(carbCalories / 4)
    const fat = Math.round(fatCalories / 9)

    // Fibra: 14g por 1000 kcal (recomendação dietética)
    const fiber = Math.round((calories / 1000) * 14)

    // Sódio: máximo 2300mg por dia (recomendação OMS)
    const sodium = 2300

    // Açúcar: máximo 10% das calorias totais (recomendação OMS)
    const sugar = Math.round((calories * 0.10) / 4)

    // Água: 35ml por kg de peso corporal (recomendação geral)
    // Se não tiver peso, usar 2000ml como padrão
    const water = weight ? Math.round(weight * 35) : 2000

    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
      sugar,
      water
    }
  }

  const macroGoals = dailyGoal ? calculateMacroGoals(dailyGoal, profile?.goal || 'maintain', profile?.weight) : null

  return {
    profile,
    isLoading,
    error,
    tmb: currentTMB,
    get: currentGET,
    dailyGoal,
    macroGoals,
    hasCompleteProfile: !!(profile?.age && profile?.weight && profile?.height)
  }
}