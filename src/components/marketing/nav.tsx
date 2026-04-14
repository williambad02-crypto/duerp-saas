'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'

const navItems = [
  { label: "L'outil", href: '/outil' },
  { label: 'Réglementation', href: '/reglementation' },
  { label: 'Qui je suis', href: '/a-propos' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Contact', href: '/contact' },
]

export function MarketingNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Ferme le menu mobile au changement de route
  useEffect(() => { setMenuOuvert(false) }, [pathname])

  // Empêche le scroll body quand menu mobile ouvert
  useEffect(() => {
    document.body.style.overflow = menuOuvert ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOuvert])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-brand-cream/90 backdrop-blur-md border-b border-brand-sand shadow-[0_1px_8px_rgba(3,25,72,0.06)]'
            : 'bg-brand-cream border-b border-transparent'
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Logo variant="full" theme="default" height={28} />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-1.5 text-sm font-medium transition-colors rounded-md',
                    isActive
                      ? 'text-brand-navy'
                      : 'text-brand-bronze hover:text-brand-navy'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-gold-light rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-brand-navy border border-brand-navy/30 hover:border-brand-navy hover:bg-brand-navy/5 px-4 py-2 rounded-lg transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold bg-brand-gold text-brand-off hover:bg-brand-gold-light px-4 py-2 rounded-lg transition-colors"
            >
              Essai gratuit
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5 rounded-lg hover:bg-brand-sand/50 transition-colors"
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOuvert}
          >
            <span
              className={cn(
                'block w-5 h-0.5 bg-brand-navy rounded-full transition-all duration-300',
                menuOuvert && 'rotate-45 translate-y-2'
              )}
            />
            <span
              className={cn(
                'block w-5 h-0.5 bg-brand-navy rounded-full transition-all duration-300',
                menuOuvert && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'block w-5 h-0.5 bg-brand-navy rounded-full transition-all duration-300',
                menuOuvert && '-rotate-45 -translate-y-2'
              )}
            />
          </button>
        </div>
      </header>

      {/* Menu mobile — plein écran */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-all duration-300',
          menuOuvert ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
          onClick={() => setMenuOuvert(false)}
        />

        {/* Panneau latéral */}
        <div
          className={cn(
            'absolute top-0 right-0 h-full w-80 max-w-full bg-brand-cream flex flex-col shadow-2xl transition-transform duration-300',
            menuOuvert ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* En-tête du panel */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-sand">
            <Logo variant="full" theme="default" height={24} />
            <button
              onClick={() => setMenuOuvert(false)}
              className="w-8 h-8 flex items-center justify-center text-brand-bronze hover:text-brand-navy rounded-lg hover:bg-brand-sand/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Liens */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    isActive
                      ? 'bg-brand-gold-pale text-brand-navy border-l-2 border-brand-gold-light'
                      : 'text-brand-bronze hover:bg-brand-sand/40 hover:text-brand-navy'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="px-4 py-6 border-t border-brand-sand space-y-3">
            <Link
              href="/auth/login"
              className="block text-center text-sm font-medium text-brand-navy border border-brand-navy px-4 py-2.5 rounded-lg hover:bg-brand-navy/5 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className="block text-center text-sm font-semibold bg-brand-gold text-brand-off hover:bg-brand-gold-light px-4 py-2.5 rounded-lg transition-colors"
            >
              Commencer l&apos;essai gratuit →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
