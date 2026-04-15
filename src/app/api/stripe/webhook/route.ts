// POST /api/stripe/webhook
// Reçoit les événements Stripe et synchronise l'état d'abonnement en base.
// Utilise le service_role Supabase pour écrire sans passer par RLS.
//
// ⚠️  Stripe API 2026-03-25.dahlia (v22) :
//     - current_period_end est sur SubscriptionItem, pas sur Subscription
//     - Invoice.subscription → Invoice.parent.subscription_details.subscription

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, getPlanFromPriceId, PlanType } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic  = 'force-dynamic'

// Utilitaire : récupère la fin de période depuis les items de l'abonnement
function getPeriodEnd(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0]
  if (!item) return null
  const ts = (item as unknown as { current_period_end?: number }).current_period_end
  return ts ? new Date(ts * 1000).toISOString() : null
}

// Utilitaire : récupère le subscription_id depuis une Invoice (API v22)
function getSubIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent as unknown as {
    subscription_details?: { subscription?: string | Stripe.Subscription }
  } | null
  const subFromParent = parent?.subscription_details?.subscription
  if (subFromParent) {
    return typeof subFromParent === 'string' ? subFromParent : subFromParent.id
  }
  return null
}

function mapStripeStatut(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'trialing':  return 'trial'
    case 'active':    return 'active'
    case 'past_due':  return 'past_due'
    case 'canceled':  return 'canceled'
    case 'unpaid':    return 'past_due'
    case 'paused':    return 'canceled'
    default:          return status
  }
}

// Déduit le plan depuis la metadata Stripe ou, en fallback, depuis le price_id
function resolvePlanType(
  meta: Record<string, string | undefined> | null,
  priceId: string
): PlanType {
  const fromMeta = meta?.plan
  if (fromMeta === 'premium' || fromMeta === 'industrie') return fromMeta
  return getPlanFromPriceId(priceId)
}

async function handleEvent(event: Stripe.Event) {
  const supabase = createAdminClient()

  switch (event.type) {

    // ── Paiement initial validé ────────────────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const subId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription | null)?.id

      if (!subId) {
        console.error('[webhook] checkout.session.completed: subscription_id absent')
        break
      }

      const sub = await stripe.subscriptions.retrieve(subId)
      const meta = (sub as unknown as { metadata?: Record<string, string> }).metadata ?? null
      const userId = meta?.user_id

      if (!userId) {
        console.error('[webhook] checkout.session.completed: user_id absent de la metadata', subId)
        break
      }

      const periode  = meta?.periode ?? 'mensuel'
      const priceId  = sub.items.data[0]?.price.id ?? ''
      const planType = resolvePlanType(meta, priceId)

      await supabase.from('abonnements').upsert({
        user_id:                userId,
        stripe_customer_id:     typeof session.customer === 'string' ? session.customer : null,
        stripe_subscription_id: sub.id,
        stripe_price_id:        priceId,
        plan:                   'essentiel',   // colonne legacy, inchangée
        plan_type:              planType,
        periode,
        statut:                 mapStripeStatut(sub.status),
        trial_ends_at:          sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        current_period_end:     getPeriodEnd(sub),
        legacy_plan:            false,
      }, { onConflict: 'user_id' })

      console.info(`[webhook] checkout.session.completed: user ${userId} → plan_type ${planType} (${periode})`)
      break
    }

    // ── Abonnement modifié (upgrade/downgrade/renouvellement) ─────────────
    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription
      const meta   = (sub as unknown as { metadata?: Record<string, string> }).metadata ?? null
      const userId = meta?.user_id

      if (!userId) {
        console.error('[webhook] subscription.updated: user_id absent', sub.id)
        break
      }

      const priceId  = sub.items.data[0]?.price.id ?? ''
      const planType = resolvePlanType(meta, priceId)
      const statut   = mapStripeStatut(sub.status)

      await supabase.from('abonnements').update({
        statut,
        plan_type:         planType,
        stripe_price_id:   priceId,
        trial_ends_at:     sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        current_period_end: getPeriodEnd(sub),
      }).eq('user_id', userId)

      console.info(`[webhook] subscription.updated: user ${userId} → plan_type ${planType} statut ${statut}`)
      break
    }

    // ── Facture payée → renouvellement ────────────────────────────────────
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const subId   = getSubIdFromInvoice(invoice)
      if (!subId) break

      const sub    = await stripe.subscriptions.retrieve(subId)
      const meta   = (sub as unknown as { metadata?: Record<string, string> }).metadata ?? null
      const userId = meta?.user_id
      if (!userId) break

      await supabase.from('abonnements').update({
        statut:            'active',
        current_period_end: getPeriodEnd(sub),
      }).eq('user_id', userId)

      console.info(`[webhook] invoice.paid: user ${userId} — période renouvelée`)
      break
    }

    // ── Paiement échoué ───────────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId   = getSubIdFromInvoice(invoice)
      if (!subId) break

      const sub    = await stripe.subscriptions.retrieve(subId)
      const meta   = (sub as unknown as { metadata?: Record<string, string> }).metadata ?? null
      const userId = meta?.user_id
      if (!userId) break

      await supabase.from('abonnements').update({ statut: 'past_due' }).eq('user_id', userId)
      console.warn(`[webhook] invoice.payment_failed: user ${userId} — marqué impayé`)
      break
    }

    // ── Abonnement annulé ─────────────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub    = event.data.object as Stripe.Subscription
      const meta   = (sub as unknown as { metadata?: Record<string, string> }).metadata ?? null
      const userId = meta?.user_id

      if (!userId) {
        console.error('[webhook] subscription.deleted: user_id absent', sub.id)
        break
      }

      await supabase.from('abonnements').update({
        statut:            'canceled',
        current_period_end: null,
      }).eq('user_id', userId)

      console.info(`[webhook] subscription.deleted: user ${userId} — annulé`)
      break
    }

    default:
      break
  }
}

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('[webhook] Signature Stripe absente')
    return NextResponse.json({ erreur: 'Signature absente' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Vérification signature échouée:', (err as Error).message)
    return NextResponse.json({ erreur: 'Signature invalide' }, { status: 400 })
  }

  try {
    await handleEvent(event)
  } catch (err) {
    console.error(`[webhook] Erreur traitement événement ${event.type}:`, err)
    // Retourner 200 — Stripe ne retentera pas si on retourne 5xx en boucle
    return NextResponse.json({ recu: true, erreur: 'Erreur interne' }, { status: 200 })
  }

  return NextResponse.json({ recu: true })
}
