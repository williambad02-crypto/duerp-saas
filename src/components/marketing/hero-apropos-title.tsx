'use client'

import { motion, useReducedMotion } from 'motion/react'

const tokens: Array<{ text: string; gold?: boolean }> = [
  { text: 'Un' },
  { text: 'professionnel' },
  { text: 'HSE' },
  { text: 'qui' },
  { text: 'a' },
  { text: 'codé', gold: true },
  { text: 'son' },
  { text: 'propre' },
  { text: 'outil.' },
]

export function HeroAproposTitle() {
  const reduced = useReducedMotion()
  return (
    <h1
      aria-label="Un professionnel HSE qui a codé son propre outil."
      className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] mb-6"
    >
      {tokens.map((t, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`inline-block whitespace-pre ${t.gold ? 'text-brand-gold-light' : 'text-brand-cream'}`}
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {t.text}
          {i < tokens.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </h1>
  )
}
