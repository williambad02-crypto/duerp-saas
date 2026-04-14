'use client'

import { useState } from 'react'
import { PanelLeft } from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Sidebar } from './sidebar'
import { AbonnementBadge } from './abonnement-badge'
import type { AbonnementProps } from '@/lib/abonnement'

interface HeaderProps {
  nomEntreprise?: string
  abonnement?: Pick<AbonnementProps, 'statut' | 'joursRestantsTrial'>
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
}

export function Header({ nomEntreprise, abonnement, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const [menuOuvert, setMenuOuvert] = useState(false)

  return (
    <>
      <header className="bg-brand-off border-b border-brand-sand px-4 py-3 flex items-center justify-between lg:px-6">
        <div className="flex items-center gap-2">
          {/* Bouton hamburger — mobile/tablette */}
          <button
            onClick={() => setMenuOuvert(true)}
            className="lg:hidden text-brand-bronze hover:text-brand-navy focus:outline-none"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Bouton toggle sidebar — desktop uniquement */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-brand-bronze hover:text-brand-navy hover:bg-brand-cream transition-colors"
              aria-label={sidebarCollapsed ? 'Ouvrir la sidebar' : 'Réduire la sidebar'}
              title={sidebarCollapsed ? 'Ouvrir (⌘B)' : 'Réduire (⌘B)'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {/* Titre — visible sur mobile */}
          <span className="lg:hidden text-sm font-semibold text-brand-navy">
            {nomEntreprise ?? 'SafeAnalyse.'}
          </span>

          {/* Nom entreprise — desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-brand-bronze">
            <span>Bonjour,</span>
            <span className="font-medium text-brand-navy">{nomEntreprise}</span>
          </div>
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

      {/* Overlay sidebar mobile */}
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
