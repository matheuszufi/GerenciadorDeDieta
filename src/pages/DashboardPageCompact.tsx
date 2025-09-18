import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useMeals } from '../hooks/useMeals'
import { useDishes } from '../hooks/useDishes'
import AddDish from '../components/AddDish'
import './DashboardPageCompact.css'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isLoading, dailyGoal, macroGoals, hasCompleteProfile } = useProfile()
  const { dailyMeals, addMeal } = useMeals()
  const { addDish } = useDishes()
  const [showAddDish, setShowAddDish] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleProfile = () => {
    navigate('/profile')
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-meal':
        setShowAddDish(true)
        break
      case 'water':
        // Implementar funcionalidade de água
        break
      case 'history':
        navigate('/history')
        break
      case 'recipes':
        // Implementar funcionalidade de receitas
        break
      default:
        break
    }
  }

  const handleAddDish = async (dishData: any) => {
    try {
      const newDish = await addDish(dishData)
      // Adicionar o prato como refeição
      await addMeal({
        type: 'lunch', // default type
        name: newDish.name,
        items: [{
          id: '1',
          foodId: newDish.id,
          foodName: newDish.name,
          quantity: 1, // 1 porção
          calories: newDish.nutritionPerServing.calories,
          protein: newDish.nutritionPerServing.protein,
          carbs: newDish.nutritionPerServing.carbs,
          fat: newDish.nutritionPerServing.fat,
          fiber: newDish.nutritionPerServing.fiber,
          sodium: newDish.nutritionPerServing.sodium,
          sugar: newDish.nutritionPerServing.sugar
        }],
        totals: {
          calories: newDish.nutritionPerServing.calories,
          protein: newDish.nutritionPerServing.protein,
          carbs: newDish.nutritionPerServing.carbs,
          fat: newDish.nutritionPerServing.fat,
          fiber: newDish.nutritionPerServing.fiber,
          sodium: newDish.nutritionPerServing.sodium,
          sugar: newDish.nutritionPerServing.sugar,
          water: newDish.nutritionPerServing.water || 0
        }
      })
      setShowAddDish(false)
    } catch (error) {
      console.error('Erro ao adicionar prato:', error)
      alert('Erro ao adicionar prato. Tente novamente.')
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">NutriPlan</h1>
          <div className="user-info">
            <button onClick={handleProfile} className="profile-button">
              👤 Perfil
            </button>
            <span className="welcome-text">Olá, {user?.name}!</span>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {isLoading ? (
          <div className="loading-state">
            <p>Carregando dados...</p>
          </div>
        ) : !hasCompleteProfile ? (
          <div className="incomplete-profile">
            <div className="welcome-section">
              <h2>👋 Bem-vindo ao NutriPlan!</h2>
              <p>Para começar, complete seu perfil para calcularmos suas metas diárias.</p>
              <button onClick={handleProfile} className="complete-profile-btn">
                Completar Perfil
              </button>
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Layout Compacto em Grid */}
            <div className="compact-grid">
              
              {/* Meta Principal: Calorias + Macros + Água */}
              <div className="main-goal-section">
                <h3>🎯 Metas Diárias</h3>
                
                {/* Meta Calórica */}
                <div className="main-goal-progress">
                  <div className="goal-numbers">
                    <span className="consumed">{dailyMeals?.dailyTotals.calories || 0}</span>
                    <span className="separator">/</span>
                    <span className="target">{dailyGoal}</span>
                    <span className="unit">kcal</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${dailyGoal ? Math.min((dailyMeals?.dailyTotals.calories || 0) / dailyGoal * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="goal-stats">
                    <span>Restam: {dailyGoal ? Math.max(0, dailyGoal - (dailyMeals?.dailyTotals.calories || 0)) : 0}</span>
                    <span>{dailyGoal ? Math.round((dailyMeals?.dailyTotals.calories || 0) / dailyGoal * 100) : 0}%</span>
                  </div>
                </div>

                {/* Macronutrientes Grid Compacto */}
                <div className="macros-mini-grid">
                  <div className="macro-mini carbs">
                    <span className="macro-icon">🍞</span>
                    <div className="macro-data">
                      <span className="macro-name">Carboidratos</span>
                      <span className="macro-values">{dailyMeals?.dailyTotals.carbs || 0}g/{macroGoals?.carbs}g</span>
                      <div className="mini-bar">
                        <div 
                          className="mini-fill carbs" 
                          style={{ width: `${macroGoals?.carbs ? Math.min((dailyMeals?.dailyTotals.carbs || 0) / macroGoals.carbs * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="macro-mini protein">
                    <span className="macro-icon">🥩</span>
                    <div className="macro-data">
                      <span className="macro-name">Proteínas</span>
                      <span className="macro-values">{dailyMeals?.dailyTotals.protein || 0}g/{macroGoals?.protein}g</span>
                      <div className="mini-bar">
                        <div 
                          className="mini-fill protein" 
                          style={{ width: `${macroGoals?.protein ? Math.min((dailyMeals?.dailyTotals.protein || 0) / macroGoals.protein * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="macro-mini fat">
                    <span className="macro-icon">🥑</span>
                    <div className="macro-data">
                      <span className="macro-name">Gorduras</span>
                      <span className="macro-values">{dailyMeals?.dailyTotals.fat || 0}g/{macroGoals?.fat}g</span>
                      <div className="mini-bar">
                        <div 
                          className="mini-fill fat" 
                          style={{ width: `${macroGoals?.fat ? Math.min((dailyMeals?.dailyTotals.fat || 0) / macroGoals.fat * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="macro-mini fiber">
                    <span className="macro-icon">🌾</span>
                    <div className="macro-data">
                      <span className="macro-name">Fibras</span>
                      <span className="macro-values">{dailyMeals?.dailyTotals.fiber || 0}g/{macroGoals?.fiber}g</span>
                      <div className="mini-bar">
                        <div 
                          className="mini-fill fiber" 
                          style={{ width: `${macroGoals?.fiber ? Math.min((dailyMeals?.dailyTotals.fiber || 0) / macroGoals.fiber * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="macro-mini water">
                    <span className="macro-icon">💧</span>
                    <div className="macro-data">
                      <span className="macro-name">Água</span>
                      <span className="macro-values">{dailyMeals?.dailyTotals.water || 0}ml/{macroGoals?.water}ml</span>
                      <div className="mini-bar">
                        <div 
                          className="mini-fill water" 
                          style={{ width: `${macroGoals?.water ? Math.min((dailyMeals?.dailyTotals.water || 0) / macroGoals.water * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="info-compact">
                <h3>⚡ Ações</h3>
                <div className="actions-mini-grid">
                  <button 
                    className="action-mini primary"
                    onClick={() => handleQuickAction('add-meal')}
                  >
                    <span className="action-icon">🍽️</span>
                    <span>Criar Prato</span>
                  </button>
                  <button 
                    className="action-mini"
                    onClick={() => handleQuickAction('water')}
                  >
                    <span className="action-icon">💧</span>
                    <span>Água</span>
                  </button>
                  <button 
                    className="action-mini"
                    onClick={() => handleQuickAction('history')}
                  >
                    <span className="action-icon">📈</span>
                    <span>Histórico</span>
                  </button>
                </div>
              </div>

              {/* Refeições de Hoje Compactas */}
              <div className="meals-compact">
                <h3>🍽️ Hoje</h3>
                {dailyMeals && dailyMeals.meals.length > 0 ? (
                  <div className="meals-mini-list">
                    {dailyMeals.meals.slice(0, 4).map((meal) => (
                      <div key={meal.id} className="meal-mini">
                        <div className="meal-mini-info">
                          <span className="meal-mini-name">{meal.name}</span>
                          <span className="meal-mini-cals">{meal.totals.calories} kcal</span>
                        </div>
                        <div className="meal-mini-macros">
                          <span>C:{meal.totals.carbs}g</span>
                          <span>P:{meal.totals.protein}g</span>
                          <span>G:{meal.totals.fat}g</span>
                        </div>
                      </div>
                    ))}
                    {dailyMeals.meals.length > 4 && (
                      <div className="more-meals-mini">
                        +{dailyMeals.meals.length - 4} mais
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-meals-mini">
                    <p>Nenhuma refeição</p>
                    <button 
                      className="add-meal-mini-btn"
                      onClick={() => handleQuickAction('add-meal')}
                    >
                      + Adicionar
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Modal AddDish */}
      {showAddDish && (
        <AddDish
          onAddDish={handleAddDish}
          onClose={() => setShowAddDish(false)}
        />
      )}
    </div>
  )
}