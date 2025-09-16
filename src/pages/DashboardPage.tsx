import { useNavigate } from 'react-router-dom'
import { 
  Apple, 
  BarChart3, 
  Calendar, 
  ChefHat, 
  Target, 
  LogOut,
  Bell,
  Search,
  Plus
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const stats = [
    { title: 'Calorias Hoje', value: '1,847', target: '2,200', icon: Target, color: 'text-blue-600' },
    { title: 'Refeições', value: '3', target: '4', icon: ChefHat, color: 'text-green-600' },
    { title: 'Proteínas', value: '89g', target: '120g', icon: BarChart3, color: 'text-purple-600' },
    { title: 'Meta Semanal', value: '85%', target: '100%', icon: Calendar, color: 'text-orange-600' }
  ]

  const recentMeals = [
    { name: 'Café da Manhã', time: '08:30', calories: 450, status: 'complete' },
    { name: 'Almoço', time: '12:45', calories: 650, status: 'complete' },
    { name: 'Lanche', time: '16:20', calories: 280, status: 'complete' },
    { name: 'Jantar', time: '19:30', calories: 500, status: 'pending' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Apple className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900 ml-2">NutriPlan</h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar alimentos, receitas..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 mt-2">
            Acompanhe seu progresso nutricional e mantenha-se no caminho certo
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    Meta: {stat.target}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Meals */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Refeições de Hoje</CardTitle>
                <CardDescription>
                  Acompanhe suas refeições e calorias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMeals.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          meal.status === 'complete' ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-sm text-gray-500">{meal.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{meal.calories} cal</p>
                        <p className="text-sm text-gray-500">
                          {meal.status === 'complete' ? 'Completo' : 'Pendente'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Refeição
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Planejar Refeição
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Relatórios
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Definir Metas
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendário
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dica do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  💡 Beba pelo menos 8 copos de água hoje para manter-se hidratado e auxiliar no metabolismo!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}