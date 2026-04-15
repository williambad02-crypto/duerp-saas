import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Module Bruit — SafeAnalyse.' }

export default async function ModuleBruitOverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!entreprise) redirect('/dashboard/onboarding')

  // Charger toutes les évaluations APR chroniques liées au risque bruit (module_status non null)
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select(`
      id,
      identifiant_auto,
      danger,
      module_status,
      criticite_brute,
      operations!inner (
        id, nom,
        postes!inner (
          id, nom
        )
      ),
      plans_maitrise (
        criticite_residuelle
      ),
      evaluations_bruit (
        methode,
        zone,
        criticite_bruit,
        criticite_residuelle_bruit,
        statut,
        total_points
      )
    `)
    .eq('code_module', 'APR')
    .eq('type_risque', 'chronique')
    .not('module_status', 'is', null)
    .order('created_at', { ascending: false })

  // Garder seulement les risques bruit (numero_risque_ed840 = 11 = Bruit)
  const { data: evaluationsBruit } = await supabase
    .from('evaluations')
    .select(`
      id,
      identifiant_auto,
      danger,
      module_status,
      numero_risque_ed840,
      criticite_brute,
      operations!inner (
        id, nom,
        postes!inner (
          id, nom
        )
      ),
      plans_maitrise (
        criticite_residuelle
      ),
      evaluations_bruit (
        methode,
        zone,
        criticite_bruit,
        criticite_residuelle_bruit,
        statut,
        total_points
      )
    `)
    .eq('code_module', 'APR')
    .eq('type_risque', 'chronique')
    .eq('numero_risque_ed840', 11)
    .not('module_status', 'is', null)
    .order('created_at', { ascending: false })

  const liste = evaluationsBruit ?? []

  const nbValides = liste.filter(
    (e) => (e.evaluations_bruit as unknown as { statut?: string } | null)?.statut === 'valide'
  ).length
  const nbEnCours = liste.filter(
    (e) => (e.evaluations_bruit as unknown as { statut?: string } | null)?.statut === 'en_cours'
  ).length
  const nbNonCommences = liste.filter(
    (e) => !e.evaluations_bruit
  ).length

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-brand-off border border-brand-sand rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-brand-navy">Module Bruit</h1>
            </div>
            <p className="text-sm text-brand-bronze">
              Évaluation normée ED 6035 / ISO 9612 simplifiée — Risque n°11 ED 840
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {nbValides} validé{nbValides > 1 ? 's' : ''}
            </span>
            {nbEnCours > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                {nbEnCours} en cours
              </span>
            )}
            {nbNonCommences > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full font-medium">
                {nbNonCommences} à faire
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Liste des évaluations */}
      {liste.length === 0 ? (
        <div className="bg-brand-off border border-brand-sand rounded-xl p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-brand-navy mb-2">Aucune évaluation bruit</h2>
          <p className="text-sm text-brand-bronze max-w-sm mx-auto">
            Pour commencer, identifiez un risque Bruit (n°11) dans votre tableau APR,
            puis lancez la présélection depuis la colonne EVR.
          </p>
          <Link
            href="/dashboard/postes"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-brand-cream rounded-lg text-sm font-medium hover:bg-brand-navy-light transition-colors"
          >
            Aller aux postes de travail →
          </Link>
        </div>
      ) : (
        <div className="bg-brand-off border border-brand-sand rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-sand bg-brand-cream/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-bronze uppercase tracking-wide">Poste</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-bronze uppercase tracking-wide">Opération</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-bronze uppercase tracking-wide">Réf.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-brand-bronze uppercase tracking-wide">Danger</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-brand-bronze uppercase tracking-wide">Méthode</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-brand-bronze uppercase tracking-wide">C. résid.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-brand-bronze uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-brand-bronze uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand/60">
              {liste.map((ev) => {
                const op = ev.operations as unknown as { id: string; nom: string; postes: { id: string; nom: string } }
                const bruitEval = ev.evaluations_bruit as unknown as {
                  methode?: string
                  zone?: string
                  criticite_residuelle_bruit?: number
                  statut?: string
                } | null
                const pm = (ev.plans_maitrise as unknown as { criticite_residuelle: number | null }[] | null)?.[0]
                const critRes = bruitEval?.criticite_residuelle_bruit ?? pm?.criticite_residuelle ?? null

                const zoneColors: Record<string, string> = {
                  vert: 'bg-green-50 text-green-700 border-green-200',
                  jaune: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                  orange: 'bg-orange-50 text-orange-700 border-orange-200',
                  rouge: 'bg-red-50 text-red-700 border-red-200',
                }
                const zoneColor = bruitEval?.zone ? zoneColors[bruitEval.zone] ?? '' : ''

                return (
                  <tr key={ev.id} className="hover:bg-brand-cream/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-navy">{op.postes.nom}</td>
                    <td className="px-4 py-3 text-brand-bronze">{op.nom}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-brand-bronze/70">
                      {ev.identifiant_auto ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-brand-bronze">{ev.danger ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {bruitEval?.methode ? (
                        <span className="text-xs text-brand-bronze capitalize">
                          {bruitEval.methode === 'sommaire' ? 'Estimation' : 'Simplifiée'}
                        </span>
                      ) : (
                        <span className="text-xs text-brand-bronze/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {critRes !== null ? (
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${zoneColor || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {critRes}
                        </span>
                      ) : (
                        <span className="text-xs text-brand-bronze/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!bruitEval ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] bg-gray-100 text-gray-500 rounded-full">
                          À faire
                        </span>
                      ) : bruitEval.statut === 'valide' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Validé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-[11px] bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full font-medium">
                          En cours
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/dashboard/modules/bruit/${ev.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-navy text-brand-cream rounded-lg text-xs font-medium hover:bg-brand-navy-light transition-colors"
                      >
                        {!bruitEval || bruitEval.statut !== 'valide' ? 'Évaluer' : 'Voir'}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Note méthodologique */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-blue-800 mb-1">Méthodologie</p>
            <p className="text-xs text-blue-700">
              L&apos;évaluation bruit suit la démarche ED 6035 (INRS) en 2 niveaux :
              <strong> estimation sommaire</strong> (test de communication) ou
              <strong> évaluation simplifiée</strong> par points d&apos;exposition.
              Le résultat remonte automatiquement dans le tableau APR.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
