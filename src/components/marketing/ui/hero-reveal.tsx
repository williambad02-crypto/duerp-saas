'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TextReveal } from './text-reveal'

interface HeroRevealProps {
  badge?: ReactNode
  title: string
  subtitle?: ReactNode
  cta?: ReactNode
  children?: ReactNode
  className?: string
  showScrollHint?: boolean
}

export function HeroReveal({
  badge,
  title,
  subtitle,
  cta,
  children,
  className,
  showScrollHint = true,
}: HeroRevealProps) {
  const reduced = useReducedMotion()

  return (
    <section
      className={cn(
        'grain relative flex min-h-[88vh] md:min-h-screen items-center',
        'bg-[var(--color-brand-cream)] overflow-hidden',
        className,
      )}
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-10 py-20 md:py-28">
        {badge && (
          <div className="animate-hero-badge mb-6 inline-flex">{badge}</div>
        )}
        <TextReveal
          words={title}
          immediate
          delay={0.2}
          as="h1"
          className="font-extrabold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[var(--color-brand-navy)] leading-[1.05]"
        />
        {subtitle && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-2xl text-lg md:text-xl text-[var(--color-brand-ink-soft)] leading-relaxed"
          >
            {subtitle}
          </motion.div>
        )}
        {cta && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            {cta}
          </motion.div>
        )}
        {children}
      </div>

      {showScrollHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--color-brand-navy)]"
          aria-hidden
        >
          <motion.svg
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </motion.div>
      )}
    </section>
  )
}
