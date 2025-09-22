import React, { useState } from 'react';
import './AddMeal.css';

interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water?: number; // ml
}

interface FoodItem {
  id: string;
  name: string;
  nutrition: NutritionalInfo; // per 100g
}

interface AddMealProps {
  onAddMeal: (meal: {
    name: string;
    quantity: number;
    unit: string;
    totals: NutritionalInfo;
  }) => void;
  onClose: () => void;
}

// Base de dados de alimentos - agora vazio, usuário deve criar seus próprios alimentos
const FOOD_DATABASE: FoodItem[] = [];

const AddMeal: React.FC<AddMealProps> = ({ onAddMeal, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');

  const filteredFoods = FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotals = (food: FoodItem, qty: number): NutritionalInfo => {
    const multiplier = qty / 100; // base é sempre 100g
    return {
      calories: Math.round(food.nutrition.calories * multiplier),
      protein: Math.round(food.nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(food.nutrition.carbs * multiplier * 10) / 10,
      fat: Math.round(food.nutrition.fat * multiplier * 10) / 10,
      fiber: Math.round(food.nutrition.fiber * multiplier * 10) / 10,
      water: food.nutrition.water ? Math.round(food.nutrition.water * multiplier) : 0
    };
  };

  const handleAddMeal = () => {
    if (!selectedFood || quantity <= 0) return;

    const totals = calculateTotals(selectedFood, quantity);
    
    onAddMeal({
      name: selectedFood.name,
      quantity,
      unit,
      totals
    });

    // Reset form
    setSearchTerm('');
    setSelectedFood(null);
    setQuantity(100);
    setUnit('g');
  };

  return (
    <div className="add-meal-overlay">
      <div className="add-meal-modal">
        <div className="add-meal-header">
          <h2>Adicionar Alimento</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="add-meal-content">
          {/* Busca de alimentos */}
          <div className="food-search">
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Lista de alimentos */}
          {searchTerm && (
            <div className="food-list">
              {filteredFoods.map(food => (
                <div
                  key={food.id}
                  className={`food-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="food-name">{food.name}</div>
                  <div className="food-nutrition">
                    {food.nutrition.calories} kcal • {food.nutrition.protein}g prot • {food.nutrition.carbs}g carb
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Informações do alimento selecionado */}
          {selectedFood && (
            <div className="selected-food">
              <h3>{selectedFood.name}</h3>
              
              <div className="quantity-input">
                <label>Quantidade:</label>
                <div className="quantity-controls">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="quantity-field"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="unit-select"
                  >
                    <option value="g">gramas</option>
                    <option value="ml">ml</option>
                    <option value="unidade">unidade</option>
                  </select>
                </div>
              </div>

              <div className="nutrition-preview">
                <h4>Valores Nutricionais ({quantity}{unit}):</h4>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <span className="label">Calorias:</span>
                    <span className="value">{calculateTotals(selectedFood, quantity).calories} kcal</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Proteínas:</span>
                    <span className="value">{calculateTotals(selectedFood, quantity).protein}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Carboidratos:</span>
                    <span className="value">{calculateTotals(selectedFood, quantity).carbs}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Gorduras:</span>
                    <span className="value">{calculateTotals(selectedFood, quantity).fat}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Fibras:</span>
                    <span className="value">{calculateTotals(selectedFood, quantity).fiber}g</span>
                  </div>
                  {selectedFood.nutrition.water && (
                    <div className="nutrition-item">
                      <span className="label">Água:</span>
                      <span className="value">{calculateTotals(selectedFood, quantity).water}ml</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="add-meal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="add-btn" 
            onClick={handleAddMeal}
            disabled={!selectedFood || quantity <= 0}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMeal;