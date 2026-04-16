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

export async function dupliquerOperation(operationId: string, posteId: string) {
  const { supabase } = await getClient()

  // 1. Charger l'opération source
  const { data: opSource, error: errOp } = await supabase
    .from('operations')
    .select('id, poste_id, nom, description, est_transversale, ordre')
    .eq('id', operationId)
    .single()

  if (errOp || !opSource) return { erreur: "Opération introuvable." }

  // 2. Refuser si transversale
  if (opSource.est_transversale) {
    return { erreur: "Impossible de dupliquer l'opération transversale." }
  }

  // 3. Charger les évaluations APR source + leurs plans de maîtrise
  const { data: evaluationsSource, error: errEval } = await supabase
    .from('evaluations')
    .select(`
      id,
      numero_risque_ed840,
      type_risque,
      statut,
      danger,
      situation_dangereuse,
      evenement_dangereux,
      dommage,
      siege_lesions,
      gravite,
      probabilite,
      duree_exposition,
      criticite_brute,
      ordre,
      module_status,
      preselection_responses,
      module_completed_at,
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

  if (errEval) return { erreur: "Erreur lors du chargement des risques sources." }

  // 4. Calculer le nouvel ordre et décaler les opérations suivantes
  const nouvelOrdre = opSource.ordre + 1

  const { data: opsSuivantes, error: errOps } = await supabase
    .from('operations')
    .select('id, ordre')
    .eq('poste_id', posteId)
    .gte('ordre', nouvelOrdre)
    .order('ordre', { ascending: false })

  if (errOps) return { erreur: "Erreur lors de la préparation de l'ordre." }

  // Décalage en descendant pour éviter toute collision intermédiaire
  for (const op of opsSuivantes ?? []) {
    const { error } = await supabase
      .from('operations')
      .update({ ordre: op.ordre + 1 })
      .eq('id', op.id)
    if (error) return { erreur: "Erreur lors du décalage des opérations." }
  }

  // 5. Insérer la nouvelle opération (clone)
  const { data: opClone, error: errInsert } = await supabase
    .from('operations')
    .insert({
      poste_id: posteId,
      nom: `${opSource.nom} (copie)`,
      description: opSource.description,
      est_transversale: false,
      ordre: nouvelOrdre,
    })
    .select('id, nom, est_transversale, ordre')
    .single()

  if (errInsert || !opClone) {
    return { erreur: "Erreur lors de la création de l'opération dupliquée." }
  }

  // 6. Pour chaque évaluation source → cloner + cloner son plan de maîtrise
  // On génère un nouvel identifiant_auto basé sur le nouvel ordre du poste
  // (le champ est auto-géré par l'application, pas par un trigger DB)
  type PlanMaitriseSource = {
    coefficient_pm: number
    criticite_residuelle: number | null
    mesures_techniques: string | null
    mesures_humaines: string | null
    mesures_organisationnelles: string | null
    mesures_epi: string | null
  }

  // Récupérer l'ordre du poste pour régénérer l'identifiant_auto
  const { data: posteData } = await supabase
    .from('postes')
    .select('ordre')
    .eq('id', posteId)
    .single()
  const ordrePoste = (posteData?.ordre ?? 0) + 1

  const risquesClones: Array<{
    id: string
    operation_id: string
    identifiant_auto: string | null
    numero_risque_ed840: number | null
    type_risque: string
    danger: string | null
    situation_dangereuse: string | null
    evenement_dangereux: string | null
    dommage: string | null
    siege_lesions: string | null
    gravite: number | null
    probabilite: number | null
    duree_exposition: number | null
    criticite_brute: number | null
    coefficient_pm: number
    criticite_residuelle: number | null
    mesures_techniques: string | null
    ordre: number
    module_status: string | null
    preselection_responses: boolean[] | null
  }> = []

  let sequence = 1
  for (const evalSrc of evaluationsSource ?? []) {
    // Identifiant unique basé sur le timestamp pour éviter les collisions
    const identifiant = `UT${String(ordrePoste).padStart(2, '0')}-R${String(Date.now() % 10000 + sequence).padStart(3, '0')}`
    sequence++

    const { data: evalClone, error: errEvalInsert } = await supabase
      .from('evaluations')
      .insert({
        operation_id: opClone.id,
        code_module: 'APR',
        numero_risque_ed840: evalSrc.numero_risque_ed840,
        type_risque: evalSrc.type_risque,
        statut: evalSrc.statut ?? 'brouillon',
        identifiant_auto: identifiant,
        danger: evalSrc.danger,
        situation_dangereuse: evalSrc.situation_dangereuse,
        evenement_dangereux: evalSrc.evenement_dangereux,
        dommage: evalSrc.dommage,
        siege_lesions: evalSrc.siege_lesions,
        gravite: evalSrc.gravite,
        probabilite: evalSrc.probabilite,
        duree_exposition: evalSrc.duree_exposition,
        criticite_brute: evalSrc.criticite_brute,
        ordre: evalSrc.ordre,
        module_status: evalSrc.module_status,
        preselection_responses: evalSrc.preselection_responses,
        module_completed_at: evalSrc.module_completed_at,
      })
      .select('id, identifiant_auto, numero_risque_ed840, type_risque, danger, situation_dangereuse, evenement_dangereux, dommage, siege_lesions, gravite, probabilite, duree_exposition, criticite_brute, ordre, module_status, preselection_responses')
      .single()

    if (errEvalInsert || !evalClone) {
      // Best-effort : on continue, mais on ne bloque pas la création du clone
      continue
    }

    // Cloner le plan de maîtrise (ou créer un PM vide par défaut)
    const pmRaw = evalSrc.plans_maitrise as unknown
    const pmSource: PlanMaitriseSource | null = Array.isArray(pmRaw)
      ? (pmRaw[0] as PlanMaitriseSource | undefined) ?? null
      : (pmRaw as PlanMaitriseSource | null)

    let coefficientPm: number = 1.0
    let criticiteResiduelle: number | null = null
    let mesuresTechniques: string | null = null

    if (pmSource) {
      coefficientPm = pmSource.coefficient_pm
      criticiteResiduelle = pmSource.criticite_residuelle
      mesuresTechniques = pmSource.mesures_techniques

      await supabase.from('plans_maitrise').insert({
        evaluation_id: evalClone.id,
        coefficient_pm: pmSource.coefficient_pm,
        criticite_residuelle: pmSource.criticite_residuelle,
        mesures_techniques: pmSource.mesures_techniques,
        mesures_humaines: pmSource.mesures_humaines,
        mesures_organisationnelles: pmSource.mesures_organisationnelles,
        mesures_epi: pmSource.mesures_epi,
      })
    } else {
      // Fallback : plan vide (aligné avec le comportement de creerRisqueVide)
      await supabase.from('plans_maitrise').insert({
        evaluation_id: evalClone.id,
        coefficient_pm: 1.0,
        criticite_residuelle: null,
      })
    }

    risquesClones.push({
      id: evalClone.id as string,
      operation_id: opClone.id as string,
      identifiant_auto: (evalClone.identifiant_auto as string | null) ?? null,
      numero_risque_ed840: evalClone.numero_risque_ed840 as number | null,
      type_risque: evalClone.type_risque as string,
      danger: evalClone.danger as string | null,
      situation_dangereuse: evalClone.situation_dangereuse as string | null,
      evenement_dangereux: evalClone.evenement_dangereux as string | null,
      dommage: evalClone.dommage as string | null,
      siege_lesions: evalClone.siege_lesions as string | null,
      gravite: evalClone.gravite as number | null,
      probabilite: evalClone.probabilite as number | null,
      duree_exposition: evalClone.duree_exposition as number | null,
      criticite_brute: evalClone.criticite_brute as number | null,
      coefficient_pm: coefficientPm,
      criticite_residuelle: criticiteResiduelle,
      mesures_techniques: mesuresTechniques,
      ordre: (evalClone.ordre as number | null) ?? 0,
      module_status: evalClone.module_status as string | null,
      preselection_responses: (evalClone.preselection_responses as boolean[] | null) ?? null,
    })
  }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true, operation: opClone, risques: risquesClones }
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

// ─── Module normé ────────────────────────────────────────────────────────────

export async function enregistrerPreselectionModule(
  evaluationId: string,
  posteId: string,
  reponses: boolean[]
) {
  const { supabase } = await getClient()

  const nbOui = reponses.filter(Boolean).length
  const moduleStatus = nbOui === 0 ? 'maitrise' : 'creuser'

  const updatePayload: Record<string, unknown> = {
    preselection_responses: reponses,
    module_status: moduleStatus,
    module_completed_at: new Date().toISOString(),
  }

  // Si maîtrisé → criticite_brute = 1 (risque présent mais maîtrisé)
  if (moduleStatus === 'maitrise') {
    updatePayload['criticite_brute'] = 1
    updatePayload['gravite'] = 1

    const { data: pm } = await supabase
      .from('plans_maitrise')
      .select('coefficient_pm')
      .eq('evaluation_id', evaluationId)
      .single()
    if (pm) {
      await supabase
        .from('plans_maitrise')
        .update({ criticite_residuelle: 1 * pm.coefficient_pm })
        .eq('evaluation_id', evaluationId)
    }
  }

  const { error } = await supabase
    .from('evaluations')
    .update(updatePayload)
    .eq('id', evaluationId)

  if (error) return { erreur: "Erreur lors de l'enregistrement." }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true, moduleStatus }
}

export async function resetPreselectionModule(evaluationId: string, posteId: string) {
  const { supabase } = await getClient()

  const { error } = await supabase
    .from('evaluations')
    .update({
      module_status: null,
      preselection_responses: null,
      module_completed_at: null,
      criticite_brute: null,
      gravite: null,
    })
    .eq('id', evaluationId)

  if (error) return { erreur: "Erreur lors de la remise à zéro." }

  await supabase
    .from('plans_maitrise')
    .update({ criticite_residuelle: null })
    .eq('evaluation_id', evaluationId)

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}
