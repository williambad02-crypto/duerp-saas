'use client'

import { useState } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

interface PricingToggleProps {
  isLoggedIn: boolean
}

export function PricingToggle({ isLoggedIn }: PricingToggleProps) {
  const [periode, setPeriode] = useState<'mensuel' | 'annuel'>('annuel')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function handleSubscribe() {
    if (!isLoggedIn) return // le bouton redirige vers signup si non connecté

    setEnCours(true)
    setErreur(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periode }),
      })
      const body = await res.json()
      if (!res.ok) {
        setErreur(body.erreur ?? "Erreur lors de la création de la session.")
        return
      }
      window.location.href = body.url
    } catch {
      setErreur("Impossible de contacter le serveur.")
    } finally {
      setEnCours(false)
    }
  }

  const prix = periode === 'mensuel'
    ? { montant: '39€', unite: '/mois', sous: 'Sans engagement — résiliable à tout moment' }
    : { montant: '390€', unite: '/an', sous: 'Soit 32,50€/mois — vous économisez 78€' }

  return (
    <div className="flex flex-col items-center gap-8">

      {/* Toggle période */}
      <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
        {(['mensuel', 'annuel'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriode(p)}
            className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all ${
              periode === p
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p === 'mensuel' ? 'Mensuel' : 'Annuel'}
            {p === 'annuel' && (
              <span className="absolute -top-2 -right-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                -17%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Card plan */}
      <div className="w-full max-w-md bg-white rounded-2xl border-2 border-blue-700 shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Plan Essentiel</h2>
          <p className="text-sm text-gray-500">Tout ce qu&apos;il vous faut pour votre DUERP</p>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold text-gray-900">{prix.montant}</span>
            <span className="text-gray-400 text-lg">{prix.unite}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{prix.sous}</p>
          {periode === 'annuel' && (
            <p className="text-xs text-gray-400 mt-1">
              <s>468€</s> → 390€ — 1 mois offert
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {[
            "Postes et opérations illimités",
            "Tous les modules de risques",
            "Export PDF DUERP officiel",
            "Historique des versions (40 ans)",
            "Support par email",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {isLoggedIn ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSubscribe}
              disabled={enCours}
              className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold px-5 py-3 text-sm transition"
            >
              {enCours ? 'Chargement…' : "S'abonner maintenant"}
            </button>
            {erreur && <p className="text-xs text-red-600 text-center">{erreur}</p>}
          </div>
        ) : (
          <Link
            href="/auth/signup"
            className={buttonVariants({ className: 'w-full font-bold' })}
          >
            Essai gratuit 14 jours →
          </Link>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          {isLoggedIn
            ? "Paiement sécurisé par Stripe"
            : "Aucune carte bancaire requise pour l'essai"}
        </p>
      </div>

      {/* Mode découverte */}
      <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">Mode découverte — Gratuit</p>
        <p className="text-xs text-gray-500 mb-3">
          1 poste, 2 opérations. Évaluations visibles, export PDF non inclus.
        </p>
        <Link
          href={isLoggedIn ? "/dashboard" : "/auth/signup"}
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          {isLoggedIn ? "Retour au dashboard →" : "Créer un compte gratuit →"}
        </Link>
      </div>

    </div>
  )
}
