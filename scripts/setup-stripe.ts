/**
 * Script de configuration Stripe — créé les produits et prix pour DUERP SaaS
 *
 * Usage :
 *   npx tsx scripts/setup-stripe.ts
 *
 * Prérequis :
 *   STRIPE_SECRET_KEY dans .env.local
 *
 * Ce script est idempotent — relancez-le sans risque si vous devez
 * récupérer les IDs de prix existants.
 */

import Stripe from 'stripe'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const clé = process.env.STRIPE_SECRET_KEY
if (!clé) {
  console.error("❌  STRIPE_SECRET_KEY absent de .env.local")
  process.exit(1)
}

const stripe = new Stripe(clé, { typescript: true })

async function main() {
  console.log("🔧  Configuration Stripe pour DUERP SaaS\n")

  // ── Produit ───────────────────────────────────────────────────────────────
  const produits = await stripe.products.list({ active: true, limit: 100 })
  let produit = produits.data.find((p) => p.metadata?.duerp_saas === 'essentiel')

  if (!produit) {
    produit = await stripe.products.create({
      name: "DUERP SaaS — Plan Essentiel",
      description: "Évaluation des risques professionnels guidée. Postes, opérations et export PDF illimités.",
      metadata: { duerp_saas: 'essentiel' },
    })
    console.log(`✅  Produit créé : ${produit.id}`)
  } else {
    console.log(`ℹ️   Produit existant : ${produit.id}`)
  }

  // ── Prix mensuel ──────────────────────────────────────────────────────────
  const prixExistants = await stripe.prices.list({ product: produit.id, active: true, limit: 100 })

  let prixMensuel = prixExistants.data.find((p) => p.metadata?.periode === 'mensuel')
  if (!prixMensuel) {
    prixMensuel = await stripe.prices.create({
      product: produit.id,
      currency: 'eur',
      unit_amount: 3900, // 39,00 €
      recurring: { interval: 'month' },
      metadata: { periode: 'mensuel' },
    })
    console.log(`✅  Prix mensuel créé : ${prixMensuel.id}`)
  } else {
    console.log(`ℹ️   Prix mensuel existant : ${prixMensuel.id}`)
  }

  // ── Prix annuel ───────────────────────────────────────────────────────────
  let prixAnnuel = prixExistants.data.find((p) => p.metadata?.periode === 'annuel')
  if (!prixAnnuel) {
    prixAnnuel = await stripe.prices.create({
      product: produit.id,
      currency: 'eur',
      unit_amount: 39000, // 390,00 €
      recurring: { interval: 'year' },
      metadata: { periode: 'annuel' },
    })
    console.log(`✅  Prix annuel créé : ${prixAnnuel.id}`)
  } else {
    console.log(`ℹ️   Prix annuel existant : ${prixAnnuel.id}`)
  }

  // ── Résumé ────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60))
  console.log("📋  Ajoutez ces variables dans .env.local et Vercel :\n")
  console.log(`STRIPE_PRICE_MENSUEL_ID=${prixMensuel.id}`)
  console.log(`STRIPE_PRICE_ANNUEL_ID=${prixAnnuel.id}`)
  console.log("\n" + "─".repeat(60))
  console.log("🔔  N'oubliez pas de configurer le webhook Stripe :")
  console.log("    Dashboard Stripe → Developers → Webhooks → Add endpoint")
  console.log("    URL : https://votre-app.vercel.app/api/stripe/webhook")
  console.log("    Événements à écouter :")
  console.log("      - checkout.session.completed")
  console.log("      - customer.subscription.updated")
  console.log("      - customer.subscription.deleted")
  console.log("      - invoice.paid")
  console.log("      - invoice.payment_failed")
  console.log("\n✅  Configuration terminée.")
}

main().catch((err) => {
  console.error("❌  Erreur :", err)
  process.exit(1)
})
