import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PosteCard } from '@/components/postes/poste-card'
import { NouveauPosteModal } from '@/components/postes/nouveau-poste-modal'
import { AlertTriangle, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default async function PostesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!entreprise) redirect('/dashboard/onboarding')

  // Charger les postes + le plan en parallèle
  const [{ data: postes }, { data: abo }] = await Promise.all([
    supabase
      .from('postes')
      .select(`
        id,
        nom,
        description,
        ordre,
        operations (
          id,
          evaluations (
            id,
            criticite_brute,
            plans_maitrise (
              criticite_residuelle
            )
          )
        )
      `)
      .eq('entreprise_id', entreprise.id)
      .order('ordre', { ascending: true }),
    supabase
      .from('abonnements')
      .select('plan_type, legacy_plan, statut')
      .eq('user_id', user.id)
      .single(),
  ])

  const planType         = (abo?.plan_type ?? 'industrie') as string
  const isLegacy         = abo?.legacy_plan ?? false
  const nbPostes         = postes?.length ?? 0
  // Les clients legacy et Premium ont accès illimité
  const isIndustrieLimite = !isLegacy && planType === 'industrie'
  const approcheLimite    = isIndustrieLimite && nbPostes === 4
  const limiteAtteinte    = isIndustrieLimite && nbPostes >= 5

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Postes de travail</h1>
        <p className="mt-1 text-sm text-gray-500">
          {nbPostes} poste{nbPostes > 1 ? 's' : ''} configuré{nbPostes > 1 ? 's' : ''}
          {isIndustrieLimite && (
            <span className="ml-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Pack Industrie — {nbPostes}/5
            </span>
          )}
        </p>
      </div>

      {/* Bannière approche de la limite (4/5) */}
      {approcheLimite && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Dernier poste disponible</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Le Pack Industrie inclut 5 postes. Passez au Pack Premium pour des postes illimités.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Passer Premium
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Liste des postes ou état vide */}
      {!postes || postes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Aucun poste de travail</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Commencez par créer vos postes de travail. Un poste regroupe les salariés exposés aux mêmes risques
            (ex&nbsp;: Soudeur, Cariste, Agent administratif).
          </p>
          <NouveauPosteModal>
            <button className="bg-brand-navy text-brand-cream text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors">
              Créer mon premier poste
            </button>
          </NouveauPosteModal>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {postes.map((poste) => (
            <PosteCard
              key={poste.id}
              poste={{
                id: poste.id,
                nom: poste.nom,
                description: poste.description ?? undefined,
                nbOperations: poste.operations?.length ?? 0,
                nbEvaluations: poste.operations?.flatMap((o) => o.evaluations ?? []).length ?? 0,
              }}
            />
          ))}

          {/* Carte "+" pour ajouter un poste — masquée ou remplacée si limite atteinte */}
          {limiteAtteinte ? (
            <Link
              href="/pricing"
              className="group bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl p-5 hover:border-amber-400 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 min-h-[140px]"
            >
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-amber-300 group-hover:border-amber-500 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-5 h-5 text-amber-500 group-hover:text-amber-700 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-amber-800">Limite atteinte</p>
                <p className="text-xs text-amber-600 mt-0.5">Passer au Pack Premium →</p>
              </div>
            </Link>
          ) : (
            <NouveauPosteModal>
              <button className="group bg-white border-2 border-dashed border-gray-200 rounded-xl p-5 shadow-sm hover:border-brand-navy hover:shadow-md transition-all text-left w-full flex flex-col items-center justify-center gap-3 min-h-[140px]">
                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-brand-navy flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-navy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-brand-navy transition-colors">
                  Ajouter un poste
                </span>
              </button>
            </NouveauPosteModal>
          )}
        </div>
      )}
    </div>
  )
}
