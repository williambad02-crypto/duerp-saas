'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'

const navItems = [
  { label: "L'outil", href: '/outil' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Réglementation', href: '/reglementation' },
  { label: 'Qui je suis', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
]

export function MarketingNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)

  // Sur les pages à hero sombre (navy deep), logo + liens en blanc avant scroll.
  const DARK_HERO_PATHS = ['/', '/outil']
  const heroIsDark = DARK_HERO_PATHS.includes(pathname)
  const onDarkHero = heroIsDark && !scrolled

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-brand-cream/90 backdrop-blur-md border-b border-brand-sand shadow-[0_1px_8px_rgba(3,25,72,0.07)] h-16'
            : 'bg-transparent border-b border-transparent h-20'
        )}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Logo
              variant="full"
              theme={onDarkHero ? 'white' : 'default'}
              height={scrolled ? 26 : 30}
              className="transition-all duration-300"
            />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium transition-colors rounded-md',
                    onDarkHero
                      ? isActive
                        ? 'text-brand-cream font-semibold'
                        : 'text-brand-cream/80 hover:text-brand-cream'
                      : isActive
                        ? 'text-brand-navy font-semibold'
                        : 'text-brand-ink-soft hover:text-brand-navy'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-accent rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className={cn(
                'text-sm font-medium transition-colors',
                onDarkHero
                  ? 'text-brand-cream/80 hover:text-brand-cream'
                  : 'text-brand-bronze hover:text-brand-navy',
              )}
            >
              Se connecter
            </Link>
            <Link
              href="/contact"
              className="text-sm font-semibold bg-brand-gold text-brand-off hover:bg-brand-gold-light px-4 py-2 rounded-lg transition-all hover:shadow-[0_2px_8px_rgba(184,134,11,0.3)]"
            >
              Demander un échange
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className={cn(
              'lg:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5 rounded-lg transition-colors',
              onDarkHero ? 'hover:bg-white/10' : 'hover:bg-brand-sand/40',
            )}
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOuvert}
          >
            <span
              className={cn(
                'block w-5 h-0.5 rounded-full transition-all duration-300',
                onDarkHero ? 'bg-brand-cream' : 'bg-brand-navy',
                menuOuvert && 'rotate-45 translate-y-2'
              )}
            />
            <span
              className={cn(
                'block w-5 h-0.5 rounded-full transition-all duration-300',
                onDarkHero ? 'bg-brand-cream' : 'bg-brand-navy',
                menuOuvert && 'opacity-0 scale-x-0'
              )}
            />
            <span
              className={cn(
                'block w-5 h-0.5 rounded-full transition-all duration-300',
                onDarkHero ? 'bg-brand-cream' : 'bg-brand-navy',
                menuOuvert && '-rotate-45 -translate-y-2'
              )}
            />
          </button>
        </div>
      </header>

      {/* Menu mobile — slide depuis la droite */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-all duration-300',
          menuOuvert ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Overlay sombre */}
        <div
          className="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm"
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
          <div className="flex items-center justify-between px-6 py-5 border-b border-brand-sand">
            <Logo variant="full" theme="default" height={24} />
            <button
              onClick={() => setMenuOuvert(false)}
              className="w-8 h-8 flex items-center justify-center text-brand-bronze hover:text-brand-navy rounded-lg hover:bg-brand-sand/40 transition-colors"
              aria-label="Fermer le menu"
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
                    'flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-colors',
                    isActive
                      ? 'bg-brand-gold-pale text-brand-navy border-l-2 border-brand-accent'
                      : 'text-brand-ink-soft hover:bg-brand-sand/40 hover:text-brand-navy'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions bas de panel */}
          <div className="px-4 py-6 border-t border-brand-sand space-y-3">
            <Link
              href="/auth/login"
              className="block text-center text-sm font-medium text-brand-navy border border-brand-navy/30 px-4 py-2.5 rounded-lg hover:bg-brand-navy/5 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/contact"
              className="block text-center text-sm font-semibold bg-brand-gold text-brand-off hover:bg-brand-gold-light px-4 py-2.5 rounded-lg transition-colors"
            >
              Demander un échange →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
