'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Check, X, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type CellValue = boolean | string | null

interface Row {
  critere: string
  categorie?: string
  sa: CellValue
  cabinet: CellValue
  gratuit: CellValue
  template: CellValue
}

const rows: Row[] = [
  { critere: 'Prix annuel moyen', categorie: 'Coût', sa: 'Dès 990 €/an', cabinet: '1 000–5 000 €', gratuit: 'Gratuit', template: 'Gratuit' },
  { critere: 'Coût récurrent', sa: 'Abonnement SaaS', cabinet: 'À chaque maj.', gratuit: 'Gratuit', template: 'Temps interne' },
  { critere: 'Guidé pas à pas', categorie: 'Fonctionnalités', sa: true, cabinet: true, gratuit: false, template: false },
  { critere: 'Méthodes normées INRS (ED 840)', sa: true, cabinet: true, gratuit: 'Partiel', template: false },
  { critere: 'Cotation G×P / G×DE automatique', sa: true, cabinet: 'Variable', gratuit: false, template: false },
  { critere: 'Plan de maîtrise intégré', sa: true, cabinet: true, gratuit: false, template: false },
  { critere: 'Export PDF structuré et conforme', sa: true, cabinet: true, gratuit: 'Basique', template: true },
  { critere: 'Conservation automatique 40 ans', sa: true, cabinet: 'Variable', gratuit: false, template: false },
  { critere: 'Interface tablette terrain', sa: true, cabinet: null, gratuit: false, template: false },
  { critere: 'Autonome après la 1ʳᵉ année', categorie: 'Autonomie', sa: true, cabinet: false, gratuit: true, template: true },
  { critere: 'Mise à jour annuelle simple', sa: true, cabinet: false, gratuit: 'Difficile', template: 'Fastidieux' },
  { critere: 'Prise en main sans formation', sa: true, cabinet: null, gratuit: false, template: false },
  { critere: 'Accompagnement humain', categorie: 'Accompagnement', sa: 'Consulting option', cabinet: true, gratuit: false, template: false },
  { critere: 'Support réactif', sa: true, cabinet: 'Variable', gratuit: false, template: false },
  { critere: 'Audit semestriel inclus', sa: 'Pack Premium', cabinet: false, gratuit: false, template: false },
]

const cols: { key: keyof Pick<Row, 'sa' | 'cabinet' | 'gratuit' | 'template'>; titre: string; highlight?: boolean }[] = [
  { key: 'sa', titre: 'SafeAnalyse.', highlight: true },
  { key: 'cabinet', titre: 'Cabinet HSE' },
  { key: 'gratuit', titre: 'Seirich / OiRA' },
  { key: 'template', titre: 'Template Word' },
]

function CellContent({ val, highlight }: { val: CellValue; highlight?: boolean }) {
  if (val === true) {
    return (
      <span className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-full',
        highlight ? 'bg-brand-success-soft text-brand-success' : 'bg-brand-success-soft/70 text-brand-success',
      )}>
        <Check className="w-4 h-4" strokeWidth={3} />
      </span>
    )
  }
  if (val === false) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-sand/60 text-brand-ink-mute/60">
        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
      </span>
    )
  }
  if (val === null) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-sand/40 text-brand-ink-mute/40">
        <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
      </span>
    )
  }
  return (
    <span className={cn(
      'text-xs md:text-sm font-semibold px-2 py-0.5 rounded-md whitespace-nowrap',
      highlight
        ? 'text-brand-navy bg-brand-gold-pale border border-brand-gold/30'
        : 'text-brand-ink-soft',
    )}>
      {val}
    </span>
  )
}

export function ComparatifTable() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <div ref={ref} className="relative rounded-3xl border border-brand-sand bg-brand-off shadow-[0_30px_80px_-40px_rgba(3,25,72,0.25)]">

      {/* En-têtes sticky */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -12 }}
        animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-16 z-20 grid grid-cols-[1.6fr_repeat(4,1fr)] border-b border-brand-sand bg-brand-cream-light/95 backdrop-blur-sm shadow-[0_4px_12px_-8px_rgba(3,25,72,0.15)] rounded-t-3xl"
      >
        <div className="p-3 md:p-4 text-xs font-bold uppercase tracking-widest text-brand-bronze/80 hidden md:flex items-end">
          Critère
        </div>
        <div className="p-3 md:p-4 md:hidden text-xs font-bold uppercase tracking-widest text-brand-bronze/80">
          &nbsp;
        </div>
        {cols.map((c) => (
          <div key={c.key} className="p-3 md:p-4 text-center flex flex-col items-center justify-end">
            <div className={cn(
              'text-[10px] md:text-xs font-extrabold uppercase tracking-widest',
              c.highlight ? 'text-brand-gold' : 'text-brand-bronze/80',
            )}>
              {c.titre}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Corps */}
      <div className="rounded-b-3xl overflow-hidden">
        {rows.map((row, i) => (
          <div key={row.critere}>
            {row.categorie && (
              <motion.div
                initial={reduced ? false : { opacity: 0 }}
                animate={inView || reduced ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: reduced ? 0 : 0.15 + i * 0.03, duration: 0.3 }}
                className="px-4 md:px-5 py-2 bg-brand-cream-light/60 border-y border-brand-sand/70 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-navy"
              >
                {row.categorie}
              </motion.div>
            )}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.4, delay: reduced ? 0 : 0.15 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-[1.6fr_repeat(4,1fr)] items-center border-b border-brand-sand/40 last:border-b-0 transition-colors hover:bg-brand-cream-light/50"
            >
              <div className="px-3 md:px-5 py-3 text-xs md:text-sm font-medium text-brand-navy">
                {row.critere}
              </div>
              {cols.map((c) => (
                <div
                  key={c.key}
                  className={cn(
                    'px-2 md:px-3 py-3 flex items-center justify-center',
                    c.highlight && 'bg-brand-gold-pale/30',
                  )}
                >
                  <motion.div
                    initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                    animate={inView || reduced ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
                    transition={{
                      delay: reduced ? 0 : 0.2 + i * 0.04,
                      type: 'spring',
                      stiffness: 420,
                      damping: 22,
                    }}
                  >
                    <CellContent val={row[c.key]} highlight={c.highlight} />
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}
