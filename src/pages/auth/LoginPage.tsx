import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  // Estados para controlar os dados do formulário
  const [formData, setFormData] = useState({
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
    e.preventDefault()
    
    setIsLoading(true)
    setError('')
    
    try {
      // Validações básicas
      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório')
      }
      
      if (!formData.password.trim()) {
        throw new Error('Senha é obrigatória')
      }
      
      // Chamar a função de login do AuthContext
      await login(formData.email, formData.password)
      
      // Se chegou aqui, o login foi bem-sucedido
      // Redirecionar para o dashboard
      navigate('/dashboard')
      
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <h1 className="login-title">
          Entrar na sua conta
        </h1>
        <p className="login-subtitle">
          Acesse sua conta NutriPlan
        </p>
        
        {/* Mostrar erro se houver */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
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
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Esqueceu sua senha?</Link>
            </div>

            <button 
              type="submit" 
              className='login-button'
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="register-link">
            <p>Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link></p>
          </div>
          
          <div className="demo-credentials">
            <p><strong>Credenciais de demonstração:</strong></p>
            <p>Email: admin@nutriplan.com</p>
            <p>Senha: 123456</p>
          </div>
        </div>
      </div>
    </div>
  )
}