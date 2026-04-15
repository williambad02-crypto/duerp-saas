'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Section 1 : Hero plein écran ────────────────────────────────────────────

export function HeroSection() {
  const { scrollY } = useScroll()
  // Parallax : l'image de fond se déplace plus lentement que le scroll
  const bgY = useTransform(scrollY, [0, 600], [0, 180])
  const bgOpacity = useTransform(scrollY, [0, 400], [0.3, 0.1])

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-brand-navy-deep flex items-center justify-center">

      {/* Image de fond avec parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY, opacity: bgOpacity }}
      >
        <Image
          src="/marketing/hero-bg-industrial.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Dégradé overlay pour lisibilité */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-brand-navy-deep/60 via-transparent to-brand-navy-deep/80" />

      {/* Contenu hero */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge géographique */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block px-3 py-1.5 bg-brand-gold-pale/15 border border-brand-gold/30 text-brand-gold-light text-xs font-semibold uppercase tracking-wider rounded-full mb-7"
          >
            Spécialiste DUERP — Morbihan &amp; Bretagne sud
          </motion.span>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-brand-cream leading-[1.08] tracking-tight mb-6"
          >
            Votre Document Unique,
            <br />
            <span className="text-brand-gold-light">fait sérieusement.</span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl sm:text-2xl text-brand-cream/75 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Un outil pédagogique conçu par un professionnel HSE, pour les PME
            industrielles qui veulent un DUERP conforme sans usine à gaz.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold-light text-brand-navy-deep hover:bg-brand-gold font-semibold px-7 py-3.5 rounded-xl text-base transition-all hover:shadow-[0_4px_20px_rgba(184,134,11,0.4)] hover:scale-[1.02]"
            >
              Demander un échange
            </Link>
            <Link
              href="/outil"
              className="inline-flex items-center justify-center gap-2 border border-brand-cream/40 text-brand-cream hover:bg-brand-cream/10 font-medium px-7 py-3.5 rounded-xl text-base transition-all"
            >
              Découvrir l&apos;outil
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Indicateur de scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown className="text-brand-cream/40 w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ── Section 2 : Sticky scroll storytelling ──────────────────────────────────

const etapes = [
  {
    num: '01',
    titre: 'Vous n\'avez pas le temps.',
    description:
      'Faire un DUERP entre deux clients, ça finit toujours en bas de la pile. Et pourtant, l\'inspection peut se présenter n\'importe quand.',
    image: '/marketing/step-01-no-time.jpg',
  },
  {
    num: '02',
    titre: 'Les outils existants sont des usines à gaz.',
    description:
      'Tableurs interminables, logiciels INRS pensés pour des ergonomes diplômés. Résultat : on commence, on abandonne, on recommence.',
    image: '/marketing/step-02-spreadsheet.jpg',
  },
  {
    num: '03',
    titre: 'Un cabinet HSE coûte cher.',
    description:
      '1 500 € pour un audit one-shot, et l\'année prochaine on recommence à zéro. Sans rien comprendre à ce qui a été fait.',
    image: '/marketing/step-03-cabinet.svg',
  },
  {
    num: '04',
    titre: 'SafeAnalyse. fait le pont.',
    description:
      'Un outil simple guidé par un pro HSE, avec accompagnement local sur site quand vous en avez besoin. Le DUERP enfin fait — et compris.',
    image: '/marketing/step-04-safeanalyse.svg',
  },
]

export function StorySection() {
  const [etapeActive, setEtapeActive] = useState(0)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null])

  useEffect(() => {
    const observers = stepRefs.current.map((ref, i) => {
      if (!ref) return null
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setEtapeActive(i)
        },
        // Déclenche quand l'élément est au centre du viewport
        { rootMargin: '-35% 0px -35% 0px', threshold: 0 }
      )
      observer.observe(ref)
      return observer
    })
    return () => { observers.forEach((obs) => obs?.disconnect()) }
  }, [])

  return (
    <section className="bg-brand-cream">
      {/* Titre introductif */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 text-center">
        <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">
          Le constat
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3">
          Pourquoi votre DUERP n&apos;est pas à jour ?
        </h2>
      </div>

      {/* Grille sticky */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Colonne gauche — image sticky */}
          <div className="hidden lg:flex sticky top-20 h-[calc(100vh-5rem)] items-center justify-center p-16">
            <div className="relative w-80 h-80">
              {etapes.map((etape, i) => (
                <div
                  key={i}
                  className={cn(
                    'absolute inset-0 transition-all duration-700 flex items-center justify-center',
                    etapeActive === i
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-4 scale-95'
                  )}
                >
                  <Image
                    src={etape.image}
                    alt={etape.titre}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite — blocs texte qui défilent */}
          <div className="py-12 lg:py-0">
            {etapes.map((etape, i) => (
              <div
                key={i}
                ref={(el) => { stepRefs.current[i] = el }}
                className={cn(
                  'min-h-screen flex items-center px-6 sm:px-10 lg:px-12 transition-opacity duration-500',
                  etapeActive === i ? 'opacity-100' : 'opacity-40 lg:opacity-40'
                )}
              >
                <div className="max-w-lg py-16">
                  {/* Image mobile — visible seulement sur mobile */}
                  <div className="lg:hidden mb-8 flex justify-center">
                    <Image
                      src={etape.image}
                      alt={etape.titre}
                      width={220}
                      height={220}
                      className="object-contain"
                    />
                  </div>

                  <span className="text-brand-accent font-mono text-sm font-bold tracking-wider">
                    {etape.num}
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-bold text-brand-navy mt-3 mb-5 leading-tight">
                    {etape.titre}
                  </h3>
                  <p className="text-lg text-brand-ink-soft leading-relaxed">
                    {etape.description}
                  </p>

                  {/* Indicateur actif */}
                  <div className="flex gap-2 mt-8">
                    {etapes.map((_, j) => (
                      <div
                        key={j}
                        className={cn(
                          'h-1 rounded-full transition-all duration-500',
                          j === i
                            ? 'w-8 bg-brand-accent'
                            : 'w-2 bg-brand-sand-dark'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
