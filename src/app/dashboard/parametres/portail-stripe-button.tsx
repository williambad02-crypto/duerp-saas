'use client'

import { useState } from 'react'

export function PortailStripeButton() {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function handleClick() {
    setEnCours(true)
    setErreur(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) {
        setErreur(body.erreur ?? 'Erreur lors de l\'ouverture du portail.')
        return
      }
      window.location.href = body.url
    } catch {
      setErreur('Impossible de contacter le serveur.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={enCours}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 transition"
      >
        {enCours ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Chargement…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Gérer mon abonnement
          </>
        )}
      </button>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      <p className="text-xs text-gray-400">
        Modifiez votre plan, votre mode de paiement ou annulez depuis le portail sécurisé Stripe.
      </p>
    </div>
  )
}
