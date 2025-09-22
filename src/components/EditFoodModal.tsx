import React, { useState, useEffect } from 'react'
import { useFoods, type Food } from '../hooks/useFoods'
import styles from './EditFoodModal.module.css'

interface EditFoodModalProps {
  food: Food
  isOpen: boolean
  onClose: () => void
}

// Categorias de ingredientes
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

const EditFoodModal: React.FC<EditFoodModalProps> = ({
  food,
  isOpen,
  onClose
}) => {
  const { updateCustomFood } = useFoods()
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'others' as keyof typeof FOOD_CATEGORIES,
    baseUnit: 'g' as 'g' | 'ml' | 'unid' | 'fatia',
    unitWeight: 100,
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      sugar: 0,
      water: 0
    }
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar dados do alimento quando o modal abrir
  useEffect(() => {
    if (food && isOpen) {
      setFormData({
        name: food.name,
        brand: food.brand || '',
        category: food.category,
        baseUnit: food.baseUnit === 'porcao' ? 'unid' : food.baseUnit,
        unitWeight: food.availableUnits[0]?.gramsEquivalent || 100,
        nutrition: { 
          ...food.nutrition,
          water: food.nutrition.water || 0
        }
      })
    }
  }, [food, isOpen])

  // Atualizar dados do formulário
  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.startsWith('nutrition.')) {
      const nutritionField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        nutrition: {
          ...prev.nutrition,
          [nutritionField]: typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Salvar alterações
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Nome do ingrediente é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      // Validar dados obrigatórios
      if (!formData.name.trim()) {
        alert('Nome do ingrediente é obrigatório')
        return
      }

      if ((formData.baseUnit === 'unid' || formData.baseUnit === 'fatia') && (!formData.unitWeight || formData.unitWeight <= 0)) {
        alert('Peso da unidade é obrigatório e deve ser maior que zero')
        return
      }

      // Criar a unidade baseada na escolha do usuário
      const unit = {
        name: formData.baseUnit === 'g' ? 'grama' : 
              formData.baseUnit === 'ml' ? 'mililitro' :
              formData.baseUnit === 'fatia' ? 'fatia' : 'unidade',
        abbreviation: formData.baseUnit,
        gramsEquivalent: formData.baseUnit === 'g' ? 1 : 
                        formData.baseUnit === 'ml' ? 1 : 
                        (formData.unitWeight || 100)
      }

      // Normalizar os valores nutricionais para 100g quando baseUnit for 'unid' ou 'fatia'
      let nutritionValues = formData.nutrition
      if (formData.baseUnit === 'unid' || formData.baseUnit === 'fatia') {
        // Os valores inseridos são por unidade/fatia, precisamos converter para 100g
        const factor = 100 / (formData.unitWeight || 100)
        nutritionValues = {
          calories: Math.round((formData.nutrition.calories || 0) * factor * 10) / 10,
          protein: Math.round((formData.nutrition.protein || 0) * factor * 10) / 10,
          carbs: Math.round((formData.nutrition.carbs || 0) * factor * 10) / 10,
          fat: Math.round((formData.nutrition.fat || 0) * factor * 10) / 10,
          fiber: Math.round((formData.nutrition.fiber || 0) * factor * 10) / 10,
          sodium: Math.round((formData.nutrition.sodium || 0) * factor * 10) / 10,
          sugar: Math.round((formData.nutrition.sugar || 0) * factor * 10) / 10,
          water: formData.nutrition.water ? Math.round(formData.nutrition.water * factor * 10) / 10 : 0
        }
      }

      // Garantir que todos os valores de nutrição são números válidos
      const cleanNutrition = {
        calories: Number(nutritionValues.calories) || 0,
        protein: Number(nutritionValues.protein) || 0,
        carbs: Number(nutritionValues.carbs) || 0,
        fat: Number(nutritionValues.fat) || 0,
        fiber: Number(nutritionValues.fiber) || 0,
        sodium: Number(nutritionValues.sodium) || 0,
        sugar: Number(nutritionValues.sugar) || 0,
        water: Number(nutritionValues.water) || 0
      }

      const updates: Partial<Food> = {
        name: formData.name.trim(),
        category: formData.category,
        nutrition: cleanNutrition,
        baseUnit: formData.baseUnit,
        availableUnits: [unit],
        defaultUnit: unit.abbreviation,
      }

      // Adicionar brand apenas se não estiver vazio
      if (formData.brand.trim()) {
        updates.brand = formData.brand.trim()
      }

      // Remover campos undefined para evitar erro no Firestore
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      ) as Partial<Food>

      await updateCustomFood(food.id, cleanUpdates)
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error)
      alert('Erro ao atualizar ingrediente')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Editar Alimento</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.content}>
            {/* Informações Básicas */}
            <div className={styles.section}>
              <h3>Informações Básicas</h3>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Nome do Ingrediente *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Peito de frango grelhado"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Marca (opcional)</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Ex: Sadia, Perdigão..."
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {Object.entries(FOOD_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Unidade Base para Valores Nutricionais</label>
                  <select
                    value={formData.baseUnit}
                    onChange={(e) => handleInputChange('baseUnit', e.target.value)}
                  >
                    <option value="g">Por 100 gramas</option>
                    <option value="ml">Por 100 mililitros</option>
                    <option value="unid">Por unidade</option>
                    <option value="fatia">Por fatia</option>
                  </select>
                </div>
              </div>

              {/* Campo adicional para peso quando unidade for fatia ou unidade */}
              {(formData.baseUnit === 'fatia' || formData.baseUnit === 'unid') && (
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label>
                      Peso em gramas {formData.baseUnit === 'fatia' ? 'da fatia' : 'da unidade'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={formData.unitWeight}
                      onChange={(e) => handleInputChange('unitWeight', parseFloat(e.target.value) || 1)}
                      placeholder={`Ex: ${formData.baseUnit === 'fatia' ? '25' : '50'}`}
                      required
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      Informe quantas gramas tem uma {formData.baseUnit === 'fatia' ? 'fatia' : 'unidade'} deste ingrediente
                    </small>
                  </div>
                </div>
              )}
            </div>

            {/* Informações Nutricionais */}
            <div className={styles.section}>
              <h3>Informações Nutricionais (por {
                formData.baseUnit === 'g' ? '100g' :
                formData.baseUnit === 'ml' ? '100ml' :
                formData.baseUnit === 'unid' ? `unidade (${formData.unitWeight}g)` :
                formData.baseUnit === 'fatia' ? `fatia (${formData.unitWeight}g)` :
                '100' + formData.baseUnit
              })</h3>
              <div className={styles.nutritionGrid}>
                <div className={styles.field}>
                  <label>Calorias (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutrition.calories}
                    onChange={(e) => handleInputChange('nutrition.calories', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Proteínas (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutrition.protein}
                    onChange={(e) => handleInputChange('nutrition.protein', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Carboidratos (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutrition.carbs}
                    onChange={(e) => handleInputChange('nutrition.carbs', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Gorduras (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutrition.fat}
                    onChange={(e) => handleInputChange('nutrition.fat', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Fibras (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutrition.fiber}
                    onChange={(e) => handleInputChange('nutrition.fiber', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Sódio (mg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutrition.sodium}
                    onChange={(e) => handleInputChange('nutrition.sodium', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Açúcar (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.nutrition.sugar}
                    onChange={(e) => handleInputChange('nutrition.sugar', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>Água (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.nutrition.water}
                    onChange={(e) => handleInputChange('nutrition.water', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditFoodModal