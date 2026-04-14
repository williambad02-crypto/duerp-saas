import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getInfoAbonnement } from '@/lib/abonnement'
import { PortailStripeButton } from './portail-stripe-button'
import { CheckoutButton } from './checkout-button'

export const metadata = { title: "Paramètres — DUERP SaaS" }

function labelStatut(statut: string): string {
  const labels: Record<string, string> = {
    essai:   'Essai gratuit en cours',
    actif:   'Abonnement actif',
    impaye:  'Paiement en attente',
    annule:  'Abonnement annulé',
    aucun:   'Mode découverte',
  }
  return labels[statut] ?? statut
}

function couleurStatut(statut: string): string {
  const couleurs: Record<string, string> = {
    essai:  'bg-blue-100 text-blue-700',
    actif:  'bg-green-100 text-green-700',
    impaye: 'bg-red-100 text-red-700',
    annule: 'bg-gray-100 text-gray-600',
    aucun:  'bg-amber-100 text-amber-700',
  }
  return couleurs[statut] ?? 'bg-gray-100 text-gray-600'
}

export default async function ParametresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: entreprise }, abo] = await Promise.all([
    supabase.from('entreprises').select('nom, siret, secteur_activite, effectif, adresse, code_postal, ville').eq('user_id', user.id).single(),
    getInfoAbonnement(user.id),
  ])

  const hasCustId = !!abo.stripeCustomerId

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">Gérez votre abonnement et les informations de votre compte.</p>
      </div>

      {/* Abonnement */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
        <div className="px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Abonnement</h2>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Statut</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${couleurStatut(abo.statut)}`}>
              {labelStatut(abo.statut)}
            </span>
          </div>

          {abo.statut === 'essai' && abo.joursRestantsTrial !== null && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Fin de l&apos;essai</span>
              <span className="text-sm font-medium text-gray-900">
                dans {abo.joursRestantsTrial} jour{abo.joursRestantsTrial > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {abo.statut === 'actif' && abo.currentPeriodEnd && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Prochain renouvellement</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(abo.currentPeriodEnd).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
          )}

          {abo.plan && abo.statut === 'actif' && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Plan</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {abo.plan} — {abo.periode ?? '—'}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex flex-col sm:flex-row gap-3">
          {hasCustId ? (
            <PortailStripeButton />
          ) : (
            <CheckoutButton />
          )}
        </div>
      </div>

      {/* Compte */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Compte</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900 font-medium">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Entreprise */}
      {entreprise && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Entreprise</h2>
          <div className="space-y-2 text-sm">
            {[
              ['Nom', entreprise.nom],
              ['SIRET', entreprise.siret],
              ["Secteur d'activité", entreprise.secteur_activite],
              ['Effectif', entreprise.effectif ? `${entreprise.effectif} salarié${entreprise.effectif > 1 ? 's' : ''}` : null],
              ['Adresse', [entreprise.adresse, entreprise.code_postal, entreprise.ville].filter(Boolean).join(', ') || null],
            ].map(([label, valeur]) =>
              valeur ? (
                <div key={label as string} className="flex justify-between gap-4">
                  <span className="text-gray-500 shrink-0">{label}</span>
                  <span className="text-gray-900 text-right">{valeur}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  )
}
