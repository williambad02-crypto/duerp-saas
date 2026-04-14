// Composant Logo SafeAnalyse.
// Fichiers disponibles :
//   logo-full.svg          — logo complet en navy (fond clair)
//   logo-symbol-white.svg  — symbole seul en blanc (fond navy)
//
// Variants manquants → fallback texte

import Image from 'next/image'
import { BrandName } from './brand-name'

interface LogoProps {
  /** 'full' = symbole + texte  |  'symbol' = symbole seul */
  variant?: 'full' | 'symbol'
  /** 'default' = navy (fond clair)  |  'white' = blanc/crème (fond navy) */
  theme?: 'default' | 'white'
  height?: number
  className?: string
}

export function Logo({
  variant = 'full',
  theme = 'default',
  height = 32,
  className,
}: LogoProps) {
  // logo-full.svg (navy) — fond clair
  if (variant === 'full' && theme === 'default') {
    return (
      <Image
        src="/logo/logo-full.svg"
        alt="SafeAnalyse."
        height={height}
        width={height * 5}
        className={`object-contain ${className ?? ''}`}
        priority
      />
    )
  }

  // logo-symbol-white.svg — fond navy
  if (variant === 'symbol' && theme === 'white') {
    return (
      <Image
        src="/logo/logo-symbol-white.svg"
        alt="SafeAnalyse."
        height={height}
        width={height}
        className={`object-contain ${className ?? ''}`}
        priority
      />
    )
  }

  // Fallback : version texte pour les variants non disponibles en fichier
  if (variant === 'full' && theme === 'white') {
    return (
      <BrandName
        color="white"
        className={`text-lg leading-none ${className ?? ''}`}
      />
    )
  }

  // symbol + default → cercle navy avec "S"
  return (
    <div
      className={`rounded-lg bg-brand-navy flex items-center justify-center ${className ?? ''}`}
      style={{ width: height, height }}
    >
      <span className="text-white font-bold" style={{ fontSize: height * 0.5 }}>
        S
      </span>
    </div>
  )
}
