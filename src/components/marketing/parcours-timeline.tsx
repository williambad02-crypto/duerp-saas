'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { UserPlus, MapPin, ShieldCheck, FileDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Etape {
  num: string
  icon: LucideIcon
  titre: string
  desc: string
}

const etapes: Etape[] = [
  { num: '01', icon: UserPlus,    titre: 'Créez votre compte', desc: '14 jours gratuits, sans carte bancaire. Accès immédiat à toutes les fonctionnalités.' },
  { num: '02', icon: MapPin,      titre: 'Déclarez vos postes', desc: "Listez vos unités de travail et leurs opérations concrètes. L'outil structure tout pour vous." },
  { num: '03', icon: ShieldCheck, titre: 'Évaluez chaque risque', desc: 'Pour chaque opération, 3 questions de présélection puis cotation guidée sur les 20 risques ED 840.' },
  { num: '04', icon: FileDown,    titre: 'Exportez votre DUERP', desc: "PDF officiel généré en un clic — page de garde, tableau APR, plan de maîtrise. Prêt pour l'inspection." },
]

export function ParcoursTimeline() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const reduced = useReducedMotion()

  return (
    <div ref={ref} className="relative mx-auto max-w-5xl">
      {/* Desktop : timeline horizontale */}
      <div className="hidden md:block">
        <div className="relative grid grid-cols-4 gap-6">
          {/* Ligne de fond */}
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-brand-sand" aria-hidden />
          {/* Ligne progressive */}
          <motion.div
            className="absolute top-8 left-[12.5%] h-px bg-gradient-to-r from-brand-gold via-brand-accent to-brand-navy origin-left"
            style={{ right: '12.5%' }}
            initial={{ scaleX: 0 }}
            animate={inView || reduced ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: reduced ? 0 : 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            aria-hidden
          />

          {etapes.map((e, i) => {
            const Icon = e.icon
            return (
              <motion.div
                key={e.num}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center px-2"
              >
                {/* Nœud */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView || reduced ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: 0.3 + i * 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-16 h-16 rounded-full bg-brand-navy text-brand-gold-light flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(3,25,72,0.5)] ring-4 ring-brand-cream-light"
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-navy-deep text-[10px] font-extrabold w-7 h-7 rounded-full flex items-center justify-center border-2 border-brand-cream-light">
                    {e.num}
                  </span>
                </div>

                <h3 className="mt-6 font-bold text-brand-navy text-base">{e.titre}</h3>
                <p className="mt-2 text-sm text-brand-bronze leading-relaxed max-w-[220px]">{e.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Mobile : timeline verticale */}
      <div className="md:hidden relative pl-6">
        <div className="absolute left-[11px] top-6 bottom-6 w-px bg-brand-sand" aria-hidden />
        <motion.div
          className="absolute left-[11px] top-6 w-px bg-gradient-to-b from-brand-gold via-brand-accent to-brand-navy origin-top"
          initial={{ scaleY: 0 }}
          animate={inView || reduced ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: reduced ? 0 : 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ height: 'calc(100% - 3rem)' }}
          aria-hidden
        />

        <ol className="space-y-10">
          {etapes.map((e, i) => {
            const Icon = e.icon
            return (
              <motion.li
                key={e.num}
                initial={reduced ? false : { opacity: 0, x: 12 }}
                animate={inView || reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className="relative"
              >
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-brand-navy text-brand-gold-light flex items-center justify-center ring-4 ring-brand-cream-light">
                  <Icon className="w-3 h-3" />
                </div>
                <div className="pl-3">
                  <div className="text-xs font-extrabold text-brand-gold">{e.num}</div>
                  <h3 className="mt-1 font-bold text-brand-navy">{e.titre}</h3>
                  <p className="mt-1 text-sm text-brand-bronze leading-relaxed">{e.desc}</p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
