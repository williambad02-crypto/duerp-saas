'use client'

import { motion, useReducedMotion } from 'motion/react'

/**
 * Titre animé mot par mot pour le hero /outil.
 * Le mot "DUERP" est mis en évidence en or.
 */
const tokens: Array<{ text: string; gold?: boolean }> = [
  { text: 'Tout' },
  { text: 'ce' },
  { text: "qu'il" },
  { text: 'vous' },
  { text: 'faut' },
  { text: 'pour' },
  { text: 'faire' },
  { text: 'votre' },
  { text: 'DUERP,', gold: true },
  { text: 'et' },
  { text: 'rien' },
  { text: 'de' },
  { text: 'plus' },
]

export function HeroOutilTitle() {
  const reduced = useReducedMotion()

  return (
    <h1
      aria-label="Tout ce qu'il vous faut pour faire votre DUERP, et rien de plus"
      className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] mb-6"
    >
      {tokens.map((t, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`inline-block whitespace-pre ${t.gold ? 'text-brand-gold-light' : 'text-brand-cream'}`}
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          {t.text}
          {i < tokens.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </h1>
  )
}
