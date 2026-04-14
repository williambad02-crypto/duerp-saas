import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { PaywallBanner } from '@/components/dashboard/paywall-banner'
import { getInfoAbonnement, serializeAbonnement } from '@/lib/abonnement'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Récupérer entreprise et abonnement en parallèle
  const [{ data: entreprise }, infoAbonnement] = await Promise.all([
    supabase
      .from('entreprises')
      .select('id, nom')
      .eq('user_id', user.id)
      .single(),
    getInfoAbonnement(user.id),
  ])

  // Rediriger vers onboarding si pas d'entreprise
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const estSurOnboarding = pathname === '/dashboard/onboarding'

  if (!entreprise && !estSurOnboarding) {
    redirect('/dashboard/onboarding')
  }

  const nomEntreprise = entreprise?.nom ?? user.email ?? 'Mon Entreprise'
  const aboProp = serializeAbonnement(infoAbonnement)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64">
        <Sidebar nomEntreprise={nomEntreprise} abonnement={aboProp} />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header nomEntreprise={nomEntreprise} abonnement={aboProp} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Bandeau paywall si nécessaire */}
          {aboProp.bandeau && (
            <PaywallBanner
              bandeau={aboProp.bandeau}
              joursRestantsTrial={aboProp.joursRestantsTrial}
            />
          )}

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
