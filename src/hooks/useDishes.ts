import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { Food, NutritionalValues } from './useFoods'

export interface DishIngredient {
  foodId: string
  foodName: string
  quantity: number // quantidade na unidade escolhida
  unit: string // unidade escolhida (ex: 'unid', 'g', 'ml', 'fatia')
  nutrition: NutritionalValues // valores calculados para a quantidade e unidade
}

export interface Dish {
  id: string
  name: string
  description?: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'beverage' | 'other'
  ingredients: DishIngredient[]
  totalNutrition: NutritionalValues // soma de todos os ingredientes
  servings: number // quantas porções o prato rende
  nutritionPerServing: NutritionalValues // nutrição por porção
  userId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export function useDishes() {
  const { user } = useAuth()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Criar ingrediente com cálculo de nutrição baseado na unidade
  const createIngredient = (food: Food, quantity: number, unit: string): DishIngredient => {
    // Validar parâmetros
    if (!food || !food.id || !food.name) {
      throw new Error('Alimento inválido')
    }
    
    if (!quantity || quantity <= 0 || isNaN(quantity)) {
      throw new Error('Quantidade deve ser maior que 0')
    }
    
    if (!unit || unit.trim().length === 0) {
      throw new Error('Unidade é obrigatória')
    }

    // Encontrar a unidade selecionada
    const selectedUnit = food.availableUnits.find(u => u.abbreviation === unit)
    if (!selectedUnit) {
      throw new Error(`Unidade ${unit} não encontrada para ${food.name}`)
    }

    // Calcular o peso em gramas baseado na quantidade e unidade
    const totalGrams = quantity * selectedUnit.gramsEquivalent
    const proportion = totalGrams / 100

    // Garantir que todos os valores de nutrição existam
    const foodNutrition = food.nutrition || {}
    
    const nutrition: NutritionalValues = {
      calories: Math.round((foodNutrition.calories || 0) * proportion * 10) / 10,
      protein: Math.round((foodNutrition.protein || 0) * proportion * 10) / 10,
      carbs: Math.round((foodNutrition.carbs || 0) * proportion * 10) / 10,
      fat: Math.round((foodNutrition.fat || 0) * proportion * 10) / 10,
      fiber: Math.round((foodNutrition.fiber || 0) * proportion * 10) / 10,
      sodium: Math.round((foodNutrition.sodium || 0) * proportion * 10) / 10,
      sugar: Math.round((foodNutrition.sugar || 0) * proportion * 10) / 10,
      water: Math.round((foodNutrition.water || 0) * proportion * 10) / 10
    }

    // Verificar se algum valor é NaN e substituir por 0
    Object.keys(nutrition).forEach(key => {
      const value = nutrition[key as keyof NutritionalValues]
      if (isNaN(value as number)) {
        nutrition[key as keyof NutritionalValues] = 0
      }
    })

    return {
      foodId: food.id,
      foodName: food.name,
      quantity: Math.round(quantity * 10) / 10, // Arredondar quantidade também
      unit,
      nutrition
    }
  }

  // Calcular nutrição total dos ingredientes
  const calculateTotalNutrition = (ingredients: DishIngredient[]): NutritionalValues => {
    if (!ingredients || ingredients.length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        sugar: 0,
        water: 0
      }
    }

    const total = ingredients.reduce((total, ingredient) => {
      const nutrition = ingredient.nutrition || {}
      return {
        calories: (total.calories || 0) + (nutrition.calories || 0),
        protein: (total.protein || 0) + (nutrition.protein || 0),
        carbs: (total.carbs || 0) + (nutrition.carbs || 0),
        fat: (total.fat || 0) + (nutrition.fat || 0),
        fiber: (total.fiber || 0) + (nutrition.fiber || 0),
        sodium: (total.sodium || 0) + (nutrition.sodium || 0),
        sugar: (total.sugar || 0) + (nutrition.sugar || 0),
        water: (total.water || 0) + (nutrition.water || 0)
      }
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0,
      water: 0
    })

    // Remover campos undefined ou NaN
    Object.keys(total).forEach(key => {
      const value = total[key as keyof NutritionalValues]
      if (value === undefined || isNaN(value as number)) {
        total[key as keyof NutritionalValues] = 0
      }
    })

    return total
  }

  // Calcular nutrição por porção
  const calculateNutritionPerServing = (totalNutrition: NutritionalValues, servings: number): NutritionalValues => {
    if (!totalNutrition || servings <= 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        sugar: 0,
        water: 0
      }
    }

    const perServing = {
      calories: Math.round((totalNutrition.calories || 0) / servings),
      protein: Math.round(((totalNutrition.protein || 0) / servings) * 10) / 10,
      carbs: Math.round(((totalNutrition.carbs || 0) / servings) * 10) / 10,
      fat: Math.round(((totalNutrition.fat || 0) / servings) * 10) / 10,
      fiber: Math.round(((totalNutrition.fiber || 0) / servings) * 10) / 10,
      sodium: Math.round((totalNutrition.sodium || 0) / servings),
      sugar: Math.round(((totalNutrition.sugar || 0) / servings) * 10) / 10,
      water: Math.round(((totalNutrition.water || 0) / servings) * 10) / 10
    }

    // Remover campos undefined ou NaN
    Object.keys(perServing).forEach(key => {
      const value = perServing[key as keyof NutritionalValues]
      if (value === undefined || isNaN(value as number)) {
        perServing[key as keyof NutritionalValues] = 0
      }
    })

    return perServing
  }

  // Carregar pratos do usuário
  const loadDishes = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Buscar pratos do usuário
      const userDishesQuery = query(
        collection(db, 'dishes'),
        where('userId', '==', user.id)
      )
      const userDishesSnapshot = await getDocs(userDishesQuery)
      
      // Buscar pratos públicos de outros usuários
      const publicDishesQuery = query(
        collection(db, 'dishes'),
        where('isPublic', '==', true)
      )
      const publicDishesSnapshot = await getDocs(publicDishesQuery)
      
      const loadedDishes: Dish[] = []
      
      userDishesSnapshot.forEach(doc => {
        loadedDishes.push({ id: doc.id, ...doc.data() } as Dish)
      })
      
      publicDishesSnapshot.forEach(doc => {
        // Evitar duplicatas (pratos públicos do próprio usuário)
        if (!loadedDishes.some(dish => dish.id === doc.id)) {
          loadedDishes.push({ id: doc.id, ...doc.data() } as Dish)
        }
      })
      
      setDishes(loadedDishes)
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar pratos:', err)
      setError('Erro ao carregar pratos')
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar novo prato
  const addDish = async (dishData: Omit<Dish, 'id' | 'totalNutrition' | 'nutritionPerServing' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      console.log('🔵 [DEBUG] Dados do prato recebidos:', dishData)
      console.log('🔵 [DEBUG] Usuário atual:', { id: user.id, email: user.email })
      console.log('🔵 [DEBUG] Ingredientes:', dishData.ingredients)
      
      // Validar dados obrigatórios
      if (!dishData.name || dishData.name.trim().length === 0) {
        throw new Error('Nome do prato é obrigatório')
      }
      
      if (!dishData.ingredients || dishData.ingredients.length === 0) {
        throw new Error('Pelo menos um ingrediente é obrigatório')
      }
      
      if (!dishData.servings || dishData.servings < 1) {
        throw new Error('Número de porções deve ser maior que 0')
      }
      
      console.log('🔵 [DEBUG] Calculando nutrição...')
      const totalNutrition = calculateTotalNutrition(dishData.ingredients)
      const nutritionPerServing = calculateNutritionPerServing(totalNutrition, dishData.servings)
      
      console.log('🔵 [DEBUG] Nutrição total calculada:', totalNutrition)
      console.log('🔵 [DEBUG] Nutrição por porção:', nutritionPerServing)
      
      const now = new Date().toISOString()
      
      // Criar objeto limpo sem valores undefined
      const cleanDishData: any = {
        name: dishData.name.trim(),
        category: dishData.category,
        ingredients: dishData.ingredients,
        servings: dishData.servings,
        isPublic: Boolean(dishData.isPublic),
        totalNutrition,
        nutritionPerServing,
        userId: user.id,
        createdAt: now,
        updatedAt: now
      }
      
      // Adicionar descrição apenas se existir
      if (dishData.description && dishData.description.trim().length > 0) {
        cleanDishData.description = dishData.description.trim()
      }

      console.log('🔵 [DEBUG] Objeto limpo preparado para Firebase:', cleanDishData)
      
      // Verificar se o Firebase está disponível
      if (!db) {
        throw new Error('Firestore não está disponível')
      }
      
      console.log('🔵 [DEBUG] Enviando para Firebase...')
      const docRef = await addDoc(collection(db, 'dishes'), cleanDishData)
      console.log('✅ [DEBUG] Documento criado com sucesso! ID:', docRef.id)
      
      const createdDish = { id: docRef.id, ...cleanDishData }
      
      setDishes(prev => [...prev, createdDish])
      console.log('✅ [DEBUG] Estado local atualizado')
      
      return createdDish
    } catch (err) {
      console.error('❌ [DEBUG] Erro completo ao adicionar prato:', err)
      console.error('❌ [DEBUG] Stack trace:', err instanceof Error ? err.stack : 'N/A')
      console.error('❌ [DEBUG] Tipo do erro:', typeof err)
      console.error('❌ [DEBUG] Propriedades do erro:', Object.keys(err || {}))
      
      if (err instanceof Error) {
        console.error('❌ [DEBUG] Mensagem:', err.message)
        console.error('❌ [DEBUG] Nome:', err.name)
        if ('code' in err) {
          console.error('❌ [DEBUG] Código:', (err as any).code)
        }
        throw err // Re-throw validation errors as-is
      }
      throw new Error('Erro ao adicionar prato')
    }
  }

  // Atualizar prato
  const updateDish = async (dishId: string, updates: Partial<Omit<Dish, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      let updateData = { ...updates }
      
      // Recalcular nutrição se ingredientes ou porções foram alterados
      if (updates.ingredients || updates.servings) {
        const dish = dishes.find(d => d.id === dishId)
        if (dish) {
          const ingredients = updates.ingredients || dish.ingredients
          const servings = updates.servings || dish.servings
          
          const totalNutrition = calculateTotalNutrition(ingredients)
          const nutritionPerServing = calculateNutritionPerServing(totalNutrition, servings)
          
          updateData = {
            ...updateData,
            totalNutrition,
            nutritionPerServing
          }
        }
      }
      
      updateData.updatedAt = new Date().toISOString()

      // Remover campos undefined antes de salvar no Firebase
      const cleanUpdateData = { ...updateData }
      Object.keys(cleanUpdateData).forEach(key => {
        if (cleanUpdateData[key as keyof typeof cleanUpdateData] === undefined) {
          delete cleanUpdateData[key as keyof typeof cleanUpdateData]
        }
      })

      await updateDoc(doc(db, 'dishes', dishId), cleanUpdateData)
      
      setDishes(prev => prev.map(dish => 
        dish.id === dishId ? { ...dish, ...cleanUpdateData } : dish
      ))
    } catch (err) {
      console.error('Erro ao atualizar prato:', err)
      throw new Error('Erro ao atualizar prato')
    }
  }

  // Deletar prato
  const deleteDish = async (dishId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      await deleteDoc(doc(db, 'dishes', dishId))
      setDishes(prev => prev.filter(dish => dish.id !== dishId))
    } catch (err) {
      console.error('Erro ao deletar prato:', err)
      throw new Error('Erro ao deletar prato')
    }
  }

  // Buscar pratos por categoria
  const getDishesByCategory = (category: Dish['category']) => {
    return dishes.filter(dish => dish.category === category)
  }

  // Buscar pratos por texto
  const searchDishes = (searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return dishes.filter(dish => 
      dish.name.toLowerCase().includes(term) ||
      (dish.description && dish.description.toLowerCase().includes(term))
    )
  }

  // Obter pratos do usuário
  const getUserDishes = () => {
    return dishes.filter(dish => dish.userId === user?.id)
  }

  useEffect(() => {
    if (user) {
      loadDishes()
    }
  }, [user])

  return {
    dishes,
    isLoading,
    error,
    addDish,
    updateDish,
    deleteDish,
    getDishesByCategory,
    searchDishes,
    getUserDishes,
    createIngredient,
    calculateTotalNutrition,
    calculateNutritionPerServing,
    reloadDishes: loadDishes
  }
}