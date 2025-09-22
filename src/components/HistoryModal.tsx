import React, { useState, useEffect } from 'react'
import { useMealsHistory } from '../hooks/useMealsHistory'
import { formatBrazilianDate, getRelativeDateString } from '../utils/timezone'
import './HistoryModal.css'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { historyData, stats, isLoading, error, loadHistory } = useMealsHistory()
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadHistory(selectedPeriod)
    }
  }, [isOpen, selectedPeriod])

  const formatDate = (dateStr: string) => {
    return formatBrazilianDate(dateStr)
  }

  const getDayName = (dateStr: string) => {
    return getRelativeDateString(dateStr)
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return '#22c55e' // Verde
    if (percentage >= 70 && percentage < 90) return '#f59e0b' // Amarelo
    if (percentage > 110) return '#ef4444' // Vermelho (excesso)
    return '#6b7280' // Cinza (insuficiente)
  }

  if (!isOpen) return null

  return (
    <div className="history-modal-overlay">
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-modal-header">
          <h2>📊 Histórico de Metas</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="history-modal-content">
          {/* Controles do período */}
          <div className="period-controls">
            <label>Período:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="period-select"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={14}>Últimos 14 dias</option>
              <option value={30}>Últimos 30 dias</option>
            </select>
          </div>

          {isLoading && (
            <div className="loading-state">
              <p>Carregando histórico...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p className="error-message">{error}</p>
            </div>
          )}

          {!isLoading && !error && historyData.length > 0 && (
            <>
              {/* Estatísticas gerais */}
              {stats && (
                <div className="stats-section">
                  <h3>📈 Estatísticas do Período</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-label">Streak</span>
                      <span className="stat-value">{stats.streak} dias</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Dias com registro</span>
                      <span className="stat-value">{stats.daysWithCompleteData}/{stats.totalDays}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Média de calorias</span>
                      <span className="stat-value">{stats.averageCalories} kcal</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Média de proteína</span>
                      <span className="stat-value">{stats.averageProtein}g</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline dos dias */}
              <div className="timeline-section">
                <h3>📅 Timeline</h3>
                <div className="timeline">
                  {historyData.slice().reverse().map((day) => (
                    <div 
                      key={day.date} 
                      className={`timeline-day ${selectedDate === day.date ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
                    >
                      <div className="day-header">
                        <div className="day-info">
                          <span className="day-name">{getDayName(day.date)}</span>
                          <span className="day-date">{formatDate(day.date)}</span>
                        </div>
                        <div className="day-summary">
                          <span className="meals-count">{day.mealsCount} refeições</span>
                          <span className="calories-summary">
                            {Math.round(day.consumed.calories)} / {day.goals.calories} kcal
                          </span>
                        </div>
                      </div>

                      {/* Barras de progresso dos macros */}
                      <div className="day-progress">
                        <div className="macro-progress">
                          <span className="macro-label">Cal</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.min(day.percentages.calories, 100)}%`,
                                backgroundColor: getCompletionColor(day.percentages.calories)
                              }}
                            ></div>
                          </div>
                          <span className="percentage">{Math.round(day.percentages.calories)}%</span>
                        </div>

                        <div className="macro-progress">
                          <span className="macro-label">Prot</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.min(day.percentages.protein, 100)}%`,
                                backgroundColor: getCompletionColor(day.percentages.protein)
                              }}
                            ></div>
                          </div>
                          <span className="percentage">{Math.round(day.percentages.protein)}%</span>
                        </div>

                        <div className="macro-progress">
                          <span className="macro-label">Carb</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.min(day.percentages.carbs, 100)}%`,
                                backgroundColor: getCompletionColor(day.percentages.carbs)
                              }}
                            ></div>
                          </div>
                          <span className="percentage">{Math.round(day.percentages.carbs)}%</span>
                        </div>

                        <div className="macro-progress">
                          <span className="macro-label">Gord</span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.min(day.percentages.fat, 100)}%`,
                                backgroundColor: getCompletionColor(day.percentages.fat)
                              }}
                            ></div>
                          </div>
                          <span className="percentage">{Math.round(day.percentages.fat)}%</span>
                        </div>
                      </div>

                      {/* Detalhes expandidos */}
                      {selectedDate === day.date && (
                        <div className="day-details">
                          <div className="details-grid">
                            <div className="detail-item">
                              <span className="detail-label">🎯 Calorias</span>
                              <span className="detail-value">
                                {Math.round(day.consumed.calories)} / {day.goals.calories} kcal
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🥩 Proteínas</span>
                              <span className="detail-value">
                                {Math.round(day.consumed.protein * 10) / 10} / {day.goals.protein}g
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🍞 Carboidratos</span>
                              <span className="detail-value">
                                {Math.round(day.consumed.carbs * 10) / 10} / {day.goals.carbs}g
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🥑 Gorduras</span>
                              <span className="detail-value">
                                {Math.round(day.consumed.fat * 10) / 10} / {day.goals.fat}g
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🌾 Fibras</span>
                              <span className="detail-value">
                                {Math.round(day.consumed.fiber * 10) / 10} / {day.goals.fiber}g
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">🥤 Refeições</span>
                              <span className="detail-value">{day.mealsCount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!isLoading && !error && historyData.length === 0 && (
            <div className="empty-state">
              <p>Nenhum dado encontrado para o período selecionado.</p>
              <p>Comece registrando suas refeições diárias!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryModal