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
          <div className="foods-table-container">
            <table className="foods-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Calorias</th>
                  <th>Proteína</th>
                  <th>Carboidrato</th>
                  <th>Gordura</th>
                  <th>Fibra</th>
                  <th>Unidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.map(food => (
                  <tr key={food.id} className="food-row">
                    <td className="food-name">
                      <div>
                        <strong>{food.name}</strong>
                        {food.brand && <div className="food-brand">{food.brand}</div>}
                      </div>
                    </td>
                    <td className="food-category">
                      {categories.find(cat => cat.value === food.category)?.label}
                    </td>
                    <td className="nutrition-value">{food.nutrition.calories} kcal</td>
                    <td className="nutrition-value">{food.nutrition.protein}g</td>
                    <td className="nutrition-value">{food.nutrition.carbs}g</td>
                    <td className="nutrition-value">{food.nutrition.fat}g</td>
                    <td className="nutrition-value">{food.nutrition.fiber}g</td>
                    <td className="food-unit">
                      Por {food.availableUnits[0]?.gramsEquivalent || 100}{food.baseUnit}
                    </td>
                    <td className="food-actions">
                      <button 
                        className="edit-button"
                        onClick={() => setEditingFood(food)}
                        title="Editar alimento"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteFood(food.id, food.name)}
                        title="Excluir alimento"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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