'use server'

import { createClient } from '@/lib/supabase/server'
import { entrepriseSchema } from '@/lib/validations/entreprise'
import { redirect } from 'next/navigation'

export async function creerEntreprise(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const validation = entrepriseSchema.safeParse({
    nom: formData.get('nom'),
    secteur_activite: formData.get('secteur_activite'),
    effectif: Number(formData.get('effectif')),
    siret: formData.get('siret') || undefined,
    adresse: formData.get('adresse') || undefined,
  })

  if (!validation.success) {
    return { erreur: validation.error.issues[0].message }
  }

  const { error } = await supabase.from('entreprises').upsert({
    user_id: user.id,
    nom: validation.data.nom,
    secteur_activite: validation.data.secteur_activite,
    effectif: validation.data.effectif,
    siret: validation.data.siret || null,
    adresse: validation.data.adresse || null,
  })

  if (error) {
    return { erreur: 'Erreur lors de la sauvegarde. Veuillez réessayer.' }
  }

  // Créer le trial de 14 jours (idempotent — ignore si déjà existant)
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)
  await supabase.from('abonnements').upsert(
    {
      user_id: user.id,
      statut: 'trial',
      plan: 'essentiel',
      trial_ends_at: trialEnd.toISOString(),
    },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )

  redirect('/dashboard')
}
