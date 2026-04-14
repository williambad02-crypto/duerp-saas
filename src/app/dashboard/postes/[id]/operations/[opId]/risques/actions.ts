'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { CodeModule, CoefficientPM } from '@/types'
import { DonneesModuleBruit, MesuresBruit, calculerCriticiteBruit } from '@/lib/constants/bruit'

// ─── Types APR ───────────────────────────────────────────────────────────────

export interface DonneesLigneAPR {
  numero_risque_ed840: number
  type_risque: 'aigu' | 'chronique'
  danger: string
  situation_dangereuse: string
  evenement_dangereux?: string | null  // obligatoire si aigu
  dommage: string
  siege_lesions: string
  gravite: number           // 1-5
  probabilite?: number      // 1-4 (aigu uniquement : G × P)
  duree_exposition?: number // 1-4 (chronique APR : G × DE)
  mesures_t?: string | null
  mesures_h?: string | null
  mesures_o?: string | null
  mesures_epi?: string | null
  coefficient_pm: number    // 0.0 / 0.25 / 0.5 / 0.75 / 1.0
}

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

// ─── Ajout d'une ligne APR ────────────────────────────────────────────────────

export async function ajouterLigneAPR(
  operationId: string,
  posteId: string,
  donnees: DonneesLigneAPR
) {
  const { supabase } = await getOperationAcces(operationId)

  // Générer l'identifiant automatique UT{ordre_poste}-R{sequence}
  const [{ data: posteData }, { count: nbExistant }] = await Promise.all([
    supabase.from('postes').select('ordre').eq('id', posteId).single(),
    supabase
      .from('evaluations')
      .select('id', { count: 'exact', head: true })
      .eq('operation_id', operationId),
  ])

  const ordrePoste = posteData?.ordre ?? 1
  const sequence = (nbExistant ?? 0) + 1
  const identifiant = `UT${String(ordrePoste).padStart(2, '0')}-R${String(sequence).padStart(3, '0')}`

  // Calculer criticité brute
  const second = donnees.type_risque === 'aigu'
    ? (donnees.probabilite ?? 1)
    : (donnees.duree_exposition ?? 1)
  const criticiteBrute = donnees.gravite * second

  // Insérer l'évaluation APR
  const { data: evaluation, error: evalError } = await supabase
    .from('evaluations')
    .insert({
      operation_id: operationId,
      code_module: 'APR' as CodeModule,
      type_risque: donnees.type_risque,
      statut: 'termine',
      numero_risque_ed840: donnees.numero_risque_ed840,
      identifiant_auto: identifiant,
      danger: donnees.danger,
      situation_dangereuse: donnees.situation_dangereuse,
      evenement_dangereux: donnees.type_risque === 'aigu' ? (donnees.evenement_dangereux || null) : null,
      dommage: donnees.dommage,
      siege_lesions: donnees.siege_lesions,
      gravite: donnees.gravite,
      probabilite: donnees.type_risque === 'aigu' ? donnees.probabilite : null,
      duree_exposition: donnees.type_risque === 'chronique' ? donnees.duree_exposition : null,
      criticite_brute: criticiteBrute,
    })
    .select('id')
    .single()

  if (evalError || !evaluation) {
    console.error('[APR] Erreur insert evaluation:', evalError?.message)
    return { erreur: "Erreur lors de l'enregistrement de la ligne APR." }
  }

  // Insérer le plan de maîtrise
  const criticiteResiduelle = criticiteBrute * donnees.coefficient_pm

  const { error: pmError } = await supabase.from('plans_maitrise').insert({
    evaluation_id: evaluation.id,
    mesures_techniques: donnees.mesures_t || null,
    mesures_humaines: donnees.mesures_h || null,
    mesures_organisationnelles: donnees.mesures_o || null,
    mesures_epi: donnees.mesures_epi || null,
    coefficient_pm: donnees.coefficient_pm,
    criticite_residuelle: criticiteResiduelle,
  })

  if (pmError) {
    console.error('[APR] Erreur insert plan_maitrise:', pmError.message)
    return { erreur: 'Erreur lors de la sauvegarde du plan de maîtrise.' }
  }

  revalidatePath(`/dashboard/postes/${posteId}/operations/${operationId}/risques`)
  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true, identifiant }
}

// ─── Suppression d'une ligne APR ─────────────────────────────────────────────

export async function supprimerLigneAPR(
  evaluationId: string,
  operationId: string,
  posteId: string
) {
  const { supabase } = await getOperationAcces(operationId)

  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', evaluationId)
    .eq('operation_id', operationId)
    .eq('code_module', 'APR' as CodeModule)

  if (error) return { erreur: 'Erreur lors de la suppression.' }

  revalidatePath(`/dashboard/postes/${posteId}/operations/${operationId}/risques`)
  return { succes: true }
}
