import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GrainOverlayProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article'
}

export function GrainOverlay({ children, className, as: Tag = 'div' }: GrainOverlayProps) {
  return <Tag className={cn('grain', className)}>{children}</Tag>
}
