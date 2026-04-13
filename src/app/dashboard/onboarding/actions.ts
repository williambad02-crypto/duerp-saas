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

  redirect('/dashboard')
}
