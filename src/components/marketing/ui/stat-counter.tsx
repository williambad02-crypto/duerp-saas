'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface StatCounterProps {
  value: number
  label: string
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
  className?: string
}

export function StatCounter({
  value,
  label,
  prefix = '',
  suffix = '',
  duration = 1.2,
  decimals = 0,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(reduced ? value : 0)

  useEffect(() => {
    if (!inView || reduced) return
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, reduced, value, duration])

  return (
    <div ref={ref} className={cn('flex flex-col items-start gap-1', className)}>
      <div className="font-extrabold tracking-tight text-4xl md:text-5xl text-[var(--color-brand-navy)]">
        {prefix}
        {display.toFixed(decimals)}
        {suffix}
      </div>
      <div className="text-sm md:text-base text-[var(--color-brand-bronze)]">{label}</div>
    </div>
  )
}
