'use client'

import { useEffect, useState } from 'react'

const COOKIE_KEY = 'duerp_cookies_accepted'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // N'afficher que si l'utilisateur n'a pas encore accepté
    if (!localStorage.getItem(COOKIE_KEY)) {
      setVisible(true)
    }
  }, [])

  function accepter() {
    localStorage.setItem(COOKIE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-gray-200 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm leading-relaxed">
          Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement
          (session d&apos;authentification). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
          {' '}
          <a href="/confidentialite" className="underline hover:text-white transition-colors">
            En savoir plus
          </a>
        </p>
        <button
          onClick={accepter}
          className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 transition-colors"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  )
}
