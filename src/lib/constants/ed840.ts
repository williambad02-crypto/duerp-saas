// Constantes ED840 -- 20 fiches de risques INRS
// Source : DUERP/01_FONDATIONS/ED840_SYNTHESE.txt (Avril 2026)
// UNIQUE SOURCE DE VERITE pour la liste des risques dans le tableau APR

import { CodeModule } from '@/types'

export type TypeRisqueED840 = 'AIGU' | 'CHRONIQUE' | 'LES_DEUX'

// null = cotation APR standard (G x P ou G x DE selon type)
// CodeModule = renvoi vers un module norme dedie
export type ModuleED840 = CodeModule | null

export interface RisqueED840 {
  numero: number         // 1 a 20 (numero de fiche ED840)
  intitule: string       // Intitule officiel INRS
  type: TypeRisqueED840  // Determine la methode de cotation par defaut
  module: ModuleED840    // null = APR standard ; CodeModule = module dedie
  description: string    // Synthese des situations dangereuses types
  exemplesDanger: string[]
  exemplesDommage: string[]
  exemplesSiege: string[]
}

export const RISQUES_ED840: RisqueED840[] = [
  {
    numero: 1,
    intitule: 'Risques de chute de plain-pied',
    type: 'AIGU',
    module: null,
    description: 'Glissades, trebuchements, faux pas sur surface plane. 2e cause d\'AT.',
    exemplesDanger: ['Sol glissant (eau, huile)', 'Espace de circulation encombre', 'Eclairage insuffisant'],
    exemplesDommage: ['Entorse', 'Fracture', 'Contusion'],
    exemplesSiege: ['Membres inferieurs', 'Membres superieurs (reception de chute)', 'Rachis'],
  },
  {
    numero: 2,
    intitule: 'Risques de chute de hauteur',
    type: 'AIGU',
    module: null,
    description: 'Chute avec difference de niveau (echelles, toits, quais, fosses). Consequences souvent graves.',
    exemplesDanger: ['Bord de quai ou de fosse non protege', 'Echelle ou echafaudage instable', 'Ouverture dans un plancher'],
    exemplesDommage: ['Fracture', 'Traumatisme cranien', 'Deces'],
    exemplesSiege: ['Membres inferieurs', 'Rachis', 'Crane'],
  },
  {
    numero: 3,
    intitule: 'Risques lies aux circulations internes',
    type: 'AIGU',
    module: null,
    description: 'Heurt d\'une personne par un vehicule ou engin interne (chariot, camion). Coactivite pietons/vehicules.',
    exemplesDanger: ['Coactivite pietons/chariots sans separation', 'Voies mal identifiees', 'Manoeuvre en marche arriere sans surveillance'],
    exemplesDommage: ['Ecrasement', 'Fracture', 'Plaie grave'],
    exemplesSiege: ['Membres inferieurs', 'Thorax', 'Crane'],
  },
  {
    numero: 4,
    intitule: 'Risques routiers en mission',
    type: 'AIGU',
    module: null,
    description: 'Accidents lors de deplacements professionnels. Inclut vibrations, bruit et stress pour les expositions regulieres.',
    exemplesDanger: ['Deplacements frequents en conditions difficiles', 'Vehicule mal entretenu', 'Usage d\'appareils pendant la conduite'],
    exemplesDommage: ['Fracture', 'Traumatisme cranien', 'Deces'],
    exemplesSiege: ['Ensemble du corps'],
  },
  {
    numero: 5,
    intitule: 'Risques lies a la charge physique de travail',
    type: 'CHRONIQUE',
    module: 'M04_CHARGE_PHYSIQUE',
    description: 'Source de TMS et de fatigue chronique. Manutention manuelle, postures contraignantes, gestes repetitifs.',
    exemplesDanger: ['Manutention manuelle de charges lourdes (>15 kg)', 'Postures contraignantes repetees', 'Gestes repetitifs a frequence elevee'],
    exemplesDommage: ['TMS des membres superieurs', 'Lombalgie chronique', 'Hernie discale'],
    exemplesSiege: ['Rachis', 'Membres superieurs', 'Epaules'],
  },
  {
    numero: 6,
    intitule: 'Risques lies a la manutention mecanique',
    type: 'AIGU',
    module: null,
    description: 'Risques d\'accident lies aux engins de manutention (chute de charge, heurt, renversement).',
    exemplesDanger: ['Charge instable ou mal arrimee', 'Engin mal entretenu', 'Deplacement sans visibilite suffisante'],
    exemplesDommage: ['Ecrasement', 'Fracture', 'Plaie grave'],
    exemplesSiege: ['Membres inferieurs', 'Thorax', 'Crane'],
  },
  {
    numero: 7,
    intitule: 'Risques lies aux produits chimiques',
    type: 'LES_DEUX',
    module: 'M06_CHIMIQUE',
    description: 'Intoxication aigue (composante aigu) et maladie professionnelle/cancer (composante chronique).',
    exemplesDanger: ['Produit chimique corrosif ou toxique', 'Solvant inflammable', 'Agent CMR (cancerogene)'],
    exemplesDommage: ['Brulure chimique', 'Intoxication', 'Cancer professionnel'],
    exemplesSiege: ['Peau', 'Voies respiratoires', 'Yeux'],
  },
  {
    numero: 8,
    intitule: 'Risques lies aux agents biologiques',
    type: 'CHRONIQUE',
    module: 'M07_BIOLOGIQUE',
    description: 'Risques d\'infection, allergie ou intoxication lies a des micro-organismes.',
    exemplesDanger: ['Contact avec eaux usees ou dechets', 'Poussieres organiques (moisissures, fientes)', 'Contact avec animaux ou produits d\'origine animale'],
    exemplesDommage: ['Infection', 'Maladie infectieuse', 'Allergie respiratoire'],
    exemplesSiege: ['Voies respiratoires', 'Peau', 'Systeme immunitaire'],
  },
  {
    numero: 9,
    intitule: 'Risques lies aux equipements de travail',
    type: 'AIGU',
    module: null,
    description: 'Blessures mecaniques par elements de machines, outils, projections. Parties mobiles, energies, temperatures.',
    exemplesDanger: ['Partie mobile accessible (lame, courroie)', 'Outil tranchant (couteau, cutter)', 'Non-consignation lors de maintenance'],
    exemplesDommage: ['Coupure', 'Amputation', 'Brulure'],
    exemplesSiege: ['Membres superieurs', 'Mains', 'Yeux'],
  },
  {
    numero: 10,
    intitule: "Risques lies aux effondrements et chutes d'objets",
    type: 'AIGU',
    module: null,
    description: "Chute d'objets depuis un niveau superieur, effondrement de materiaux ou de structures.",
    exemplesDanger: ['Stockage instable en hauteur', 'Rack de stockage non adapte', 'Travaux simultanes a differentes hauteurs'],
    exemplesDommage: ['Contusion', 'Fracture', 'Traumatisme cranien'],
    exemplesSiege: ['Crane', 'Epaules', 'Membres superieurs'],
  },
  {
    numero: 11,
    intitule: 'Risques et nuisances lies au bruit',
    type: 'LES_DEUX',
    module: 'M01_BRUIT',
    description: 'Traumatisme sonore aigu (exposition intense soudaine) et surdite professionnelle (exposition quotidienne prolongee, irreversible).',
    exemplesDanger: ['Outils portatifs bruyants (meuleuse, marteau-piqueur)', 'Chocs metalliques, presses', 'Ambiance sonore elevee permanente'],
    exemplesDommage: ['Surdite professionnelle', 'Traumatisme sonore', 'Acouphenes'],
    exemplesSiege: ['Oreilles / systeme auditif'],
  },
  {
    numero: 12,
    intitule: 'Risques lies aux ambiances thermiques',
    type: 'LES_DEUX',
    module: 'M08_THERMIQUE',
    description: "Coup de chaleur ou gelure (aigu) et stress thermique chronique (chronique). Postes exterieurs, chambres froides, fours.",
    exemplesDanger: ['Proximite de sources de chaleur (fours, surfaces chaudes)', 'Chambre frigorifique', 'Poste exterieur en ete ou en hiver'],
    exemplesDommage: ['Coup de chaleur', 'Gelures', 'Dermatose thermique'],
    exemplesSiege: ['Peau', 'Ensemble du corps'],
  },
  {
    numero: 13,
    intitule: "Risques d'incendie et d'explosion (ATEX)",
    type: 'AIGU',
    module: null,
    description: "Brulures, intoxication, rupture de tympan, deces. Produits inflammables, atmospheres explosibles, travaux par points chauds.",
    exemplesDanger: ['Produits inflammables ou explosifs', 'Atmosphere explosive (solvants, poussieres)', 'Travaux par points chauds (soudage, meulage)'],
    exemplesDommage: ['Brulure', 'Intoxication aux fumees', 'Traumatisme par blast'],
    exemplesSiege: ['Peau', 'Voies respiratoires', 'Ensemble du corps'],
  },
  {
    numero: 14,
    intitule: "Risques lies a l'electricite",
    type: 'AIGU',
    module: null,
    description: 'Brulures, electrisation, electrocution par contact avec piece sous tension ou arc electrique.',
    exemplesDanger: ['Armoire electrique non fermee a cle', 'Cable d\'alimentation deteriore', 'Intervention sans consignation'],
    exemplesDommage: ['Electrisation', 'Brulure electrique', 'Electrocution'],
    exemplesSiege: ['Membres superieurs', 'Thorax', 'Ensemble du corps'],
  },
  {
    numero: 15,
    intitule: 'Risques lies aux ambiances lumineuses',
    type: 'CHRONIQUE',
    module: null,
    description: "Fatigue visuelle, accidents favorises par un mauvais eclairage, postures contraignantes liees a la compensation de l'eclairage.",
    exemplesDanger: ['Locaux aveugles ou mal eclaires', 'Eblouissements (lampes nues, reflets)', 'Reflets sur ecrans favorisant les mauvaises postures'],
    exemplesDommage: ['Fatigue visuelle', 'TMS (postures de compensation)', 'Maux de tete chroniques'],
    exemplesSiege: ['Yeux', 'Rachis cervical', 'Membres superieurs'],
  },
  {
    numero: 16,
    intitule: 'Risques lies aux rayonnements',
    type: 'CHRONIQUE',
    module: 'M09_RAYONNEMENTS',
    description: 'CEM, rayonnements optiques artificiels (ROA), rayonnements ionisants. Effets differes (cancers, lesions oculaires).',
    exemplesDanger: ['Soudage electrique, induction (CEM)', 'Lampes UV, laser (ROA)', 'Radon, appareils radiologiques'],
    exemplesDommage: ['Cataracte', 'Cancer professionnel', 'Mutations cellulaires'],
    exemplesSiege: ['Yeux', 'Peau', 'Moelle osseuse'],
  },
  {
    numero: 17,
    intitule: 'Risques psychosociaux (RPS)',
    type: 'CHRONIQUE',
    module: 'M05_RPS',
    description: 'Atteinte a la sante mentale et physique liee aux conditions de travail. Burn-out, depression, troubles anxieux.',
    exemplesDanger: ['Surcharge de travail chronique', 'Manque d\'autonomie ou de reconnaissance', 'Conflits interpersonnels, harcelement'],
    exemplesDommage: ['Burn-out', 'Depression', 'Maladie cardiovasculaire'],
    exemplesSiege: ['Systeme nerveux', 'Systeme cardiovasculaire', 'Ensemble du corps'],
  },
  {
    numero: 18,
    intitule: 'Risques lies aux vibrations',
    type: 'CHRONIQUE',
    module: 'M02_VIBRATIONS',
    description: 'Vibrations main-bras (VMB : syndrome de Raynaud, neuropathies) et vibrations corps entier (VCE : lombalgies, hernies).',
    exemplesDanger: ['Outils vibrants (meuleuse, marteau-piqueur)', 'Conduite d\'engin de chantier ou chariot elevateur', 'Tronconneuse, perforateur'],
    exemplesDommage: ['Syndrome de Raynaud', 'Lombalgie chronique', 'Hernie discale'],
    exemplesSiege: ['Membres superieurs (VMB)', 'Rachis lombaire (VCE)'],
  },
  {
    numero: 19,
    intitule: 'Risques de heurt et de cognement',
    type: 'AIGU',
    module: null,
    description: 'Heurt contre elements fixes de l\'environnement. Contusions, plaies, entorses -- peut provoquer une chute.',
    exemplesDanger: ['Objets depassant des espaces de stockage', 'Elements saillants non signales', 'Espaces de travail encombrés'],
    exemplesDommage: ['Contusion', 'Plaie', 'Entorse'],
    exemplesSiege: ['Tete', 'Membres superieurs', 'Membres inferieurs'],
  },
  {
    numero: 20,
    intitule: 'Risques lies aux pratiques addictives',
    type: 'CHRONIQUE',
    module: null,
    description: 'Risques lies a la consommation de substances psychoactives favorisee ou aggravee par les conditions de travail.',
    exemplesDanger: ['Facteurs de travail favorisant les addictions (RPS, horaires decales)', 'Pots professionnels frequents', 'Isolement au travail'],
    exemplesDommage: ['Accident du travail lie a la baisse de vigilance', 'Depression', 'Pathologie cardiovasculaire'],
    exemplesSiege: ['Systeme nerveux', 'Systeme cardiovasculaire', 'Foie'],
  },
]

// Lookup par numero de fiche
export const RISQUE_ED840_PAR_NUMERO: Record<number, RisqueED840> = Object.fromEntries(
  RISQUES_ED840.map((r) => [r.numero, r])
)

// Risques ayant un module dedie actif en V1
export function aModuleDedieActif(risque: RisqueED840): boolean {
  return risque.module === 'M01_BRUIT'
}

// Determine la methode de cotation APR pour une ligne donnee
// aigu => G x P | chronique_apr => G x DE
export type MethodeCotationAPR = 'gxp' | 'gxde' | 'module_dedie'

export function getMethodeCotation(
  risque: RisqueED840,
  typeChoisi: 'aigu' | 'chronique'
): MethodeCotationAPR {
  if (typeChoisi === 'aigu') return 'gxp'
  if (aModuleDedieActif(risque)) return 'module_dedie'
  return 'gxde'
}

// Duree d'exposition (DE) -- echelle pour cotation CHRONIQUE APR standard
export const ECHELLE_DUREE_EXPOSITION = [
  { valeur: 1, label: 'Rare', description: 'Quelques fois par an' },
  { valeur: 2, label: 'Occasionnel', description: 'Quelques fois par mois' },
  { valeur: 3, label: 'Frequent', description: 'Plusieurs fois par semaine' },
  { valeur: 4, label: 'Permanent', description: 'Exposition quotidienne' },
] as const
