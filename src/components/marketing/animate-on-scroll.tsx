'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  /** Délai en ms avant l'animation (utile pour cascader des éléments) */
  delay?: 0 | 100 | 200 | 300 | 400 | 500
  /** Animation CSS à appliquer */
  animation?: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right'
  /** Seuil d'intersection (0-1) */
  threshold?: number
}

const delayClass = {
  0: '',
  100: 'animation-delay-100',
  200: 'animation-delay-200',
  300: 'animation-delay-300',
  400: 'animation-delay-400',
  500: 'animation-delay-500',
}

const animationClass = {
  'fade-up': 'sa-fade-up',
  'fade-in': 'sa-fade-in',
  'fade-left': 'sa-fade-left',
  'fade-right': 'sa-fade-right',
}

export function AnimateOnScroll({
  children,
  className,
  delay = 0,
  animation = 'fade-up',
  threshold = 0.15,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('sa-visible')
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={cn('sa-animate', animationClass[animation], delayClass[delay], className)}
    >
      {children}
    </div>
  )
}
