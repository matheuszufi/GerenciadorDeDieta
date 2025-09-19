import React, { useState, useEffect } from 'react'
import { useFoods, type Food } from '../hooks/useFoods'
import { useMeals, type Meal } from '../hooks/useMeals'
import styles from './MealEditor.module.css'

interface MealEditorProps {
  isOpen: boolean
  onClose: () => void
  mealType?: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'
  existingMeal?: Meal | null
}

interface FoodSelection {
  foodId: string
  quantity: number
  unit: string
}

// Categorias de ingredientes com tradução
const FOOD_CATEGORIES = {
  protein: 'Proteínas',
  carbs: 'Carboidratos',
  vegetables: 'Vegetais',
  fruits: 'Frutas',
  dairy: 'Laticínios',
  grains: 'Grãos',
  fats: 'Gorduras',
  beverages: 'Bebidas',
  others: 'Outros'
} as const

const MealEditor: React.FC<MealEditorProps> = ({
  isOpen,
  onClose,
  mealType = 'breakfast',
  existingMeal = null
}) => {
  const { foods, isLoading: foodsLoading, calculateNutrition } = useFoods()
  const { addMeal, removeMeal } = useMeals()
  
  // Estados principais
  const [selectedFoods, setSelectedFoods] = useState<FoodSelection[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof FOOD_CATEGORIES | 'all'>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMealType, setCurrentMealType] = useState<'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'>(mealType)

  // Nomes dos tipos de refeição
  const mealTypeNames = {
    breakfast: 'Café da Manhã',
    morning_snack: 'Lanche da Manhã',
    lunch: 'Almoço',
    afternoon_snack: 'Lanche da Tarde',
    dinner: 'Jantar',
    evening_snack: 'Ceia'
  }

  // Filtrar ingredientes por busca e categoria
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.brand && food.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Carregar refeição existente se houver
  useEffect(() => {
    if (existingMeal && foods.length > 0) {
      const selections: FoodSelection[] = existingMeal.items.map(item => {
        const food = foods.find(f => f.id === item.foodId)
        return {
          foodId: item.foodId,
          quantity: item.quantity,
          unit: item.unit || food?.defaultUnit || 'g' // Usar a unidade do item ou a padrão do alimento
        }
      })
      setSelectedFoods(selections)
      setCurrentMealType(existingMeal.type) // Definir o tipo da refeição existente
    } else if (!existingMeal) {
      setSelectedFoods([])
      setCurrentMealType(mealType) // Usar o tipo passado como prop
    }
  }, [existingMeal, mealType, isOpen, foods])

  // Adicionar ingrediente à seleção
  const handleAddFood = (food: Food) => {
    const existingIndex = selectedFoods.findIndex(s => s.foodId === food.id)
    if (existingIndex >= 0) {
      // Se já existe, aumentar a quantidade
      const newSelections = [...selectedFoods]
      newSelections[existingIndex].quantity += 100 // Adicionar 100g por padrão
      setSelectedFoods(newSelections)
    } else {
      // Adicionar novo ingrediente
      setSelectedFoods(prev => [...prev, { 
        foodId: food.id, 
        quantity: 100, // 100g por padrão
        unit: food.defaultUnit 
      }])
    }
  }

  // Remover ingrediente da seleção
  const handleRemoveFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(s => s.foodId !== foodId))
  }

  // Atualizar quantidade de um ingrediente
  const handleUpdateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFood(foodId)
      return
    }
    
    setSelectedFoods(prev =>
      prev.map(s => s.foodId === foodId ? { ...s, quantity } : s)
    )
  }

  // Atualizar unidade de um ingrediente
  const handleUpdateUnit = (foodId: string, unit: string) => {
    setSelectedFoods(prev =>
      prev.map(s => s.foodId === foodId ? { ...s, unit } : s)
    )
  }

  // Calcular totais nutricionais
  const calculateTotals = () => {
    return selectedFoods.reduce((totals, selection) => {
      const food = foods.find(f => f.id === selection.foodId)
      if (!food) return totals

      const nutrition = calculateNutrition(food, selection.quantity, selection.unit)
      
      return {
        calories: totals.calories + nutrition.calories,
        protein: totals.protein + nutrition.protein,
        carbs: totals.carbs + nutrition.carbs,
        fat: totals.fat + nutrition.fat,
        fiber: totals.fiber + nutrition.fiber,
        sodium: totals.sodium + nutrition.sodium,
        sugar: totals.sugar + nutrition.sugar,
        water: totals.water + (nutrition.water || 0)
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
  }

  // Salvar refeição
  const handleSaveMeal = async () => {
    if (selectedFoods.length === 0) {
      alert('Adicione pelo menos um ingrediente à refeição')
      return
    }

    setIsSubmitting(true)
    try {
      // Se é uma refeição existente, remover primeiro
      if (existingMeal) {
        await removeMeal(existingMeal.id)
      }

      // Criar itens da refeição
      const mealItems = selectedFoods.map(selection => {
        const food = foods.find(f => f.id === selection.foodId)!
        const nutrition = calculateNutrition(food, selection.quantity, selection.unit)
        
        return {
          id: `${food.id}_${Date.now()}`,
          foodId: food.id,
          foodName: food.name,
          quantity: selection.quantity,
          unit: selection.unit, // Incluir a unidade
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          fiber: nutrition.fiber,
          sodium: nutrition.sodium,
          sugar: nutrition.sugar
        }
      })

      const totals = calculateTotals()

      // Criar nova refeição
      const newMeal = {
        type: currentMealType, // Usar o tipo selecionado pelo usuário
        name: mealTypeNames[currentMealType],
        items: mealItems,
        totals
      }

      await addMeal(newMeal)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar refeição:', error)
      alert('Erro ao salvar refeição')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const totals = calculateTotals()

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2>{existingMeal ? 'Editar' : 'Adicionar'} Refeição</h2>
            {/* Selector de tipo de refeição */}
            <div className={styles.mealTypeSelector}>
              <label htmlFor="mealType">Tipo de refeição:</label>
              <select
                id="mealType"
                value={currentMealType}
                onChange={(e) => setCurrentMealType(e.target.value as 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack')}
                className={styles.mealTypeSelect}
              >
                {Object.entries(mealTypeNames).map(([type, name]) => (
                  <option key={type} value={type}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* Seção de Busca e Filtros */}
          <div className={styles.searchSection}>
            <div className={styles.searchRow}>
              <input
                type="text"
                placeholder="Buscar ingredientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className={styles.categoryFilter}
              >
                <option value="all">Todas as categorias</option>
                {Object.entries(FOOD_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.mainContent}>
            {/* Lista de Ingredientes Disponíveis */}
            <div className={styles.foodsSection}>
              <h3>Ingredientes Disponíveis</h3>
              {foodsLoading ? (
                <div className={styles.loading}>Carregando ingredientes...</div>
              ) : (
                <div className={styles.foodsList}>
                  {filteredFoods.map(food => (
                    <div key={food.id} className={styles.foodItem}>
                      <div className={styles.foodInfo}>
                        <h4>{food.name}</h4>
                        <span className={styles.category}>{FOOD_CATEGORIES[food.category]}</span>
                        <p className={styles.nutrition}>
                          {Math.round(food.nutrition.calories)} kcal • 
                          P: {food.nutrition.protein}g • 
                          C: {food.nutrition.carbs}g • 
                          G: {food.nutrition.fat}g
                          <span className={styles.per100}>/100{food.baseUnit}</span>
                        </p>
                      </div>
                      <button
                        className={styles.addButton}
                        onClick={() => handleAddFood(food)}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Ingredientes da Refeição */}
            <div className={styles.mealSection}>
              <h3>Ingredientes da Refeição ({selectedFoods.length})</h3>
              {selectedFoods.length === 0 ? (
                <div className={styles.emptyMeal}>
                  <p>Nenhum ingrediente adicionado</p>
                </div>
              ) : (
                <>
                  <div className={styles.selectedFoodsList}>
                    {selectedFoods.map(selection => {
                      const food = foods.find(f => f.id === selection.foodId)
                      if (!food) return null

                      return (
                        <div key={selection.foodId} className={styles.selectedFood}>
                          <div className={styles.foodDetails}>
                            <h4>{food.name}</h4>
                            <div className={styles.quantityControls}>
                              <input
                                type="number"
                                value={selection.quantity}
                                onChange={(e) => handleUpdateQuantity(selection.foodId, Number(e.target.value))}
                                min="1"
                                className={styles.quantityInput}
                              />
                              <select
                                value={selection.unit}
                                onChange={(e) => handleUpdateUnit(selection.foodId, e.target.value)}
                                className={styles.unitSelect}
                              >
                                {food.availableUnits.map(unit => (
                                  <option key={unit.abbreviation} value={unit.abbreviation}>
                                    {unit.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button
                            className={styles.removeButton}
                            onClick={() => handleRemoveFood(selection.foodId)}
                          >
                            🗑️
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Totais Nutricionais */}
                  <div className={styles.totals}>
                    <h4>Totais Nutricionais</h4>
                    <div className={styles.nutritionGrid}>
                      <div className={styles.nutritionItem}>
                        <span className={styles.label}>Calorias</span>
                        <span className={styles.value}>{Math.round(totals.calories)} kcal</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span className={styles.label}>Proteínas</span>
                        <span className={styles.value}>{Math.round(totals.protein)}g</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span className={styles.label}>Carboidratos</span>
                        <span className={styles.value}>{Math.round(totals.carbs)}g</span>
                      </div>
                      <div className={styles.nutritionItem}>
                        <span className={styles.label}>Gorduras</span>
                        <span className={styles.value}>{Math.round(totals.fat)}g</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer com botões de ação */}
        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSaveMeal}
            disabled={isSubmitting || selectedFoods.length === 0}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Refeição'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MealEditor