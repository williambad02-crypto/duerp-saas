'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Factory, HardHat, Utensils } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Secteur {
  icon: LucideIcon
  titre: string
  description: string
  image: string
  alt: string
}

const secteurs: Secteur[] = [
  {
    icon: Factory,
    titre: 'Agroalimentaire',
    description:
      "Ateliers de production, chambres froides, découpe, conditionnement. Bruit, TMS, risques biologiques et chimiques. Secteur historique de SafeAnalyse. — l'outil est né en PME agro.",
    image: '/marketing/secteur-agroalimentaire.jpg',
    alt: 'Atelier agroalimentaire',
  },
  {
    icon: HardHat,
    titre: 'BTP & Industrie',
    description:
      'Chantiers, ateliers de maintenance, manutention. Chutes, vibrations, risques électriques et mécaniques.',
    image: '/marketing/secteur-btp.jpg',
    alt: 'Chantier BTP',
  },
  {
    icon: Utensils,
    titre: 'Restauration & Services',
    description:
      'Cuisine professionnelle, hôtellerie, transport. Brûlures, efforts physiques, stress thermique et RPS.',
    image: '/marketing/secteur-restauration.jpg',
    alt: 'Cuisine professionnelle',
  },
]

const AUTOPLAY_MS = 10000
const DRAG_THRESHOLD = 80
const WHEEL_THRESHOLD = 60
const WHEEL_COOLDOWN_MS = 600

export function SecteursCarousel() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [progress, setProgress] = useState(0)

  const pausedRef = useRef(false)
  const elapsedRef = useRef(0)
  const lastTickRef = useRef<number | null>(null)
  const wheelAccumRef = useRef(0)
  const wheelLockUntilRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { pausedRef.current = paused }, [paused])

  const goto = useCallback((next: number, dir: 1 | -1) => {
    setDirection(dir)
    setIndex(((next % secteurs.length) + secteurs.length) % secteurs.length)
    elapsedRef.current = 0
    setProgress(0)
  }, [])

  // Timer via rAF : pause sans reset
  useEffect(() => {
    if (reduced) return
    let rafId = 0
    const tick = (now: number) => {
      if (lastTickRef.current != null && !pausedRef.current) {
        const dt = now - lastTickRef.current
        elapsedRef.current += dt
        if (elapsedRef.current >= AUTOPLAY_MS) {
          elapsedRef.current = 0
          setDirection(1)
          setIndex((i) => (i + 1) % secteurs.length)
          setProgress(0)
        } else {
          setProgress(elapsedRef.current / AUTOPLAY_MS)
        }
      }
      lastTickRef.current = now
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [reduced])

  // Scroll horizontal (trackpad / wheel) → navigation sans clic
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
      e.preventDefault()
      const now = performance.now()
      if (now < wheelLockUntilRef.current) return
      wheelAccumRef.current += e.deltaX
      if (Math.abs(wheelAccumRef.current) >= WHEEL_THRESHOLD) {
        const dir: 1 | -1 = wheelAccumRef.current > 0 ? 1 : -1
        goto(index + dir, dir)
        wheelAccumRef.current = 0
        wheelLockUntilRef.current = now + WHEEL_COOLDOWN_MS
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [index, goto])

  const current = secteurs[index]
  const Icon = current.icon

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-navy-deep/40 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing select-none touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x < -DRAG_THRESHOLD) {
            goto(index + 1, 1)
          } else if (info.offset.x > DRAG_THRESHOLD) {
            goto(index - 1, -1)
          }
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px] lg:min-h-[480px] pointer-events-none">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[16/10] lg:aspect-auto">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`img-${index}`}
                custom={direction}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={current.image}
                  alt={current.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority={index === 0}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-deep/70 via-brand-navy-deep/20 to-transparent lg:from-brand-navy-deep/40 lg:via-transparent" />
                <div className="lg:hidden absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-brand-navy-deep" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Texte */}
          <div className="relative p-8 md:p-12 lg:p-14 flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`text-${index}`}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold-light mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-brand-gold-light text-xs font-bold uppercase tracking-widest mb-2">
                  Secteur {index + 1} / {secteurs.length}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-brand-cream mb-4 leading-tight">
                  {current.titre}
                </h3>
                <p className="text-brand-cream/70 leading-relaxed max-w-lg">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Indicateurs : 3 pastilles, active large + se remplit comme un timer */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {secteurs.map((s, i) => {
          const active = i === index
          return (
            <button
              key={s.titre}
              type="button"
              onClick={() => goto(i, i > index ? 1 : -1)}
              aria-label={`Aller au secteur ${s.titre}`}
              aria-current={active}
              className={cn(
                'relative h-1.5 rounded-full overflow-hidden transition-all duration-300',
                active
                  ? 'w-12 bg-brand-cream/20'
                  : 'w-1.5 bg-brand-cream/30 hover:bg-brand-cream/50',
              )}
            >
              {active && (
                <span
                  className="absolute inset-y-0 left-0 bg-brand-gold-light rounded-full"
                  style={{ width: reduced ? '100%' : `${progress * 100}%` }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
