'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AccordionItem {
  id: string
  question: string
  reponse: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
  /** Ouvrir le premier item par défaut */
  defaultOpen?: string
}

export function Accordion({ items, className, defaultOpen }: AccordionProps) {
  const [ouvert, setOuvert] = useState<string | null>(defaultOpen ?? null)

  return (
    <div className={cn('divide-y divide-brand-sand', className)}>
      {items.map((item) => {
        const isOpen = ouvert === item.id
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOuvert(isOpen ? null : item.id)}
              className="w-full flex items-start justify-between py-4 text-left gap-4 group"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  'text-sm sm:text-base font-semibold leading-snug transition-colors',
                  isOpen
                    ? 'text-brand-navy'
                    : 'text-brand-ink-soft group-hover:text-brand-navy'
                )}
              >
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-brand-bronze shrink-0 mt-0.5 transition-transform duration-300',
                  isOpen && 'rotate-180 text-brand-accent'
                )}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                isOpen ? 'max-h-[600px] pb-5' : 'max-h-0'
              )}
            >
              <div className="text-sm sm:text-base text-brand-ink-soft leading-relaxed pr-8">
                {item.reponse}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
