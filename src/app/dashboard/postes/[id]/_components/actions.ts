'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return { supabase, user }
}

async function verifierAccesOperation(supabase: Awaited<ReturnType<typeof createClient>>, operationId: string) {
  const { data: operation } = await supabase
    .from('operations')
    .select('id, poste_id')
    .eq('id', operationId)
    .single()
  return operation
}

// ─── Opérations ──────────────────────────────────────────────────────────────

export async function creerOperationInline(posteId: string, nom: string) {
  const { supabase } = await getClient()
  const nomTrim = nom.trim()
  if (!nomTrim) return { erreur: 'Le nom est requis.' }

  const { data: existantes } = await supabase
    .from('operations')
    .select('id')
    .eq('poste_id', posteId)

  const { data: operation, error } = await supabase
    .from('operations')
    .insert({
      poste_id: posteId,
      nom: nomTrim,
      ordre: existantes?.length ?? 0,
      est_transversale: false,
    })
    .select('id, nom, est_transversale, ordre')
    .single()

  if (error || !operation) return { erreur: "Erreur lors de la création de l'opération." }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true, operation }
}

export async function renommerOperation(operationId: string, posteId: string, nom: string) {
  const { supabase } = await getClient()
  const nomTrim = nom.trim()
  if (!nomTrim) return { erreur: 'Le nom est requis.' }

  const { error } = await supabase
    .from('operations')
    .update({ nom: nomTrim })
    .eq('id', operationId)

  if (error) return { erreur: "Erreur lors de la modification." }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}

export async function supprimerOperationAvecOptions(
  operationId: string,
  posteId: string,
  mode: 'cascade' | 'deplacer'
) {
  const { supabase } = await getClient()

  if (mode === 'deplacer') {
    // Trouver l'opération "Toutes opérations"
    const { data: transversale } = await supabase
      .from('operations')
      .select('id')
      .eq('poste_id', posteId)
      .eq('est_transversale', true)
      .single()

    if (transversale) {
      await supabase
        .from('evaluations')
        .update({ operation_id: transversale.id })
        .eq('operation_id', operationId)
        .eq('code_module', 'APR')
    }
  }

  const { error } = await supabase.from('operations').delete().eq('id', operationId)
  if (error) return { erreur: "Erreur lors de la suppression." }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}

// ─── Risques (évaluations APR) ───────────────────────────────────────────────

export async function creerRisqueVide(operationId: string, posteId: string) {
  const { supabase } = await getClient()

  const operation = await verifierAccesOperation(supabase, operationId)
  if (!operation) return { erreur: "Opération introuvable." }

  // Générer identifiant lisible UT{n}-R{seq}
  const [{ data: posteData }, { count: nbExistants }] = await Promise.all([
    supabase.from('postes').select('ordre').eq('id', posteId).single(),
    supabase
      .from('evaluations')
      .select('id', { count: 'exact', head: true })
      .eq('operation_id', operationId)
      .eq('code_module', 'APR'),
  ])

  const ordrePoste = (posteData?.ordre ?? 0) + 1
  const sequence = (nbExistants ?? 0) + 1
  const identifiant = `UT${String(ordrePoste).padStart(2, '0')}-R${String(sequence).padStart(3, '0')}`

  const { data: evaluation, error } = await supabase
    .from('evaluations')
    .insert({
      operation_id: operationId,
      code_module: 'APR',
      type_risque: 'aigu',
      statut: 'brouillon',
      identifiant_auto: identifiant,
      ordre: nbExistants ?? 0,
    })
    .select('id, identifiant_auto, ordre')
    .single()

  if (error || !evaluation) return { erreur: "Erreur lors de la création du risque." }

  // Créer plan de maîtrise vide (PM = 1.0 = aucune protection)
  await supabase.from('plans_maitrise').insert({
    evaluation_id: evaluation.id,
    coefficient_pm: 1.0,
    criticite_residuelle: null,
  })

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true, evaluation }
}

export async function mettreAJourCellule(
  evaluationId: string,
  posteId: string,
  colonne: string,
  valeur: unknown
) {
  const { supabase } = await getClient()

  // Colonnes de evaluations
  const colonnesEval = [
    'danger', 'situation_dangereuse', 'evenement_dangereux', 'dommage', 'siege_lesions',
    'numero_risque_ed840', 'type_risque', 'gravite', 'probabilite', 'duree_exposition',
  ]

  // Colonnes de plans_maitrise
  const colonnesPM = ['coefficient_pm', 'mesures_techniques', 'mesures_humaines', 'mesures_organisationnelles', 'mesures_epi']

  if (colonnesEval.includes(colonne)) {
    const updatePayload: Record<string, unknown> = { [colonne]: valeur }

    // Recalculer criticite_brute si G, P ou DE changent
    if (['gravite', 'probabilite', 'duree_exposition', 'type_risque'].includes(colonne)) {
      const { data: ev } = await supabase
        .from('evaluations')
        .select('gravite, probabilite, duree_exposition, type_risque')
        .eq('id', evaluationId)
        .single()

      if (ev) {
        const g = colonne === 'gravite' ? (valeur as number) : (ev.gravite ?? 0)
        const typeRisque = colonne === 'type_risque' ? (valeur as string) : ev.type_risque
        const p = colonne === 'probabilite' ? (valeur as number) : (ev.probabilite ?? 0)
        const de = colonne === 'duree_exposition' ? (valeur as number) : (ev.duree_exposition ?? 0)

        if (g > 0) {
          const second = typeRisque === 'aigu' ? p : de
          updatePayload['criticite_brute'] = second > 0 ? g * second : null
        } else {
          updatePayload['criticite_brute'] = null
        }
      }
    }

    const { error } = await supabase
      .from('evaluations')
      .update(updatePayload)
      .eq('id', evaluationId)

    if (error) return { erreur: "Erreur lors de la mise à jour." }

    // Si criticite_brute recalculée → mettre à jour criticite_residuelle
    if (updatePayload['criticite_brute'] !== undefined) {
      const { data: pm } = await supabase
        .from('plans_maitrise')
        .select('coefficient_pm')
        .eq('evaluation_id', evaluationId)
        .single()

      if (pm) {
        const critBrute = updatePayload['criticite_brute'] as number | null
        const critRes = critBrute !== null ? critBrute * pm.coefficient_pm : null
        await supabase
          .from('plans_maitrise')
          .update({ criticite_residuelle: critRes })
          .eq('evaluation_id', evaluationId)
      }
    }
  } else if (colonnesPM.includes(colonne)) {
    const updatePM: Record<string, unknown> = { [colonne]: valeur }

    // Si PM change → recalculer criticite_residuelle
    if (colonne === 'coefficient_pm') {
      const { data: ev } = await supabase
        .from('evaluations')
        .select('criticite_brute')
        .eq('id', evaluationId)
        .single()

      if (ev?.criticite_brute !== null && ev?.criticite_brute !== undefined) {
        updatePM['criticite_residuelle'] = ev.criticite_brute * (valeur as number)
      }
    }

    const { error } = await supabase
      .from('plans_maitrise')
      .update(updatePM)
      .eq('evaluation_id', evaluationId)

    if (error) return { erreur: "Erreur lors de la mise à jour du plan de maîtrise." }
  }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}

export async function deplacerRisque(
  evaluationId: string,
  nouvelOperationId: string,
  posteId: string
) {
  const { supabase } = await getClient()

  const { error } = await supabase
    .from('evaluations')
    .update({ operation_id: nouvelOperationId })
    .eq('id', evaluationId)
    .eq('code_module', 'APR')

  if (error) return { erreur: "Erreur lors du déplacement." }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}

export async function supprimerRisque(evaluationId: string, posteId: string) {
  const { supabase } = await getClient()

  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', evaluationId)
    .eq('code_module', 'APR')

  if (error) return { erreur: "Erreur lors de la suppression." }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}
