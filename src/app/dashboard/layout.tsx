import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Récupérer le nom de l'entreprise
  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id, nom')
    .eq('user_id', user.id)
    .single()

  // Rediriger vers l'onboarding si pas d'entreprise,
  // sauf si on est déjà sur la page onboarding (évite la boucle infinie)
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const estSurOnboarding = pathname === '/dashboard/onboarding'

  if (!entreprise && !estSurOnboarding) {
    redirect('/dashboard/onboarding')
  }

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
          <footer className="mt-12 border-t border-gray-200 pt-4 pb-2">
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-gray-400">
              <a href="/mentions-legales" className="hover:text-gray-600 transition-colors">Mentions légales</a>
              <span aria-hidden>·</span>
              <a href="/cgu" className="hover:text-gray-600 transition-colors">CGU</a>
              <span aria-hidden>·</span>
              <a href="/confidentialite" className="hover:text-gray-600 transition-colors">Confidentialité</a>
              <span aria-hidden>·</span>
              <a href="/contact" className="hover:text-gray-600 transition-colors">Contact</a>
            </nav>
          </footer>
        </main>
      </div>
    </div>
  )
}
