'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface TextRevealProps {
  words: string
  className?: string
  mode?: 'word' | 'line'
  delay?: number
  stagger?: number
  immediate?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
}

export function TextReveal({
  words,
  className,
  mode = 'word',
  delay = 0,
  stagger = 0.04,
  immediate = false,
  as = 'span',
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const reduced = useReducedMotion()
  const shouldAnimate = immediate || inView
  const parts = mode === 'word' ? words.split(' ') : words.split('\n')

  const Tag = motion[as] as typeof motion.span

  if (reduced) {
    const Static = as
    return <Static className={className} ref={ref as never}>{words}</Static>
  }

  return (
    <Tag
      ref={ref as never}
      className={cn('inline-block', className)}
      aria-label={words}
    >
      {parts.map((part, i) => (
        <motion.span
          key={`${part}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: 20 }}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.6,
            delay: delay + i * stagger,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {part}
          {mode === 'word' && i < parts.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Tag>
  )
}
