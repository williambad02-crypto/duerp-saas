// Types métier DUERP

export type StatutEvaluation = 'brouillon' | 'en_cours' | 'termine'

export type NiveauCriticite = 'vert' | 'jaune' | 'orange' | 'rouge'

export type TypeRisque = 'aigu' | 'chronique'

export type CodeModule =
  | 'APR'               // Analyse Préliminaire des Risques — cotation standard G×P ou G×DE
  | 'M01_BRUIT'
  | 'M02_VIBRATIONS'
  | 'M03_TMS'
  | 'M04_CHARGE_PHYSIQUE'
  | 'M05_RPS'
  | 'M06_CHIMIQUE'
  | 'M07_BIOLOGIQUE'
  | 'M08_THERMIQUE'
  | 'M09_RAYONNEMENTS'

export type StatutModule = 'actif' | 'coming_soon' | 'desactive'

export type StatutAbonnement = 'trial' | 'active' | 'past_due' | 'canceled' | 'paused'

export type PlanAbonnement = 'decouverte' | 'essentiel' | 'consulting'

// Coefficient Plan de Maîtrise (PM)
export type CoefficientPM = 0.0 | 0.25 | 0.5 | 0.75 | 1.0

// Base de données — types Supabase
export interface Entreprise {
  id: string
  user_id: string
  nom: string
  siret?: string
  secteur_activite?: string
  effectif?: number
  adresse?: string
  code_postal?: string
  ville?: string
  created_at: string
  updated_at: string
}

export interface Poste {
  id: string
  entreprise_id: string
  nom: string
  description?: string
  ordre: number
  created_at: string
  updated_at: string
}

export interface Operation {
  id: string
  poste_id: string
  nom: string
  description?: string
  est_transversale: boolean // true = "Toutes opérations"
  ordre: number
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  operation_id: string
  code_module: CodeModule
  type_risque: TypeRisque
  statut: StatutEvaluation
  // Identification APR
  numero_risque_ed840?: number    // 1-20 (fiche ED840)
  identifiant_auto?: string       // ex: UT01-R003
  // Chaîne de l'accident (colonnes APR)
  danger?: string
  situation_dangereuse?: string
  evenement_dangereux?: string    // aigus uniquement
  dommage?: string
  siege_lesions?: string
  // Cotation brute (risque aigu : G×P)
  gravite?: number // 1-5
  probabilite?: number // 1-4
  duree_exposition?: number // 1-4 (chronique APR standard)
  criticite_brute?: number // G × P ou G × DE
  // Données spécifiques au module (JSON flexible)
  donnees_module?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Preselection {
  id: string
  operation_id: string
  code_module: CodeModule
  question_1: boolean
  question_2: boolean
  question_3: boolean
  // Si 0 OUI → module ignoré, criticité 1
  module_actif: boolean
  created_at: string
  updated_at: string
}

export interface PlanMaitrise {
  id: string
  evaluation_id: string
  // Mesures existantes (T.H.O. + EPI)
  mesures_techniques?: string
  mesures_humaines?: string
  mesures_organisationnelles?: string
  mesures_epi?: string
  coefficient_pm: CoefficientPM // 0.0 à 1.0
  criticite_residuelle?: number // criticite_brute × coefficient_pm
  // Plan d'action (mesures à venir)
  actions_prevues?: string
  coefficient_pm_cible?: CoefficientPM
  criticite_finale?: number
  echeance?: string
  responsable?: string
  created_at: string
  updated_at: string
}

export interface Abonnement {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan: PlanAbonnement
  statut: StatutAbonnement
  date_debut?: string
  date_fin?: string
  trial_ends_at?: string
  created_at: string
  updated_at: string
}

// Calcul criticité
export function calculerNiveauCriticite(score: number): NiveauCriticite {
  if (score <= 4) return 'vert'
  if (score <= 9) return 'jaune'
  if (score <= 14) return 'orange'
  return 'rouge'
}
