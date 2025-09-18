import React, { useState } from 'react';
import './AddFood.css';
import type { Food, NutritionalValues, FoodUnit } from '../hooks/useFoods';

interface AddFoodProps {
  onAddFood: (food: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const AddFood: React.FC<AddFoodProps> = ({ onAddFood, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'others' as Food['category'],
    baseUnit: 'g' as 'g' | 'ml',
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
    } as NutritionalValues,
    customUnits: [
      { name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }
    ] as FoodUnit[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'protein', label: '🥩 Proteínas' },
    { value: 'carbs', label: '🍞 Carboidratos' },
    { value: 'vegetables', label: '🥕 Vegetais' },
    { value: 'fruits', label: '🍎 Frutas' },
    { value: 'dairy', label: '🥛 Laticínios' },
    { value: 'grains', label: '🌾 Grãos' },
    { value: 'fats', label: '🥑 Gorduras' },
    { value: 'beverages', label: '🥤 Bebidas' },
    { value: 'others', label: '📦 Outros' }
  ];

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.startsWith('nutrition.')) {
      const nutritionField = field.replace('nutrition.', '') as keyof NutritionalValues;
      setFormData(prev => ({
        ...prev,
        nutrition: {
          ...prev.nutrition,
          [nutritionField]: typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nome do alimento é obrigatório');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const foodData: Omit<Food, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        category: formData.category,
        nutrition: formData.nutrition,
        baseUnit: formData.baseUnit,
        availableUnits: formData.customUnits,
        defaultUnit: formData.customUnits[0].abbreviation,
        isCustom: true,
        isPublic: formData.isPublic
      };

      // Só adicionar brand se não estiver vazio
      if (formData.brand.trim()) {
        foodData.brand = formData.brand.trim();
      }

      await onAddFood(foodData);
      
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar alimento:', error);
      alert('Erro ao adicionar alimento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-food-overlay">
      <div className="add-food-modal">
        <div className="add-food-header">
          <h2>Criar Novo Alimento</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-food-form">
          <div className="form-section">
            <h3>Informações Básicas</h3>
            
            <div className="form-group">
              <label htmlFor="name">Nome do Alimento *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Peito de frango grelhado"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">Marca (opcional)</label>
              <input
                id="brand"
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Ex: Sadia, Nestlé..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Categoria</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="baseUnit">Unidade Base</label>
                <select
                  id="baseUnit"
                  value={formData.baseUnit}
                  onChange={(e) => {
                    const newBaseUnit = e.target.value as 'g' | 'ml';
                    setFormData(prev => ({
                      ...prev,
                      baseUnit: newBaseUnit,
                      customUnits: newBaseUnit === 'g' 
                        ? [{ name: 'grama', abbreviation: 'g', gramsEquivalent: 1 }]
                        : [{ name: 'mililitro', abbreviation: 'ml', gramsEquivalent: 1 }]
                    }));
                  }}
                >
                  <option value="g">Gramas (g)</option>
                  <option value="ml">Mililitros (ml)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Informações Nutricionais (por 100{formData.baseUnit})</h3>
            
            <div className="nutrition-grid">
              <div className="form-group">
                <label htmlFor="calories">Calorias (kcal)</label>
                <input
                  id="calories"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.calories}
                  onChange={(e) => handleInputChange('nutrition.calories', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="protein">Proteínas (g)</label>
                <input
                  id="protein"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.protein}
                  onChange={(e) => handleInputChange('nutrition.protein', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="carbs">Carboidratos (g)</label>
                <input
                  id="carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.carbs}
                  onChange={(e) => handleInputChange('nutrition.carbs', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fat">Gorduras (g)</label>
                <input
                  id="fat"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.fat}
                  onChange={(e) => handleInputChange('nutrition.fat', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fiber">Fibras (g)</label>
                <input
                  id="fiber"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.fiber}
                  onChange={(e) => handleInputChange('nutrition.fiber', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sodium">Sódio (mg)</label>
                <input
                  id="sodium"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.sodium}
                  onChange={(e) => handleInputChange('nutrition.sodium', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sugar">Açúcar (g)</label>
                <input
                  id="sugar"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.sugar}
                  onChange={(e) => handleInputChange('nutrition.sugar', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="water">Água (ml)</label>
                <input
                  id="water"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.water}
                  onChange={(e) => handleInputChange('nutrition.water', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                />
                <span>Tornar público (outros usuários poderão usar)</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-submit">
              {isSubmitting ? 'Salvando...' : 'Criar Alimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFood;