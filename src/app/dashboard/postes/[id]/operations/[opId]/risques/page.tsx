import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ModuleCard } from '@/components/evaluation/module-card'
import { MODULES_RISQUES } from '@/lib/constants/modules'
import { calculerCriticiteBruit } from '@/lib/constants/bruit'

interface Props {
  params: Promise<{ id: string; opId: string }>
}

// Dériver la couleur de criticité bruit depuis le score brut
function couleurDepuisCriticiteBruit(criticiteBrute: number): 'vert' | 'jaune' | 'orange' | 'rouge' {
  // Pour M01, les criticités possibles sont 2/4/8/16 — on mappe directement
  if (criticiteBrute <= 2) return 'vert'
  if (criticiteBrute <= 4) return 'jaune'
  if (criticiteBrute <= 8) return 'orange'
  return 'rouge'
}

// Couleur générique pour les modules non-bruit (G×P, futur)
function couleurDepuisScore(score: number): 'vert' | 'jaune' | 'orange' | 'rouge' {
  if (score <= 4) return 'vert'
  if (score <= 9) return 'jaune'
  if (score <= 14) return 'orange'
  return 'rouge'
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
    .select('id, nom, est_transversale, poste_id, postes!inner(id, nom, entreprise_id)')
    .eq('id', operationId)
    .eq('poste_id', posteId)
    .single()

  if (!operation) notFound()

  // Charger présélections et évaluations de cette opération en parallèle
  const [{ data: preselections }, { data: evaluations }] = await Promise.all([
    supabase
      .from('preselections')
      .select('code_module, module_actif')
      .eq('operation_id', operationId),
    supabase
      .from('evaluations')
      .select('code_module, statut, criticite_brute, plans_maitrise(coefficient_pm, criticite_residuelle)')
      .eq('operation_id', operationId),
  ])

  // Indexer par code_module pour lookup O(1)
  const preselectionsMap = Object.fromEntries(
    (preselections ?? []).map((p) => [p.code_module, p])
  )
  const evaluationsMap = Object.fromEntries(
    (evaluations ?? []).map((e) => [e.code_module, e])
  )

  const poste = operation.postes as unknown as { id: string; nom: string }

  const nbTermines = MODULES_RISQUES.filter((m) => {
    const eval_ = evaluationsMap[m.code]
    return eval_?.statut === 'termine'
  }).length

  const nbActifs = MODULES_RISQUES.filter((m) => m.statut !== 'desactive').length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
        <span className="text-gray-900 font-medium">Modules de risque</span>
      </nav>

      {/* En-tête */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {operation.est_transversale && (
                <span className="text-xs font-medium text-purple-700 bg-purple-100 rounded px-2 py-0.5">
                  Transversale
                </span>
              )}
              <h1 className="text-xl font-bold text-gray-900">{operation.nom}</h1>
            </div>
            <p className="text-sm text-gray-500">
              Évaluez chaque module de risque applicable à cette opération
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-gray-900">
              {nbTermines}/{nbActifs}
            </div>
            <div className="text-xs text-gray-500">modules évalués</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(nbTermines / nbActifs) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Liste des modules */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider px-1">
          Modules actifs
        </h2>

        {MODULES_RISQUES.filter((m) => m.statut !== 'desactive').map((module) => {
          const preselect = preselectionsMap[module.code]
          const evaluation = evaluationsMap[module.code]

          let couleur: 'vert' | 'jaune' | 'orange' | 'rouge' | undefined
          const critBrute = evaluation?.criticite_brute ?? null
          const critResid =
            (evaluation?.plans_maitrise as { criticite_residuelle?: number } | null)
              ?.criticite_residuelle ?? null

          if (critBrute != null) {
            couleur =
              module.code === 'M01_BRUIT'
                ? couleurDepuisCriticiteBruit(critBrute)
                : couleurDepuisScore(critBrute)
          }

          const etat = {
            preselectFaite: !!preselect,
            moduleActif: preselect?.module_actif ?? null,
            evaluationTerminee: evaluation?.statut === 'termine',
            criticiteBrute: critBrute,
            couleurCriticite: couleur,
            criticiteResiduelle: critResid,
          }

          return (
            <ModuleCard
              key={module.code}
              module={module}
              etat={etat}
              posteId={posteId}
              operationId={operationId}
            />
          )
        })}

        {/* Modules désactivés */}
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1 mt-6">
          Prochainement
        </h2>

        {MODULES_RISQUES.filter((m) => m.statut === 'desactive').map((module) => (
          <ModuleCard
            key={module.code}
            module={module}
            etat={{
              preselectFaite: false,
              moduleActif: null,
              evaluationTerminee: false,
            }}
            posteId={posteId}
            operationId={operationId}
          />
        ))}
      </div>

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
