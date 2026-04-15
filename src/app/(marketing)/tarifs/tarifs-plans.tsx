'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { CardTilt } from '@/components/marketing/ui'
import { cn } from '@/lib/utils'

const FEATURES_INDUSTRIE = [
  "Jusqu'à 5 postes de travail",
  "Jusqu'à 20 opérations",
  "Les 20 risques ED 840 couverts",
  "Module Bruit (M01) inclus",
  "Export PDF DUERP conforme",
  "Conservation 40 ans automatique",
  "Support email sous 24h ouvrées",
]

const FEATURES_PREMIUM = [
  "Postes et opérations illimités",
  "Tous les modules (M01 + M02-M05 dès sortie)",
  "Audit semestriel visio 1h inclus",
  "Export PDF DUERP conforme",
  "Conservation 40 ans automatique",
  "Support prioritaire (4h ouvrées)",
  "Onboarding personnalisé (visio 30 min)",
]

type Periode = 'mensuel' | 'annuel'

function FeatureList({
  features,
  checkClassName,
  itemClassName,
}: {
  features: string[]
  checkClassName: string
  itemClassName: string
}) {
  const ref = useRef<HTMLUListElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reduced = useReducedMotion()

  return (
    <ul ref={ref} className="space-y-3 mb-8 flex-1">
      {features.map((f, i) => (
        <motion.li
          key={f}
          initial={reduced ? false : { opacity: 0, x: -8 }}
          animate={inView || reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
          transition={{ duration: 0.45, delay: 0.15 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn('flex items-start gap-3 text-sm', itemClassName)}
        >
          <motion.span
            initial={reduced ? false : { scale: 0, rotate: -90 }}
            animate={inView || reduced ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
            transition={{
              delay: 0.2 + i * 0.2,
              type: 'spring',
              stiffness: 380,
              damping: 18,
            }}
            className={cn(
              'shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center',
              checkClassName,
            )}
          >
            <Check className="w-3 h-3" strokeWidth={3} />
          </motion.span>
          <span className="leading-relaxed">{f}</span>
        </motion.li>
      ))}
    </ul>
  )
}

export function TarifsPlans() {
  const [periode, setPeriode] = useState<Periode>('annuel')
  const reduced = useReducedMotion()

  const prix = {
    industrie: periode === 'mensuel'
      ? { montant: '99', detail: '/mois', sous: 'Sans engagement' }
      : { montant: '990', detail: '/an', sous: 'Soit 82,50 €/mois — 2 mois offerts' },
    premium: periode === 'mensuel'
      ? { montant: '149', detail: '/mois', sous: 'Sans engagement' }
      : { montant: '1 490', detail: '/an', sous: 'Soit 124 €/mois — 2 mois offerts' },
  }

  return (
    <div className="flex flex-col items-center gap-10">

      {/* Toggle période — style navy pill cohérent */}
      <div className="relative">
        <div
          role="tablist"
          aria-label="Choisir la fréquence de facturation"
          className="inline-flex items-center bg-brand-off border border-brand-sand rounded-full p-1 shadow-[0_2px_8px_-3px_rgba(3,25,72,0.1)]"
        >
          {(['mensuel', 'annuel'] as const).map((p) => {
            const active = periode === p
            return (
              <button
                key={p}
                role="tab"
                aria-selected={active}
                onClick={() => setPeriode(p)}
                className={cn(
                  'relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200',
                  active ? 'text-brand-off' : 'text-brand-ink-soft hover:text-brand-navy',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tarifs-pill"
                    className="absolute inset-0 rounded-full bg-brand-navy z-[-1]"
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                {p === 'mensuel' ? 'Mensuel' : 'Annuel'}
              </button>
            )
          })}
        </div>
        <span className="absolute -top-3 right-0 translate-x-1/2 sm:translate-x-0 bg-brand-gold text-brand-navy-deep text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none shadow-[0_4px_10px_-2px_rgba(184,134,11,0.5)]">
          2 mois offerts
        </span>
      </div>

      {/* Grille 2 plans avec CardTilt */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

        {/* Pack Industrie */}
        <CardTilt max={2}>
          <div className="relative h-full rounded-3xl bg-brand-off border border-brand-sand p-8 md:p-9 flex flex-col shadow-[0_10px_30px_-15px_rgba(3,25,72,0.15)]">
            <div className="mb-6">
              <p className="text-xs font-bold text-brand-bronze uppercase tracking-[0.2em] mb-2">Pack Industrie</p>
              <p className="text-sm text-brand-ink-soft mb-5">PME 1-50 salariés · 5 postes / 20 opérations</p>
              <div className="flex items-baseline gap-1 h-14">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`industrie-${prix.industrie.montant}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-5xl font-extrabold text-brand-navy tracking-tight"
                  >
                    {prix.industrie.montant}€
                  </motion.span>
                </AnimatePresence>
                <span className="text-brand-bronze text-base">{prix.industrie.detail}</span>
              </div>
              <p className="text-xs text-brand-ink-mute mt-1">{prix.industrie.sous}</p>
            </div>

            <FeatureList
              features={FEATURES_INDUSTRIE}
              checkClassName="bg-brand-success-soft text-brand-success"
              itemClassName="text-brand-ink-soft"
            />

            <Link
              href="/auth/signup?plan=industrie"
              className="block text-center rounded-xl border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-brand-cream font-bold px-5 py-3 text-sm transition-all"
            >
              Essai gratuit 14 jours →
            </Link>
          </div>
        </CardTilt>

        {/* Pack Premium — premium highlighted */}
        <CardTilt max={2}>
          <div className="relative h-full rounded-3xl p-[1.5px] bg-gradient-to-br from-brand-gold via-brand-gold-light to-brand-gold shadow-[0_24px_60px_-20px_rgba(184,134,11,0.45)]">
            {/* Badge recommandé — hors du conteneur overflow-hidden */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-brand-gold text-brand-navy-deep text-[11px] font-extrabold px-4 py-1.5 rounded-full whitespace-nowrap shadow-[0_4px_16px_-4px_rgba(184,134,11,0.6)] uppercase tracking-widest">
              ⭑ Recommandé
            </div>
            <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-brand-navy-deep p-8 md:p-9 flex flex-col overflow-hidden">
              {/* Décor radial doré */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-gold/15 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-16 w-48 h-48 rounded-full bg-brand-accent/10 blur-3xl"
              />

              <div className="relative mb-6">
                <p className="text-xs font-bold text-brand-gold-light uppercase tracking-[0.2em] mb-2">Pack Premium</p>
                <p className="text-sm text-brand-cream/60 mb-5">PME 50-250 salariés · Postes illimités</p>
                <div className="flex items-baseline gap-1 h-14">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`premium-${prix.premium.montant}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="text-5xl font-extrabold text-brand-cream tracking-tight"
                    >
                      {prix.premium.montant}€
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-brand-cream/60 text-base">{prix.premium.detail}</span>
                </div>
                <p className="text-xs text-brand-cream/50 mt-1">{prix.premium.sous}</p>
              </div>

              <FeatureList
                features={FEATURES_PREMIUM}
                checkClassName="bg-brand-gold/20 text-brand-gold-light ring-1 ring-brand-gold/40"
                itemClassName="text-brand-cream/85 relative z-10"
              />

              <Link
                href="/auth/signup?plan=premium"
                className="relative z-10 block text-center rounded-xl bg-brand-gold hover:bg-brand-gold-light text-brand-navy-deep font-extrabold px-5 py-3.5 text-sm transition-all hover:shadow-[0_10px_30px_-6px_rgba(184,134,11,0.7)]"
              >
                Essai gratuit 14 jours →
              </Link>
            </div>
          </div>
        </CardTilt>

      </div>

      <p className="text-xs text-brand-ink-mute text-center">
        Aucune carte bancaire requise pour l&apos;essai · Paiement Stripe sécurisé · Annulable à tout moment
      </p>
    </div>
  )
}
