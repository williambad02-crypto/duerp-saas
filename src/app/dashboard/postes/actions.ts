'use server'

import { createClient } from '@/lib/supabase/server'
import { posteSchema } from '@/lib/validations/poste'
import { operationSchema } from '@/lib/validations/operation'
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

  const { error } = await supabase.from('postes').insert({
    entreprise_id: entrepriseId,
    nom: validation.data.nom,
    description: validation.data.description || null,
    ordre: (postes?.length ?? 0),
  })

  if (error) return { erreur: 'Erreur lors de la création du poste.' }

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
