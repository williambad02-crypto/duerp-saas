# Phase REVISION — Refonte de la vue Évaluation des Risques (Module 5 APR/EVR)

## Contexte

L'implémentation actuelle des phases 1C/1D a dévié de la vision initiale décrite dans `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` (Module 5 — APR/EVR).

**Ce qui existe actuellement :**
- Une liste de 9 modules par opération
- Un seul parcours fonctionnel : présélection + module Bruit
- Pas de vue tableau APR
- Pas de dropdown des 20 risques ED840
- Aucune gestion des risques AIGUS
- Pas de colonnes Danger / Situation dangereuse / Événement dangereux / Dommage / Siège des lésions

**Ce qu'il faut construire :**
Une vue tableau APR complète qui devient l'interface principale d'évaluation par opération. Les modules normés (Bruit, Vibrations, TMS...) deviennent des sous-outils déclenchés depuis le tableau, pas l'interface principale.

## Fichiers de référence à lire OBLIGATOIREMENT

1. `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` — Section "MODULE 5 — APR / EVR" — spec complète de la vue tableau
2. `DUERP/01_FONDATIONS/ED840_SYNTHESE.txt` — liste des 20 risques ED840 avec type (AIGU / CHRONIQUE / LES DEUX) et module associé
3. `DUERP/02_METHODOLOGIE/DEFINITIONS_RISQUES.txt` — glossaire (Danger, Situation dangereuse, Événement dangereux, Dommage, Siège des lésions)
4. `DUERP/01_FONDATIONS/COTATION.txt` — cotation G×P pour AIGU, G×DE pour CHRONIQUE APR standard

Lis ces fichiers EN ENTIER avant de commencer. Le contenu de ces fichiers EST la spécification.

## Ce qu'il faut construire

### 1. Constantes : liste des 20 risques ED840

Crée `src/lib/constants/ed840.ts` avec les 20 risques, extraits de `ED840_SYNTHESE.txt` :

```typescript
export type TypeRisqueED840 = 'AIGU' | 'CHRONIQUE' | 'LES_DEUX'
export type ModuleAssocie = 'APR' | 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'M06' | 'M07' | 'M08' | 'M09'

export interface RisqueED840 {
  numero: number          // 1 à 20
  intitule: string
  type: TypeRisqueED840
  module: ModuleAssocie
  description: string
}

export const RISQUES_ED840: RisqueED840[] = [
  { numero: 1, intitule: 'Risques de chute de plain-pied', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 2, intitule: 'Risques de chute de hauteur', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 3, intitule: 'Risques liés aux circulations internes', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 4, intitule: 'Risques routiers en mission', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 5, intitule: 'Risques liés à la charge physique de travail', type: 'CHRONIQUE', module: 'M04', description: '...' },
  { numero: 6, intitule: 'Risques liés à la manutention mécanique', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 7, intitule: 'Risques liés aux produits chimiques', type: 'LES_DEUX', module: 'M06', description: '...' },
  { numero: 8, intitule: 'Risques liés aux agents biologiques', type: 'CHRONIQUE', module: 'M07', description: '...' },
  { numero: 9, intitule: 'Risques liés aux équipements de travail', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 10, intitule: 'Risques liés aux effondrements/chutes d\'objets', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 11, intitule: 'Risques et nuisances liés au bruit', type: 'LES_DEUX', module: 'M01', description: '...' },
  { numero: 12, intitule: 'Risques liés aux ambiances thermiques', type: 'LES_DEUX', module: 'M08', description: '...' },
  { numero: 13, intitule: 'Risques d\'incendie et d\'explosion (ATEX)', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 14, intitule: 'Risques liés à l\'électricité', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 15, intitule: 'Risques liés aux ambiances lumineuses', type: 'CHRONIQUE', module: 'APR', description: '...' },
  { numero: 16, intitule: 'Risques liés aux rayonnements', type: 'CHRONIQUE', module: 'M09', description: '...' },
  { numero: 17, intitule: 'Risques psychosociaux', type: 'CHRONIQUE', module: 'M05', description: '...' },
  { numero: 18, intitule: 'Risques liés aux vibrations', type: 'CHRONIQUE', module: 'M02', description: '...' },
  { numero: 19, intitule: 'Risques de heurt, de cognement', type: 'AIGU', module: 'APR', description: '...' },
  { numero: 20, intitule: 'Risques liés aux pratiques addictives', type: 'CHRONIQUE', module: 'M05', description: '...' },
]
```

La description de chaque risque provient des fiches détaillées de `ED840_SYNTHESE.txt`.

### 2. Schéma DB : étendre la table `evaluations`

Crée une migration `supabase/migrations/004_apr_extension.sql` :

```sql
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS numero_risque_ed840 INTEGER;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS danger TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS situation_dangereuse TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS evenement_dangereux TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS dommage TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS siege_lesions TEXT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS gravite SMALLINT CHECK (gravite BETWEEN 1 AND 5);
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS probabilite SMALLINT CHECK (probabilite BETWEEN 1 AND 4);
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS duree_exposition SMALLINT CHECK (duree_exposition BETWEEN 1 AND 4);
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS criticite_brute SMALLINT;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS identifiant_auto TEXT;
```

### 3. Vue Tableau APR — nouvelle page principale

Remplace la page actuelle `/dashboard/postes/[id]/operations/[opId]/risques` par un tableau APR complet.

**Route** : `/dashboard/postes/[id]/operations/[opId]`

**Affichage par défaut** : un tableau initialement vide avec un bouton "Ajouter un risque" en haut.

**Colonnes du tableau :**

| # | Colonne | Contenu |
|---|---|---|
| 1 | ID | Auto (UT01-R001, UT01-R002...) |
| 2 | Danger | Texte libre ("Ce qui peut blesser") |
| 3 | Situation dangereuse | Texte libre ("Ce que fait l'opérateur") |
| 4 | Risque | Dropdown 20 risques ED840 |
| 5 | Type | AIGU / CHRONIQUE (auto selon le risque, modifiable si "LES_DEUX") |
| 6 | Événement dangereux | Texte libre (affiché uniquement si AIGU) |
| 7 | Dommage | Texte libre |
| 8 | Siège des lésions | Texte libre |
| 9 | G | 1-5 (dropdown) |
| 10 | P ou DE | 1-4 (dropdown, P si AIGU, DE si CHRONIQUE APR) |
| 11 | Criticité brute | Auto (G × P ou G × DE) |
| 12 | Présélection | Bouton "Évaluer" (affiché uniquement si module dédié disponible) |
| 13 | T.H.O. / EPI | Icônes ou texte court |
| 14 | PM | Dropdown (0.0 / 0.25 / 0.5 / 0.75 / 1.0) |
| 15 | Criticité résiduelle | Auto (Crit brute × PM) avec couleur |
| 16 | Actions | Boutons Éditer / Supprimer |

**Code couleur** : vert 1-4 / jaune 5-9 / orange 10-14 / rouge 15-20.

### 4. Formulaire d'ajout de ligne APR

Formulaire guidé en 5 étapes :

**Étape 1 — Identification du risque :**
- Dropdown des 20 risques ED840
- Auto-détermination du type selon la fiche ED840

**Étape 2 — Contexte :**
- Danger, Situation dangereuse, Dommage, Siège des lésions (tous obligatoires)
- Si AIGU : Événement dangereux (obligatoire)

**Étape 3 — Cotation :**
- Si AIGU ou CHRONIQUE APR standard : cotation inline G×P ou G×DE
- Si CHRONIQUE avec module dédié :
  - Bouton "Évaluation sommaire" → 3 questions OUI/NON
  - Si 0 OUI → criticité 1 automatique
  - Si 1+ OUI → bouton "Évaluation détaillée (méthode INRS)" qui ouvre le module normé

**Étape 4 — Plan de Maîtrise :**
- 4 champs texte T / H / O / EPI
- Dropdown PM (0.0 / 0.25 / 0.5 / 0.75 / 1.0)
- Criticité résiduelle calculée en temps réel

**Étape 5 — Validation :**
- Récapitulatif + Enregistrer → insert dans `evaluations`
- ID auto généré : UT{numero_poste}-R{numero_risque_dans_poste}

### 5. Modifier les modules normés existants

Le module Bruit (et futurs M02-M05) doit renvoyer la criticité vers le formulaire APR qui l'a appelé, au lieu d'enregistrer une évaluation complète.

### 6. Adaptation du tableau de synthèse `/dashboard/apr`

Affiche toutes les colonnes du modèle APR complet.

### 7. Adaptation du PDF

Doit afficher le tableau complet par poste. Format paysage possible pour améliorer la lisibilité.

## C'est fini quand

- [ ] La page d'une opération affiche un tableau APR vide avec bouton "Ajouter un risque"
- [ ] Le dropdown des 20 risques ED840 fonctionne, avec auto-détection du type
- [ ] On peut ajouter un risque AIGU avec cotation G×P inline
- [ ] On peut ajouter un risque CHRONIQUE APR standard avec cotation G×DE inline
- [ ] On peut ajouter un risque CHRONIQUE avec module dédié : présélection puis module Bruit si déclenché
- [ ] Les colonnes Danger / Situation dangereuse / Événement dangereux / Dommage / Siège des lésions sont saisissables
- [ ] La criticité brute et résiduelle s'affichent avec les bonnes couleurs
- [ ] Le tableau APR de synthèse affiche toutes les colonnes
- [ ] Le PDF exporte le tableau complet
- [ ] La migration SQL a bien été appliquée en base

## Méthode de travail recommandée

**Session 1 :** Migration SQL + constantes ed840.ts + nouvelle page tableau APR (vide) + dropdown ED840 + formulaire pour AIGUS
**Session 2 :** Formulaire pour CHRONIQUES APR standard + connexion module Bruit + adaptation tableau synthèse et PDF
