import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / titre */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">DUERP SaaS</h1>
          <p className="mt-1 text-sm text-gray-500">
            Évaluation des risques professionnels
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
