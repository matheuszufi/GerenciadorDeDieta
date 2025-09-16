import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Apple, BarChart3, Calendar, ChefHat, Target, Users } from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Apple className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">NutriPlan</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Recursos</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Preços</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900">Contato</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth/register">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Gerencie sua dieta com
            <span className="text-green-600"> inteligência</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforme seus hábitos alimentares com nossa plataforma completa de gestão nutricional. 
            Planeje refeições, monitore calorias e alcance seus objetivos de saúde.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/auth/register">Comece Sua Jornada</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/auth/login">Ver Demonstração</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Recursos Poderosos
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ChefHat className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Planejamento de Refeições</CardTitle>
                <CardDescription>
                  Crie planos alimentares personalizados baseados em suas preferências e objetivos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Análise Nutricional</CardTitle>
                <CardDescription>
                  Monitore macros, micros e calorias com gráficos detalhados e relatórios
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Metas Personalizadas</CardTitle>
                <CardDescription>
                  Defina e acompanhe objetivos específicos como perda de peso ou ganho de massa
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Agenda Alimentar</CardTitle>
                <CardDescription>
                  Organize suas refeições em um calendário intuitivo e receba lembretes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Acompanhamento Profissional</CardTitle>
                <CardDescription>
                  Conecte-se com nutricionistas e receba orientação especializada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Apple className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Base de Alimentos</CardTitle>
                <CardDescription>
                  Acesso a milhares de alimentos com informações nutricionais completas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-4xl font-bold text-green-600 mb-2">10k+</h4>
              <p className="text-gray-600">Usuários Ativos</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold text-blue-600 mb-2">50k+</h4>
              <p className="text-gray-600">Refeições Planejadas</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold text-purple-600 mb-2">95%</h4>
              <p className="text-gray-600">Satisfação dos Usuários</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-green-600">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Pronto para transformar sua alimentação?
          </h3>
          <p className="text-xl text-green-100 mb-8">
            Junte-se a milhares de pessoas que já mudaram seus hábitos alimentares
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
            <Link to="/auth/register">Começar Agora - Grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Apple className="h-8 w-8 text-green-400" />
                <h5 className="text-xl font-bold">NutriPlan</h5>
              </div>
              <p className="text-gray-400">
                Sua plataforma completa para uma vida mais saudável
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Produto</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Empresa</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Suporte</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NutriPlan. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}