'use server'

import { createClient } from '@/lib/supabase/server'
import { posteSchema } from '@/lib/validations/poste'
import { operationSchema } from '@/lib/validations/operation'
import { TEMPLATE_METIER_PAR_CODE } from '@/lib/constants/templates-metier'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Récupérer l'entreprise de l'utilisateur courant (helper interne)
async function getEntrepriseId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!entreprise) redirect('/dashboard/onboarding')
  return { supabase, entrepriseId: entreprise.id, userId: user.id }
}

// ─── POSTES ────────────────────────────────────────────────────────────────────

export async function creerPoste(formData: FormData) {
  const { supabase, entrepriseId, userId } = await getEntrepriseId()

  const validation = posteSchema.safeParse({
    nom: formData.get('nom'),
    description: formData.get('description') || undefined,
  })

  if (!validation.success) {
    return { erreur: validation.error.issues[0].message }
  }

  const { data: postes } = await supabase
    .from('postes')
    .select('id')
    .eq('entreprise_id', entrepriseId)

  // ── Vérification quota Pack Industrie ─────────────────────────────────────
  const { data: abo } = await supabase
    .from('abonnements')
    .select('plan_type, legacy_plan')
    .eq('user_id', userId)
    .single()

  const planType  = (abo?.plan_type ?? 'industrie') as string
  const isLegacy  = abo?.legacy_plan ?? false
  const nbPostes  = postes?.length ?? 0

  // Les clients legacy (ancien plan 39€) ont un accès équivalent Premium
  if (!isLegacy && planType === 'industrie' && nbPostes >= 5) {
    return {
      erreur: 'Limite du Pack Industrie atteinte (5 postes). Passez au Pack Premium pour des postes illimités.',
      limiteAtteinte: true,
    }
  }

  const { data: nouveauPoste, error } = await supabase
    .from('postes')
    .insert({
      entreprise_id: entrepriseId,
      nom: validation.data.nom,
      description: validation.data.description || null,
      ordre: (postes?.length ?? 0),
    })
    .select('id')
    .single()

  if (error || !nouveauPoste) return { erreur: 'Erreur lors de la création du poste.' }

  // ── Template métier : pré-remplissage de l'opération transversale ────────
  // Le trigger DB ensure_toutes_operations() crée l'opération "Toutes opérations"
  // automatiquement après l'insert dans postes. On récupère cette opération
  // puis on insère les risques du template choisi (si fourni).
  const templateCodeRaw = formData.get('templateCode')
  const templateCode = typeof templateCodeRaw === 'string' && templateCodeRaw.length > 0
    ? templateCodeRaw
    : null

  if (templateCode) {
    const template = TEMPLATE_METIER_PAR_CODE[templateCode]
    if (template) {
      const { data: opTransverse } = await supabase
        .from('operations')
        .select('id')
        .eq('poste_id', nouveauPoste.id)
        .eq('est_transversale', true)
        .single()

      if (opTransverse) {
        // Sécurité : si des évaluations existent déjà (cas théorique improbable),
        // on ne crée pas de doublons.
        const { data: evalsExistantes } = await supabase
          .from('evaluations')
          .select('id')
          .eq('operation_id', opTransverse.id)
          .limit(1)

        if (!evalsExistantes || evalsExistantes.length === 0) {
          for (let i = 0; i < template.risques.length; i++) {
            const r = template.risques[i]
            const { data: newEval } = await supabase
              .from('evaluations')
              .insert({
                operation_id: opTransverse.id,
                code_module: 'APR',
                numero_risque_ed840: r.numero_risque_ed840,
                type_risque: r.type_risque,
                danger: r.danger,
                situation_dangereuse: r.situation_dangereuse,
                evenement_dangereux: r.evenement_dangereux,
                dommage: r.dommage,
                gravite: r.gravite,
                probabilite: r.probabilite,
                duree_exposition: r.duree_exposition,
                ordre: i,
              })
              .select('id')
              .single()

            if (newEval && r.mesures_techniques_modele) {
              // coefficient_pm = 1.0 par défaut : les mesures types sont
              // proposées mais pas encore évaluées en efficacité par l'utilisateur.
              // La criticité résiduelle reste égale à la criticité brute tant
              // que l'utilisateur n'a pas renseigné le coefficient réel.
              await supabase.from('plans_maitrise').insert({
                evaluation_id: newEval.id,
                coefficient_pm: 1.0,
                mesures_techniques: r.mesures_techniques_modele,
              })
            }
          }
        }
      }
    }
  }

  revalidatePath('/dashboard/postes')
  return { succes: true }
}

export async function modifierPoste(posteId: string, formData: FormData) {
  const { supabase } = await getEntrepriseId()

  const validation = posteSchema.safeParse({
    nom: formData.get('nom'),
    description: formData.get('description') || undefined,
  })

  if (!validation.success) {
    return { erreur: validation.error.issues[0].message }
  }

  const { error } = await supabase
    .from('postes')
    .update({
      nom: validation.data.nom,
      description: validation.data.description || null,
    })
    .eq('id', posteId)

  if (error) return { erreur: 'Erreur lors de la modification.' }

  revalidatePath('/dashboard/postes')
  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}

export async function supprimerPoste(posteId: string) {
  const { supabase } = await getEntrepriseId()

  const { error } = await supabase.from('postes').delete().eq('id', posteId)

  if (error) return { erreur: 'Erreur lors de la suppression.' }

  revalidatePath('/dashboard/postes')
  redirect('/dashboard/postes')
}

// ─── OPÉRATIONS ────────────────────────────────────────────────────────────────

export async function creerOperation(posteId: string, formData: FormData) {
  const { supabase } = await getEntrepriseId()

  const estTransversale = formData.get('est_transversale') === 'true'

  // Vérifier unicité de l'opération transversale
  if (estTransversale) {
    const { data: existante } = await supabase
      .from('operations')
      .select('id')
      .eq('poste_id', posteId)
      .eq('est_transversale', true)
      .single()

    if (existante) {
      return { erreur: "L'opération \"Toutes opérations\" existe déjà pour ce poste." }
    }
  }

  const validation = operationSchema.safeParse({
    nom: estTransversale ? 'Toutes opérations' : formData.get('nom'),
    description: formData.get('description') || undefined,
    est_transversale: estTransversale,
  })

  if (!validation.success) {
    return { erreur: validation.error.issues[0].message }
  }

  const { data: operations } = await supabase
    .from('operations')
    .select('id')
    .eq('poste_id', posteId)

  const { error } = await supabase.from('operations').insert({
    poste_id: posteId,
    nom: validation.data.nom,
    description: validation.data.description || null,
    est_transversale: validation.data.est_transversale,
    ordre: (operations?.length ?? 0),
  })

  if (error) return { erreur: "Erreur lors de la création de l'opération." }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}

export async function modifierOperation(operationId: string, posteId: string, formData: FormData) {
  const { supabase } = await getEntrepriseId()

  const validation = operationSchema.safeParse({
    nom: formData.get('nom'),
    description: formData.get('description') || undefined,
    est_transversale: false,
  })

  if (!validation.success) {
    return { erreur: validation.error.issues[0].message }
  }

  const { error } = await supabase
    .from('operations')
    .update({
      nom: validation.data.nom,
      description: validation.data.description || null,
    })
    .eq('id', operationId)

  if (error) return { erreur: "Erreur lors de la modification." }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}

export async function supprimerOperation(operationId: string, posteId: string) {
  const { supabase } = await getEntrepriseId()

  const { error } = await supabase.from('operations').delete().eq('id', operationId)

  if (error) return { erreur: 'Erreur lors de la suppression.' }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { succes: true }
}
