'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { AbonnementProps } from '@/lib/abonnement'

interface PaywallBannerProps {
  bandeau: AbonnementProps['bandeau']
  joursRestantsTrial: number | null
}

export function PaywallBanner({ bandeau, joursRestantsTrial }: PaywallBannerProps) {
  const [ferme, setFerme] = useState(false)

  if (!bandeau || ferme) return null

  const configs = {
    trial_bientot: {
      bg: 'bg-orange-50 border-orange-200',
      text: 'text-orange-800',
      icon: '⏳',
      message: `Votre essai gratuit se termine dans ${joursRestantsTrial} jour${(joursRestantsTrial ?? 0) > 1 ? 's' : ''}. Abonnez-vous pour ne pas perdre l'accès à vos données.`,
      cta: "S'abonner maintenant",
      href: '/pricing',
    },
    impaye: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: '⚠️',
      message: "Votre paiement a échoué. Votre accès est limité — vous pouvez consulter vos données mais pas les modifier ni exporter le PDF.",
      cta: 'Mettre à jour le paiement',
      href: '/dashboard/parametres',
    },
    annule: {
      bg: 'bg-gray-50 border-gray-200',
      text: 'text-gray-800',
      icon: '🔒',
      message: "Votre abonnement est annulé. Vos données sont conservées en lecture seule. Réabonnez-vous pour retrouver l'accès complet.",
      cta: 'Réactiver',
      href: '/pricing',
    },
    aucun: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: '👋',
      message: "Vous êtes en mode découverte (1 poste, 2 opérations). Démarrez votre essai gratuit de 14 jours pour accéder à toutes les fonctionnalités.",
      cta: "Essai gratuit — 14 jours",
      href: '/pricing',
    },
  } as const

  const config = configs[bandeau]

  return (
    <div className={`border rounded-lg px-4 py-3 mb-4 flex items-center justify-between gap-4 ${config.bg}`}>
      <div className="flex items-start gap-2 min-w-0">
        <span className="text-base shrink-0 mt-0.5">{config.icon}</span>
        <p className={`text-sm leading-relaxed ${config.text}`}>{config.message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={config.href}
          className={`text-xs font-semibold whitespace-nowrap underline ${config.text}`}
        >
          {config.cta}
        </Link>
        {bandeau !== 'impaye' && (
          <button
            onClick={() => setFerme(true)}
            className={`${config.text} opacity-50 hover:opacity-100`}
            aria-label="Fermer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
