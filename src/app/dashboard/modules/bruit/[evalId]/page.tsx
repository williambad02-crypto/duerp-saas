import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { FormBruit } from './_components/form-bruit'

interface Props {
  params: Promise<{ evalId: string }>
}

export default async function EvaluationBruitPage({ params }: Props) {
  const { evalId } = await params

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

  // Charger l'évaluation APR + contexte
  const { data: evaluation } = await supabase
    .from('evaluations')
    .select(`
      id,
      identifiant_auto,
      danger,
      situation_dangereuse,
      dommage,
      module_status,
      preselection_responses,
      operations!inner (
        id, nom,
        postes!inner (
          id, nom
        )
      )
    `)
    .eq('id', evalId)
    .eq('code_module', 'APR')
    .eq('type_risque', 'chronique')
    .single()

  if (!evaluation) notFound()

  // Vérifier que c'est bien un risque bruit avec module_status non null
  if (!evaluation.module_status) {
    redirect(`/dashboard/modules/bruit`)
  }

  // Charger l'évaluation bruit existante (si elle existe)
  const { data: evaluationBruit } = await supabase
    .from('evaluations_bruit')
    .select('*')
    .eq('evaluation_id', evalId)
    .maybeSingle()

  const op = evaluation.operations as unknown as {
    id: string
    nom: string
    postes: { id: string; nom: string }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-brand-bronze/70 flex-wrap">
        <Link href="/dashboard/postes" className="hover:text-brand-navy transition-colors">
          Postes
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/postes/${op.postes.id}`}
          className="hover:text-brand-navy transition-colors"
        >
          {op.postes.nom}
        </Link>
        <span>/</span>
        <Link href="/dashboard/modules/bruit" className="hover:text-brand-navy transition-colors">
          Module Bruit
        </Link>
        <span>/</span>
        <span className="text-brand-navy font-medium">
          {evaluation.identifiant_auto ?? 'Évaluation'}
        </span>
      </nav>

      {/* En-tête de l'évaluation */}
      <div className="bg-brand-off border border-brand-sand rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono text-brand-bronze/60 bg-brand-sand/50 px-1.5 py-0.5 rounded">
                {evaluation.identifiant_auto ?? 'APR'}
              </span>
              <span className="text-xs text-brand-bronze/50">•</span>
              <span className="text-xs text-brand-bronze">{op.nom}</span>
              <span className="text-xs text-brand-bronze/50">•</span>
              <span className="text-xs text-brand-bronze">{op.postes.nom}</span>
            </div>
            <h1 className="text-lg font-bold text-brand-navy">
              {evaluation.danger ?? 'Évaluation bruit'}
            </h1>
            {evaluation.situation_dangereuse && (
              <p className="text-sm text-brand-bronze mt-0.5">{evaluation.situation_dangereuse}</p>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <FormBruit
        evaluationId={evalId}
        evaluationBruit={evaluationBruit}
        moduleStatus={evaluation.module_status as 'maitrise' | 'creuser'}
        preselectionResponses={(evaluation.preselection_responses as boolean[] | null) ?? null}
        posteId={op.postes.id}
      />
    </div>
  )
}
