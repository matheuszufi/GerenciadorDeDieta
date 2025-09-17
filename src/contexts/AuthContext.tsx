import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simular verificação de token ao carregar a app
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Simular autenticação - em produção, seria uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Validação simples para demonstração
      if (email === 'admin@nutriplan.com' && password === '123456') {
        const mockUser: User = {
          id: '1',
          email: email,
          name: 'Admin NutriPlan',
          avatar: 'https://ui-avatars.com/api/?name=Admin+NutriPlan&background=22c55e&color=fff'
        }
        
        const mockToken = 'mock-jwt-token-' + Date.now()
        
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('user_data', JSON.stringify(mockUser))
        setUser(mockUser)
      } else {
        throw new Error('Credenciais inválidas')
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Simular registro - em produção, seria uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Validação básica da senha para evitar warning
      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres')
      }
      
      const mockUser: User = {
        id: Date.now().toString(),
        email: email,
        name: name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22c55e&color=fff`
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      localStorage.setItem('auth_token', mockToken)
      localStorage.setItem('user_data', JSON.stringify(mockUser))
      setUser(mockUser)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
  }

  const resetPassword = async (email: string): Promise<void> => {
    // Simular envio de email de recuperação
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Email de recuperação enviado para: ${email}`)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}