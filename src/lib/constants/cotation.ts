// Système de cotation — source : DUERP/01_FONDATIONS/COTATION.txt
// UNIQUE SOURCE DE VÉRITÉ pour les formules de calcul

// Échelle Gravité (G) — risques aigus
export const ECHELLE_GRAVITE = [
  { valeur: 1, label: 'Sans soin', description: 'Accident sans nécessité de soins' },
  { valeur: 2, label: 'Soins sans incapacité', description: 'Accident avec soins, sans incapacité' },
  { valeur: 3, label: 'Incapacité temporaire', description: 'Accident avec incapacité partielle temporaire' },
  { valeur: 4, label: 'Incapacité permanente / MP', description: 'Incapacité permanente ou maladie professionnelle' },
  { valeur: 5, label: 'Décès', description: 'Accident mortel' },
] as const

// Échelle Probabilité (P) — risques aigus
export const ECHELLE_PROBABILITE = [
  { valeur: 1, label: 'Improbable', description: "N'est jamais arrivé dans cette situation" },
  { valeur: 2, label: 'Probable', description: "Peut arriver, on peut l'imaginer" },
  { valeur: 3, label: 'Certain', description: 'Arrive parfois, des précédents existent' },
  { valeur: 4, label: 'Fatal', description: 'Arrive régulièrement / tout le temps' },
] as const

// Coefficients Plan de Maîtrise (PM)
export const COEFFICIENTS_PM = [
  {
    valeur: 1.0,
    label: 'Aucune protection',
    description: 'Aucune protection en place (sans EPI ni mesure)',
  },
  {
    valeur: 0.75,
    label: 'Protection partielle',
    description: 'EPI seuls OU mesures organisationnelles légères',
  },
  {
    valeur: 0.5,
    label: 'Double protection',
    description: 'Protections collectives + EPI',
  },
  {
    valeur: 0.25,
    label: 'Protection robuste',
    description: 'Protections collectives robustes + procédures formalisées + formation',
  },
  {
    valeur: 0.0,
    label: 'Risque supprimé',
    description: 'Risque totalement supprimé',
  },
] as const

// Zones de criticité
export const ZONES_CRITICITE = [
  { min: 1, max: 4, niveau: 'vert', label: 'Faible', action: 'Risque acceptable, surveillance suffisante', couleur: '#22c55e' },
  { min: 5, max: 9, niveau: 'jaune', label: 'Modéré', action: 'Actions à planifier', couleur: '#eab308' },
  { min: 10, max: 14, niveau: 'orange', label: 'Élevé', action: 'Actions prioritaires à mettre en place', couleur: '#f97316' },
  { min: 15, max: 20, niveau: 'rouge', label: 'Critique', action: 'Actions immédiates requises', couleur: '#ef4444' },
] as const

// Calcul criticité brute (G × P)
export function calculerCriticiteBrute(gravite: number, probabilite: number): number {
  return gravite * probabilite
}

// Calcul criticité résiduelle (criticité brute × PM)
export function calculerCriticiteResiduelle(criticiteBrute: number, coefficientPM: number): number {
  return criticiteBrute * coefficientPM
}

// Déterminer la zone de criticité
export function getNiveauCriticite(score: number) {
  return ZONES_CRITICITE.find((z) => score >= z.min && score <= z.max) ?? ZONES_CRITICITE[3]
}
