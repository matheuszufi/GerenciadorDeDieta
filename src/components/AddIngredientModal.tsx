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

// Unidades padrão para diferentes tipos de alimentos
const DEFAULT_UNITS = {
  solid: [
    { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 },
    { name: 'quilograma', abbreviation: 'kg', gramsEquivalent: 1000 },
    { name: 'unidade', abbreviation: 'unid', gramsEquivalent: 100 }, // valor padrão, pode ser editado
  ],
  liquid: [
    { name: 'mililitro', abbreviation: 'ml', gramsEquivalent: 1 },
    { name: 'litro', abbreviation: 'l', gramsEquivalent: 1000 },
    { name: 'copo (200ml)', abbreviation: 'copo', gramsEquivalent: 200 },
  ],
  custom: [
    { name: 'colher de sopa', abbreviation: 'c.sopa', gramsEquivalent: 15 },
    { name: 'colher de chá', abbreviation: 'c.chá', gramsEquivalent: 5 },
    { name: 'xícara', abbreviation: 'xíc', gramsEquivalent: 240 },
    { name: 'fatia', abbreviation: 'fatia', gramsEquivalent: 25 },
  ]
}

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
    baseUnit: 'g' as 'g' | 'ml' | 'unid' | 'fatia' | 'porcao',
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
  
  const [selectedUnits, setSelectedUnits] = useState<Array<{name: string, abbreviation: string, gramsEquivalent: number}>>([
    { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
  ])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomUnit, setShowCustomUnit] = useState(false)
  const [customUnit, setCustomUnit] = useState({
    name: '',
    abbreviation: '',
    gramsEquivalent: 1
  })

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

  // Adicionar unidade padrão
  const addUnit = (unit: {name: string, abbreviation: string, gramsEquivalent: number}) => {
    if (!selectedUnits.find(u => u.abbreviation === unit.abbreviation)) {
      setSelectedUnits(prev => [...prev, unit])
    }
  }

  // Remover unidade
  const removeUnit = (abbreviation: string) => {
    if (abbreviation === 'g' || abbreviation === 'ml') return // Não pode remover unidade base
    setSelectedUnits(prev => prev.filter(u => u.abbreviation !== abbreviation))
  }

  // Adicionar unidade customizada
  const addCustomUnit = () => {
    if (customUnit.name && customUnit.abbreviation && customUnit.gramsEquivalent > 0) {
      if (!selectedUnits.find(u => u.abbreviation === customUnit.abbreviation)) {
        setSelectedUnits(prev => [...prev, customUnit])
        setCustomUnit({ name: '', abbreviation: '', gramsEquivalent: 1 })
        setShowCustomUnit(false)
      }
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
      const newFood: Omit<Food, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        category: formData.category,
        nutrition: formData.nutrition,
        baseUnit: formData.baseUnit,
        availableUnits: selectedUnits,
        defaultUnit: selectedUnits[0]?.abbreviation || 'g',
        isCustom: true,
        isPublic: formData.isPublic
      }

      await addCustomFood(newFood)
      
      // Reset form
      setFormData({
        name: '',
        brand: '',
        category: 'others',
        baseUnit: 'g',
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
      setSelectedUnits([{ name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }])
      
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
                  <label>Unidade Base</label>
                  <select
                    value={formData.baseUnit}
                    onChange={(e) => handleInputChange('baseUnit', e.target.value)}
                  >
                    <option value="g">Gramas (sólido)</option>
                    <option value="ml">Mililitros (líquido)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Informações Nutricionais */}
            <div className={styles.section}>
              <h3>Informações Nutricionais (por 100{formData.baseUnit})</h3>
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

            {/* Unidades de Medida */}
            <div className={styles.section}>
              <h3>Unidades de Medida</h3>
              <div className={styles.unitsSection}>
                <div className={styles.selectedUnits}>
                  <h4>Unidades Selecionadas:</h4>
                  <div className={styles.unitsList}>
                    {selectedUnits.map(unit => (
                      <div key={unit.abbreviation} className={styles.unitItem}>
                        <span>{unit.name} ({unit.abbreviation}) = {unit.gramsEquivalent}{formData.baseUnit}</span>
                        {unit.abbreviation !== 'g' && unit.abbreviation !== 'ml' && (
                          <button type="button" onClick={() => removeUnit(unit.abbreviation)}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.addUnits}>
                  <h4>Adicionar Unidades:</h4>
                  <div className={styles.unitButtons}>
                    {(formData.baseUnit === 'g' ? DEFAULT_UNITS.solid : DEFAULT_UNITS.liquid).map(unit => (
                      <button
                        key={unit.abbreviation}
                        type="button"
                        onClick={() => addUnit(unit)}
                        disabled={selectedUnits.some(u => u.abbreviation === unit.abbreviation)}
                        className={styles.unitButton}
                      >
                        {unit.name}
                      </button>
                    ))}
                    {DEFAULT_UNITS.custom.map(unit => (
                      <button
                        key={unit.abbreviation}
                        type="button"
                        onClick={() => addUnit(unit)}
                        disabled={selectedUnits.some(u => u.abbreviation === unit.abbreviation)}
                        className={styles.unitButton}
                      >
                        {unit.name}
                      </button>
                    ))}
                  </div>

                  {!showCustomUnit ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomUnit(true)}
                      className={styles.addCustomButton}
                    >
                      + Unidade Personalizada
                    </button>
                  ) : (
                    <div className={styles.customUnitForm}>
                      <input
                        type="text"
                        placeholder="Nome da unidade"
                        value={customUnit.name}
                        onChange={(e) => setCustomUnit(prev => ({...prev, name: e.target.value}))}
                      />
                      <input
                        type="text"
                        placeholder="Abreviação"
                        value={customUnit.abbreviation}
                        onChange={(e) => setCustomUnit(prev => ({...prev, abbreviation: e.target.value}))}
                      />
                      <input
                        type="number"
                        placeholder="Equivalente em gramas"
                        value={customUnit.gramsEquivalent}
                        onChange={(e) => setCustomUnit(prev => ({...prev, gramsEquivalent: parseFloat(e.target.value) || 1}))}
                      />
                      <button type="button" onClick={addCustomUnit}>Adicionar</button>
                      <button type="button" onClick={() => setShowCustomUnit(false)}>Cancelar</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div className={styles.section}>
              <div className={styles.checkboxField}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  />
                  Tornar público (outros usuários poderão usar este ingrediente)
                </label>
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