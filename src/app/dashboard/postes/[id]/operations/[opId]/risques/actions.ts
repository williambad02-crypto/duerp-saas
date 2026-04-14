'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { CodeModule, CoefficientPM } from '@/types'
import { DonneesModuleBruit, MesuresBruit, calculerCriticiteBruit } from '@/lib/constants/bruit'

// Helper interne — vérifie que l'opération appartient bien à l'utilisateur courant
async function getOperationAcces(operationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // La RLS fait le travail de sécurité ; on charge juste pour récupérer poste_id
  const { data: operation } = await supabase
    .from('operations')
    .select('id, poste_id')
    .eq('id', operationId)
    .single()

  if (!operation) redirect('/dashboard/postes')

  return { supabase, operation, user }
}

// ─── Présélection ────────────────────────────────────────────────────────────

export async function sauvegarderPreselection(
  operationId: string,
  posteId: string,
  codeModule: CodeModule,
  reponses: { q1: boolean; q2: boolean; q3: boolean }
) {
  const { supabase } = await getOperationAcces(operationId)

  const moduleActif = reponses.q1 || reponses.q2 || reponses.q3

  const { error } = await supabase.from('preselections').upsert(
    {
      operation_id: operationId,
      code_module: codeModule,
      question_1: reponses.q1,
      question_2: reponses.q2,
      question_3: reponses.q3,
      module_actif: moduleActif,
    },
    { onConflict: 'operation_id,code_module' }
  )

  if (error) return { erreur: 'Erreur lors de la sauvegarde de la présélection.' }

  // Si 0 OUI → créer automatiquement une évaluation avec criticité 1 (module ignoré)
  if (!moduleActif) {
    await supabase.from('evaluations').upsert(
      {
        operation_id: operationId,
        code_module: codeModule,
        type_risque: 'chronique',
        statut: 'termine',
        criticite_brute: 1,
        donnees_module: { module_ignore: true, raison: 'preselection_0_oui' },
      },
      { onConflict: 'operation_id,code_module,type_risque' }
    )
  }

  revalidatePath(`/dashboard/postes/${posteId}/operations/${operationId}/risques`)
  revalidatePath(`/dashboard/postes/${posteId}/operations/${operationId}/risques/${codeModule}`)
  return { succes: true, moduleActif }
}

// ─── Évaluation Module Bruit (M01) ──────────────────────────────────────────

export async function sauvegarderEvaluationBruit(
  operationId: string,
  posteId: string,
  donnees: Omit<DonneesModuleBruit, 'mesures'>,
  mesures: MesuresBruit,
  coefficientPm: CoefficientPM
) {
  const { supabase } = await getOperationAcces(operationId)

  // Calculer criticité brute selon la méthode des points
  let criticiteBrute: number
  if (donnees.niveau_estimation === 2) {
    criticiteBrute = 16
  } else if (donnees.total_points !== undefined) {
    criticiteBrute = calculerCriticiteBruit(donnees.total_points).criticite
  } else {
    criticiteBrute = 2 // niveau 0 → faible
  }

  const donneesCompletes: DonneesModuleBruit = { ...donnees, mesures }

  // Upsert évaluation
  const { data: evaluation, error: evalError } = await supabase
    .from('evaluations')
    .upsert(
      {
        operation_id: operationId,
        code_module: 'M01_BRUIT',
        type_risque: 'chronique',
        statut: 'termine',
        criticite_brute: criticiteBrute,
        donnees_module: donneesCompletes as unknown as Record<string, unknown>,
      },
      { onConflict: 'operation_id,code_module,type_risque' }
    )
    .select('id')
    .single()

  if (evalError || !evaluation) {
    return { erreur: "Erreur lors de la sauvegarde de l'évaluation." }
  }

  const criticiteResiduelle = coefficientPm === 0 ? 0 : criticiteBrute * coefficientPm

  // Upsert plan de maîtrise
  const { error: pmError } = await supabase.from('plans_maitrise').upsert(
    {
      evaluation_id: evaluation.id,
      mesures_techniques: mesures.techniques.join(',') || null,
      mesures_humaines: mesures.humaines.join(',') || null,
      mesures_organisationnelles: mesures.organisationnelles.join(',') || null,
      mesures_epi: mesures.epi.join(',') || null,
      coefficient_pm: coefficientPm,
      criticite_residuelle: criticiteResiduelle,
    },
    { onConflict: 'evaluation_id' }
  )

  if (pmError) return { erreur: 'Erreur lors de la sauvegarde du plan de maîtrise.' }

  revalidatePath(`/dashboard/postes/${posteId}/operations/${operationId}/risques`)
  revalidatePath(`/dashboard/postes/${posteId}/operations/${operationId}/risques/M01_BRUIT`)
  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}
