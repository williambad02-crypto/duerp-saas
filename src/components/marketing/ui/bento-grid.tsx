import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SectionReveal } from './section-reveal'

interface BentoGridProps {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

type Size = 'sm' | 'md' | 'lg'

const sizeClass: Record<Size, string> = {
  sm: 'md:col-span-2',
  md: 'md:col-span-3',
  lg: 'md:col-span-4 md:row-span-2',
}

interface BentoCardProps {
  title: string
  description?: string
  icon?: ReactNode
  size?: Size
  index?: number
  className?: string
  children?: ReactNode
}

export function BentoCard({
  title,
  description,
  icon,
  size = 'sm',
  index = 0,
  className,
  children,
}: BentoCardProps) {
  return (
    <SectionReveal
      variant="fade-up"
      delay={index * 0.08}
      className={cn(sizeClass[size], 'h-full')}
    >
      <div
        className={cn(
          'group relative h-full rounded-2xl border border-[var(--color-brand-sand)] bg-[var(--color-brand-off)]',
          'p-6 md:p-7 transition-all duration-300',
          'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(3,25,72,0.25)]',
          className,
        )}
      >
        {icon && (
          <div className="mb-4 text-[var(--color-brand-gold)]">{icon}</div>
        )}
        <h3 className="font-semibold text-lg md:text-xl text-[var(--color-brand-navy)] mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm md:text-base text-[var(--color-brand-ink-soft)] leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </div>
    </SectionReveal>
  )
}
