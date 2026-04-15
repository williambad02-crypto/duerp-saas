import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MarqueeStripProps {
  children: ReactNode
  duration?: number
  pauseOnHover?: boolean
  className?: string
  gap?: string
}

export function MarqueeStrip({
  children,
  duration = 30,
  pauseOnHover = true,
  className,
  gap = '3rem',
}: MarqueeStripProps) {
  return (
    <div
      className={cn(
        'overflow-hidden w-full',
        pauseOnHover && 'sa-marquee-pause',
        className,
      )}
      style={{ ['--sa-marquee-duration' as string]: `${duration}s` }}
      aria-hidden
    >
      <div className="sa-marquee-track" style={{ gap }}>
        <div className="flex items-center shrink-0" style={{ gap }}>{children}</div>
        <div className="flex items-center shrink-0" style={{ gap }}>{children}</div>
      </div>
    </div>
  )
}
