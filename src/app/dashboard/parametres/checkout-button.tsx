'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export function CheckoutButton() {
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/pricing"
        className={buttonVariants({ className: 'w-full sm:w-auto' })}
      >
        Voir les offres d&apos;abonnement →
      </Link>
      <p className="text-xs text-gray-400">
        14 jours d&apos;essai gratuit inclus — sans carte bancaire.
      </p>
    </div>
  )
}
