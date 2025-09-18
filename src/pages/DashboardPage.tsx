import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useMeals } from '../hooks/useMeals'
import FirestoreTest from '../components/FirestoreTest'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { profile, isLoading, tmb, get, dailyGoal, macroGoals, hasCompleteProfile } = useProfile()
  const { dailyMeals, calculateProgress } = useMeals()

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
        // Futura página de registrar refeição
        alert('Funcionalidade em desenvolvimento: Registrar Refeição')
        break
      case 'history':
        // Futura página de histórico
        alert('Funcionalidade em desenvolvimento: Ver Histórico')
        break
      case 'water':
        // Futura funcionalidade de água
        alert('Funcionalidade em desenvolvimento: Registrar Água')
        break
      case 'recipes':
        // Futura funcionalidade de receitas
        alert('Funcionalidade em desenvolvimento: Receitas')
        break
      default:
        break
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">NutriPlan Dashboard</h1>
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
            {/* Seção de Metas Diárias */}
            <div className="daily-goals-section">
              <h2>📊 Metas de Hoje</h2>
              
              {/* Meta Principal de Calorias */}
              <div className="primary-goal">
                <div className="goal-card primary">
                  <div className="goal-header">
                    <h3>Meta Calórica Diária</h3>
                    <span className="goal-icon">🎯</span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-numbers">
                      <span className="consumed">{dailyMeals?.dailyTotals.calories || 0}</span>
                      <span className="separator">/</span>
                      <span className="target">{dailyGoal}</span>
                      <span className="unit">kcal</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${dailyGoal ? calculateProgress(dailyGoal) : 0}%` }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <span className="remaining">
                        Restam: {dailyGoal ? Math.max(0, dailyGoal - (dailyMeals?.dailyTotals.calories || 0)) : 0} kcal
                      </span>
                      <span className="percentage">
                        {dailyGoal ? Math.round(calculateProgress(dailyGoal)) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macronutrientes */}
              {macroGoals && (
                <div className="macros-section">
                  <h3>🥗 Macronutrientes</h3>
                  <div className="macros-grid">
                    {/* Proteínas */}
                    <div className="macro-card protein">
                      <div className="macro-header">
                        <span className="macro-icon">🥩</span>
                        <h4>Proteínas</h4>
                      </div>
                      <div className="macro-progress">
                        <div className="macro-numbers">
                          <span className="consumed">{dailyMeals?.dailyTotals.protein || 0}</span>
                          <span className="separator">/</span>
                          <span className="target">{macroGoals.protein}</span>
                          <span className="unit">g</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill protein-fill" 
                            style={{ width: `${Math.min(((dailyMeals?.dailyTotals.protein || 0) / macroGoals.protein) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Carboidratos */}
                    <div className="macro-card carbs">
                      <div className="macro-header">
                        <span className="macro-icon">🍞</span>
                        <h4>Carboidratos</h4>
                      </div>
                      <div className="macro-progress">
                        <div className="macro-numbers">
                          <span className="consumed">{dailyMeals?.dailyTotals.carbs || 0}</span>
                          <span className="separator">/</span>
                          <span className="target">{macroGoals.carbs}</span>
                          <span className="unit">g</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill carbs-fill" 
                            style={{ width: `${Math.min(((dailyMeals?.dailyTotals.carbs || 0) / macroGoals.carbs) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Gorduras */}
                    <div className="macro-card fat">
                      <div className="macro-header">
                        <span className="macro-icon">🥑</span>
                        <h4>Gorduras</h4>
                      </div>
                      <div className="macro-progress">
                        <div className="macro-numbers">
                          <span className="consumed">{dailyMeals?.dailyTotals.fat || 0}</span>
                          <span className="separator">/</span>
                          <span className="target">{macroGoals.fat}</span>
                          <span className="unit">g</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill fat-fill" 
                            style={{ width: `${Math.min(((dailyMeals?.dailyTotals.fat || 0) / macroGoals.fat) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Fibras */}
                    <div className="macro-card fiber">
                      <div className="macro-header">
                        <span className="macro-icon">🌾</span>
                        <h4>Fibras</h4>
                      </div>
                      <div className="macro-progress">
                        <div className="macro-numbers">
                          <span className="consumed">{dailyMeals?.dailyTotals.fiber || 0}</span>
                          <span className="separator">/</span>
                          <span className="target">{macroGoals.fiber}</span>
                          <span className="unit">g</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill fiber-fill" 
                            style={{ width: `${Math.min(((dailyMeals?.dailyTotals.fiber || 0) / macroGoals.fiber) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Micronutrientes */}
                  <div className="micros-section">
                    <h4>📋 Controle Adicional</h4>
                    <div className="micros-grid">
                      <div className="micro-item">
                        <span className="micro-icon">🧂</span>
                        <div className="micro-info">
                          <span className="micro-name">Sódio</span>
                          <span className="micro-value">
                            {dailyMeals?.dailyTotals.sodium || 0} / {macroGoals.sodium} mg
                          </span>
                          <div className="micro-bar">
                            <div 
                              className="micro-fill sodium-fill"
                              style={{ width: `${Math.min(((dailyMeals?.dailyTotals.sodium || 0) / macroGoals.sodium) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="micro-item">
                        <span className="micro-icon">🍯</span>
                        <div className="micro-info">
                          <span className="micro-name">Açúcar</span>
                          <span className="micro-value">
                            {dailyMeals?.dailyTotals.sugar || 0} / {macroGoals.sugar} g
                          </span>
                          <div className="micro-bar">
                            <div 
                              className="micro-fill sugar-fill"
                              style={{ width: `${Math.min(((dailyMeals?.dailyTotals.sugar || 0) / macroGoals.sugar) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dados Metabólicos */}
              <div className="metabolic-data">
                <h3>⚡ Dados Metabólicos</h3>
                <div className="metabolic-grid">
                  <div className="metabolic-item">
                    <h4>TMB</h4>
                    <div className="metabolic-value">
                      <span className="number">{tmb}</span>
                      <span className="unit">kcal</span>
                    </div>
                    <p className="metabolic-desc">Taxa Metabólica Basal</p>
                  </div>

                  <div className="metabolic-item">
                    <h4>GET</h4>
                    <div className="metabolic-value">
                      <span className="number">{get}</span>
                      <span className="unit">kcal</span>
                    </div>
                    <p className="metabolic-desc">Gasto Energético Total</p>
                  </div>

                  <div className="metabolic-item">
                    <h4>Objetivo</h4>
                    <div className="goal-type">
                      {profile?.goal === 'lose' && '📉 Perder Peso'}
                      {profile?.goal === 'maintain' && '⚖️ Manter Peso'}
                      {profile?.goal === 'gain' && '📈 Ganhar Peso'}
                      {profile?.goal === 'muscle' && '💪 Ganhar Massa'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Ações Rápidas */}
            <div className="quick-actions-section">
              <h2>⚡ Ações Rápidas</h2>
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-btn primary"
                  onClick={() => handleQuickAction('add-meal')}
                >
                  <span className="action-icon">🍽️</span>
                  <span className="action-text">Adicionar Refeição</span>
                </button>

                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('water')}
                >
                  <span className="action-icon">💧</span>
                  <span className="action-text">Registrar Água</span>
                </button>

                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('history')}
                >
                  <span className="action-icon">�</span>
                  <span className="action-text">Ver Histórico</span>
                </button>

                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickAction('recipes')}
                >
                  <span className="action-icon">📝</span>
                  <span className="action-text">Receitas</span>
                </button>
              </div>
            </div>

            {/* Seção de Refeições de Hoje */}
            <div className="todays-meals-section">
              <h2>🍽️ Refeições de Hoje</h2>
              {dailyMeals && dailyMeals.meals.length > 0 ? (
                <div className="meals-list">
                  {dailyMeals.meals.map((meal) => (
                    <div key={meal.id} className="meal-card">
                      <div className="meal-header">
                        <h4>{meal.name}</h4>
                        <span className="meal-calories">{meal.totals.calories} kcal</span>
                      </div>
                      <div className="meal-items">
                        {meal.items.map((item) => (
                          <span key={item.id} className="meal-item">
                            {item.foodName} ({item.quantity}g)
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-meals">
                  <p>Nenhuma refeição registrada hoje.</p>
                  <button 
                    className="add-first-meal-btn"
                    onClick={() => handleQuickAction('add-meal')}
                  >
                    Adicionar primeira refeição
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Componente de teste temporário para debug */}
      <FirestoreTest />
    </div>
  )
}