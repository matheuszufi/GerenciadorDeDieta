import React, { useState } from 'react'
import { useFoods } from '../hooks/useFoods'
import AddIngredientModal from '../components/AddIngredientModal'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './FoodsPage.css'

// Componente inline para EditFoodModal temporário
const EditFoodModal = ({ food, isOpen, onClose }: any) => {
  if (!isOpen) return null
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Alimento</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Funcionalidade de edição será implementada em breve.</p>
          <p>Alimento: {food.name}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

const FoodsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { foods, isLoading, deleteCustomFood } = useFoods()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Redirect if not authenticated
  if (!user) {
    navigate('/login')
    return null
  }

  // Filter foods based on search and category
  const filteredFoods = foods
    .filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (food.brand && food.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory
      const isUserFood = food.isCustom && food.userId === user.id
      
      return matchesSearch && matchesCategory && isUserFood
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { 
      sensitivity: 'base',
      ignorePunctuation: true 
    }))

  const handleDeleteFood = async (foodId: string, foodName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${foodName}"?`)) {
      try {
        await deleteCustomFood(foodId)
      } catch (error) {
        console.error('Erro ao excluir alimento:', error)
        alert('Erro ao excluir alimento')
      }
    }
  }

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'protein', label: 'Proteínas' },
    { value: 'carbs', label: 'Carboidratos' },
    { value: 'vegetables', label: 'Vegetais' },
    { value: 'fruits', label: 'Frutas' },
    { value: 'dairy', label: 'Laticínios' },
    { value: 'grains', label: 'Grãos' },
    { value: 'fats', label: 'Gorduras' },
    { value: 'beverages', label: 'Bebidas' },
    { value: 'others', label: 'Outros' }
  ]

  if (isLoading) {
    return (
      <div className="foods-page">
        <div className="loading">Carregando alimentos...</div>
      </div>
    )
  }

  return (
    <div className="foods-page">
      <div className="foods-header">
        <div className="header-top">
          <h1>Meus Alimentos</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Voltar ao Dashboard
          </button>
        </div>
        
        <div className="header-actions">
          <button 
            className="add-food-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Adicionar Alimento
          </button>
        </div>
      </div>

      <div className="foods-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar alimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="foods-list">
        {filteredFoods.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum alimento encontrado.</p>
            <button 
              className="add-first-food"
              onClick={() => setIsAddModalOpen(true)}
            >
              Criar primeiro alimento
            </button>
          </div>
        ) : (
          <div className="foods-grid">
            {filteredFoods.map(food => (
              <div key={food.id} className="food-card">
                <div className="food-header">
                  <h3>{food.name}</h3>
                  {food.brand && <span className="food-brand">{food.brand}</span>}
                </div>
                
                <div className="food-category">
                  {categories.find(cat => cat.value === food.category)?.label}
                </div>
                
                <div className="food-nutrition">
                  <div className="nutrition-item">
                    <span className="label">Calorias:</span>
                    <span className="value">{food.nutrition.calories} kcal</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Proteína:</span>
                    <span className="value">{food.nutrition.protein}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Carboidratos:</span>
                    <span className="value">{food.nutrition.carbs}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="label">Gorduras:</span>
                    <span className="value">{food.nutrition.fat}g</span>
                  </div>
                </div>
                
                <div className="food-unit">
                  Por {food.availableUnits[0]?.gramsEquivalent || 100}{food.baseUnit}
                </div>
                
                <div className="food-actions">
                  <button 
                    className="edit-button"
                    onClick={() => setEditingFood(food)}
                  >
                    Editar
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteFood(food.id, food.name)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddIngredientModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      {editingFood && (
        <EditFoodModal 
          food={editingFood}
          isOpen={!!editingFood}
          onClose={() => setEditingFood(null)}
        />
      )}
    </div>
  )
}

export default FoodsPage