// Questions de présélection par module — source : STANDARD_PRESELECTION.txt
// Transcription mot pour mot des questions. NE PAS MODIFIER sans relire le fichier source.

import { CodeModule } from '@/types'

export interface QuestionPreselection {
  id: 1 | 2 | 3
  texte: string
}

// La preselection ne s'applique qu'aux modules normes (pas a 'APR')
export const QUESTIONS_PRESELECTION: Record<Exclude<CodeModule, 'APR'>, QuestionPreselection[]> = {
  M01_BRUIT: [
    {
      id: 1,
      texte: 'Faut-il élever la voix pour se faire comprendre lors de cette opération ?',
    },
    {
      id: 2,
      texte: "Des plaintes d'acouphènes ou de fatigue auditive ont-elles été signalées par des salariés réalisant cette opération ?",
    },
    {
      id: 3,
      texte: 'Des machines, outils ou équipements bruyants sont-ils utilisés ou présents à proximité lors de cette opération ?',
    },
  ],
  M02_VIBRATIONS: [
    {
      id: 1,
      texte: "Cette opération implique-t-elle l'utilisation d'un outil vibrant tenu en main (meuleuse, marteau-piqueur, perceuse, tronçonneuse…) ?",
    },
    {
      id: 2,
      texte: "Cette opération implique-t-elle la conduite d'un engin, véhicule ou machine transmettant des vibrations au corps entier (chariot, tracteur, camion, engin de chantier…) ?",
    },
    {
      id: 3,
      texte: "Des plaintes de fourmillements, engourdissements dans les mains ou de douleurs lombaires liées à la conduite ont-elles été signalées ?",
    },
  ],
  M03_TMS: [
    {
      id: 1,
      texte: 'Cette opération comporte-t-elle des gestes répétitifs des bras ou des mains sur une durée significative (assemblage, saisie, tri, emballage…) ?',
    },
    {
      id: 2,
      texte: "Cette opération nécessite-t-elle des postures contraignantes maintenues (bras en l'air, dos courbé, torsion, accroupissement…) ?",
    },
    {
      id: 3,
      texte: "Des cas de tendinites, douleurs d'épaule, canal carpien ou lombalgies ont-ils été signalés ou reconnus en MP sur ce type de poste ?",
    },
  ],
  M04_CHARGE_PHYSIQUE: [
    {
      id: 1,
      texte: 'Cette opération implique-t-elle de soulever, porter, pousser ou tirer des charges (objets, matériaux, patients, conteneurs…) ?',
    },
    {
      id: 2,
      texte: "Cette opération nécessite-t-elle une activité physique soutenue (debout en mouvement, déplacements fréquents, efforts répétés) ?",
    },
    {
      id: 3,
      texte: "Des douleurs physiques (dos, membres) ou des accidents liés à un effort ont-ils été signalés sur ce type d'opération ?",
    },
  ],
  M05_RPS: [
    {
      id: 1,
      texte: 'Des salariés de ce poste sont-ils soumis à une pression de temps importante, à des objectifs difficiles à atteindre ou à des conflits de rôle fréquents ?',
    },
    {
      id: 2,
      texte: "Des salariés de ce poste sont-ils en contact régulier avec du public, des patients ou des clients pouvant être sources de tensions ou d'agressivité ?",
    },
    {
      id: 3,
      texte: 'Des signaux RPS ont-ils été observés sur ce poste : absentéisme élevé, turn-over, plaintes de mal-être, conflits internes ou tensions managériales signalées ?',
    },
  ],
  M06_CHIMIQUE: [
    {
      id: 1,
      texte: "Cette opération implique-t-elle l'utilisation, la manipulation ou la production de produits chimiques (solvants, peintures, colles, acides, gaz, fumées de soudage, poussières de bois…) ?",
    },
    {
      id: 2,
      texte: 'Les produits utilisés portent-ils des pictogrammes de danger (SGH/CLP) sur leurs étiquettes ou fiches de données sécurité ?',
    },
    {
      id: 3,
      texte: "Des voies d'exposition sont-elles présentes lors de cette opération : inhalation de vapeurs/poussières, contact cutané, ingestion possible ?",
    },
  ],
  M07_BIOLOGIQUE: [
    {
      id: 1,
      texte: "Cette opération expose-t-elle des salariés à des agents biologiques (bactéries, virus, champignons, parasites) : soins, déchets, animaux, eaux usées, déchets verts, laboratoire… ?",
    },
    {
      id: 2,
      texte: 'Des piqûres, coupures ou projections de liquides biologiques sont-elles possibles lors de cette opération ?',
    },
    {
      id: 3,
      texte: "Ce poste relève-t-il d'un secteur à risque biologique connu : santé, agriculture, agroalimentaire, assainissement, collecte de déchets ?",
    },
  ],
  M08_THERMIQUE: [
    {
      id: 1,
      texte: 'Cette opération se déroule-t-elle dans un environnement chaud (> 30°C), froid (< 10°C), ou avec des variations thermiques importantes ?',
    },
    {
      id: 2,
      texte: "L'activité physique liée à cette opération est-elle forte dans cet environnement (travail physique par forte chaleur, entrepôt frigorifique…) ?",
    },
    {
      id: 3,
      texte: 'Des malaises, crampes ou incidents liés à la chaleur/au froid ont-ils été signalés sur ce poste ou dans cet environnement ?',
    },
  ],
  M09_RAYONNEMENTS: [
    {
      id: 1,
      texte: "Cette opération implique-t-elle l'utilisation ou la proximité d'une source de rayonnements ionisants (radiographie, radioactivité, scanner industriel…) ou non ionisants (laser, UV, arc de soudage, IRM, micro-ondes, ondes RF…) ?",
    },
    {
      id: 2,
      texte: 'Des équipements de protection spécifiques contre les rayonnements (dosimètre, écran plombé, lunettes laser…) sont-ils utilisés ou requis ?',
    },
    {
      id: 3,
      texte: "Ce poste relève-t-il d'un secteur connu pour les rayonnements : médical, nucléaire, soudage, traitement de surface, laboratoire ?",
    },
  ],
}
