// POST /api/stripe/checkout
// Crée une session Stripe Checkout pour s'abonner.
// Accepte { plan: 'industrie'|'premium', periode: 'mensuel'|'annuel' }

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICES, PlanType, PeriodeAbonnement } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const plan: PlanType     = body.plan === 'premium' ? 'premium' : 'industrie'
  const periode: PeriodeAbonnement = body.periode === 'annuel' ? 'annuel' : 'mensuel'
  const priceKey = `${plan}_${periode}` as keyof typeof STRIPE_PRICES
  const priceId  = STRIPE_PRICES[priceKey]

  if (!priceId) {
    return NextResponse.json(
      {
        erreur: `Prix Stripe non configuré pour le plan "${plan}" période "${periode}". ` +
          'Ajoutez les variables STRIPE_PRICE_INDUSTRIE_MONTHLY / YEARLY et ' +
          'STRIPE_PRICE_PREMIUM_MONTHLY / YEARLY dans .env.local et Vercel.',
      },
      { status: 500 }
    )
  }

  const headersList = await headers()
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${headersList.get('x-forwarded-proto') || 'https'}://${headersList.get('host')}`

  // Récupérer le customer Stripe existant ou en créer un
  const { data: abo } = await supabase
    .from('abonnements')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = abo?.stripe_customer_id ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('abonnements')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
  }

  console.info(`[checkout] user ${user.id} → plan ${plan} ${periode} (price: ${priceId.slice(0, 12)}…)`)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        user_id: user.id,
        plan,
        periode,
      },
    },
    payment_method_collection: 'always',
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url:  `${appUrl}/pricing?checkout=cancelled`,
    locale: 'fr',
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
