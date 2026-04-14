// Badge de criticité coloré — utilisé dans les cartes module et le récapitulatif

interface CriticiteBadgeProps {
  score: number
  couleur: 'vert' | 'jaune' | 'orange' | 'rouge'
  label?: string
  size?: 'sm' | 'md'
}

const COULEURS_CLASSES = {
  vert: 'bg-green-100 text-green-800 border-green-200',
  jaune: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  rouge: 'bg-red-100 text-red-800 border-red-200',
}

const COULEURS_DOT = {
  vert: 'bg-green-500',
  jaune: 'bg-yellow-500',
  orange: 'bg-orange-500',
  rouge: 'bg-red-500',
}

export function CriticiteBadge({ score, couleur, label, size = 'md' }: CriticiteBadgeProps) {
  const baseClasses = COULEURS_CLASSES[couleur]
  const dotClasse = COULEURS_DOT[couleur]

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${baseClasses}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotClasse}`} />
        {score}
      </span>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${baseClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotClasse}`} />
      <span className="text-sm font-semibold">{score}</span>
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

// Version pour les scores bruts (calcul automatique de la couleur)
interface CriticiteScoreBadgeProps {
  score: number
  size?: 'sm' | 'md'
}

export function CriticiteScoreBadge({ score, size = 'md' }: CriticiteScoreBadgeProps) {
  let couleur: 'vert' | 'jaune' | 'orange' | 'rouge'
  let label: string

  if (score <= 4) {
    couleur = 'vert'
    label = 'Faible'
  } else if (score <= 9) {
    couleur = 'jaune'
    label = 'Modéré'
  } else if (score <= 14) {
    couleur = 'orange'
    label = 'Élevé'
  } else {
    couleur = 'rouge'
    label = 'Critique'
  }

  return <CriticiteBadge score={score} couleur={couleur} label={label} size={size} />
}
