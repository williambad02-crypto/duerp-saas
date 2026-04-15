'use client'

import { motion, useReducedMotion } from 'motion/react'

const tokens: Array<{ text: string; gold?: boolean }> = [
  { text: 'Tout' },
  { text: 'ce' },
  { text: 'que' },
  { text: 'vous' },
  { text: 'voulez' },
  { text: 'savoir.', gold: true },
]

export function HeroFaqTitle() {
  const reduced = useReducedMotion()
  return (
    <h1
      aria-label="Tout ce que vous voulez savoir."
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
