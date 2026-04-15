'use client'

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'
import type { ReactNode, MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface CardTiltProps {
  children: ReactNode
  className?: string
  max?: number
}

export function CardTilt({ children, className, max = 8 }: CardTiltProps) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 18 })
  const sy = useSpring(y, { stiffness: 180, damping: 18 })
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max])

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  if (reduced) return <div className={className}>{children}</div>

  return (
    <div style={{ perspective: 800 }} className={cn(className)}>
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  )
}
