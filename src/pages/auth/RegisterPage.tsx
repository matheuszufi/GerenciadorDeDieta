import { useState } from 'react'
import './RegisterPage.css'

export default function RegisterPage() {
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
    
    // Aqui faremos a validação e envio dos dados
    console.log('Dados do formulário:', formData)
    
    // Simular um delay de envio
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
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
        </div>
      </div>
    </div>
  )
}