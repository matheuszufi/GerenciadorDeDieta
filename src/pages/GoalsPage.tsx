import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileManager } from '../hooks/useProfileManager'
import { useAuth } from '../contexts/AuthContext'
import './GoalsPage.css'

interface GoalFormData {
  dailyGoal: number
  macroGoals: {
    protein: number
    carbs: number
    fat: number
  }
  microGoals: {
    fiber: number
    sugar: number
    sodium: number
  }
  hydrationGoal: number
}

export default function GoalsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isLoading, dailyGoal, macroGoals, updateProfile } = useProfileManager()
  
  const [formData, setFormData] = useState<GoalFormData>({
    dailyGoal: 2000,
    macroGoals: {
      protein: 150,
      carbs: 250,
      fat: 65
    },
    microGoals: {
      fiber: 25,
      sugar: 50,
      sodium: 2300
    },
    hydrationGoal: 2000
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Carregar dados atuais do perfil apenas uma vez
  useEffect(() => {
    if (!dataLoaded && dailyGoal && macroGoals) {
      setFormData(prev => ({
        ...prev,
        dailyGoal: dailyGoal,
        macroGoals: {
          protein: macroGoals.protein,
          carbs: macroGoals.carbs,
          fat: macroGoals.fat
        }
      }))
      setDataLoaded(true)
    }
  }, [dailyGoal, macroGoals, dataLoaded])

  const handleInputChange = (category: keyof GoalFormData, field: string, value: number) => {
    if (category === 'dailyGoal' || category === 'hydrationGoal') {
      setFormData(prev => ({
        ...prev,
        [category]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }))
    }
  }

  const calculateCaloriesFromMacros = () => {
    const { protein, carbs, fat } = formData.macroGoals
    return (protein * 4) + (carbs * 4) + (fat * 9)
  }

  const handleSave = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      await updateProfile({
        dailyGoal: formData.dailyGoal,
        macroGoals: formData.macroGoals
      })
      
      // TODO: Salvar microGoals e hydrationGoal quando implementarmos no backend
      
      alert('Metas atualizadas com sucesso!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Erro ao atualizar metas:', error)
      alert('Erro ao atualizar metas')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAutoBalance = () => {
    const calories = formData.dailyGoal
    // Distribuição padrão: 30% proteína, 40% carboidrato, 30% gordura
    const protein = Math.round((calories * 0.30) / 4)
    const carbs = Math.round((calories * 0.40) / 4)
    const fat = Math.round((calories * 0.30) / 9)
    
    setFormData(prev => ({
      ...prev,
      macroGoals: { protein, carbs, fat }
    }))
  }

  if (isLoading) {
    return (
      <div className="goals-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando metas...</p>
        </div>
      </div>
    )
  }

  const macroCalories = calculateCaloriesFromMacros()
  const caloriesDifference = macroCalories - formData.dailyGoal

  return (
    <div className="goals-container">
      <header className="goals-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Voltar
        </button>
        <h1>Editar Metas Nutricionais</h1>
        <div className="header-actions">
          <button onClick={handleAutoBalance} className="auto-balance-btn">
            🎯 Auto-Balancear
          </button>
        </div>
      </header>

      <main className="goals-main">
        <div className="goals-form">
          {/* Seção de Calorias */}
          <section className="goal-section">
            <h2>Meta Calórica Diária</h2>
            <div className="input-group">
              <label htmlFor="dailyGoal">Calorias por dia</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="dailyGoal"
                  value={formData.dailyGoal}
                  onChange={(e) => handleInputChange('dailyGoal', '', Number(e.target.value))}
                  min="1000"
                  max="5000"
                  step="50"
                />
                <span className="unit">kcal</span>
              </div>
            </div>
          </section>

          {/* Seção de Macronutrientes */}
          <section className="goal-section">
            <h2>Macronutrientes</h2>
            <div className="macros-grid">
              <div className="macro-input">
                <label htmlFor="protein">Proteína</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="protein"
                    value={formData.macroGoals.protein}
                    onChange={(e) => handleInputChange('macroGoals', 'protein', Number(e.target.value))}
                    min="0"
                    max="500"
                    step="5"
                  />
                  <span className="unit">g</span>
                </div>
                <span className="calories-info">{formData.macroGoals.protein * 4} kcal</span>
              </div>

              <div className="macro-input">
                <label htmlFor="carbs">Carboidratos</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="carbs"
                    value={formData.macroGoals.carbs}
                    onChange={(e) => handleInputChange('macroGoals', 'carbs', Number(e.target.value))}
                    min="0"
                    max="800"
                    step="5"
                  />
                  <span className="unit">g</span>
                </div>
                <span className="calories-info">{formData.macroGoals.carbs * 4} kcal</span>
              </div>

              <div className="macro-input">
                <label htmlFor="fat">Gorduras</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="fat"
                    value={formData.macroGoals.fat}
                    onChange={(e) => handleInputChange('macroGoals', 'fat', Number(e.target.value))}
                    min="0"
                    max="300"
                    step="5"
                  />
                  <span className="unit">g</span>
                </div>
                <span className="calories-info">{formData.macroGoals.fat * 9} kcal</span>
              </div>
            </div>

            {/* Resumo de calorias dos macros */}
            <div className={`macro-summary ${Math.abs(caloriesDifference) > 100 ? 'warning' : 'success'}`}>
              <p>
                <strong>Total dos macros:</strong> {macroCalories} kcal
                {caloriesDifference !== 0 && (
                  <span className="difference">
                    ({caloriesDifference > 0 ? '+' : ''}{caloriesDifference} kcal da meta)
                  </span>
                )}
              </p>
            </div>
          </section>

          {/* Seção Avançada */}
          <section className="goal-section">
            <button 
              className="toggle-advanced"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>Configurações Avançadas</span>
              <span className={`toggle-icon ${showAdvanced ? 'open' : ''}`}>▼</span>
            </button>

            {showAdvanced && (
              <>
                {/* Micronutrientes */}
                <div className="advanced-section">
                  <h3>Micronutrientes</h3>
                  <div className="micros-grid">
                    <div className="micro-input">
                      <label htmlFor="fiber">Fibras</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="fiber"
                          value={formData.microGoals.fiber}
                          onChange={(e) => handleInputChange('microGoals', 'fiber', Number(e.target.value))}
                          min="0"
                          max="100"
                          step="1"
                        />
                        <span className="unit">g</span>
                      </div>
                      <span className="goal-info">Recomendado: 25-35g</span>
                    </div>

                    <div className="micro-input">
                      <label htmlFor="sugar">Açúcar (máx.)</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="sugar"
                          value={formData.microGoals.sugar}
                          onChange={(e) => handleInputChange('microGoals', 'sugar', Number(e.target.value))}
                          min="0"
                          max="200"
                          step="5"
                        />
                        <span className="unit">g</span>
                      </div>
                      <span className="goal-info">Recomendado: &lt;50g</span>
                    </div>

                    <div className="micro-input">
                      <label htmlFor="sodium">Sódio (máx.)</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="sodium"
                          value={formData.microGoals.sodium}
                          onChange={(e) => handleInputChange('microGoals', 'sodium', Number(e.target.value))}
                          min="0"
                          max="5000"
                          step="100"
                        />
                        <span className="unit">mg</span>
                      </div>
                      <span className="goal-info">Recomendado: &lt;2300mg</span>
                    </div>
                  </div>
                </div>

                {/* Hidratação */}
                <div className="advanced-section">
                  <h3>Hidratação</h3>
                  <div className="input-group">
                    <label htmlFor="hydration">Meta de água por dia</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        id="hydration"
                        value={formData.hydrationGoal}
                        onChange={(e) => handleInputChange('hydrationGoal', '', Number(e.target.value))}
                        min="500"
                        max="5000"
                        step="100"
                      />
                      <span className="unit">ml</span>
                    </div>
                    <span className="goal-info">Recomendado: 2000-3000ml</span>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Botões de Ação */}
          <div className="form-actions">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave} 
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Metas'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}