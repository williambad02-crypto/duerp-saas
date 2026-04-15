'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

interface PricingToggleProps {
  isLoggedIn: boolean
}

const FEATURES_INDUSTRIE = [
  "Jusqu'à 5 postes de travail",
  "Jusqu'à 20 opérations",
  "Les 20 risques ED 840 couverts",
  "Module Bruit (M01) inclus",
  "Export PDF DUERP conforme",
  "Conservation 40 ans automatique",
  "Support email sous 24h ouvrées",
]

const FEATURES_PREMIUM = [
  "Postes et opérations illimités",
  "Tous les modules (M01 + M02-M05 dès sortie)",
  "Audit semestriel visio 1h inclus",
  "Export PDF DUERP conforme",
  "Conservation 40 ans automatique",
  "Support prioritaire (4h ouvrées)",
  "Onboarding personnalisé (visio 30 min)",
]

export function PricingToggle({ isLoggedIn }: PricingToggleProps) {
  const [periode, setPeriode] = useState<'mensuel' | 'annuel'>('annuel')
  const [enCours, setEnCours] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  async function handleSubscribe(plan: 'industrie' | 'premium') {
    if (!isLoggedIn) return

    setEnCours(plan)
    setErreur(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, periode }),
      })
      const body = await res.json()
      if (!res.ok) {
        setErreur(body.erreur ?? 'Erreur lors de la création de la session.')
        return
      }
      window.location.href = body.url
    } catch {
      setErreur('Impossible de contacter le serveur.')
    } finally {
      setEnCours(null)
    }
  }

  const prix = {
    industrie: periode === 'mensuel' ? { montant: '99', unite: '/mois', sous: 'Sans engagement' } : { montant: '990', unite: '/an', sous: 'Soit 82,50€/mois — 2 mois offerts' },
    premium:   periode === 'mensuel' ? { montant: '149', unite: '/mois', sous: 'Sans engagement' } : { montant: '1490', unite: '/an', sous: 'Soit 124€/mois — 2 mois offerts' },
  }

  return (
    <div className="flex flex-col items-center gap-8">

      {/* Toggle période */}
      <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
        {(['mensuel', 'annuel'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriode(p)}
            className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all ${
              periode === p
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p === 'mensuel' ? 'Mensuel' : 'Annuel'}
            {p === 'annuel' && (
              <span className="absolute -top-2 -right-1 bg-brand-gold text-brand-off text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                2 mois offerts
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grille 2 plans */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Pack Industrie */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-8 flex flex-col">
          <div className="mb-6">
            <p className="text-xs font-bold text-brand-bronze uppercase tracking-wider mb-2">Pack Industrie</p>
            <p className="text-sm text-gray-500 mb-4">PME 1-50 salariés</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-gray-900">{prix.industrie.montant}€</span>
              <span className="text-gray-400">{prix.industrie.unite}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{prix.industrie.sous}</p>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {FEATURES_INDUSTRIE.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          {isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSubscribe('industrie')}
                disabled={enCours !== null}
                className="w-full rounded-xl border-2 border-brand-navy text-brand-navy hover:bg-brand-navy/5 disabled:opacity-60 font-bold px-5 py-3 text-sm transition"
              >
                {enCours === 'industrie' ? 'Chargement…' : "Choisir Pack Industrie"}
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signup?plan=industrie"
              className="block text-center rounded-xl border-2 border-brand-navy text-brand-navy hover:bg-brand-navy/5 font-bold px-5 py-3 text-sm transition"
            >
              Essai gratuit 14 jours →
            </Link>
          )}
        </div>

        {/* Pack Premium */}
        <div className="relative bg-brand-navy rounded-2xl shadow-lg p-8 flex flex-col">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-off text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
            RECOMMANDÉ
          </div>
          <div className="mb-6">
            <p className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">Pack Premium</p>
            <p className="text-sm text-brand-cream/60 mb-4">PME 50-250 salariés</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-white">{prix.premium.montant}€</span>
              <span className="text-brand-cream/60">{prix.premium.unite}</span>
            </div>
            <p className="text-xs text-brand-cream/50 mt-1">{prix.premium.sous}</p>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {FEATURES_PREMIUM.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-brand-cream/80">
                <Check className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          {isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSubscribe('premium')}
                disabled={enCours !== null}
                className="w-full rounded-xl bg-brand-gold hover:bg-brand-gold-light disabled:opacity-60 text-brand-off font-bold px-5 py-3 text-sm transition"
              >
                {enCours === 'premium' ? 'Chargement…' : "Choisir Pack Premium"}
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signup?plan=premium"
              className="block text-center rounded-xl bg-brand-gold hover:bg-brand-gold-light text-brand-off font-bold px-5 py-3 text-sm transition"
            >
              Essai gratuit 14 jours →
            </Link>
          )}
        </div>

      </div>

      {erreur && (
        <p className="text-sm text-red-600 text-center">{erreur}</p>
      )}

      {/* Note sécurité */}
      <p className="text-xs text-gray-400 text-center">
        {isLoggedIn ? 'Paiement sécurisé par Stripe · Annulable à tout moment' : 'Aucune carte bancaire requise pour l\'essai · Paiement Stripe sécurisé'}
      </p>

    </div>
  )
}
