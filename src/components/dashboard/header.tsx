'use client'

import { useState } from 'react'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Sidebar } from './sidebar'
import { AbonnementBadge } from './abonnement-badge'
import type { AbonnementProps } from '@/lib/abonnement'

interface HeaderProps {
  nomEntreprise?: string
  abonnement?: Pick<AbonnementProps, 'statut' | 'joursRestantsTrial'>
}

export function Header({ nomEntreprise, abonnement }: HeaderProps) {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:px-6">
        {/* Bouton hamburger — mobile/tablette */}
        <button
          onClick={() => setMenuOuvert(true)}
          className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Ouvrir le menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Titre — visible sur mobile */}
        <span className="lg:hidden text-sm font-semibold text-gray-700">
          {nomEntreprise ?? 'DUERP SaaS'}
        </span>

        {/* Spacer desktop avec nom entreprise */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
          <span>Bonjour,</span>
          <span className="font-medium text-gray-900">{nomEntreprise}</span>
        </div>

        {/* Badge abonnement (desktop) + déconnexion */}
        <div className="flex items-center gap-3">
          {abonnement && (
            <div className="hidden sm:block">
              <AbonnementBadge
                statut={abonnement.statut}
                joursRestantsTrial={abonnement.joursRestantsTrial}
              />
            </div>
          )}
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              Déconnexion
            </Button>
          </form>
        </div>
      </header>

      {/* Overlay mobile */}
      {menuOuvert && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOuvert(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 z-50 shadow-xl">
            <Sidebar
              nomEntreprise={nomEntreprise}
              abonnement={abonnement}
              onClose={() => setMenuOuvert(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
