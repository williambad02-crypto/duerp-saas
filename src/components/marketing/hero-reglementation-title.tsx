'use client'

import { motion, useReducedMotion } from 'motion/react'

const tokens: Array<{ text: string; gold?: boolean }> = [
  { text: 'Le' },
  { text: 'DUERP' },
  { text: 'en' },
  { text: 'clair.', gold: true },
]

export function HeroReglementationTitle() {
  const reduced = useReducedMotion()
  return (
    <h1
      aria-label="Le DUERP en clair."
      className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] mb-6"
    >
      {tokens.map((t, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`inline-block whitespace-pre ${t.gold ? 'text-brand-gold-light' : 'text-brand-cream'}`}
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {t.text}
          {i < tokens.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </h1>
  )
}
