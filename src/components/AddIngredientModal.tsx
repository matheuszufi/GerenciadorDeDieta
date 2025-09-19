import React, { useState } from 'react'
import { useFoods, type Food } from '../hooks/useFoods'
import styles from './AddIngredientModal.module.css'

interface AddIngredientModalProps {
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

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addCustomFood } = useFoods()
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'others' as keyof typeof FOOD_CATEGORIES,
    baseUnit: 'g' as 'g' | 'ml' | 'unid' | 'fatia',
    unitWeight: 100, // peso em gramas para fatia/unidade
    isPublic: false,
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

  // Salvar ingrediente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Nome do ingrediente é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      // Criar a unidade baseada na escolha do usuário
      const unit = {
        name: formData.baseUnit === 'g' ? 'grama' : 
              formData.baseUnit === 'ml' ? 'mililitro' :
              formData.baseUnit === 'fatia' ? 'fatia' : 'unidade',
        abbreviation: formData.baseUnit,
        gramsEquivalent: formData.baseUnit === 'g' || formData.baseUnit === 'ml' ? 100 : formData.unitWeight
      }

      const newFood: Omit<Food, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        category: formData.category,
        nutrition: formData.nutrition,
        baseUnit: formData.baseUnit,
        availableUnits: [unit],
        defaultUnit: unit.abbreviation,
        isCustom: true,
        isPublic: false // Sempre false conforme solicitado
      }

      // Adicionar brand apenas se não estiver vazio
      if (formData.brand.trim()) {
        (newFood as any).brand = formData.brand.trim()
      }

      await addCustomFood(newFood)
      
      // Reset form
      setFormData({
        name: '',
        brand: '',
        category: 'others',
        baseUnit: 'g',
        unitWeight: 100,
        isPublic: false,
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
      
      onClose()
    } catch (error) {
      console.error('Erro ao criar ingrediente:', error)
      alert('Erro ao criar ingrediente')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Criar Novo Ingrediente</h2>
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
              {isSubmitting ? 'Salvando...' : 'Criar Ingrediente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddIngredientModal