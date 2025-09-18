import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../lib/firebase'

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
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Função para converter FirebaseUser para nosso tipo User
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || 'Usuário',
    avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'Usuario')}&background=22c55e&color=fff`
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [firebaseEnabled, setFirebaseEnabled] = useState(true)

  // Verificar se Firebase está disponível e configurar listener
  useEffect(() => {
    if (!auth) {
      console.warn('🔄 Firebase não disponível, usando modo mock')
      setFirebaseEnabled(false)
      
      // Modo mock - verificar localStorage
      const userData = localStorage.getItem('mock_user_data')
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          localStorage.removeItem('mock_user_data')
        }
      }
      setIsLoading(false)
      return
    }

    // Firebase disponível - configurar listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser))
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }, (error) => {
      console.error('❌ Erro no onAuthStateChanged:', error)
      setFirebaseEnabled(false)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    
    try {
      if (firebaseEnabled && auth) {
        // Usar Firebase
        await signInWithEmailAndPassword(auth, email, password)
        // O onAuthStateChanged irá atualizar o estado do usuário
      } else {
        // Modo mock
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Usuário demo para testes
        if (email === 'admin@nutriplan.com' && password === '123456') {
          const mockUser: User = {
            id: '1',
            email: email,
            name: 'Admin NutriPlan',
            avatar: 'https://ui-avatars.com/api/?name=Admin+NutriPlan&background=22c55e&color=fff'
          }
          localStorage.setItem('mock_user_data', JSON.stringify(mockUser))
          setUser(mockUser)
        } else {
          throw new Error('Credenciais inválidas')
        }
      }
    } catch (error: any) {
      setIsLoading(false)
      throw new Error(error.message || 'Erro ao fazer login')
    }
  }

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Validação básica da senha
      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres')
      }

      if (firebaseEnabled && auth) {
        // Usar Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Atualizar o perfil com o nome
        await updateProfile(userCredential.user, {
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22c55e&color=fff`
        })
        // O onAuthStateChanged irá atualizar o estado do usuário
      } else {
        // Modo mock
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const mockUser: User = {
          id: Date.now().toString(),
          email: email,
          name: name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22c55e&color=fff`
        }
        localStorage.setItem('mock_user_data', JSON.stringify(mockUser))
        setUser(mockUser)
      }
    } catch (error: any) {
      setIsLoading(false)
      throw new Error(error.message || 'Erro ao criar conta')
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (firebaseEnabled && auth) {
        // Usar Firebase
        await signOut(auth)
        // O onAuthStateChanged irá limpar o estado do usuário
      } else {
        // Modo mock
        localStorage.removeItem('mock_user_data')
        setUser(null)
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer logout')
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      if (firebaseEnabled && auth) {
        // Usar Firebase
        await sendPasswordResetEmail(auth, email)
      } else {
        // Modo mock
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(`📧 Email de recuperação enviado para: ${email} (modo demonstração)`)
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar email de recuperação')
    }
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