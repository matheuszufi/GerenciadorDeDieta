import React, { useState } from 'react';
import { useFoods } from '../hooks/useFoods';
import { useDishes } from '../hooks/useDishes';
import AddFood from './AddFood';
import './AddDish.css';
import type { Food, NutritionalValues } from '../hooks/useFoods';
import type { Dish, DishIngredient } from '../hooks/useDishes';

interface AddDishProps {
  onAddDish: (dish: Omit<Dish, 'id' | 'totalNutrition' | 'nutritionPerServing' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const AddDish: React.FC<AddDishProps> = ({ onAddDish, onClose }) => {
  const { foods, addCustomFood, searchFoods } = useFoods();
  const { createIngredient, calculateTotalNutrition, calculateNutritionPerServing } = useDishes();
  
  const [showAddFood, setShowAddFood] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [dishData, setDishData] = useState({
    name: '',
    description: '',
    category: 'lunch' as Dish['category'],
    servings: 1,
    isPublic: false,
    ingredients: [] as DishIngredient[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'breakfast', label: '🍳 Café da Manhã' },
    { value: 'lunch', label: '🍽️ Almoço' },
    { value: 'dinner', label: '🌙 Jantar' },
    { value: 'snack', label: '🥨 Lanche' },
    { value: 'dessert', label: '🍰 Sobremesa' },
    { value: 'beverage', label: '🥤 Bebida' },
    { value: 'other', label: '📦 Outro' }
  ];

  const foodCategories = [
    { value: 'all', label: 'Todos' },
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

  // Filtrar alimentos
  const getFilteredFoods = () => {
    let filtered = searchTerm ? searchFoods(searchTerm) : foods;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(food => food.category === selectedCategory);
    }
    
    return filtered;
  };

  // Adicionar ingrediente ao prato
  const addIngredient = (food: Food, quantity: number, unit: string) => {
    const newIngredient = createIngredient(food, quantity, unit);
    
    setDishData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  // Remover ingrediente
  const removeIngredient = (index: number) => {
    setDishData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // Atualizar quantidade do ingrediente
  const updateIngredientQuantity = (index: number, quantity: number, unit?: string) => {
    const ingredient = dishData.ingredients[index];
    const food = foods.find(f => f.id === ingredient.foodId);
    
    if (food && quantity > 0) {
      const updatedIngredient = createIngredient(food, quantity, unit || ingredient.unit);
      
      setDishData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map((ing, i) => 
          i === index ? updatedIngredient : ing
        )
      }));
    }
  };

  // Calcular nutrição total do prato
  const getTotalNutrition = (): NutritionalValues => {
    return calculateTotalNutrition(dishData.ingredients);
  };

  // Calcular nutrição por porção
  const getNutritionPerServing = (): NutritionalValues => {
    const total = getTotalNutrition();
    return calculateNutritionPerServing(total, dishData.servings);
  };

  // Submeter prato
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dishData.name.trim()) {
      alert('Nome do prato é obrigatório');
      return;
    }
    
    if (dishData.ingredients.length === 0) {
      alert('Adicione pelo menos um ingrediente');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const dishToSubmit = {
        name: dishData.name.trim(),
        category: dishData.category,
        ingredients: dishData.ingredients,
        servings: dishData.servings,
        isPublic: dishData.isPublic,
        ...(dishData.description.trim() && { description: dishData.description.trim() })
      };
      
      await onAddDish(dishToSubmit);
      
      onClose();
    } catch (error) {
      console.error('Erro ao criar prato:', error);
      alert('Erro ao criar prato. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomFood = async (foodData: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addCustomFood(foodData);
    setShowAddFood(false);
  };

  const filteredFoods = getFilteredFoods();
  const totalNutrition = getTotalNutrition();
  const nutritionPerServing = getNutritionPerServing();

  return (
    <>
      <div className="add-dish-overlay">
        <div className="add-dish-modal">
          <div className="add-dish-header">
            <h2>Criar Novo Prato</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="add-dish-content">
            <form onSubmit={handleSubmit} className="dish-form">
              {/* Informações básicas do prato */}
              <div className="form-section">
                <h3>Informações do Prato</h3>
                
                <div className="form-group">
                  <label htmlFor="dish-name">Nome do Prato *</label>
                  <input
                    id="dish-name"
                    type="text"
                    value={dishData.name}
                    onChange={(e) => setDishData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Frango com batata doce"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dish-description">Descrição (opcional)</label>
                  <textarea
                    id="dish-description"
                    value={dishData.description}
                    onChange={(e) => setDishData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o prato..."
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dish-category">Categoria</label>
                    <select
                      id="dish-category"
                      value={dishData.category}
                      onChange={(e) => setDishData(prev => ({ ...prev, category: e.target.value as Dish['category'] }))}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dish-servings">Porções</label>
                    <input
                      id="dish-servings"
                      type="number"
                      min="1"
                      value={dishData.servings}
                      onChange={(e) => setDishData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={dishData.isPublic}
                      onChange={(e) => setDishData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    />
                    <span>Tornar público (outros usuários poderão usar)</span>
                  </label>
                </div>
              </div>

              {/* Seleção de ingredientes */}
              <div className="form-section">
                <div className="section-header">
                  <h3>Ingredientes</h3>
                  <button 
                    type="button" 
                    className="btn-add-food"
                    onClick={() => setShowAddFood(true)}
                  >
                    + Criar Alimento
                  </button>
                </div>

                {/* Busca e filtros */}
                <div className="search-filters">
                  <div className="search-input-group">
                    <input
                      type="text"
                      placeholder="Buscar alimentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-filter"
                  >
                    {foodCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lista de alimentos */}
                <div className="foods-grid">
                  {filteredFoods.map(food => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onAdd={(quantity, unit) => addIngredient(food, quantity, unit)}
                    />
                  ))}
                </div>
              </div>

              {/* Ingredientes adicionados */}
              {dishData.ingredients.length > 0 && (
                <div className="form-section">
                  <h3>Ingredientes do Prato</h3>
                  <div className="ingredients-list">
                    {dishData.ingredients.map((ingredient, index) => (
                      <div key={index} className="ingredient-item">
                        <div className="ingredient-info">
                          <span className="ingredient-name">{ingredient.foodName}</span>
                          <div className="ingredient-controls">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={ingredient.quantity}
                              onChange={(e) => updateIngredientQuantity(index, parseFloat(e.target.value) || 0)}
                              className="quantity-input"
                            />
                            <span>{ingredient.unit}</span>
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="remove-btn"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="ingredient-nutrition">
                          {ingredient.nutrition.calories} kcal • 
                          {ingredient.nutrition.protein}g prot • 
                          {ingredient.nutrition.carbs}g carb
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo nutricional */}
              {dishData.ingredients.length > 0 && (
                <div className="form-section">
                  <h3>Resumo Nutricional</h3>
                  <div className="nutrition-summary">
                    <div className="nutrition-totals">
                      <h4>Total do Prato</h4>
                      <div className="nutrition-values">
                        <span>{totalNutrition.calories} kcal</span>
                        <span>{totalNutrition.protein}g proteína</span>
                        <span>{totalNutrition.carbs}g carboidratos</span>
                        <span>{totalNutrition.fat}g gordura</span>
                      </div>
                    </div>
                    
                    <div className="nutrition-per-serving">
                      <h4>Por Porção ({dishData.servings} porções)</h4>
                      <div className="nutrition-values">
                        <span>{nutritionPerServing.calories} kcal</span>
                        <span>{nutritionPerServing.protein}g proteína</span>
                        <span>{nutritionPerServing.carbs}g carboidratos</span>
                        <span>{nutritionPerServing.fat}g gordura</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-cancel">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || dishData.ingredients.length === 0}
                  className="btn-submit"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Prato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal para adicionar alimento customizado */}
      {showAddFood && (
        <AddFood
          onAddFood={handleAddCustomFood}
          onClose={() => setShowAddFood(false)}
        />
      )}
    </>
  );
};

// Componente para exibir cada alimento
interface FoodCardProps {
  food: Food;
  onAdd: (quantity: number, unit: string) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(food.defaultUnit);

  const handleAdd = () => {
    if (quantity > 0) {
      onAdd(quantity, selectedUnit);
    }
  };

  return (
    <div className="food-card">
      <div className="food-info">
        <div className="food-name">{food.name}</div>
        {food.brand && <div className="food-brand">{food.brand}</div>}
        <div className="food-nutrition">
          {food.nutrition.calories} kcal • 
          {food.nutrition.protein}g prot • 
          {food.nutrition.carbs}g carb
          <span className="food-unit">(por 100{food.baseUnit})</span>
        </div>
      </div>
      
      <div className="food-controls">
        <div className="quantity-control">
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
            className="quantity-input"
          />
          <select 
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="unit-select"
          >
            {food.availableUnits.map(unit => (
              <option key={unit.abbreviation} value={unit.abbreviation}>
                {unit.abbreviation}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleAdd} className="add-btn">
          Adicionar
        </button>
      </div>
    </div>
  );
};

export default AddDish;