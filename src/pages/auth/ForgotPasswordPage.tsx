import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Apple, Mail, ArrowLeft, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuth } from '@/contexts/AuthContext'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido')
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await resetPassword(data.email)
      setIsEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email de recuperação')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Email Enviado!</CardTitle>
              <CardDescription>
                Enviamos as instruções de recuperação para<br />
                <strong>{getValues('email')}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <p className="text-xs text-gray-500">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente em alguns minutos.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                onClick={() => setIsEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Tentar outro email
              </Button>
              
              <Link
                to="/auth/login"
                className="text-center text-sm text-green-600 hover:text-green-500 font-medium"
              >
                Voltar ao login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <Apple className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900 ml-2">NutriPlan</h1>
            </div>
            <CardTitle className="text-2xl">Esqueceu a senha?</CardTitle>
            <CardDescription>
              Digite seu email e enviaremos as instruções para redefinir sua senha
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Instruções'
                )}
              </Button>

              <Link
                to="/auth/login"
                className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao login
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}