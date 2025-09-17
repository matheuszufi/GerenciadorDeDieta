import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">NutriPlan Dashboard</h1>
          <div className="user-info">
            <span className="welcome-text">Bem-vindo, {user?.name}!</span>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>Bem-vindo ao seu Gerenciador de Dieta!</h2>
            <p>Aqui você pode acompanhar sua alimentação, definir metas e muito mais.</p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Meu Perfil</h3>
              <p>Visualize e edite suas informações pessoais</p>
              <div className="user-details">
                <p><strong>Nome:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>ID:</strong> {user?.id}</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Refeições de Hoje</h3>
              <p>Registre suas refeições do dia</p>
              <div className="meals-summary">
                <p>🍳 Café da manhã: Não registrado</p>
                <p>🥗 Almoço: Não registrado</p>
                <p>🍽️ Jantar: Não registrado</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Metas Nutricionais</h3>
              <p>Acompanhe suas metas diárias</p>
              <div className="goals-summary">
                <p>🎯 Calorias: 0/2000 kcal</p>
                <p>🥤 Água: 0/8 copos</p>
                <p>🏃 Exercícios: 0/30 min</p>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Progresso Semanal</h3>
              <p>Veja seu progresso da última semana</p>
              <div className="progress-summary">
                <p>📊 Média de calorias: 0 kcal/dia</p>
                <p>📈 Tendência: Sem dados</p>
                <p>🏆 Metas alcançadas: 0/7 dias</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Ações Rápidas</h3>
            <div className="actions-grid">
              <button className="action-button">
                ➕ Adicionar Refeição
              </button>
              <button className="action-button">
                💧 Registrar Água
              </button>
              <button className="action-button">
                🏃 Adicionar Exercício
              </button>
              <button className="action-button">
                � Ver Relatórios
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}