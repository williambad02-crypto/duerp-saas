import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EntrepriseForm } from '@/components/onboarding/entreprise-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Si l'entreprise existe déjà → dashboard
  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (entreprise) redirect('/dashboard')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur DUERP SaaS</h1>
        <p className="mt-1 text-sm text-gray-500">
          Commençons par configurer votre entreprise. Ces informations apparaîtront dans votre Document Unique.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <EntrepriseForm />
      </div>
    </div>
  )
}
