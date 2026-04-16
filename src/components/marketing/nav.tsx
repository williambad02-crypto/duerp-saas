'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'

type NavChild = { label: string; href: string; desc?: string }
type NavItem = { label: string; href: string; children?: NavChild[] }

const navItems: NavItem[] = [
  {
    label: "L'outil",
    href: '/outil',
    children: [
      { label: "Présentation de l'outil", href: '/outil', desc: 'Fonctionnalités et parcours' },
      { label: 'Comparatif', href: '/comparatif', desc: 'SafeAnalyse. vs cabinets, Seirich, templates' },
      { label: 'FAQ', href: '/faq', desc: 'Questions fréquentes' },
    ],
  },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Réglementation', href: '/reglementation' },
  {
    label: 'Qui je suis',
    href: '/a-propos',
    children: [
      { label: 'Mon parcours', href: '/a-propos', desc: 'William, HSE terrain + alternance PME' },
      { label: 'Témoignages', href: '/temoignages', desc: 'Retours des premiers utilisateurs' },
    ],
  },
  { label: 'Contact', href: '/contact' },
]

export function MarketingNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [dropdownOuvert, setDropdownOuvert] = useState<string | null>(null)
  const [sectionMobileOuverte, setSectionMobileOuverte] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sur les pages à hero sombre (navy deep), logo + liens en blanc avant scroll.
  const DARK_HERO_PATHS = ['/', '/outil', '/tarifs', '/a-propos', '/temoignages', '/contact', '/faq', '/comparatif', '/reglementation']
  const heroIsDark = DARK_HERO_PATHS.includes(pathname)
  const onDarkHero = heroIsDark && !scrolled

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Ferme menus au changement de route
  useEffect(() => {
    setMenuOuvert(false)
    setDropdownOuvert(null)
    setSectionMobileOuverte(null)
  }, [pathname])

  // Empêche le scroll body quand menu mobile ouvert
  useEffect(() => {
    document.body.style.overflow = menuOuvert ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOuvert])

  // Cleanup timer au démontage
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const ouvrirDropdown = (label: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDropdownOuvert(label)
  }

  const fermerDropdown = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDropdownOuvert(null), 150)
  }

  // Un enfant est-il actif ? (pour souligner le parent)
  const groupEstActif = (item: NavItem) =>
    pathname === item.href || (item.children?.some((c) => pathname === c.href) ?? false)

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
              const isActive = groupEstActif(item)
              const hasChildren = !!item.children?.length
              const estOuvert = dropdownOuvert === item.label

              if (!hasChildren) {
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
              }

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => ouvrirDropdown(item.label)}
                  onMouseLeave={fermerDropdown}
                >
                  <Link
                    href={item.href}
                    aria-haspopup="true"
                    aria-expanded={estOuvert}
                    className={cn(
                      'relative flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors rounded-md',
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
                    <svg
                      className={cn(
                        'w-3 h-3 transition-transform duration-200',
                        estOuvert && 'rotate-180'
                      )}
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {isActive && (
                      <span className="absolute bottom-1 left-3.5 right-6 h-0.5 bg-brand-accent rounded-full" />
                    )}
                  </Link>

                  {/* Dropdown */}
                  <div
                    className={cn(
                      'absolute left-1/2 -translate-x-1/2 top-full pt-3 min-w-[300px]',
                      'transition-all duration-200',
                      estOuvert
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-1 pointer-events-none'
                    )}
                  >
                    <div className="bg-brand-cream rounded-xl border border-brand-sand shadow-[0_12px_40px_rgba(3,25,72,0.15)] p-2">
                      {item.children!.map((child) => {
                        const childActif = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-3 py-2.5 rounded-lg transition-colors group/item',
                              childActif
                                ? 'bg-brand-gold-pale'
                                : 'hover:bg-brand-sand/40'
                            )}
                          >
                            <div className={cn(
                              'text-sm font-semibold',
                              childActif ? 'text-brand-navy' : 'text-brand-navy group-hover/item:text-brand-navy'
                            )}>
                              {child.label}
                            </div>
                            {child.desc && (
                              <div className="text-xs text-brand-ink-soft mt-0.5 leading-snug">
                                {child.desc}
                              </div>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
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
              const isActive = groupEstActif(item)
              const hasChildren = !!item.children?.length
              const sectionOuverte = sectionMobileOuverte === item.label

              if (!hasChildren) {
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
              }

              return (
                <div key={item.label}>
                  <div className={cn(
                    'flex items-stretch rounded-xl overflow-hidden',
                    isActive && 'bg-brand-gold-pale border-l-2 border-brand-accent',
                  )}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex-1 flex items-center px-4 py-3.5 text-base font-medium transition-colors',
                        isActive ? 'text-brand-navy' : 'text-brand-ink-soft hover:bg-brand-sand/40 hover:text-brand-navy',
                      )}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSectionMobileOuverte(sectionOuverte ? null : item.label)}
                      className="w-12 flex items-center justify-center text-brand-ink-soft hover:text-brand-navy hover:bg-brand-sand/40 transition-colors"
                      aria-label={sectionOuverte ? `Replier ${item.label}` : `Déplier ${item.label}`}
                      aria-expanded={sectionOuverte}
                    >
                      <svg
                        className={cn('w-4 h-4 transition-transform duration-200', sectionOuverte && 'rotate-180')}
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Sous-liens */}
                  <div
                    className={cn(
                      'overflow-hidden transition-[max-height] duration-300 ease-out',
                      sectionOuverte ? 'max-h-96' : 'max-h-0'
                    )}
                  >
                    <div className="pl-4 pt-1 pb-2 space-y-0.5">
                      {item.children!.map((child) => {
                        const childActif = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                              childActif
                                ? 'bg-brand-gold-pale/60 text-brand-navy font-semibold'
                                : 'text-brand-ink-soft hover:bg-brand-sand/40 hover:text-brand-navy'
                            )}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
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
