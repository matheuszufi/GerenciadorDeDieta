import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export interface NutritionalValues {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
  sugar: number
  water?: number
}

export interface FoodUnit {
  name: string
  abbreviation: string
  gramsEquivalent: number // quantos gramas representa esta unidade
}

export interface Food {
  id: string
  name: string
  brand?: string
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'dairy' | 'grains' | 'fats' | 'beverages' | 'others'
  nutrition: NutritionalValues // por 100g/ml do peso base
  baseUnit: 'g' | 'ml' // unidade base para os valores nutricionais
  availableUnits: FoodUnit[] // unidades disponíveis para este alimento
  defaultUnit: string // unidade padrão para exibição
  isCustom: boolean // se foi criado pelo usuário
  userId?: string // para alimentos customizados
  isPublic: boolean // se pode ser usado por outros usuários
  createdAt: string
  updatedAt: string
}

export function useFoods() {
  const { user } = useAuth()
  const [foods, setFoods] = useState<Food[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para calcular nutrição baseada na quantidade e unidade
  const calculateNutrition = (food: Food, quantity: number, unit: string): NutritionalValues => {
    // Encontrar a unidade selecionada
    const selectedUnit = food.availableUnits.find(u => u.abbreviation === unit)
    if (!selectedUnit) {
      throw new Error(`Unidade ${unit} não encontrada para ${food.name}`)
    }

    // Calcular o peso em gramas baseado na quantidade e unidade
    const totalGrams = quantity * selectedUnit.gramsEquivalent

    // Calcular a proporção baseada em 100g do alimento base
    const proportion = totalGrams / 100

    // Aplicar a proporção aos valores nutricionais
    return {
      calories: Math.round(food.nutrition.calories * proportion * 10) / 10,
      protein: Math.round(food.nutrition.protein * proportion * 10) / 10,
      carbs: Math.round(food.nutrition.carbs * proportion * 10) / 10,
      fat: Math.round(food.nutrition.fat * proportion * 10) / 10,
      fiber: Math.round(food.nutrition.fiber * proportion * 10) / 10,
      sodium: Math.round(food.nutrition.sodium * proportion * 10) / 10,
      sugar: Math.round(food.nutrition.sugar * proportion * 10) / 10,
      water: food.nutrition.water ? Math.round(food.nutrition.water * proportion * 10) / 10 : undefined
    }
  }

  // Carregar alimentos (padrão + customizados do usuário)
  const loadFoods = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      // Buscar alimentos padrão (isCustom = false)
      const defaultFoodsQuery = query(
        collection(db, 'foods'), 
        where('isCustom', '==', false)
      )
      const defaultFoodsSnapshot = await getDocs(defaultFoodsQuery)
      
      // Buscar alimentos customizados do usuário
      const userFoodsQuery = query(
        collection(db, 'foods'),
        where('userId', '==', user.id),
        where('isCustom', '==', true)
      )
      const userFoodsSnapshot = await getDocs(userFoodsQuery)
      
      // Buscar alimentos públicos de outros usuários
      const publicFoodsQuery = query(
        collection(db, 'foods'),
        where('isPublic', '==', true),
        where('isCustom', '==', true)
      )
      const publicFoodsSnapshot = await getDocs(publicFoodsQuery)

      const allFoods: Food[] = []
      
      defaultFoodsSnapshot.forEach(doc => {
        allFoods.push({ id: doc.id, ...doc.data() } as Food)
      })
      
      userFoodsSnapshot.forEach(doc => {
        allFoods.push({ id: doc.id, ...doc.data() } as Food)
      })
      
      publicFoodsSnapshot.forEach(doc => {
        // Evitar duplicatas dos próprios alimentos do usuário
        if (doc.data().userId !== user.id) {
          allFoods.push({ id: doc.id, ...doc.data() } as Food)
        }
      })

      setFoods(allFoods)
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar alimentos:', err)
      setError('Erro ao carregar alimentos')
    } finally {
      setIsLoading(false)
    }
  }

  // Adicionar novo alimento customizado
  const addCustomFood = async (foodData: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const now = new Date().toISOString()
      const newFood = {
        ...foodData,
        userId: user.id,
        isCustom: true,
        createdAt: now,
        updatedAt: now
      }

      const docRef = await addDoc(collection(db, 'foods'), newFood)
      const createdFood = { id: docRef.id, ...newFood }
      
      setFoods(prev => [...prev, createdFood])
      return createdFood
    } catch (err) {
      console.error('Erro ao adicionar alimento:', err)
      throw new Error('Erro ao adicionar alimento')
    }
  }

  // Atualizar alimento customizado
  const updateCustomFood = async (foodId: string, updates: Partial<Food>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const foodRef = doc(db, 'foods', foodId)
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      await updateDoc(foodRef, updateData)
      
      setFoods(prev => prev.map(food => 
        food.id === foodId ? { ...food, ...updateData } : food
      ))
    } catch (err) {
      console.error('Erro ao atualizar alimento:', err)
      throw new Error('Erro ao atualizar alimento')
    }
  }

  // Deletar alimento customizado
  const deleteCustomFood = async (foodId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      await deleteDoc(doc(db, 'foods', foodId))
      setFoods(prev => prev.filter(food => food.id !== foodId))
    } catch (err) {
      console.error('Erro ao deletar alimento:', err)
      throw new Error('Erro ao deletar alimento')
    }
  }

  // Buscar alimentos por categoria
  const getFoodsByCategory = (category: Food['category']) => {
    return foods.filter(food => food.category === category)
  }

  // Buscar alimentos por texto
  const searchFoods = (searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return foods.filter(food => 
      food.name.toLowerCase().includes(term) ||
      (food.brand && food.brand.toLowerCase().includes(term))
    )
  }

  useEffect(() => {
    if (user) {
      loadFoods()
    }
  }, [user])

  return {
    foods,
    isLoading,
    error,
    addCustomFood,
    updateCustomFood,
    deleteCustomFood,
    getFoodsByCategory,
    searchFoods,
    calculateNutrition,
    reloadFoods: loadFoods
  }
}