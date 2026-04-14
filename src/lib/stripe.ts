import Stripe from 'stripe'

// Singleton Stripe — côté serveur uniquement
// Ne jamais importer ce fichier dans un composant client
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquant dans les variables d\'environnement')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

// IDs des prix Stripe — à renseigner après avoir exécuté scripts/setup-stripe.ts
export const STRIPE_PRICES = {
  mensuel: process.env.STRIPE_PRICE_MENSUEL_ID ?? '',
  annuel:  process.env.STRIPE_PRICE_ANNUEL_ID  ?? '',
} as const

export type PeriodeAbonnement = 'mensuel' | 'annuel'
