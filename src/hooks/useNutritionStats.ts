import { useMemo } from 'react'
import type { Meal } from '../types/index'

interface NutritionCalculation {
  protein: {
    consumed: number
    target: number
    calories: number
    percentage: number
  }
  carbs: {
    consumed: number
    target: number
    calories: number
    percentage: number
  }
  fat: {
    consumed: number
    target: number
    calories: number
    percentage: number
  }
  calories: {
    consumed: number
    target: number
    remaining: number
    percentage: number
  }
  fiber: {
    consumed: number
    recommended: number
  }
  sugar: {
    consumed: number
    limit: number
  }
}

interface UseNutritionStatsProps {
  meals: Meal[]
  userProfile?: {
    weight?: number
    height?: number
    age?: number
    gender?: 'male' | 'female'
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
    goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight'
  }
  customTargets?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

export const useNutritionStats = ({ 
  meals, 
  userProfile, 
  customTargets 
}: UseNutritionStatsProps): NutritionCalculation => {
  return useMemo(() => {
    // Calcular totais consumidos
    const totalNutrition = meals.reduce((acc, meal) => {
      meal.dishes.forEach(dish => {
        const servings = dish.servings || 1
        acc.calories += (dish.dish.calories || 0) * servings
        acc.protein += (dish.dish.protein || 0) * servings
        acc.carbs += (dish.dish.carbs || 0) * servings
        acc.fat += (dish.dish.fat || 0) * servings
        acc.fiber += (dish.dish.fiber || 0) * servings
        acc.sugar += (dish.dish.sugar || 0) * servings
      })
      return acc
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    })

    // Calcular metas baseadas no perfil do usuário ou valores customizados
    const targets = calculateTargets(userProfile, customTargets)

    // Calcular estatísticas finais
    const proteinCalories = totalNutrition.protein * 4
    const carbsCalories = totalNutrition.carbs * 4
    const fatCalories = totalNutrition.fat * 9

    return {
      protein: {
        consumed: totalNutrition.protein,
        target: targets.protein,
        calories: proteinCalories,
        percentage: (totalNutrition.protein / targets.protein) * 100
      },
      carbs: {
        consumed: totalNutrition.carbs,
        target: targets.carbs,
        calories: carbsCalories,
        percentage: (totalNutrition.carbs / targets.carbs) * 100
      },
      fat: {
        consumed: totalNutrition.fat,
        target: targets.fat,
        calories: fatCalories,
        percentage: (totalNutrition.fat / targets.fat) * 100
      },
      calories: {
        consumed: totalNutrition.calories,
        target: targets.calories,
        remaining: Math.max(0, targets.calories - totalNutrition.calories),
        percentage: (totalNutrition.calories / targets.calories) * 100
      },
      fiber: {
        consumed: totalNutrition.fiber,
        recommended: targets.fiber
      },
      sugar: {
        consumed: totalNutrition.sugar,
        limit: targets.sugar
      }
    }
  }, [meals, userProfile, customTargets])
}

function calculateTargets(
  userProfile?: UseNutritionStatsProps['userProfile'],
  customTargets?: UseNutritionStatsProps['customTargets']
) {
  // Se há metas customizadas, use elas
  if (customTargets) {
    return {
      calories: customTargets.calories || 2000,
      protein: customTargets.protein || 150,
      carbs: customTargets.carbs || 250,
      fat: customTargets.fat || 65,
      fiber: 25,
      sugar: 50
    }
  }

  // Se não há perfil, use valores padrão
  if (!userProfile || !userProfile.weight || !userProfile.height || !userProfile.age) {
    return {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65,
      fiber: 25,
      sugar: 50
    }
  }

  // Calcular BMR (Taxa Metabólica Basal) usando fórmula de Mifflin-St Jeor
  let bmr: number
  if (userProfile.gender === 'male') {
    bmr = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age) + 5
  } else {
    bmr = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age) - 161
  }

  // Multiplicadores de atividade
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  }

  const activityMultiplier = activityMultipliers[userProfile.activityLevel || 'moderately_active']
  let tdee = bmr * activityMultiplier

  // Ajustar baseado no objetivo
  switch (userProfile.goal) {
    case 'lose_weight':
      tdee -= 500 // Déficit de 500 calorias
      break
    case 'gain_weight':
      tdee += 500 // Surplus de 500 calorias
      break
    default:
      // maintain_weight - manter TDEE
      break
  }

  // Calcular macronutrientes baseado em percentuais padrão
  const proteinPercentage = 0.25 // 25% das calorias
  const fatPercentage = 0.25     // 25% das calorias
  const carbsPercentage = 0.50   // 50% das calorias

  const proteinCalories = tdee * proteinPercentage
  const fatCalories = tdee * fatPercentage
  const carbsCalories = tdee * carbsPercentage

  return {
    calories: Math.round(tdee),
    protein: Math.round(proteinCalories / 4), // 4 cal/g
    carbs: Math.round(carbsCalories / 4),     // 4 cal/g
    fat: Math.round(fatCalories / 9),         // 9 cal/g
    fiber: userProfile.gender === 'male' ? 38 : 25, // Recomendações da FDA
    sugar: Math.round(tdee * 0.10 / 4) // Máximo 10% das calorias em açúcar
  }
}

export default useNutritionStats