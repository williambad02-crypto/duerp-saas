'use client'

import { motion, useInView, useReducedMotion, type Variants } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right'

const variantsMap: Record<Variant, Variants> = {
  'fade-up':    { hidden: { opacity: 0, y: 24 },  visible: { opacity: 1, y: 0 } },
  'fade-in':    { hidden: { opacity: 0 },         visible: { opacity: 1 } },
  'fade-left':  { hidden: { opacity: 0, x: 24 },  visible: { opacity: 1, x: 0 } },
  'fade-right': { hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } },
}

interface SectionRevealProps {
  children: ReactNode
  className?: string
  variant?: Variant
  delay?: number
  amount?: number
  as?: 'div' | 'section' | 'article' | 'li'
}

export function SectionReveal({
  children,
  className,
  variant = 'fade-up',
  delay = 0,
  amount = 0.2,
  as = 'div',
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount })
  const reduced = useReducedMotion()

  const MotionTag = motion[as] as typeof motion.div

  return (
    <MotionTag
      ref={ref}
      className={cn(className)}
      initial={reduced ? 'visible' : 'hidden'}
      animate={inView || reduced ? 'visible' : 'hidden'}
      variants={variantsMap[variant]}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  )
}
