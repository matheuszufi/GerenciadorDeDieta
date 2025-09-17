import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './RegisterPage.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  // Estados para controlar os dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  
  // Estado para controlar quando está enviando o formulário
  const [isLoading, setIsLoading] = useState(false)
  
  // Estado para mostrar mensagens de erro
  const [error, setError] = useState('')

  // Função para atualizar os valores dos campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Função que será chamada quando o formulário for enviado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Previne o comportamento padrão do formulário
    
    setIsLoading(true)
    setError('')
    
    try {
      // Validações básicas
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório')
      }
      
      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório')
      }
      
      if (formData.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres')
      }
      
      // Chamar a função de registro do AuthContext
      await register(formData.name, formData.email, formData.password)
      
      // Se chegou aqui, o registro foi bem-sucedido
      // Redirecionar para o dashboard
      navigate('/dashboard')
      
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="register-container">
      <div className="register-wrapper">
        <h1 className="register-title">
          Criar Conta
        </h1>
        <p className="register-subtitle">
          Junte-se ao NutriPlan e transforme sua alimentação
        </p>
        
        {/* Mostrar erro se houver */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="register-card">
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name" className='form-label'>Nome Completo</label>
                <input
                  type="text" 
                  id="name" 
                  name="name"
                  className='form-input' 
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
            </div>

            <div className='form-group'>
                <label htmlFor="email" className='form-label'>Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className='form-input' 
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
            </div>

            <div className='form-group'>
                <label htmlFor="password" className='form-label'>Senha</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  className='form-input' 
                  placeholder="Crie uma senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
            </div>

            <button 
              type="submit" 
              className='register-button'
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
          
          <div className="login-link">
            <p>Já tem uma conta? <a href="/login">Faça login aqui</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}