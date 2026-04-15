'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Contact } from '../parametres/contacts/_actions'

async function getClientAndEntreprise() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: entreprise } = await supabase
    .from('entreprises').select('id').eq('user_id', user.id).single()
  if (!entreprise) redirect('/dashboard/onboarding')
  return { supabase, entrepriseId: entreprise.id }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ActionPlan {
  id: string
  evaluation_id: string
  contact_id: string | null
  description: string | null
  type_prevention: 'technique' | 'organisationnelle' | 'formation_epi' | null
  facilite: 'facile' | 'moyen' | 'complexe' | null
  echeance: string | null
  statut: 'a_faire' | 'en_cours' | 'termine'
  rappels_actifs: boolean
  coefficient_pm_cible: number | null
  criticite_cible: number | null
  commentaire: string | null
  date_realisation: string | null
}

export interface EvaluationAvecAction {
  // Données APR (lecture seule)
  id: string
  danger: string
  criticite_brute: number | null
  type_risque: string
  poste_nom: string
  operation_nom: string
  mesures_existantes: string | null
  criticite_residuelle: number | null
  // Action liée (peut être null si pas encore créée)
  action: ActionPlan | null
  // Contact assigné
  contact: Contact | null
}

// ─── Lecture ─────────────────────────────────────────────────────────────────

export async function getEvaluationsAiguesAvecActions(): Promise<EvaluationAvecAction[]> {
  // RLS sur evaluations filtre automatiquement par user_id — pas besoin de filtre explicite entreprise_id
  const { supabase } = await getClientAndEntreprise()

  const { data, error } = await supabase
    .from('evaluations')
    .select(`
      id,
      danger,
      criticite_brute,
      type_risque,
      operations (
        nom,
        postes (
          nom
        )
      ),
      plans_maitrise (
        criticite_residuelle,
        mesures_techniques,
        mesures_humaines,
        mesures_organisationnelles,
        mesures_epi
      ),
      actions_plan (
        id,
        contact_id,
        description,
        type_prevention,
        facilite,
        echeance,
        statut,
        rappels_actifs,
        coefficient_pm_cible,
        criticite_cible,
        commentaire,
        date_realisation
      )
    `)
    .eq('type_risque', 'aigu')
    .order('criticite_brute', { ascending: false })

  if (error) console.error('[plan-action] Erreur query:', JSON.stringify(error))
  console.log('[plan-action] Nb évaluations aigues:', data?.length ?? 0)
  if (!data) return []

  return data.map((ev: any) => {
    const action = ev.actions_plan?.[0] ?? null
    return {
      id: ev.id,
      danger: ev.danger,
      criticite_brute: ev.criticite_brute,
      type_risque: ev.type_risque,
      poste_nom: ev.operations?.postes?.nom ?? '',
      operation_nom: ev.operations?.nom ?? '',
      mesures_existantes: [
        ev.plans_maitrise?.[0]?.mesures_techniques,
        ev.plans_maitrise?.[0]?.mesures_humaines,
        ev.plans_maitrise?.[0]?.mesures_organisationnelles,
        ev.plans_maitrise?.[0]?.mesures_epi,
      ].filter(Boolean).join(' · ') || null,
      criticite_residuelle: ev.plans_maitrise?.[0]?.criticite_residuelle ?? null,
      action: action
        ? {
            id: action.id,
            evaluation_id: ev.id,
            contact_id: action.contact_id,
            description: action.description,
            type_prevention: action.type_prevention,
            facilite: action.facilite,
            echeance: action.echeance,
            statut: action.statut,
            rappels_actifs: action.rappels_actifs,
            coefficient_pm_cible: action.coefficient_pm_cible,
            criticite_cible: action.criticite_cible,
            commentaire: action.commentaire,
            date_realisation: action.date_realisation,
          }
        : null,
      contact: null, // résolu côté client depuis la prop contacts
    }
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function upsertAction(payload: {
  evaluationId: string
  actionId?: string
  champ: keyof Omit<ActionPlan, 'id' | 'evaluation_id'>
  valeur: string | number | boolean | null
}): Promise<{ actionId: string }> {
  const { supabase } = await getClientAndEntreprise()

  // Calculer criticite_cible si on change le coefficient_pm_cible
  let extraFields: Record<string, unknown> = {}
  if (payload.champ === 'coefficient_pm_cible' && typeof payload.valeur === 'number') {
    const { data: ev } = await supabase
      .from('evaluations')
      .select('criticite_brute')
      .eq('id', payload.evaluationId)
      .single()
    if (ev?.criticite_brute != null) {
      extraFields.criticite_cible = +(ev.criticite_brute * (1 - payload.valeur)).toFixed(1)
    }
  }

  if (payload.actionId) {
    await supabase
      .from('actions_plan')
      .update({ [payload.champ]: payload.valeur, ...extraFields })
      .eq('id', payload.actionId)
    revalidatePath('/dashboard/plan-action')
    return { actionId: payload.actionId }
  } else {
    const { data, error } = await supabase
      .from('actions_plan')
      .insert({ evaluation_id: payload.evaluationId, [payload.champ]: payload.valeur, ...extraFields })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/plan-action')
    return { actionId: data.id }
  }
}

export async function terminerAction(actionId: string, evaluationId: string, coefficientPmCible: number): Promise<void> {
  const { supabase } = await getClientAndEntreprise()

  // 1. Marquer l'action comme terminée (trigger DB set_date_realisation gère date_realisation)
  await supabase
    .from('actions_plan')
    .update({ statut: 'termine' })
    .eq('id', actionId)

  // 2. Mettre à jour le PM dans plans_maitrise
  const { data: pm } = await supabase
    .from('plans_maitrise')
    .select('id, criticite_residuelle')
    .eq('evaluation_id', evaluationId)
    .single()

  if (pm) {
    const { data: ev } = await supabase
      .from('evaluations')
      .select('criticite_brute')
      .eq('id', evaluationId)
      .single()
    const nouvelleCriticite = ev?.criticite_brute != null
      ? +(ev.criticite_brute * (1 - coefficientPmCible)).toFixed(1)
      : pm.criticite_residuelle

    await supabase
      .from('plans_maitrise')
      .update({ coefficient_pm: coefficientPmCible, criticite_residuelle: nouvelleCriticite })
      .eq('id', pm.id)
  }

  revalidatePath('/dashboard/plan-action')
  revalidatePath('/dashboard/apr')
  revalidatePath('/dashboard/postes')
}

export async function toggleRappelsAction(actionId: string, actif: boolean): Promise<void> {
  const { supabase } = await getClientAndEntreprise()
  const { error } = await supabase
    .from('actions_plan')
    .update({ rappels_actifs: actif })
    .eq('id', actionId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/plan-action')
}
