import { collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Food, FoodUnit } from '../hooks/useFoods'

// Unidades comuns para diferentes tipos de alimentos
const COMMON_UNITS = {
  gramsOnly: [
    { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
  ],
  millilitersOnly: [
    { name: 'mililitro', abbreviation: 'ml', gramsEquivalent: 1 }
  ],
  eggUnits: [
    { name: 'unidade média', abbreviation: 'unid', gramsEquivalent: 50 },
    { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
  ],
  breadUnits: [
    { name: 'unidade (pão francês)', abbreviation: 'unid', gramsEquivalent: 50 },
    { name: 'fatia', abbreviation: 'fatia', gramsEquivalent: 25 },
    { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
  ],
  fruitUnits: [
    { name: 'unidade média', abbreviation: 'unid', gramsEquivalent: 120 },
    { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
  ],
  milkUnits: [
    { name: 'copo (200ml)', abbreviation: 'copo', gramsEquivalent: 200 },
    { name: 'mililitro', abbreviation: 'ml', gramsEquivalent: 1 }
  ],
  oilUnits: [
    { name: 'colher de sopa', abbreviation: 'c.sopa', gramsEquivalent: 15 },
    { name: 'colher de chá', abbreviation: 'c.chá', gramsEquivalent: 5 },
    { name: 'mililitro', abbreviation: 'ml', gramsEquivalent: 1 }
  ],
  nutsUnits: [
    { name: 'unidade', abbreviation: 'unid', gramsEquivalent: 5 },
    { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
  ],
  cheeseUnits: [
    { name: 'fatia', abbreviation: 'fatia', gramsEquivalent: 20 },
    { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
  ]
}

// Alimentos padrão para popular o banco
const DEFAULT_FOODS: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Arroz Branco Cozido',
    category: 'carbs',
    nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sodium: 1, sugar: 0.1 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.gramsOnly,
    defaultUnit: 'g',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Feijão Preto Cozido',
    category: 'protein',
    nutrition: { calories: 132, protein: 8.9, carbs: 23, fat: 0.5, fiber: 8.7, sodium: 2, sugar: 0.3 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.gramsOnly,
    defaultUnit: 'g',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Peito de Frango Grelhado',
    category: 'protein',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74, sugar: 0 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.gramsOnly,
    defaultUnit: 'g',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Ovo Cozido',
    category: 'protein',
    nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sodium: 124, sugar: 1.1 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.eggUnits,
    defaultUnit: 'unid',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Banana',
    category: 'fruits',
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sodium: 1, sugar: 12 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.fruitUnits,
    defaultUnit: 'unid',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Aveia em Flocos',
    category: 'grains',
    nutrition: { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10, sodium: 2, sugar: 1 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.gramsOnly,
    defaultUnit: 'g',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Leite Integral',
    category: 'dairy',
    nutrition: { calories: 61, protein: 3.2, carbs: 4.5, fat: 3.2, fiber: 0, sodium: 44, sugar: 4.5, water: 87 },
    baseUnit: 'ml',
    availableUnits: COMMON_UNITS.milkUnits,
    defaultUnit: 'copo',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Pão Francês',
    category: 'carbs',
    nutrition: { calories: 300, protein: 9, carbs: 58, fat: 3.1, fiber: 2.3, sodium: 643, sugar: 5 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.breadUnits,
    defaultUnit: 'unid',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Maçã',
    category: 'fruits',
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sodium: 1, sugar: 10, water: 85 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.fruitUnits,
    defaultUnit: 'unid',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Batata Doce Cozida',
    category: 'carbs',
    nutrition: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sodium: 5, sugar: 4.2 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.gramsOnly,
    defaultUnit: 'g',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Água',
    category: 'beverages',
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0, water: 100 },
    baseUnit: 'ml',
    availableUnits: COMMON_UNITS.milkUnits,
    defaultUnit: 'copo',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Suco de Laranja Natural',
    category: 'beverages',
    nutrition: { calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, fiber: 0.2, sodium: 1, sugar: 8.1, water: 88 },
    baseUnit: 'ml',
    availableUnits: COMMON_UNITS.milkUnits,
    defaultUnit: 'copo',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Café sem Açúcar',
    category: 'beverages',
    nutrition: { calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sodium: 5, sugar: 0, water: 99 },
    baseUnit: 'ml',
    availableUnits: COMMON_UNITS.milkUnits,
    defaultUnit: 'copo',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Brócolis Cozido',
    category: 'vegetables',
    nutrition: { calories: 35, protein: 2.4, carbs: 7, fat: 0.4, fiber: 3.3, sodium: 41, sugar: 1.5, water: 89 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.gramsOnly,
    defaultUnit: 'g',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Carne Bovina Magra',
    category: 'protein',
    nutrition: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sodium: 72, sugar: 0 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.gramsOnly,
    defaultUnit: 'g',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Azeite de Oliva',
    category: 'fats',
    nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 2, sugar: 0 },
    baseUnit: 'ml',
    availableUnits: COMMON_UNITS.oilUnits,
    defaultUnit: 'c.sopa',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Tomate',
    category: 'vegetables',
    nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5, sugar: 2.6, water: 95 },
    baseUnit: 'g',
    availableUnits: [
      { name: 'unidade média', abbreviation: 'unid', gramsEquivalent: 100 },
      { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
    ],
    defaultUnit: 'unid',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Queijo Mussarela',
    category: 'dairy',
    nutrition: { calories: 280, protein: 25, carbs: 2.2, fat: 19, fiber: 0, sodium: 627, sugar: 1 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.cheeseUnits,
    defaultUnit: 'fatia',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Iogurte Natural',
    category: 'dairy',
    nutrition: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sodium: 46, sugar: 4.7, water: 88 },
    baseUnit: 'g',
    availableUnits: [
      { name: 'pote (170g)', abbreviation: 'pote', gramsEquivalent: 170 },
      { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
    ],
    defaultUnit: 'pote',
    isCustom: false,
    isPublic: true
  },
  {
    name: 'Castanha do Pará',
    category: 'fats',
    nutrition: { calories: 656, protein: 14, carbs: 12, fat: 67, fiber: 7.5, sodium: 3, sugar: 2.3 },
    baseUnit: 'g',
    availableUnits: COMMON_UNITS.nutsUnits,
    defaultUnit: 'unid',
    isCustom: false,
    isPublic: true
  }
]

export const populateDefaultFoods = async (): Promise<void> => {
  try {
    console.log('Verificando alimentos padrão...')
    
    // Verificar se já existem alimentos padrão com a nova estrutura
    const defaultFoodsQuery = query(
      collection(db, 'foods'),
      where('isCustom', '==', false)
    )
    const existingFoods = await getDocs(defaultFoodsQuery)
    
    // Verificar se algum alimento existente tem a nova estrutura (availableUnits)
    const hasNewStructure = existingFoods.docs.some(doc => {
      const data = doc.data()
      return data.availableUnits && Array.isArray(data.availableUnits)
    })
    
    if (existingFoods.size > 0 && hasNewStructure) {
      console.log(`Já existem ${existingFoods.size} alimentos padrão com nova estrutura`)
      return
    }
    
    // Se existem alimentos antigos, vamos removê-los e criar novos
    if (existingFoods.size > 0) {
      console.log('Removendo alimentos antigos para atualizar estrutura...')
      const deletePromises = existingFoods.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
    }
    
    console.log('Populando alimentos padrão com nova estrutura...')
    const now = new Date().toISOString()
    
    const promises = DEFAULT_FOODS.map(food => 
      addDoc(collection(db, 'foods'), {
        ...food,
        createdAt: now,
        updatedAt: now
      })
    )
    
    await Promise.all(promises)
    console.log(`${DEFAULT_FOODS.length} alimentos padrão adicionados com sucesso!`)
    
  } catch (error) {
    console.error('Erro ao popular alimentos padrão:', error)
    throw error
  }
}

// Função para ser chamada durante a inicialização do app
export const initializeDatabase = async (): Promise<void> => {
  try {
    await populateDefaultFoods()
  } catch (error) {
    console.error('Erro na inicialização do banco de dados:', error)
  }
}