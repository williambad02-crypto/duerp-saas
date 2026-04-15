'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [hovered, setHovered] = useState(false)
  // Détecte si le device supporte le hover (pas tactile)
  const canHover = useRef(false)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialiser depuis localStorage (côté client uniquement)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved === 'true') setCollapsed(true)
    } catch {}
    canHover.current = window.matchMedia('(hover: hover)').matches
  }, [])

  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('sidebar-collapsed', String(next)) } catch {}
      return next
    })
    setHovered(false)
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

  // Quand collapsed + hovered, la sidebar flotte au-dessus (VS Code pattern)
  const isFloating = collapsed && hovered

  return (
    <div className="flex h-screen bg-brand-cream-light overflow-hidden">
      {/* Sidebar desktop — largeur animée */}
      <aside
        onMouseEnter={() => {
          if (!canHover.current || !collapsed) return
          if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
          openTimer.current = setTimeout(() => setHovered(true), 80)
        }}
        onMouseLeave={() => {
          if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null }
          closeTimer.current = setTimeout(() => setHovered(false), 250)
        }}
        style={{
          width: collapsed ? 64 : 256,
          flexShrink: 0,
          transition: 'width 250ms cubic-bezier(0.32,0.72,0,1)',
          position: 'relative',
          zIndex: isFloating ? 40 : 'auto',
        }}
        className="hidden lg:flex overflow-visible"
      >
        {/* Panneau réel — peut dépasser la largeur de l'aside quand en hover-float */}
        <div
          style={{
            width: isFloating ? 256 : undefined,
            position: isFloating ? 'absolute' : 'relative',
            top: isFloating ? 0 : undefined,
            left: isFloating ? 0 : undefined,
            height: isFloating ? '100%' : '100%',
            transition: 'width 250ms cubic-bezier(0.32,0.72,0,1)',
            boxShadow: isFloating ? '4px 0 24px rgba(0,0,0,0.18)' : undefined,
          }}
          className="flex overflow-hidden w-full"
        >
          <Sidebar
            nomEntreprise={nomEntreprise}
            abonnement={abonnement}
            collapsed={collapsed && !hovered}
          />
        </div>
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
