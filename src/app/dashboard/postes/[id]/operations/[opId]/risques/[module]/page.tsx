import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PreselectForm } from '@/components/evaluation/preselection-form'
import { ModuleBruit } from '@/components/evaluation/module-bruit'
import { ModuleComingSoon } from '@/components/evaluation/module-coming-soon'
import { CriticiteBadge } from '@/components/evaluation/criticite-badge'
import { MODULE_PAR_CODE, MODULES_RISQUES } from '@/lib/constants/modules'
import { QUESTIONS_PRESELECTION } from '@/lib/constants/preselection'
import { calculerCriticiteBruit } from '@/lib/constants/bruit'
import { CodeModule } from '@/types'

interface Props {
  params: Promise<{ id: string; opId: string; module: string }>
}

export default async function ModuleEvaluationPage({ params }: Props) {
  const { id: posteId, opId: operationId, module: moduleCode } = await params

  // Valider le code module
  const codeModule = moduleCode as CodeModule
  const moduleInfo = MODULE_PAR_CODE[codeModule]
  if (!moduleInfo) notFound()

  // Les modules désactivés ne sont pas accessibles
  if (moduleInfo.statut === 'desactive') redirect(`/dashboard/postes/${posteId}/operations/${operationId}/risques`)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Charger l'opération
  const { data: operation } = await supabase
    .from('operations')
    .select('id, nom, est_transversale, poste_id, postes!inner(id, nom)')
    .eq('id', operationId)
    .eq('poste_id', posteId)
    .single()

  if (!operation) notFound()

  // Charger présélection et évaluation existantes en parallèle
  const [{ data: preselection }, { data: evaluation }] = await Promise.all([
    supabase
      .from('preselections')
      .select('*')
      .eq('operation_id', operationId)
      .eq('code_module', codeModule)
      .maybeSingle(),
    supabase
      .from('evaluations')
      .select('*, plans_maitrise(*)')
      .eq('operation_id', operationId)
      .eq('code_module', codeModule)
      .maybeSingle(),
  ])

  const poste = operation.postes as unknown as { id: string; nom: string }
  const questions = QUESTIONS_PRESELECTION[codeModule]

  // ── Calcul de la criticité pour l'affichage "terminé" ─────────────────────
  let criticiteBrute: number | null = evaluation?.criticite_brute ?? null
  let couleurCriticite: 'vert' | 'jaune' | 'orange' | 'rouge' | null = null
  if (criticiteBrute != null) {
    if (codeModule === 'M01_BRUIT') {
      const crit = calculerCriticiteBruit(
        criticiteBrute <= 2 ? 0 : criticiteBrute <= 4 ? 20 : criticiteBrute <= 8 ? 80 : 9999
      )
      couleurCriticite = crit.couleur
    } else {
      couleurCriticite =
        criticiteBrute <= 4
          ? 'vert'
          : criticiteBrute <= 9
          ? 'jaune'
          : criticiteBrute <= 14
          ? 'orange'
          : 'rouge'
    }
  }

  const planMaitrise = evaluation
    ? (evaluation as { plans_maitrise: { coefficient_pm?: number; criticite_residuelle?: number } | null })
        .plans_maitrise
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
        <Link
          href={`/dashboard/postes/${posteId}/operations/${operationId}/risques`}
          className="hover:text-gray-700"
        >
          {operation.nom}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{moduleInfo.nom}</span>
      </nav>

      {/* En-tête du module */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {moduleInfo.statut === 'coming_soon' && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                  V2
                </span>
              )}
              <h1 className="text-xl font-bold text-gray-900">{moduleInfo.nom}</h1>
            </div>
            <p className="text-sm text-gray-500">{moduleInfo.description}</p>
            <p className="text-xs text-gray-400 mt-1">Opération : {operation.nom}</p>
          </div>
          {evaluation?.statut === 'termine' && criticiteBrute != null && couleurCriticite && (
            <CriticiteBadge
              score={criticiteBrute}
              couleur={couleurCriticite}
              label="Criticité"
            />
          )}
        </div>
      </div>

      {/* ── Contenu selon l'état ──────────────────────────────────────────── */}

      {/* CAS 1 : Pas de présélection → formulaire de présélection */}
      {!preselection && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <PreselectForm
            operationId={operationId}
            posteId={posteId}
            codeModule={codeModule}
            nomModule={moduleInfo.nom}
            questions={questions}
          />
        </div>
      )}

      {/* CAS 2 : Présélection faite, 0 OUI → module non concerné */}
      {preselection && !preselection.module_actif && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-900">
                  Module non concerné — Criticité 1 (Négligeable)
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Aucune des 3 questions de présélection n&apos;a reçu de réponse OUI.
                  Le risque <strong>{moduleInfo.nom}</strong> est donc non significatif pour cette
                  opération. La criticité a été automatiquement fixée à 1 dans votre APR.
                </p>
              </div>
            </div>
          </div>

          {/* Rappel des réponses */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Réponses enregistrées</h4>
            <div className="space-y-2">
              {questions.map((q) => {
                const reponse =
                  q.id === 1
                    ? preselection.question_1
                    : q.id === 2
                    ? preselection.question_2
                    : preselection.question_3
                return (
                  <div key={q.id} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 ${
                        reponse ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {reponse ? 'O' : 'N'}
                    </span>
                    <p className="text-sm text-gray-600">{q.texte}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/postes/${posteId}/operations/${operationId}/risques`}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
            >
              ← Retour aux modules
            </Link>
            {/* Permettre de refaire la présélection */}
            <Link
              href={`/dashboard/postes/${posteId}/operations/${operationId}/risques/${codeModule}`}
              className="text-sm text-blue-600 hover:underline"
            >
              Refaire la présélection
            </Link>
          </div>
        </div>
      )}

      {/* CAS 3 : Présélection 1+ OUI → module déclenché */}
      {preselection && preselection.module_actif && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {/* M01 Bruit : wizard complet */}
          {codeModule === 'M01_BRUIT' && (
            <ModuleBruit
              operationId={operationId}
              posteId={posteId}
              nomOperation={operation.nom}
            />
          )}

          {/* M02-M05 : coming soon */}
          {moduleInfo.statut === 'coming_soon' && (
            <ModuleComingSoon
              module={moduleInfo}
              posteId={posteId}
              operationId={operationId}
            />
          )}
        </div>
      )}

      {/* Évaluation terminée — afficher résultat complet si module coming soon */}
      {preselection?.module_actif && evaluation?.statut === 'termine' && planMaitrise && codeModule === 'M01_BRUIT' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-900">Évaluation terminée</p>
              <p className="text-xs text-indigo-600 mt-0.5">
                Criticité résiduelle ={' '}
                {planMaitrise.criticite_residuelle ?? 'N/A'}{' '}
                (PM = {planMaitrise.coefficient_pm})
              </p>
            </div>
            <Link
              href={`/dashboard/postes/${posteId}/operations/${operationId}/risques`}
              className="text-xs text-indigo-700 hover:underline font-medium"
            >
              Voir tous les modules →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
