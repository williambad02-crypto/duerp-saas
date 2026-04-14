'use client'

import Link from 'next/link'
import type { AbonnementProps } from '@/lib/abonnement'

export function AbonnementBadge({ statut, joursRestantsTrial }: Pick<AbonnementProps, 'statut' | 'joursRestantsTrial'>) {
  if (statut === 'actif') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Abonné
      </span>
    )
  }

  if (statut === 'essai') {
    const urgent = (joursRestantsTrial ?? 0) <= 3
    return (
      <Link href="/pricing" className="block">
        <span className={`inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-1 ${
          urgent
            ? 'bg-orange-100 text-orange-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${urgent ? 'bg-orange-500' : 'bg-blue-500'}`} />
          Essai — {joursRestantsTrial}j
        </span>
      </Link>
    )
  }

  if (statut === 'impaye') {
    return (
      <Link href="/dashboard/parametres" className="block">
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Paiement requis
        </span>
      </Link>
    )
  }

  if (statut === 'annule') {
    return (
      <Link href="/pricing" className="block">
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Expiré
        </span>
      </Link>
    )
  }

  // aucun — mode découverte
  return (
    <Link href="/pricing" className="block">
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Découverte
      </span>
    </Link>
  )
}
