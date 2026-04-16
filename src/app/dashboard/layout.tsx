import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
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
    <DashboardShell nomEntreprise={nomEntreprise} abonnement={aboProp}>
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          {children}
        </div>

        <footer className="mt-12 border-t border-brand-sand pt-4 pb-2">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-brand-bronze/50">
            <a href="/mentions-legales" className="hover:text-brand-navy transition-colors">Mentions légales</a>
            <span aria-hidden>·</span>
            <a href="/cgu" className="hover:text-brand-navy transition-colors">CGU</a>
            <span aria-hidden>·</span>
            <a href="/confidentialite" className="hover:text-brand-navy transition-colors">Confidentialité</a>
            <span aria-hidden>·</span>
            <a href="/contact" className="hover:text-brand-navy transition-colors">Contact</a>
          </nav>
        </footer>
      </main>
    </DashboardShell>
  )
}
