// POST /api/stripe/portal
// Crée une session Stripe Billing Portal pour que l'utilisateur gère son abonnement.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  const { data: abo } = await supabase
    .from('abonnements')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!abo?.stripe_customer_id) {
    console.warn(`[portal] user ${user.id} — pas de stripe_customer_id`)
    return NextResponse.json(
      { erreur: "Aucun abonnement Stripe trouvé. Commencez par vous abonner." },
      { status: 400 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: abo.stripe_customer_id,
      return_url: `${appUrl}/dashboard/parametres`,
    })

    console.info(`[portal] session créée pour user ${user.id}`)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[portal] Erreur création session portail:', err)
    return NextResponse.json({ erreur: 'Impossible de créer la session portail.' }, { status: 500 })
  }
}
