'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AbonnementBadge } from './abonnement-badge'
import { Logo } from '@/components/brand/logo'
import type { AbonnementProps } from '@/lib/abonnement'

const navigation = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Postes de travail',
    href: '/dashboard/postes',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Tableau APR',
    href: '/dashboard/apr',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Module Bruit',
    href: '/dashboard/modules/bruit',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
      </svg>
    ),
  },
  {
    label: "Plan d'action",
    href: '/dashboard/plan-action',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Paramètres',
    href: '/dashboard/parametres',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  nomEntreprise?: string
  onClose?: () => void
  abonnement?: Pick<AbonnementProps, 'statut' | 'joursRestantsTrial'>
  collapsed?: boolean
}

export function Sidebar({ nomEntreprise, onClose, abonnement, collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full w-full bg-brand-navy overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-brand-navy-light" style={{ minHeight: 72 }}>
        <div
          style={{
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 200,
            overflow: 'hidden',
            transition: collapsed
              ? 'opacity 80ms ease, max-width 220ms cubic-bezier(0.4,0,0.2,1)'
              : 'opacity 150ms ease 80ms, max-width 220ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <Logo variant="full" theme="white" height={28} />
        </div>
        <div
          style={{
            opacity: collapsed ? 1 : 0,
            maxWidth: collapsed ? 40 : 0,
            overflow: 'hidden',
            transition: collapsed
              ? 'opacity 150ms ease 80ms, max-width 220ms cubic-bezier(0.4,0,0.2,1)'
              : 'opacity 80ms ease, max-width 220ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-brand-gold-light flex items-center justify-center">
            <span className="text-brand-navy font-bold text-base leading-none">S</span>
          </div>
        </div>
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="lg:hidden text-brand-cream/50 hover:text-brand-cream ml-2"
            aria-label="Fermer le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nom entreprise */}
      {nomEntreprise && (
        <div
          className="border-b border-brand-navy-light overflow-hidden"
          style={{
            maxHeight: collapsed ? 0 : 60,
            opacity: collapsed ? 0 : 1,
            transition: collapsed
              ? 'max-height 220ms cubic-bezier(0.4,0,0.2,1), opacity 80ms ease'
              : 'max-height 220ms cubic-bezier(0.4,0,0.2,1), opacity 150ms ease 80ms',
          }}
        >
          <div className="px-6 py-3">
            <p className="text-xs text-brand-cream/40 uppercase tracking-wide font-medium">Entreprise</p>
            <p className="text-sm font-medium text-brand-cream truncate mt-0.5">{nomEntreprise}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-navy-light text-brand-off'
                    : 'text-brand-off/70 hover:bg-brand-navy-light hover:text-brand-off'
                )}
              >
                {/* Barre active gauche */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-gold-light rounded-r-full" />
                )}
                <span className={isActive ? 'text-brand-gold-light' : 'text-brand-off/50'}>
                  {item.icon}
                </span>
                {/* Label avec transition opacity/max-width */}
                <span
                  style={{
                    opacity: collapsed ? 0 : 1,
                    maxWidth: collapsed ? 0 : 180,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    transition: collapsed
                      ? 'opacity 80ms ease, max-width 220ms cubic-bezier(0.4,0,0.2,1)'
                      : 'opacity 150ms ease 80ms, max-width 220ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  {item.label}
                </span>
              </Link>

              {/* Tooltip — visible uniquement en mode collapsed */}
              <span
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-brand-navy-light text-brand-cream text-xs px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none z-[60] shadow-lg border border-white/10"
                style={{
                  opacity: collapsed ? undefined : 0,
                  transition: 'opacity 100ms ease',
                }}
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </nav>

      {/* Badge abonnement + pied */}
      <div
        className="px-4 py-4 border-t border-brand-navy-light space-y-2 overflow-hidden"
        style={{
          maxHeight: collapsed ? 48 : 120,
          transition: 'max-height 220ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {abonnement && !collapsed && (
          <AbonnementBadge
            statut={abonnement.statut}
            joursRestantsTrial={abonnement.joursRestantsTrial}
          />
        )}
        <p
          style={{
            opacity: collapsed ? 0 : 0.3,
            transition: 'opacity 150ms ease',
          }}
          className="text-xs text-brand-cream"
        >
          SafeAnalyse. — v1.0
        </p>
      </div>
    </div>
  )
}
