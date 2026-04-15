'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getClientAndEntreprise() {
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
  return { supabase, user, entrepriseId: entreprise.id }
}

// ─── Phase interface ──────────────────────────────────────────────────────────

export interface PhaseBruit {
  id: string // uuid client-side pour les keys React
  label: string
  niveau_db: number
  duree: string // '5min' | '10min' | '15min' | '30min' | '1h' | '2h' | '4h' | '8h'
  points: number
}

// ─── Sauvegarder (auto, sans valider) ────────────────────────────────────────

export async function sauvegarderEvaluationBruit(payload: {
  evaluationId: string
  methode: 'sommaire' | 'simplifiee'
  niveau_estimation?: number | null
  phases?: PhaseBruit[]
  total_points?: number | null
  zone?: string | null
  criticite_bruit?: number | null
  epi_utilises?: boolean
  epi_types?: string[]
  epi_snr?: number | null
  mesures_techniques?: string[]
  mesures_organisationnelles?: string[]
  mesures_humaines?: string[]
  criticite_residuelle_bruit?: number | null
}) {
  const { supabase } = await getClientAndEntreprise()

  const {
    evaluationId,
    methode,
    niveau_estimation,
    phases,
    total_points,
    zone,
    criticite_bruit,
    epi_utilises,
    epi_types,
    epi_snr,
    mesures_techniques,
    mesures_organisationnelles,
    mesures_humaines,
    criticite_residuelle_bruit,
  } = payload

  // Vérifier que l'évaluation appartient bien à l'user (via RLS)
  const { data: ev } = await supabase
    .from('evaluations')
    .select('id, operation_id, operations!inner(poste_id)')
    .eq('id', evaluationId)
    .single()

  if (!ev) return { erreur: 'Évaluation introuvable.' }

  const op = ev.operations as unknown as { poste_id: string }

  const { error } = await supabase.from('evaluations_bruit').upsert(
    {
      evaluation_id: evaluationId,
      methode,
      niveau_estimation: niveau_estimation ?? null,
      phases: phases ?? [],
      total_points: total_points ?? null,
      zone: zone ?? null,
      criticite_bruit: criticite_bruit ?? null,
      epi_utilises: epi_utilises ?? false,
      epi_types: epi_types ?? [],
      epi_snr: epi_snr ?? null,
      mesures_techniques: mesures_techniques ?? [],
      mesures_organisationnelles: mesures_organisationnelles ?? [],
      mesures_humaines: mesures_humaines ?? [],
      criticite_residuelle_bruit: criticite_residuelle_bruit ?? null,
      statut: 'en_cours',
    },
    { onConflict: 'evaluation_id' }
  )

  if (error) return { erreur: "Erreur lors de la sauvegarde : " + error.message }

  revalidatePath(`/dashboard/modules/bruit/${evaluationId}`)
  revalidatePath(`/dashboard/postes/${op.poste_id}`)
  return { succes: true }
}

// ─── Valider l'évaluation bruit ───────────────────────────────────────────────

export async function validerEvaluationBruit(payload: {
  evaluationId: string
  criticite_bruit: number
  criticite_residuelle_bruit: number
  zone: string
  methode: 'sommaire' | 'simplifiee'
  niveau_estimation?: number | null
  phases?: PhaseBruit[]
  total_points?: number | null
  epi_utilises?: boolean
  epi_types?: string[]
  epi_snr?: number | null
  mesures_techniques?: string[]
  mesures_organisationnelles?: string[]
  mesures_humaines?: string[]
}) {
  const { supabase } = await getClientAndEntreprise()

  const { evaluationId, criticite_bruit, criticite_residuelle_bruit } = payload

  // Récupérer le poste_id pour revalidation
  const { data: ev } = await supabase
    .from('evaluations')
    .select('id, operation_id, operations!inner(poste_id)')
    .eq('id', evaluationId)
    .single()

  if (!ev) return { erreur: 'Évaluation introuvable.' }

  const op = ev.operations as unknown as { poste_id: string }

  // 1. Mettre à jour evaluations_bruit → statut 'valide'
  const { error: errBruit } = await supabase.from('evaluations_bruit').upsert(
    {
      evaluation_id: evaluationId,
      methode: payload.methode,
      niveau_estimation: payload.niveau_estimation ?? null,
      phases: payload.phases ?? [],
      total_points: payload.total_points ?? null,
      zone: payload.zone,
      criticite_bruit,
      epi_utilises: payload.epi_utilises ?? false,
      epi_types: payload.epi_types ?? [],
      epi_snr: payload.epi_snr ?? null,
      mesures_techniques: payload.mesures_techniques ?? [],
      mesures_organisationnelles: payload.mesures_organisationnelles ?? [],
      mesures_humaines: payload.mesures_humaines ?? [],
      criticite_residuelle_bruit,
      statut: 'valide',
    },
    { onConflict: 'evaluation_id' }
  )

  if (errBruit) return { erreur: "Erreur lors de la validation : " + errBruit.message }

  // 2. Écrire criticite_brute sur l'évaluation APR
  const { error: errEval } = await supabase
    .from('evaluations')
    .update({ criticite_brute: criticite_bruit })
    .eq('id', evaluationId)

  if (errEval) return { erreur: "Erreur mise à jour évaluation APR : " + errEval.message }

  // 3. Écrire criticite_residuelle sur plans_maitrise (PM = 1 par défaut pour bruit, la criticité finale vient du module)
  const { error: errPM } = await supabase
    .from('plans_maitrise')
    .update({
      criticite_residuelle: criticite_residuelle_bruit,
      coefficient_pm: 1.0, // PM non applicable pour module normé — la réduction est dans la méthode
    })
    .eq('evaluation_id', evaluationId)

  if (errPM) return { erreur: "Erreur mise à jour plan de maîtrise : " + errPM.message }

  revalidatePath(`/dashboard/modules/bruit`)
  revalidatePath(`/dashboard/modules/bruit/${evaluationId}`)
  revalidatePath(`/dashboard/postes/${op.poste_id}`)
  return { succes: true }
}
