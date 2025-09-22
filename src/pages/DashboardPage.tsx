import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useMeals } from '../hooks/useMeals'
import { useState } from 'react'
import HistoryModal from '../components/HistoryModal'
import MacroProgress from '../components/MacroProgress'
import CircularProgress from '../components/CircularProgress'
import MealEditor from '../components/MealEditor'
import AddIngredientModal from '../components/AddIngredientModal'
import type { Meal } from '../hooks/useMeals'
import './DashboardPage.css'

export default function DashboardPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { isLoading, tmb, get, dailyGoal, macroGoals, hasCompleteProfile } = useProfile()
  const { dailyMeals, calculateProgress, removeMeal } = useMeals()
  
  // Estados
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isMealEditorOpen, setIsMealEditorOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'>('breakfast')
  const [showFabMenu, setShowFabMenu] = useState(false)
  const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false)

  // Handlers
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const openMealEditor = (type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack', meal?: Meal) => {
    setEditingMeal(meal || null)
    setSelectedMealType(type)
    setIsMealEditorOpen(true)
    setShowFabMenu(false) // Fechar menu flutuante ao abrir editor
  }

  const toggleFabMenu = () => {
    setShowFabMenu(!showFabMenu)
  }

  const handleDeleteMeal = async (mealId: string, mealName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a refeição "${mealName}"?`)) {
      try {
        await removeMeal(mealId)
      } catch (error) {
        console.error('Erro ao excluir refeição:', error)
        alert('Erro ao excluir refeição')
      }
    }
  }

  // Função para ordenar refeições na sequência desejada
  const sortMealsByOrder = (meals: Meal[]) => {
    const mealOrder = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack']
    return [...meals].sort((a, b) => {
      const orderA = mealOrder.indexOf(a.type)
      const orderB = mealOrder.indexOf(b.type)
      return orderA - orderB
    })
  }

  // Estados de loading e perfil incompleto
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!hasCompleteProfile) {
    return (
      <div className="dashboard-container">
        <div className="incomplete-profile">
          <div className="welcome-card">
            <h2>👋 Bem-vindo ao NutriPlan!</h2>
            <p>Complete seu perfil para acessar o dashboard completo.</p>
            <button onClick={() => navigate('/profile')} className="complete-profile-btn">
              Completar Perfil
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Dados para MacroProgress
  const macroData = macroGoals ? {
    protein: {
      consumed: dailyMeals?.dailyTotals.protein || 0,
      target: macroGoals.protein,
      calories: (dailyMeals?.dailyTotals.protein || 0) * 4,
      unit: 'g',
      color: '#10b981',
      label: 'Proteínas'
    },
    carbs: {
      consumed: dailyMeals?.dailyTotals.carbs || 0,
      target: macroGoals.carbs,
      calories: (dailyMeals?.dailyTotals.carbs || 0) * 4,
      unit: 'g',
      color: '#10b981',
      label: 'Carboidratos'
    },
    fat: {
      consumed: dailyMeals?.dailyTotals.fat || 0,
      target: macroGoals.fat,
      calories: (dailyMeals?.dailyTotals.fat || 0) * 9,
      unit: 'g',
      color: '#10b981',
      label: 'Gorduras'
    },
    fiber: {
      consumed: dailyMeals?.dailyTotals.fiber || 0,
      target: 25, // Meta recomendada de fibra
      unit: 'g',
      color: '#10b981',
      label: 'Fibras'
    },
    sugar: {
      consumed: dailyMeals?.dailyTotals.sugar || 0,
      target: 50, // Meta máxima recomendada de açúcar
      unit: 'g',
      color: '#10b981',
      label: 'Açúcar'
    },
    sodium: {
      consumed: dailyMeals?.dailyTotals.sodium || 0,
      target: 2300, // Meta máxima recomendada de sódio (mg)
      unit: 'mg',
      color: '#10b981',
      label: 'Sódio'
    },
    calories: {
      consumed: dailyMeals?.dailyTotals.calories || 0,
      target: dailyGoal || 2000
    }
  } : null

  return (
    <div className="dashboard-container compact">
      {/* Header Compacto */}
      <header className="dashboard-header compact">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">NutriPlan</h1>
            <div className="quick-stats">
              <span className="stat">
                {Math.round(dailyMeals?.dailyTotals.calories || 0)}/{dailyGoal} kcal
              </span>
              <span className="stat-progress">
                {Math.round(calculateProgress(dailyGoal || 2000))}%
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/profile')} className="header-btn profile" title="Perfil">
              <span className="btn-icon">👤</span>
              <span className="btn-text">Perfil</span>
            </button>
            <button onClick={handleLogout} className="header-btn logout" title="Sair">
              <span className="btn-icon">�</span>
              <span className="btn-text">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main compact">
        <div className="dashboard-grid">
          {/* Seção de Progresso Principal */}
          <section className="progress-section">
            <div className="calories-overview">
              <h3>Calorias</h3>
              <CircularProgress
                value={dailyMeals?.dailyTotals.calories || 0}
                max={dailyGoal || 2000}
                size={120}
                strokeWidth={8}
                gradient={true}
                animated={true}
              />
              <div className="calories-info">
                <div className="calories-percentage">
                  {Math.round(calculateProgress(dailyGoal || 2000))}% da meta
                </div>
                <div className="calories-remaining">
                  {Math.max(0, (dailyGoal || 2000) - (dailyMeals?.dailyTotals.calories || 0)).toFixed(2)} restantes
                </div>
              </div>
            </div>

            {/* Metas Metabólicas Compactas */}
            <div className="metabolic-summary">
              <div className="meta-item">
                <span className="meta-label">TMB</span>
                <span className="meta-value">{tmb}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">GET</span>
                <span className="meta-value">{get}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Meta</span>
                <span className="meta-value">{dailyGoal}</span>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="quick-actions">
              <h4>Ações Rápidas</h4>
              <div className="action-buttons">
                <button 
                  onClick={() => setIsAddIngredientModalOpen(true)} 
                  className="action-btn create-ingredient"
                  title="Criar Ingrediente"
                >
                  <span className="action-icon">🥗</span>
                  <span className="action-text">Criar Ingrediente</span>
                </button>
                <button 
                  onClick={() => navigate('/foods')} 
                  className="action-btn manage-foods"
                  title="Gerenciar Alimentos"
                >
                  <span className="action-icon">🍎</span>
                  <span className="action-text">Gerenciar Alimentos</span>
                </button>
                <button 
                  onClick={() => navigate('/goals')} 
                  className="action-btn edit-goals"
                  title="Editar Metas"
                >
                  <span className="action-icon">🎯</span>
                  <span className="action-text">Editar Metas</span>
                </button>
                <button 
                  onClick={() => setIsHistoryModalOpen(true)} 
                  className="action-btn history"
                  title="Histórico"
                >
                  <span className="action-icon">📊</span>
                  <span className="action-text">Histórico</span>
                </button>
              </div>
            </div>
          </section>

          {/* Seção de Macronutrientes */}
          {macroData && (
            <section className="macros-section">
              <h3>Macronutrientes</h3>
              <MacroProgress 
                protein={macroData.protein}
                carbs={macroData.carbs}
                fat={macroData.fat}
                fiber={macroData.fiber}
                sugar={macroData.sugar}
                sodium={macroData.sodium}
                calories={{ consumed: 0, target: 1 }} // Valores dummy para não mostrar calorias
                compact={true} 
              />
            </section>
          )}

          {/* Seção de Refeições Compacta */}
          <section className="meals-section">
            <div className="meals-header">
              <h3>Refeições de Hoje</h3>
              <div className="meal-actions">
                <button 
                  onClick={() => openMealEditor('breakfast')} 
                  className="primary-add-btn"
                  title="Adicionar Nova Refeição"
                >
                  + Adicionar Refeição
                </button>
              </div>
            </div>

            <div className="meals-list compact">
              {dailyMeals && dailyMeals.meals.length > 0 ? (
                sortMealsByOrder(dailyMeals.meals).map((meal) => (
                  <div key={meal.id} className="meal-card compact">
                    <div className="meal-header">
                      <span className="meal-icon">
                        {meal.type === 'breakfast' && '☀️'}
                        {meal.type === 'morning_snack' && '🥐'}
                        {meal.type === 'lunch' && '�️'}
                        {meal.type === 'afternoon_snack' && '🧁'}
                        {meal.type === 'dinner' && '🌙'}
                        {meal.type === 'evening_snack' && '🥛'}
                      </span>
                      <div className="meal-info">
                        <h4>{meal.name}</h4>
                        <span className="meal-items-count">{meal.items.length} itens</span>
                      </div>
                      <div className="meal-nutrition">
                        <span className="calories">{Math.round(meal.totals.calories)} kcal</span>
                        <div className="macros">
                          <span>P: {Math.round(meal.totals.protein)}g</span>
                          <span>C: {Math.round(meal.totals.carbs)}g</span>
                          <span>G: {Math.round(meal.totals.fat)}g</span>
                        </div>
                      </div>
                      <div className="meal-actions">
                        <button 
                          onClick={() => openMealEditor(meal.type, meal)}
                          className="edit-btn"
                          title="Editar refeição"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteMeal(meal.id, meal.name)}
                          className="delete-btn"
                          title="Excluir refeição"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {/* Lista de itens da refeição */}
                    <div className="meal-items">
                      {meal.items.map((item, index) => (
                        <div key={item.id || index} className="meal-item">
                          <span className="item-name">{item.foodName}</span>
                          <div className="item-details">
                            <span className="item-quantity">{item.quantity}g</span>
                            <span className="item-calories">{Math.round(item.calories)}kcal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-meals compact">
                  <p>Nenhuma refeição registrada hoje</p>
                  <div className="empty-actions">
                    <button onClick={() => openMealEditor('breakfast')} className="add-meal-btn breakfast">
                      ☀️ Café da Manhã
                    </button>
                    <button onClick={() => openMealEditor('morning_snack')} className="add-meal-btn morning-snack">
                      🥐 Lanche da Manhã
                    </button>
                    <button onClick={() => openMealEditor('lunch')} className="add-meal-btn lunch">
                      �️ Almoço
                    </button>
                    <button onClick={() => openMealEditor('afternoon_snack')} className="add-meal-btn afternoon-snack">
                      🧁 Lanche da Tarde
                    </button>
                    <button onClick={() => openMealEditor('dinner')} className="add-meal-btn dinner">
                      🌙 Jantar
                    </button>
                    <button onClick={() => openMealEditor('evening_snack')} className="add-meal-btn evening-snack">
                      🥛 Ceia
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Seção de Progresso da Água */}
          <section className="water-section">
            <h3>Hidratação</h3>
            <div className="water-progress">
              <CircularProgress
                value={dailyMeals?.dailyTotals.water || 0}
                max={2000} // Meta recomendada de 2L de água por dia
                size={100}
                strokeWidth={8}
                gradient={true}
                animated={true}
                label="Água"
                unit="ml"
              />
              <div className="water-info">
                <div className="water-percentage">
                  {Math.round(((dailyMeals?.dailyTotals.water || 0) / 2000) * 100)}% da meta
                </div>
                <div className="water-remaining">
                  {Math.max(0, 2000 - (dailyMeals?.dailyTotals.water || 0))}ml restantes
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Botão Flutuante para Adicionar Refeição */}
      <div className={`floating-add-container ${showFabMenu ? 'menu-open' : ''}`}>
        {/* Menu de Opções */}
        {showFabMenu && (
          <div className="fab-menu">
            <button onClick={() => openMealEditor('breakfast')} className="fab-option breakfast">
              <span>☀️</span>
              <span>Café da Manhã</span>
            </button>
            <button onClick={() => openMealEditor('morning_snack')} className="fab-option morning-snack">
              <span>🥐</span>
              <span>Lanche da Manhã</span>
            </button>
            <button onClick={() => openMealEditor('lunch')} className="fab-option lunch">
              <span>�️</span>
              <span>Almoço</span>
            </button>
            <button onClick={() => openMealEditor('afternoon_snack')} className="fab-option afternoon-snack">
              <span>🧁</span>
              <span>Lanche da Tarde</span>
            </button>
            <button onClick={() => openMealEditor('dinner')} className="fab-option dinner">
              <span>🌙</span>
              <span>Jantar</span>
            </button>
            <button onClick={() => openMealEditor('evening_snack')} className="fab-option evening-snack">
              <span>🥛</span>
              <span>Ceia</span>
            </button>
          </div>
        )}
        
        {/* Botão Principal */}
        <button 
          onClick={toggleFabMenu}
          className={`floating-add-btn ${showFabMenu ? 'active' : ''}`}
          title="Adicionar Refeição"
        >
          <span className={`plus-icon ${showFabMenu ? 'rotated' : ''}`}>+</span>
        </button>
      </div>

      {/* Modals */}
      <HistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
      
      <MealEditor
        isOpen={isMealEditorOpen}
        onClose={() => setIsMealEditorOpen(false)}
        mealType={selectedMealType}
        existingMeal={editingMeal}
      />

      <AddIngredientModal
        isOpen={isAddIngredientModalOpen}
        onClose={() => setIsAddIngredientModalOpen(false)}
      />
    </div>
  )
}