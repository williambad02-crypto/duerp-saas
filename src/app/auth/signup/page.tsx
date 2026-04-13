import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
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

        {/* Carte d'inscription */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Créer un compte</h2>
          <p className="text-sm text-gray-500 mb-6">
            Essai gratuit 14 jours — aucune carte bancaire requise
          </p>
          <SignupForm />
          <p className="mt-4 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
