import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AprTableOperation, LigneAPRUI } from '@/components/apr/apr-table-operation'

interface Props {
  params: Promise<{ id: string; opId: string }>
}

export default async function RisquesOperationPage({ params }: Props) {
  const { id: posteId, opId: operationId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Charger l'opération avec son poste
  const { data: operation } = await supabase
    .from('operations')
    .select('id, nom, est_transversale, poste_id, postes!inner(id, nom, ordre, entreprise_id)')
    .eq('id', operationId)
    .eq('poste_id', posteId)
    .single()

  if (!operation) notFound()

  const poste = operation.postes as unknown as { id: string; nom: string; ordre: number }

  // Charger les évaluations APR de cette opération (code_module = 'APR')
  const { data: evaluationsRaw } = await supabase
    .from('evaluations')
    .select(`
      id,
      numero_risque_ed840,
      identifiant_auto,
      type_risque,
      danger,
      situation_dangereuse,
      evenement_dangereux,
      dommage,
      siege_lesions,
      gravite,
      probabilite,
      duree_exposition,
      criticite_brute,
      plans_maitrise (
        coefficient_pm,
        criticite_residuelle,
        mesures_techniques,
        mesures_humaines,
        mesures_organisationnelles,
        mesures_epi
      )
    `)
    .eq('operation_id', operationId)
    .eq('code_module', 'APR')
    .order('created_at')

  // Structurer les données pour le composant client
  const lignes: LigneAPRUI[] = (evaluationsRaw ?? []).map((ev) => {
    const pmArr = ev.plans_maitrise as unknown as Array<{
      coefficient_pm: number
      criticite_residuelle: number | null
      mesures_techniques: string | null
      mesures_humaines: string | null
      mesures_organisationnelles: string | null
      mesures_epi: string | null
    }>
    const pm = pmArr?.[0] ?? null

    return {
      id: ev.id,
      identifiant_auto: ev.identifiant_auto as string | null,
      numero_risque_ed840: ev.numero_risque_ed840 as number | null,
      type_risque: ev.type_risque as 'aigu' | 'chronique',
      danger: ev.danger as string | null,
      situation_dangereuse: ev.situation_dangereuse as string | null,
      evenement_dangereux: ev.evenement_dangereux as string | null,
      dommage: ev.dommage as string | null,
      siege_lesions: ev.siege_lesions as string | null,
      gravite: ev.gravite as number | null,
      probabilite: ev.probabilite as number | null,
      duree_exposition: ev.duree_exposition as number | null,
      criticite_brute: ev.criticite_brute as number | null,
      pm: pm
        ? {
            coefficient_pm: pm.coefficient_pm,
            criticite_residuelle: pm.criticite_residuelle,
            mesures_techniques: pm.mesures_techniques,
            mesures_humaines: pm.mesures_humaines,
            mesures_organisationnelles: pm.mesures_organisationnelles,
            mesures_epi: pm.mesures_epi,
          }
        : null,
    }
  })

  // URL du module Bruit pour le lien dans le formulaire
  const moduleUrl = `/dashboard/postes/${posteId}/operations/${operationId}/risques/M01_BRUIT`

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link href="/dashboard/postes" className="hover:text-gray-700">
          Postes
        </Link>
        <span>/</span>
        <Link href={`/dashboard/postes/${posteId}`} className="hover:text-gray-700">
          {poste.nom}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{operation.nom}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">Tableau APR</span>
      </nav>

      {/* En-tête */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {operation.est_transversale && (
                <span className="text-xs font-medium text-purple-700 bg-purple-100 rounded px-2 py-0.5">
                  Transversale
                </span>
              )}
              <h1 className="text-xl font-bold text-gray-900">{operation.nom}</h1>
            </div>
            <p className="text-sm text-gray-500">
              Analyse Préliminaire des Risques — Méthode ED840 (INRS)
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-gray-900">{lignes.length}</div>
            <div className="text-xs text-gray-500">risque{lignes.length > 1 ? 's' : ''} identifié{lignes.length > 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Accès rapide aux modules normés */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium">Modules d'évaluation normée :</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/postes/${posteId}/operations/${operationId}/risques/M01_BRUIT`}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-full transition-colors text-gray-600"
            >
              Bruit (ED 6035)
            </Link>
            <span className="text-xs px-3 py-1 bg-gray-50 text-gray-400 rounded-full cursor-not-allowed">
              Vibrations (à venir)
            </span>
            <span className="text-xs px-3 py-1 bg-gray-50 text-gray-400 rounded-full cursor-not-allowed">
              Charge physique (à venir)
            </span>
            <span className="text-xs px-3 py-1 bg-gray-50 text-gray-400 rounded-full cursor-not-allowed">
              RPS (à venir)
            </span>
          </div>
        </div>
      </div>

      {/* Tableau APR (composant client) */}
      <AprTableOperation
        lignes={lignes}
        operationId={operationId}
        posteId={posteId}
        operationNom={operation.nom}
        moduleUrl={moduleUrl}
      />

      {/* Retour */}
      <div className="pb-4">
        <Link
          href={`/dashboard/postes/${posteId}`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
        >
          ← Retour au poste
        </Link>
      </div>
    </div>
  )
}
