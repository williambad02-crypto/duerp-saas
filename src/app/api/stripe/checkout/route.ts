// POST /api/stripe/checkout
// Crée une session Stripe Checkout pour s'abonner.
// Le trial de 14 jours est géré côté DB (créé à l'onboarding) — pas de trial Stripe.

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICES, PeriodeAbonnement } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const periode: PeriodeAbonnement = body.periode === 'annuel' ? 'annuel' : 'mensuel'
  const priceId = STRIPE_PRICES[periode]

  if (!priceId) {
    return NextResponse.json(
      { erreur: `Prix Stripe non configuré pour la période "${periode}". Exécutez scripts/setup-stripe.ts.` },
      { status: 500 }
    )
  }

  const headersList = await headers()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    || `${headersList.get('x-forwarded-proto') || 'https'}://${headersList.get('host')}`

  // Récupérer l'email et l'abonnement existant pour réutiliser le customer Stripe
  const { data: abo } = await supabase
    .from('abonnements')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = abo?.stripe_customer_id ?? undefined

  // Créer le customer Stripe si inexistant
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id

    // Sauvegarder le customer_id en base (pour les prochains checkouts)
    await supabase
      .from('abonnements')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        user_id: user.id,
        periode,
      },
    },
    // Permettre de passer la saisie de CB si le trial couvre déjà (rare en pratique)
    payment_method_collection: 'always',
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    locale: 'fr',
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
