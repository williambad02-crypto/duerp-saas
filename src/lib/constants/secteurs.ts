// Secteurs d'activité disponibles lors de l'onboarding
export const SECTEURS_ACTIVITE = [
  { valeur: 'btp', label: 'BTP / Construction' },
  { valeur: 'industrie', label: 'Industrie / Fabrication' },
  { valeur: 'agroalimentaire', label: 'Agroalimentaire' },
  { valeur: 'tertiaire', label: 'Tertiaire / Bureau' },
  { valeur: 'sante', label: 'Santé / Social' },
  { valeur: 'agriculture', label: 'Agriculture / Sylviculture' },
  { valeur: 'transport', label: 'Transport / Logistique' },
  { valeur: 'commerce', label: 'Commerce / Distribution' },
  { valeur: 'artisanat', label: 'Artisanat' },
  { valeur: 'autre', label: 'Autre' },
] as const

export type SecteurActivite = (typeof SECTEURS_ACTIVITE)[number]['valeur']
