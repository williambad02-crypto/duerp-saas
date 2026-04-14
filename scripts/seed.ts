/**
 * Script de seed — données de démonstration pour DUERP SaaS
 *
 * Prérequis :
 *   1. Copier .env.local.example → .env.local avec vos clés Supabase
 *   2. Créer manuellement un utilisateur de test dans Supabase Auth Dashboard
 *      (email: demo@duerp.fr, mot de passe: DemoPass123!)
 *   3. Récupérer son UUID depuis Supabase Auth
 *   4. Définir USER_ID_TEST ci-dessous
 *
 * Exécution :
 *   npx tsx scripts/seed.ts
 *
 * Ce script utilise la service role key (bypass RLS) — à ne jamais exposer en production.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis')
  process.exit(1)
}

// ── À REMPLACER : UUID de l'utilisateur de test ────────────────────────────
// Récupérable dans Supabase Auth Dashboard > Users
const USER_ID_TEST = process.env.SEED_USER_ID ?? 'REMPLACEZ_PAR_UUID_UTILISATEUR'

if (USER_ID_TEST === 'REMPLACEZ_PAR_UUID_UTILISATEUR') {
  console.error('❌ Définissez SEED_USER_ID dans .env.local ou remplacez la constante dans ce script')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('🌱 Démarrage du seed...\n')

  // ── 1. Entreprise ──────────────────────────────────────────────────────────
  console.log('📋 Création de l\'entreprise...')

  // Supprimer les données existantes pour cet utilisateur (idempotent)
  await supabase.from('entreprises').delete().eq('user_id', USER_ID_TEST)

  const { data: entreprise, error: errEntreprise } = await supabase
    .from('entreprises')
    .insert({
      user_id: USER_ID_TEST,
      nom: 'Menuiserie Dupont & Fils',
      siret: '12345678901234',
      secteur_activite: 'Industrie du bois et de l\'ameublement',
      effectif: 24,
      adresse: '15 rue de l\'Artisanat',
      code_postal: '69003',
      ville: 'Lyon',
    })
    .select('id')
    .single()

  if (errEntreprise || !entreprise) {
    console.error('❌ Erreur entreprise :', errEntreprise)
    process.exit(1)
  }

  console.log(`   ✅ Entreprise : ${entreprise.id}`)

  // ── 2. Postes ──────────────────────────────────────────────────────────────
  console.log('👷 Création des postes...')

  const { data: postes, error: errPostes } = await supabase
    .from('postes')
    .insert([
      {
        entreprise_id: entreprise.id,
        nom: 'Menuisier',
        description: 'Fabrication et pose de menuiseries bois, utilisation machines-outils',
        ordre: 0,
      },
      {
        entreprise_id: entreprise.id,
        nom: 'Cariste',
        description: 'Manutention et stockage des matériaux, conduite chariot élévateur',
        ordre: 1,
      },
      {
        entreprise_id: entreprise.id,
        nom: 'Secrétaire administrative',
        description: 'Gestion administrative, accueil téléphonique, travail sur écran',
        ordre: 2,
      },
    ])
    .select('id, nom')

  if (errPostes || !postes) {
    console.error('❌ Erreur postes :', errPostes)
    process.exit(1)
  }

  const posteMenuisier = postes[0]
  const posteCariste = postes[1]
  const posteSecretaire = postes[2]
  console.log(`   ✅ ${postes.length} postes créés`)

  // ── 3. Opérations ──────────────────────────────────────────────────────────
  console.log('⚙️  Création des opérations...')

  const { data: operations, error: errOps } = await supabase
    .from('operations')
    .insert([
      // Menuisier
      {
        poste_id: posteMenuisier.id,
        nom: 'Scie sur table',
        description: 'Découpe longitudinale et transversale sur scie à table',
        est_transversale: false,
        ordre: 0,
      },
      {
        poste_id: posteMenuisier.id,
        nom: 'Dégauchissage / Rabotage',
        description: 'Mise à dimension et dressage des pièces sur dégauchisseuse',
        est_transversale: false,
        ordre: 1,
      },
      {
        poste_id: posteMenuisier.id,
        nom: 'Meulage / Ponçage',
        description: 'Finition de surface — ponceuse orbitale et meuleuse d\'angle',
        est_transversale: false,
        ordre: 2,
      },
      {
        poste_id: posteMenuisier.id,
        nom: 'Toutes opérations',
        description: 'Risques transversaux au poste Menuisier',
        est_transversale: true,
        ordre: 99,
      },
      // Cariste
      {
        poste_id: posteCariste.id,
        nom: 'Conduite chariot élévateur',
        description: 'Déplacement et stockage de palettes en entrepôt',
        est_transversale: false,
        ordre: 0,
      },
      {
        poste_id: posteCariste.id,
        nom: 'Chargement / Déchargement',
        description: 'Opérations de chargement camions, présence zone de circulation',
        est_transversale: false,
        ordre: 1,
      },
      // Secrétaire
      {
        poste_id: posteSecretaire.id,
        nom: 'Travail sur écran',
        description: 'Saisie, traitement de fichiers, appels téléphoniques',
        est_transversale: false,
        ordre: 0,
      },
    ])
    .select('id, nom, poste_id')

  if (errOps || !operations) {
    console.error('❌ Erreur opérations :', errOps)
    process.exit(1)
  }

  const opScie = operations[0]
  const opDegauchi = operations[1]
  const opMeulage = operations[2]
  const opTransversale = operations[3]
  const opConduite = operations[4]
  console.log(`   ✅ ${operations.length} opérations créées`)

  // ── 4. Présélections ───────────────────────────────────────────────────────
  console.log('❓ Création des présélections...')

  const { error: errPresel } = await supabase.from('preselections').insert([
    // Scie — bruit POSITIF (1+ OUI)
    {
      operation_id: opScie.id,
      code_module: 'M01_BRUIT',
      question_1: true,
      question_2: true,
      question_3: true,
      module_actif: true,
    },
    // Dégauchissage — bruit POSITIF
    {
      operation_id: opDegauchi.id,
      code_module: 'M01_BRUIT',
      question_1: true,
      question_2: false,
      question_3: true,
      module_actif: true,
    },
    // Transversale — bruit POSITIF (bruit ambiant atelier)
    {
      operation_id: opTransversale.id,
      code_module: 'M01_BRUIT',
      question_1: true,
      question_2: false,
      question_3: true,
      module_actif: true,
    },
    // Meulage — bruit NEGATIF (présélection négative)
    {
      operation_id: opMeulage.id,
      code_module: 'M01_BRUIT',
      question_1: false,
      question_2: false,
      question_3: true,
      module_actif: true,
    },
    // Conduite chariot — bruit NEGATIF (0 OUI)
    {
      operation_id: opConduite.id,
      code_module: 'M01_BRUIT',
      question_1: false,
      question_2: false,
      question_3: false,
      module_actif: false,
    },
  ])

  if (errPresel) {
    console.error('❌ Erreur présélections :', errPresel)
    process.exit(1)
  }

  console.log('   ✅ Présélections créées')

  // ── 5. Évaluations + Plans de maîtrise ────────────────────────────────────
  console.log('📊 Création des évaluations bruit...')

  // Évaluation 1 : Scie sur table — 95 dB(A) × 4h = 510 points → criticité 16 (rouge)
  const { data: eval1, error: errEval1 } = await supabase
    .from('evaluations')
    .insert({
      operation_id: opScie.id,
      code_module: 'M01_BRUIT',
      type_risque: 'chronique',
      statut: 'termine',
      criticite_brute: 16,
      donnees_module: {
        niveau_estimation: 1,
        niveau_db: 95,
        duree_exposition: '4h',
        total_points: 510,
        mesures: {
          techniques: [],
          organisationnelles: ['rotation_postes'],
          humaines: ['formation_risque'],
          epi: ['bouchons_jetables'],
          risque_supprime: false,
        },
      },
    })
    .select('id')
    .single()

  if (errEval1 || !eval1) {
    console.error('❌ Erreur eval1 :', errEval1)
    process.exit(1)
  }

  await supabase.from('plans_maitrise').insert({
    evaluation_id: eval1.id,
    mesures_techniques: null,
    mesures_humaines: 'formation_risque',
    mesures_organisationnelles: 'rotation_postes',
    mesures_epi: 'bouchons_jetables',
    coefficient_pm: 0.75,
    criticite_residuelle: 12,
  })

  // Évaluation 2 : Dégauchissage — 90 dB(A) × 2h = 80 points → criticité 8 (orange)
  const { data: eval2, error: errEval2 } = await supabase
    .from('evaluations')
    .insert({
      operation_id: opDegauchi.id,
      code_module: 'M01_BRUIT',
      type_risque: 'chronique',
      statut: 'termine',
      criticite_brute: 8,
      donnees_module: {
        niveau_estimation: 1,
        niveau_db: 90,
        duree_exposition: '2h',
        total_points: 80,
        mesures: {
          techniques: ['encoffrement'],
          organisationnelles: [],
          humaines: ['information_picb'],
          epi: ['bouchons_moules'],
          risque_supprime: false,
        },
      },
    })
    .select('id')
    .single()

  if (!errEval2 && eval2) {
    await supabase.from('plans_maitrise').insert({
      evaluation_id: eval2.id,
      mesures_techniques: 'encoffrement',
      mesures_humaines: 'information_picb',
      mesures_organisationnelles: null,
      mesures_epi: 'bouchons_moules',
      coefficient_pm: 0.5,
      criticite_residuelle: 4,
    })
  }

  // Évaluation 3 : Toutes opérations — niveau 1 estimation sommaire → criticité 4 (jaune)
  const { data: eval3, error: errEval3 } = await supabase
    .from('evaluations')
    .insert({
      operation_id: opTransversale.id,
      code_module: 'M01_BRUIT',
      type_risque: 'chronique',
      statut: 'termine',
      criticite_brute: 4,
      donnees_module: {
        niveau_estimation: 1,
        niveau_db: 82,
        duree_exposition: '8h',
        total_points: 50,
        mesures: {
          techniques: [],
          organisationnelles: ['planification'],
          humaines: [],
          epi: ['casques_antibruit'],
          risque_supprime: false,
        },
      },
    })
    .select('id')
    .single()

  if (!errEval3 && eval3) {
    await supabase.from('plans_maitrise').insert({
      evaluation_id: eval3.id,
      mesures_techniques: null,
      mesures_humaines: null,
      mesures_organisationnelles: 'planification',
      mesures_epi: 'casques_antibruit',
      coefficient_pm: 0.75,
      criticite_residuelle: 3,
    })
  }

  // Évaluation 4 : Conduite chariot — présélection 0 OUI → criticité 1 automatique
  await supabase.from('evaluations').insert({
    operation_id: opConduite.id,
    code_module: 'M01_BRUIT',
    type_risque: 'chronique',
    statut: 'termine',
    criticite_brute: 1,
    donnees_module: { module_ignore: true, raison: 'preselection_0_oui' },
  })

  console.log('   ✅ Évaluations et plans de maîtrise créés')

  console.log('\n✨ Seed terminé avec succès !')
  console.log('   Connectez-vous avec demo@duerp.fr pour voir les données.')
}

seed().catch((err) => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})
