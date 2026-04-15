'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Plan = 'industrie' | 'premium' | 'consulting'

interface Row {
  label: string
  values: Record<Plan, string | boolean>
  highlight?: boolean
}

const rows: Row[] = [
  { label: 'Accès outil SaaS complet', values: { industrie: true, premium: true, consulting: '2 ans Pack Premium offerts' } },
  { label: 'Postes & opérations', values: { industrie: '5 / 20', premium: 'Illimités', consulting: 'Illimités' } },
  { label: 'Les 20 risques ED 840', values: { industrie: true, premium: true, consulting: true } },
  { label: 'Module Bruit (M01)', values: { industrie: true, premium: true, consulting: true } },
  { label: 'Modules M02-M05 (dès sortie)', values: { industrie: false, premium: true, consulting: true } },
  { label: 'Export PDF DUERP conforme', values: { industrie: true, premium: true, consulting: true } },
  { label: 'Conservation 40 ans automatique', values: { industrie: true, premium: true, consulting: true } },
  { label: 'Support email sous 24 h ouvrées', values: { industrie: true, premium: false, consulting: false } },
  { label: 'Support prioritaire (4 h ouvrées)', values: { industrie: false, premium: true, consulting: true } },
  { label: 'Onboarding personnalisé', values: { industrie: false, premium: 'Visio 30 min', consulting: 'Sur site inclus' } },
  { label: 'Audit semestriel visio 1 h', values: { industrie: false, premium: true, consulting: true } },
  { label: 'Journée consultant sur site', values: { industrie: false, premium: false, consulting: true }, highlight: true },
  { label: 'DUERP rédigé, validé, signable', values: { industrie: false, premium: false, consulting: true }, highlight: true },
]

const colHeaders: { key: Plan; title: string; price: string; detail: string }[] = [
  { key: 'industrie', title: 'Pack Industrie', price: '99 €', detail: '/ mois' },
  { key: 'premium', title: 'Pack Premium', price: '149 €', detail: '/ mois' },
  { key: 'consulting', title: 'Consulting + Outil', price: '700 €', detail: '/ jour · Premium 2 ans' },
]

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-success-soft text-brand-success">
        <Check className="w-4 h-4" strokeWidth={3} />
      </span>
    )
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-sand/60 text-brand-ink-mute/60">
        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
      </span>
    )
  }
  return (
    <span className="text-xs md:text-sm font-semibold text-brand-navy bg-brand-gold-pale border border-brand-gold/30 px-2.5 py-1 rounded-md whitespace-nowrap">
      {value}
    </span>
  )
}

export function TarifsComparatif() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <div ref={ref} className="relative">
      <div className="relative rounded-3xl border border-brand-sand bg-brand-off shadow-[0_30px_80px_-40px_rgba(3,25,72,0.25)]">
        {/* En-têtes colonnes — sticky sous la nav pour rester visible pendant le scroll */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -12 }}
          animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-16 z-20 grid grid-cols-[1.2fr_repeat(3,1fr)] md:grid-cols-[1.5fr_repeat(3,1fr)] border-b border-brand-sand bg-brand-cream-light/95 backdrop-blur-sm shadow-[0_4px_12px_-8px_rgba(3,25,72,0.15)] rounded-t-3xl"
        >
          <div className="p-4 md:p-5 text-xs font-bold uppercase tracking-widest text-brand-bronze/80 hidden md:flex items-end">
            Comparer
          </div>
          <div className="p-4 md:p-5 text-xs font-bold uppercase tracking-widest text-brand-bronze/80 md:hidden">
            &nbsp;
          </div>
          {colHeaders.map((c) => (
            <div
              key={c.key}
              className="relative p-4 md:p-5 text-center flex flex-col items-center justify-end"
            >
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 text-brand-bronze">
                {c.title}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl md:text-2xl font-extrabold text-brand-navy">
                  {c.price}
                </span>
                <span className="text-[10px] md:text-xs text-brand-ink-mute">
                  {c.detail}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Lignes */}
        <div className="rounded-b-3xl overflow-hidden">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.4, delay: reduced ? 0 : 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'grid grid-cols-[1.2fr_repeat(3,1fr)] md:grid-cols-[1.5fr_repeat(3,1fr)] items-center border-b border-brand-sand/60 last:border-b-0 transition-colors hover:bg-brand-cream-light/60',
                row.highlight && 'bg-brand-gold-pale/30',
              )}
            >
              <div className={cn(
                'p-3 md:p-4 text-xs md:text-sm font-medium text-brand-navy',
                row.highlight && 'text-brand-navy font-semibold',
              )}>
                {row.label}
                {row.highlight && (
                  <span className="ml-2 text-[9px] font-extrabold uppercase tracking-widest text-brand-gold">Exclusif</span>
                )}
              </div>
              {colHeaders.map((c) => (
                <div
                  key={c.key}
                  className="p-3 md:p-4 flex items-center justify-center"
                >
                  <motion.div
                    initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                    animate={inView || reduced ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
                    transition={{
                      delay: reduced ? 0 : 0.2 + i * 0.05,
                      type: 'spring',
                      stiffness: 420,
                      damping: 22,
                    }}
                  >
                    <Cell value={row.values[c.key]} />
                  </motion.div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Note de bas de tableau */}
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={inView || reduced ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: reduced ? 0 : 0.15 + rows.length * 0.05 + 0.2, duration: 0.4 }}
        className="mt-5 text-center text-xs text-brand-ink-mute"
      >
        Toutes les offres : 14 jours d&apos;essai gratuit · Sans CB · Annulable · Facture pro fournie.
      </motion.p>
    </div>
  )
}
