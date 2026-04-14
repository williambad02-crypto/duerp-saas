'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import type { AbonnementProps } from '@/lib/abonnement'

interface DashboardShellProps {
  children: React.ReactNode
  nomEntreprise: string
  abonnement?: Pick<AbonnementProps, 'statut' | 'joursRestantsTrial'>
}

export function DashboardShell({ children, nomEntreprise, abonnement }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  // Initialiser depuis localStorage (côté client uniquement)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved === 'true') setCollapsed(true)
    } catch {}
  }, [])

  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('sidebar-collapsed', String(next)) } catch {}
      return next
    })
  }, [])

  // Raccourci Cmd+B / Ctrl+B
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [toggleSidebar])

  return (
    <div className="flex h-screen bg-brand-cream-light overflow-hidden">
      {/* Sidebar desktop — largeur animée */}
      <aside
        style={{
          width: collapsed ? 64 : 256,
          flexShrink: 0,
          transition: 'width 250ms ease-in-out',
        }}
        className="hidden lg:flex overflow-hidden"
      >
        <Sidebar nomEntreprise={nomEntreprise} abonnement={abonnement} collapsed={collapsed} />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          nomEntreprise={nomEntreprise}
          abonnement={abonnement}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={collapsed}
        />
        {children}
      </div>
    </div>
  )
}
