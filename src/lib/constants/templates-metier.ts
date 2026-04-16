// ==========================================================================
// Templates métier V1 — pré-remplissage d'un poste avec risques types INRS ED840
// ==========================================================================
//
// 3 templates pour aider la création d'un poste : l'opération transversale
// "Toutes opérations" est pré-remplie avec 4 à 7 risques types.
//
// Les valeurs G / P / DE sont indicatives (médianes observées sur le terrain)
// l'utilisateur doit les valider / ajuster selon son contexte réel.
//
// IMPORTANT : les numéros ED840 référencent la liste officielle INRS
// (voir src/lib/constants/ed840.ts et DUERP/01_FONDATIONS/ED840_SYNTHESE.txt).
//
// Contenu à valider / affiner par William (expert HSE) avant mise en prod.
// ==========================================================================

export type TemplateRisque = {
  numero_risque_ed840: number
  type_risque: 'aigu' | 'chronique'
  danger: string
  situation_dangereuse: string
  evenement_dangereux: string
  dommage: string
  gravite: number
  probabilite: number | null      // renseigné si type aigu
  duree_exposition: number | null // renseigné si type chronique
  mesures_techniques_modele?: string | null
}

export type TemplateMetier = {
  code: string
  nom: string
  description: string
  icone: string
  risques: TemplateRisque[]
}

export const TEMPLATES_METIER: TemplateMetier[] = [
  // ─── Template 1 : Opérateur production agroalimentaire ────────────────────
  {
    code: 'agro_operateur_production',
    nom: 'Opérateur production agroalimentaire',
    description: 'Préparation, conditionnement, nettoyage en atelier alimentaire.',
    icone: '🏭',
    risques: [
      {
        // ED840 #5 — Risques liés à la charge physique de travail
        numero_risque_ed840: 5,
        type_risque: 'chronique',
        danger: 'Manutention manuelle de cartons et bacs',
        situation_dangereuse: 'Port de charges > 15 kg de façon répétée',
        evenement_dangereux: 'Lombalgie aiguë',
        dommage: 'TMS lombaire',
        gravite: 3,
        probabilite: null,
        duree_exposition: 3,
        mesures_techniques_modele:
          'Aide à la manutention (transpalette, convoyeur), réduction du poids des bacs, rotation des tâches',
      },
      {
        // ED840 #11 — Risques et nuisances liés au bruit
        numero_risque_ed840: 11,
        type_risque: 'chronique',
        danger: 'Bruit des machines de conditionnement',
        situation_dangereuse: 'Exposition continue 8 h > 85 dBA',
        evenement_dangereux: 'Dégradation auditive',
        dommage: 'Surdité professionnelle',
        gravite: 4,
        probabilite: null,
        duree_exposition: 3,
        mesures_techniques_modele:
          'Capotage machine, EPI bouchons moulés, mesure Lex,8h annuelle',
      },
      {
        // ED840 #1 — Risques de chute de plain-pied
        numero_risque_ed840: 1,
        type_risque: 'aigu',
        danger: 'Sols humides après nettoyage',
        situation_dangereuse: 'Circulation sur sol mouillé',
        evenement_dangereux: 'Glissade et chute',
        dommage: 'Contusion, entorse, fracture',
        gravite: 3,
        probabilite: 3,
        duree_exposition: null,
        mesures_techniques_modele:
          'Signalétique sol mouillé, chaussures antidérapantes, rainurage sol',
      },
      {
        // ED840 #9 — Risques liés aux équipements de travail
        numero_risque_ed840: 9,
        type_risque: 'aigu',
        danger: 'Utilisation de couteaux de parage',
        situation_dangereuse: 'Découpe manuelle de produits',
        evenement_dangereux: 'Coupure main/doigt',
        dommage: 'Plaie, section de tendon',
        gravite: 3,
        probabilite: 3,
        duree_exposition: null,
        mesures_techniques_modele:
          'Gants anti-coupures, affûtage régulier, formation geste',
      },
      {
        // ED840 #12 — Risques liés aux ambiances thermiques
        numero_risque_ed840: 12,
        type_risque: 'chronique',
        danger: 'Travail en chambre froide',
        situation_dangereuse: 'Exposition prolongée à 4 °C',
        evenement_dangereux: 'Hypothermie, engelures',
        dommage: 'Affections dues au froid',
        gravite: 3,
        probabilite: null,
        duree_exposition: 2,
        mesures_techniques_modele:
          'EPI thermiques, rotation, boisson chaude accessible',
      },
      {
        // ED840 #8 — Risques liés aux agents biologiques
        numero_risque_ed840: 8,
        type_risque: 'chronique',
        danger: 'Contact avec produits alimentaires crus',
        situation_dangereuse: 'Manipulation viande / volaille fraîche',
        evenement_dangereux: 'Contamination cutanée ou digestive',
        dommage: 'Infection (salmonelle, listeria)',
        gravite: 3,
        probabilite: null,
        duree_exposition: 3,
        mesures_techniques_modele:
          'Hygiène stricte, gants, vestiaires séparés',
      },
      {
        // ED840 #5 — Postures contraignantes (charge physique)
        numero_risque_ed840: 5,
        type_risque: 'chronique',
        danger: 'Posture debout prolongée',
        situation_dangereuse: '8 h debout sur ligne de production',
        evenement_dangereux: 'Fatigue, TMS membre inférieur',
        dommage: 'Insuffisance veineuse, TMS',
        gravite: 2,
        probabilite: null,
        duree_exposition: 4,
        mesures_techniques_modele:
          'Tapis anti-fatigue, rotation, sièges debout',
      },
    ],
  },

  // ─── Template 2 : Chauffeur-livreur poids lourd ───────────────────────────
  {
    code: 'chauffeur_livreur_pl',
    nom: 'Chauffeur-livreur poids lourd',
    description: 'Conduite longue distance, livraisons, manutention.',
    icone: '🚚',
    risques: [
      {
        // ED840 #4 — Risques routiers en mission
        numero_risque_ed840: 4,
        type_risque: 'aigu',
        danger: 'Conduite sur route / autoroute',
        situation_dangereuse: 'Longs trajets, fatigue',
        evenement_dangereux: 'Accident de la circulation',
        dommage: 'Traumatisme, décès',
        gravite: 5,
        probabilite: 2,
        duree_exposition: null,
        mesures_techniques_modele:
          'Pauses régulières, limitateur de vitesse, formation ECO-conduite',
      },
      {
        // ED840 #5 — Charge physique (manutention)
        numero_risque_ed840: 5,
        type_risque: 'chronique',
        danger: 'Manutention de colis lourds',
        situation_dangereuse: 'Chargement / déchargement multiples par jour',
        evenement_dangereux: 'Lombalgie',
        dommage: 'TMS rachis',
        gravite: 3,
        probabilite: null,
        duree_exposition: 4,
        mesures_techniques_modele:
          'Transpalette électrique, hayon, formation gestes et postures',
      },
      {
        // ED840 #1 — Chute de plain-pied (sortie cabine)
        numero_risque_ed840: 1,
        type_risque: 'aigu',
        danger: 'Sortie / entrée cabine camion',
        situation_dangereuse: 'Descente sans utiliser les marches',
        evenement_dangereux: 'Chute',
        dommage: 'Entorse, fracture',
        gravite: 3,
        probabilite: 3,
        duree_exposition: null,
        mesures_techniques_modele:
          'Marchepieds propres, formation "3 points de contact"',
      },
      {
        // ED840 #5 — Posture assise prolongée (charge physique)
        numero_risque_ed840: 5,
        type_risque: 'chronique',
        danger: 'Posture assise prolongée',
        situation_dangereuse: '> 6 h / jour au volant',
        evenement_dangereux: 'TMS dos, jambes',
        dommage: 'Lombalgie chronique',
        gravite: 3,
        probabilite: null,
        duree_exposition: 4,
        mesures_techniques_modele:
          'Siège ergonomique, pauses marche',
      },
      {
        // ED840 #17 — Risques psychosociaux (RPS)
        numero_risque_ed840: 17,
        type_risque: 'chronique',
        danger: 'Stress délais de livraison',
        situation_dangereuse: 'Contraintes temporelles fortes',
        evenement_dangereux: 'Épuisement',
        dommage: 'Trouble anxio-dépressif',
        gravite: 3,
        probabilite: null,
        duree_exposition: 3,
        mesures_techniques_modele:
          'Planning réaliste, écoute RH, formation gestion du stress',
      },
    ],
  },

  // ─── Template 3 : Agent administratif / bureau ────────────────────────────
  {
    code: 'agent_bureau',
    nom: 'Agent administratif / bureau',
    description: 'Poste sédentaire sur écran.',
    icone: '💼',
    risques: [
      {
        // ED840 #5 — Charge physique (travail sur écran)
        numero_risque_ed840: 5,
        type_risque: 'chronique',
        danger: 'Travail prolongé sur écran',
        situation_dangereuse: 'Posture statique > 7 h / jour',
        evenement_dangereux: 'Douleurs cou / épaules / poignet',
        dommage: 'TMS membres supérieurs, cervicalgie',
        gravite: 2,
        probabilite: null,
        duree_exposition: 4,
        mesures_techniques_modele:
          'Fauteuil ergonomique, écran à hauteur des yeux, pauses 20-20-20',
      },
      {
        // ED840 #17 — Risques psychosociaux (RPS)
        numero_risque_ed840: 17,
        type_risque: 'chronique',
        danger: 'Charge mentale / pression temps',
        situation_dangereuse: 'Multiplicité de tâches, interruptions',
        evenement_dangereux: 'Stress chronique',
        dommage: 'Burn-out, troubles du sommeil',
        gravite: 3,
        probabilite: null,
        duree_exposition: 3,
        mesures_techniques_modele:
          'Gestion du temps, régulation charge, droit à la déconnexion',
      },
      {
        // ED840 #4 — Risques routiers en mission (trajet)
        numero_risque_ed840: 4,
        type_risque: 'aigu',
        danger: 'Trajet domicile-travail',
        situation_dangereuse: 'Conduite quotidienne',
        evenement_dangereux: 'Accident de trajet',
        dommage: 'Traumatisme',
        gravite: 4,
        probabilite: 2,
        duree_exposition: null,
        mesures_techniques_modele:
          'Covoiturage, transports en commun, sensibilisation',
      },
      {
        // ED840 #1 — Chute de plain-pied
        numero_risque_ed840: 1,
        type_risque: 'aigu',
        danger: 'Câbles au sol dans le bureau',
        situation_dangereuse: 'Passage fréquent entre postes',
        evenement_dangereux: 'Chute de plain-pied',
        dommage: 'Entorse, contusion',
        gravite: 2,
        probabilite: 2,
        duree_exposition: null,
        mesures_techniques_modele:
          'Gaine-câbles, rangement',
      },
    ],
  },
]

// Lookup utilitaire par code
export const TEMPLATE_METIER_PAR_CODE: Record<string, TemplateMetier> = Object.fromEntries(
  TEMPLATES_METIER.map((t) => [t.code, t])
)
