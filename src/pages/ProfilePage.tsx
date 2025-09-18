import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: 'sedentary',
    goal: 'maintain'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Carregar dados do perfil do Firestore
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', user.id))
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data()
          setFormData(prev => ({
            ...prev,
            age: profileData.age?.toString() || '',
            weight: profileData.weight?.toString() || '',
            height: profileData.height?.toString() || '',
            gender: profileData.gender || 'male',
            activityLevel: profileData.activityLevel || 'sedentary',
            goal: profileData.goal || 'maintain'
          }))
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        setMessage('Erro ao carregar dados do perfil')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    if (!user?.id) {
      setMessage('Erro: usuário não identificado')
      setIsLoading(false)
      return
    }
    
    try {
      // Preparar dados para salvar
      const profileData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseInt(formData.height) : null,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        updatedAt: new Date().toISOString(),
        // Calcular e salvar TMB e GET se todos os dados estiverem presentes
        tmb: calculateTMB(),
        get: calculateGET()
      }
      
      // Salvar no Firestore
      await setDoc(doc(db, 'profiles', user.id), profileData, { merge: true })
      
      setMessage('Perfil atualizado com sucesso!')
      
      // Opcional: voltar para dashboard após 2 segundos
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setMessage('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  // Função para calcular TMB usando a fórmula de Mifflin-St Jeor
  const calculateTMB = () => {
    const { age, weight, height, gender } = formData
    
    if (!age || !weight || !height) return null
    
    const ageNum = parseFloat(age)
    const weightNum = parseFloat(weight)
    const heightNum = parseFloat(height)
    
    let tmb = 0
    
    if (gender === 'male') {
      // Homens: TMB = (10 × peso) + (6,25 × altura) - (5 × idade) + 5
      tmb = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + 5
    } else {
      // Mulheres: TMB = (10 × peso) + (6,25 × altura) - (5 × idade) - 161
      tmb = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) - 161
    }
    
    return Math.round(tmb)
  }

  // Função para calcular GET (Gasto Energético Total)
  const calculateGET = () => {
    const tmb = calculateTMB()
    if (!tmb) return null
    
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      intense: 1.725,
      athlete: 1.9
    }
    
    const factor = activityFactors[formData.activityLevel as keyof typeof activityFactors]
    return Math.round(tmb * factor)
  }

  // Função para obter descrição do nível de atividade
  const getActivityDescription = () => {
    const descriptions = {
      sedentary: 'Sedentário (pouco ou nenhum exercício)',
      light: 'Leve (1-3 treinos por semana)',
      moderate: 'Moderado (3-5 treinos por semana)',
      intense: 'Intenso (6-7 treinos por semana)',
      athlete: 'Atleta (2 treinos por dia)'
    }
    
    return descriptions[formData.activityLevel as keyof typeof descriptions]
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={handleBack} className="back-button">
          ← Voltar ao Dashboard
        </button>
        <h1 className="profile-title">Editar Perfil</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Usuario')}&background=22c55e&color=fff`} 
              alt={user?.name} 
              className="avatar-image"
            />
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>

          {message && (
            <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {isLoadingProfile ? (
            <div className="loading-profile">
              <p>Carregando dados do perfil...</p>
            </div>
          ) : (
            <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Informações Pessoais</h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
                <small className="form-hint">O email não pode ser alterado</small>
              </div>

              <div className="form-group">
                <label htmlFor="age" className="form-label">Idade</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="form-input"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="1"
                  max="120"
                  placeholder="Ex: 25"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="form-label">Sexo</label>
                <select
                  id="gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Dados Físicos</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight" className="form-label">Peso (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    className="form-input"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="1"
                    max="500"
                    step="0.1"
                    placeholder="Ex: 70.5"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="height" className="form-label">Altura (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    className="form-input"
                    value={formData.height}
                    onChange={handleInputChange}
                    min="50"
                    max="250"
                    placeholder="Ex: 175"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="activityLevel" className="form-label">Nível de Atividade Física</label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  className="form-select"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                >
                  <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                  <option value="light">Leve (1-3 treinos por semana)</option>
                  <option value="moderate">Moderado (3-5 treinos por semana)</option>
                  <option value="intense">Intenso (6-7 treinos por semana)</option>
                  <option value="athlete">Atleta (2 treinos por dia)</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Objetivo</h3>
              
              <div className="form-group">
                <label htmlFor="goal" className="form-label">Meta Principal</label>
                <select
                  id="goal"
                  name="goal"
                  className="form-select"
                  value={formData.goal}
                  onChange={handleInputChange}
                >
                  <option value="lose">Perder peso</option>
                  <option value="maintain">Manter peso</option>
                  <option value="gain">Ganhar peso</option>
                  <option value="muscle">Ganhar massa muscular</option>
                </select>
              </div>
            </div>

            {/* Seção de Cálculos Metabólicos */}
            {formData.age && formData.weight && formData.height && (
              <div className="form-section">
                <h3>Cálculos Metabólicos</h3>
                
                <div className="metabolic-info">
                  <div className="metabolic-card">
                    <h4>TMB - Taxa Metabólica Basal</h4>
                    <div className="metabolic-value">
                      {calculateTMB()} <span>kcal/dia</span>
                    </div>
                    <p className="metabolic-description">
                      Energia mínima necessária para manter as funções vitais em repouso
                    </p>
                  </div>

                  <div className="metabolic-card">
                    <h4>GET - Gasto Energético Total</h4>
                    <div className="metabolic-value">
                      {calculateGET()} <span>kcal/dia</span>
                    </div>
                    <p className="metabolic-description">
                      Total de energia gasta considerando seu nível de atividade
                    </p>
                    <p className="activity-level">
                      <strong>Nível de atividade:</strong> {getActivityDescription()}
                    </p>
                  </div>

                  <div className="metabolic-formula">
                    <h5>Fórmula utilizada (Mifflin-St Jeor):</h5>
                    <p>
                      {formData.gender === 'male' 
                        ? 'Homens: TMB = (10 × peso) + (6,25 × altura) - (5 × idade) + 5'
                        : 'Mulheres: TMB = (10 × peso) + (6,25 × altura) - (5 × idade) - 161'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleBack}
                className="cancel-button"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}