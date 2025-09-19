import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from './useProfile'

interface UpdateProfileData {
  dailyGoal?: number
  macroGoals?: {
    protein: number
    carbs: number
    fat: number
  }
  microGoals?: {
    fiber: number
    sugar: number
    sodium: number
  }
  hydrationGoal?: number
}

export function useProfileManager() {
  const { user } = useAuth()
  const profileData = useProfile()

  const updateProfile = async (updates: UpdateProfileData) => {
    if (!user?.id) throw new Error('Usuário não autenticado')

    try {
      const now = new Date().toISOString()
      
      // Atualizar documento do perfil com as novas metas
      const profileRef = doc(db, 'profiles', user.id)
      
      const updateData = {
        ...updates,
        updatedAt: now
      }

      await setDoc(profileRef, updateData, { merge: true })
      
      // TODO: Se implementarmos metas personalizadas separadas do perfil,
      // salvar também em uma coleção separada
      
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw new Error('Erro ao atualizar perfil')
    }
  }

  return {
    ...profileData,
    updateProfile
  }
}