// Composant nom de marque — style typographique SafeAnalyse.
// "Safe" en Bold (700) + "Analyse" en Regular (400) + "." en Bold

interface BrandNameProps {
  className?: string
  /** Couleur du texte — par défaut navy */
  color?: 'navy' | 'white' | 'cream'
}

const colorMap = {
  navy: 'text-brand-navy',
  white: 'text-white',
  cream: 'text-brand-cream',
}

export function BrandName({ className, color = 'navy' }: BrandNameProps) {
  const textColor = colorMap[color]
  return (
    <span className={`${textColor} ${className ?? ''}`}>
      <span className="font-bold">Safe</span>
      <span className="font-normal">Analyse</span>
      <span className="font-bold">.</span>
    </span>
  )
}
