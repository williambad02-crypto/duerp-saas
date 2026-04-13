import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer le nom de l'entreprise
  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('nom')
    .eq('user_id', user.id)
    .single()

  const nomEntreprise = entreprise?.nom ?? user.email ?? 'Mon Entreprise'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar desktop — masquée sur mobile */}
      <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64">
        <Sidebar nomEntreprise={nomEntreprise} />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header nomEntreprise={nomEntreprise} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
