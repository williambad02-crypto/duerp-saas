// Module M01 — Bruit
// Source : DUERP/03_MODULES_RISQUES/01_BRUIT/BRUIT_METHODE.txt
// UNIQUE SOURCE DE VÉRITÉ pour les constantes du module bruit

// ─── Test de communication (Estimation sommaire — Niveau 1) ─────────────────────
export type NiveauEstimationBruit = 0 | 1 | 2

export const NIVEAUX_ESTIMATION_BRUIT = [
  {
    valeur: 0 as NiveauEstimationBruit,
    label: 'Communication aisée à moins de 0,5 m',
    description: "On peut se parler normalement sans hausser la voix (et pas d'événements bruyants rares)",
    interpretation: 'Pas de risque bruit significatif',
    risque: 'faible',
  },
  {
    valeur: 1 as NiveauEstimationBruit,
    label: 'Doit élever la voix à moins de 2 m',
    description: 'Il faut parler fort ou répéter pour se faire comprendre à 1-2 m',
    interpretation: 'Risque incertain — évaluation simplifiée recommandée',
    risque: 'incertain',
  },
  {
    valeur: 2 as NiveauEstimationBruit,
    label: 'Doit crier à moins de 1 m (ou bruits impulsionnels)',
    description: 'Doit crier pour se faire entendre à moins de 1 m, ou chocs/impacts intenses présents',
    interpretation: 'Risque certain — ≈ > 90 dB(A)',
    risque: 'certain',
  },
] as const

// ─── Niveaux sonores disponibles (dB(A)) ────────────────────────────────────────
export const NIVEAUX_DB = [80, 82, 85, 88, 90, 95, 100, 105] as const
export type NiveauDb = (typeof NIVEAUX_DB)[number]

// ─── Durées d'exposition disponibles ────────────────────────────────────────────
export const DUREES_EXPOSITION = [
  { valeur: '5min', label: '5 minutes', minutes: 5 },
  { valeur: '10min', label: '10 minutes', minutes: 10 },
  { valeur: '15min', label: '15 minutes', minutes: 15 },
  { valeur: '30min', label: '30 minutes', minutes: 30 },
  { valeur: '1h', label: '1 heure', minutes: 60 },
  { valeur: '2h', label: '2 heures', minutes: 120 },
  { valeur: '4h', label: '4 heures', minutes: 240 },
  { valeur: '8h', label: '8 heures (journée complète)', minutes: 480 },
] as const
export type DureeExposition = (typeof DUREES_EXPOSITION)[number]['valeur']

// ─── Table des points d'exposition ─────────────────────────────────────────────
// Source : Figure 9 de l'ED 6035 (INRS) — intégrée dans BRUIT_METHODE.txt, Section 5
// Format : TABLE_POINTS[dB][durée] = points
export const TABLE_POINTS_BRUIT: Record<NiveauDb, Record<DureeExposition, number>> = {
  80: { '8h': 32, '4h': 16, '2h': 8, '1h': 4, '30min': 2, '15min': 1, '10min': 1, '5min': 0 },
  82: { '8h': 50, '4h': 25, '2h': 13, '1h': 6, '30min': 3, '15min': 2, '10min': 1, '5min': 1 },
  85: { '8h': 100, '4h': 50, '2h': 25, '1h': 13, '30min': 6, '15min': 3, '10min': 2, '5min': 1 },
  88: { '8h': 200, '4h': 100, '2h': 50, '1h': 25, '30min': 13, '15min': 6, '10min': 4, '5min': 2 },
  90: { '8h': 320, '4h': 160, '2h': 80, '1h': 40, '30min': 20, '15min': 10, '10min': 7, '5min': 3 },
  95: { '8h': 1000, '4h': 510, '2h': 250, '1h': 130, '30min': 60, '15min': 32, '10min': 21, '5min': 11 },
  100: { '8h': 3200, '4h': 1600, '2h': 800, '1h': 400, '30min': 200, '15min': 100, '10min': 70, '5min': 33 },
  105: { '8h': 9999, '4h': 9999, '2h': 2500, '1h': 1300, '30min': 630, '15min': 320, '10min': 210, '5min': 110 },
}

// ─── Correspondance points → criticité (source : BRUIT_METHODE.txt, Section 5) ─
export interface CriticiteBruit {
  criticite: 2 | 4 | 8 | 16
  niveauRisque: string
  interpretation: string
  action: string
  couleur: 'vert' | 'jaune' | 'orange' | 'rouge'
}

export function calculerCriticiteBruit(totalPoints: number): CriticiteBruit {
  if (totalPoints <= 16) {
    return {
      criticite: 2,
      niveauRisque: 'Faible',
      interpretation: 'LEX,8h ≤ 77 dB(A) — Pas d\'action bruit requise',
      action: 'Documenter dans l\'APR. Aucune obligation réglementaire.',
      couleur: 'vert',
    }
  }
  if (totalPoints <= 32) {
    return {
      criticite: 4,
      niveauRisque: 'Modéré',
      interpretation: 'LEX,8h 77–80 dB(A) — Zone d\'incertitude',
      action: 'Mesurage normalisé recommandé pour confirmer.',
      couleur: 'jaune',
    }
  }
  if (totalPoints <= 100) {
    return {
      criticite: 8,
      niveauRisque: 'Élevé — VAI dépassée',
      interpretation: 'LEX,8h 80–85 dB(A) — Valeur d\'Action Inférieure dépassée',
      action: 'Information travailleurs + PICB à disposition + examens audiométriques.',
      couleur: 'orange',
    }
  }
  return {
    criticite: 16,
    niveauRisque: 'Très élevé — VAS dépassée',
    interpretation: 'LEX,8h > 85 dB(A) — Valeur d\'Action Supérieure dépassée',
    action: 'Programme technique de réduction + port PICB OBLIGATOIRE + SMR.',
    couleur: 'rouge',
  }
}

// ─── Mesures de prévention (source : BRUIT_METHODE.txt, Section 7) ──────────────
export const MESURES_PREVENTION_BRUIT = {
  techniques: [
    { id: 'encoffrement', label: 'Encoffrement / cabine acoustique de la machine' },
    { id: 'traitement_acoustique', label: 'Traitement acoustique du local (absorbants, panneaux)' },
    { id: 'isolation_vibratoire', label: 'Isolation vibratoire (plots, amortisseurs sous machine)' },
    { id: 'ecrans_acoustiques', label: 'Écrans acoustiques entre source et travailleurs' },
    { id: 'maintenance_preventive', label: 'Maintenance préventive (machines entretenues = moins bruyantes)' },
    { id: 'substitution', label: 'Remplacement par procédé moins bruyant' },
  ],
  organisationnelles: [
    { id: 'rotation_postes', label: 'Rotation de postes / réduction du temps d\'exposition individuel' },
    { id: 'regroupement_taches', label: 'Regroupement des tâches bruyantes (moins de travailleurs présents)' },
    { id: 'signalisation', label: 'Signalisation et délimitation des zones bruyantes (accès restreint)' },
    { id: 'planification', label: 'Planification horaire pour concentrer les périodes bruyantes' },
  ],
  humaines: [
    { id: 'formation_risque', label: 'Formation des travailleurs au risque bruit et à ses effets' },
    { id: 'information_picb', label: 'Information sur l\'usage correct des PICB (ajustement, entretien, limites)' },
    { id: 'sensibilisation', label: 'Sensibilisation à la déclaration des symptômes précoces (acouphènes)' },
  ],
  epi: [
    { id: 'bouchons_jetables', label: 'Bouchons d\'oreilles jetables' },
    { id: 'bouchons_moules', label: 'Bouchons moulés sur mesure' },
    { id: 'casques_antibruit', label: 'Casques antibruit (serre-tête)' },
    { id: 'casques_communication', label: 'Casques avec communication intégrée (pour travailleurs mobiles)' },
  ],
}

// ─── Auto-calcul du coefficient PM ─────────────────────────────────────────────
export type MesuresBruit = {
  techniques: string[]
  organisationnelles: string[]
  humaines: string[]
  epi: string[]
  risque_supprime: boolean
}

export function suggererCoefficientPM(mesures: MesuresBruit): number {
  if (mesures.risque_supprime) return 0.0

  const hasT = mesures.techniques.length > 0
  const hasO = mesures.organisationnelles.length > 0
  const hasH = mesures.humaines.length > 0
  const hasEPI = mesures.epi.length > 0

  // Protections collectives robustes + procédures + formation
  if (hasT && (hasO || hasH)) return 0.25

  // Protections collectives (T) + EPI
  if (hasT && hasEPI) return 0.5

  // Protections collectives seules
  if (hasT) return 0.5

  // EPI seuls ou mesures organisationnelles/humaines seules
  if (hasEPI || hasO || hasH) return 0.75

  return 1.0
}

// ─── Données sauvegardées dans donnees_module (JSONB) ───────────────────────────
export interface DonneesModuleBruit {
  niveau_estimation: NiveauEstimationBruit
  niveau_db?: NiveauDb
  duree_exposition?: DureeExposition
  total_points?: number
  mesures: MesuresBruit
}
