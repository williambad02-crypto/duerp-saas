// Helper serveur — lecture et interprétation du statut d'abonnement
// Côté serveur uniquement (Server Components, Server Actions, API Routes)

import { createClient } from '@/lib/supabase/server'

export type StatutAbonnementEffectif =
  | 'essai'    // trial en cours
  | 'actif'    // abonnement payant actif
  | 'impaye'   // paiement échoué
  | 'annule'   // abonnement annulé
  | 'aucun'    // jamais abonné ou trial expiré sans paiement

export interface InfoAbonnement {
  statut: StatutAbonnementEffectif
  joursRestantsTrial: number | null
  currentPeriodEnd: Date | null
  plan: string | null
  periode: string | null
  stripeCustomerId: string | null
  peutModifier: boolean     // false → lecture seule
  peutExporterPDF: boolean  // false → PDF bloqué
  bandeau: 'trial_bientot' | 'impaye' | 'annule' | 'aucun' | null
}

export async function getInfoAbonnement(userId: string): Promise<InfoAbonnement> {
  const supabase = await createClient()

  const { data: abo } = await supabase
    .from('abonnements')
    .select('statut, trial_ends_at, current_period_end, plan, periode, stripe_customer_id')
    .eq('user_id', userId)
    .single()

  // Aucun enregistrement → mode découverte
  if (!abo) {
    return aucun()
  }

  const maintenant = new Date()

  if (abo.statut === 'trial') {
    const trialEnd = abo.trial_ends_at ? new Date(abo.trial_ends_at) : null
    if (!trialEnd || trialEnd <= maintenant) {
      // Trial expiré sans abonnement → mode découverte
      return aucun()
    }
    const joursRestants = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24))
    )
    const bientotFini = joursRestants <= 3
    return {
      statut: 'essai',
      joursRestantsTrial: joursRestants,
      currentPeriodEnd: trialEnd,
      plan: abo.plan,
      periode: abo.periode,
      stripeCustomerId: abo.stripe_customer_id ?? null,
      peutModifier: true,
      peutExporterPDF: true,
      bandeau: bientotFini ? 'trial_bientot' : null,
    }
  }

  if (abo.statut === 'active') {
    return {
      statut: 'actif',
      joursRestantsTrial: null,
      currentPeriodEnd: abo.current_period_end ? new Date(abo.current_period_end) : null,
      plan: abo.plan,
      periode: abo.periode,
      stripeCustomerId: abo.stripe_customer_id ?? null,
      peutModifier: true,
      peutExporterPDF: true,
      bandeau: null,
    }
  }

  if (abo.statut === 'past_due') {
    return {
      statut: 'impaye',
      joursRestantsTrial: null,
      currentPeriodEnd: abo.current_period_end ? new Date(abo.current_period_end) : null,
      plan: abo.plan,
      periode: abo.periode,
      stripeCustomerId: abo.stripe_customer_id ?? null,
      peutModifier: false,
      peutExporterPDF: false,
      bandeau: 'impaye',
    }
  }

  if (abo.statut === 'canceled') {
    return {
      statut: 'annule',
      joursRestantsTrial: null,
      currentPeriodEnd: null,
      plan: abo.plan,
      periode: abo.periode,
      stripeCustomerId: abo.stripe_customer_id ?? null,
      peutModifier: false,
      peutExporterPDF: false,
      bandeau: 'annule',
    }
  }

  return aucun()
}

function aucun(): InfoAbonnement {
  return {
    statut: 'aucun',
    joursRestantsTrial: null,
    currentPeriodEnd: null,
    plan: null,
    periode: null,
    stripeCustomerId: null,
    peutModifier: false,
    peutExporterPDF: false,
    bandeau: 'aucun',
  }
}

// Sérialisation pour passer aux composants client (props)
export interface AbonnementProps {
  statut: StatutAbonnementEffectif
  joursRestantsTrial: number | null
  peutModifier: boolean
  peutExporterPDF: boolean
  bandeau: InfoAbonnement['bandeau']
}

export function serializeAbonnement(info: InfoAbonnement): AbonnementProps {
  return {
    statut: info.statut,
    joursRestantsTrial: info.joursRestantsTrial,
    peutModifier: info.peutModifier,
    peutExporterPDF: info.peutExporterPDF,
    bandeau: info.bandeau,
  }
}
