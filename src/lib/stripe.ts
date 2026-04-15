import Stripe from 'stripe'

// Singleton Stripe — côté serveur uniquement
// Ne jamais importer ce fichier dans un composant client
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY manquant dans les variables d'environnement")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

// ─── Price IDs ────────────────────────────────────────────────────────────────
// À renseigner dans .env.local ET dans Vercel (Settings → Environment Variables)
// après avoir créé les 4 produits dans le dashboard Stripe.
//
// Variables requises :
//   STRIPE_PRICE_INDUSTRIE_MONTHLY=price_xxx   → Pack Industrie 99€/mois
//   STRIPE_PRICE_INDUSTRIE_YEARLY=price_xxx    → Pack Industrie 990€/an
//   STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx     → Pack Premium 149€/mois
//   STRIPE_PRICE_PREMIUM_YEARLY=price_xxx      → Pack Premium 1490€/an
//
// Variables legacy (ancien plan 39€) — laisser telles quelles pour les clients existants :
//   STRIPE_PRICE_MENSUEL_ID=price_xxx          → legacy
//   STRIPE_PRICE_ANNUEL_ID=price_xxx           → legacy

export const STRIPE_PRICES = {
  industrie_mensuel: process.env.STRIPE_PRICE_INDUSTRIE_MONTHLY ?? '',
  industrie_annuel:  process.env.STRIPE_PRICE_INDUSTRIE_YEARLY  ?? '',
  premium_mensuel:   process.env.STRIPE_PRICE_PREMIUM_MONTHLY   ?? '',
  premium_annuel:    process.env.STRIPE_PRICE_PREMIUM_YEARLY    ?? '',
} as const

export type PlanType = 'industrie' | 'premium'
export type PeriodeAbonnement = 'mensuel' | 'annuel'

// Quotas par plan (null = illimité)
export const PLAN_QUOTAS: Record<PlanType, { max_postes: number | null; max_operations: number | null }> = {
  industrie: { max_postes: 5, max_operations: 20 },
  premium:   { max_postes: null, max_operations: null },
}

// Helper : retrouve le plan depuis un price_id (utilisé dans le webhook)
export function getPlanFromPriceId(priceId: string): PlanType {
  const industriePrices = [
    process.env.STRIPE_PRICE_INDUSTRIE_MONTHLY ?? '',
    process.env.STRIPE_PRICE_INDUSTRIE_YEARLY  ?? '',
  ].filter(Boolean)

  if (industriePrices.length > 0 && industriePrices.includes(priceId)) {
    return 'industrie'
  }
  return 'premium'
}
