# Phase 1C — Présélection des risques + Module Bruit complet

## Contexte

L'entreprise, les postes et les opérations sont en place (Phase 1A + 1B).
On implémente maintenant le cœur métier : la présélection des risques et le premier module d'évaluation complet (Bruit).

## Fichiers de référence à lire OBLIGATOIREMENT

1. `DUERP/02_METHODOLOGIE/STANDARD_PRESELECTION.txt` — règles de présélection et questions par module
2. `DUERP/03_MODULES_RISQUES/01_BRUIT/BRUIT_METHODE.txt` — méthode complète du module Bruit
3. `DUERP/01_FONDATIONS/COTATION.txt` — système de cotation et Plan de Maîtrise

Lis ces fichiers EN ENTIER avant de coder. Le contenu de ces fichiers EST la spécification.

## Ce que tu dois faire

### 1. Écran de présélection — `/dashboard/postes/[id]/operations/[opId]/risques`

Quand l'utilisateur clique "Évaluer les risques" sur une opération, afficher les 9 modules sous forme de cards :

**Pour les 5 modules actifs (M01-M05)** :
- Icône + nom du module
- Statut : "Non évalué" / "Non applicable (criticité 1)" / "Évalué (criticité X)"
- Badge couleur selon la criticité si évalué
- Bouton "Évaluer" → ouvre les 3 questions de présélection

**Pour les 4 modules "Coming soon" (M06-M09)** :
- Card grisée avec mention "Disponible prochainement"
- Non cliquable

### 2. Composant de présélection (3 questions OUI/NON)

Quand l'utilisateur clique "Évaluer" sur un module actif :

- Afficher le nom du module en titre
- Afficher les 3 questions du module (source : `STANDARD_PRESELECTION.txt`)
- Chaque question a un toggle OUI/NON (défaut : NON)
- Bouton "Valider la présélection"

**Logique après validation :**

- **0 OUI** → Enregistrer criticité = 1 en base avec motif "Présélection négative". Afficher un message : "Ce risque ne semble pas présent sur cette opération. Criticité 1 enregistrée. Vous pouvez revenir modifier ce choix à tout moment." Retour à la liste des modules.
- **1+ OUI** → Rediriger vers le module d'évaluation complet

Les questions de présélection sont stockées dans des constantes TypeScript (fichier `src/lib/constants/preselection.ts`), extraites mot pour mot de `STANDARD_PRESELECTION.txt`.

### 3. Module Bruit complet (M01)

C'est le module le plus important de cette phase. Lis `BRUIT_METHODE.txt` EN ENTIER.

Implémente l'évaluation en suivant la structure du fichier METHODE :

**Étape 1 — Estimation sommaire (Niveau 0)**

L'utilisateur répond à 3 questions d'estimation rapide basées sur la section "ESTIMATION SOMMAIRE" de BRUIT_METHODE.txt. L'objectif est d'orienter vers le bon niveau de précision.

**Étape 2 — Grille d'évaluation**

Selon les réponses, afficher la grille appropriée :
- Estimation du niveau d'exposition basée sur le type d'activité/machine
- Sélection de la durée d'exposition quotidienne
- Calcul automatique de la criticité selon la table du fichier METHODE

**Étape 3 — Plan de Maîtrise**

- Liste des mesures de prévention existantes classées en T.H.O. + EPI :
  - T (Technique) : capotage, isolation, matériaux absorbants...
  - H (Humain) : rotation, limitation durée d'exposition...
  - O (Organisationnel) : procédures, signalétique, zones délimitées...
  - EPI : bouchons, casques anti-bruit...
- L'utilisateur coche les mesures existantes
- Coefficient PM calculé automatiquement selon l'échelle :
  - 1.0 = aucune mesure
  - 0.75 = EPI seuls ou mesures partielles
  - 0.50 = protections collectives + EPI
  - 0.25 = protections collectives robustes + procédures + formation
  - 0.0 = risque totalement supprimé
- Criticité résiduelle = criticité brute × PM (affichée en temps réel avec couleur)

**Étape 4 — Récapitulatif**

Afficher un résumé de l'évaluation :
- Criticité brute (avec couleur)
- Mesures existantes listées
- Coefficient PM
- Criticité résiduelle (avec couleur)
- Bouton "Enregistrer" → sauvegarde en base → retour à la liste des modules

### 4. Constantes métier

Crée un fichier `src/lib/constants/modules.ts` avec :

```typescript
// Liste des modules avec leur statut
// transversal : true = toujours transversal, 'partiel' = selon contexte, false = jamais
export const MODULES_RISQUES = [
  { code: 'M01', nom: 'Bruit', actif: true, transversal: true as const },
  { code: 'M02', nom: 'Vibrations', actif: true, transversal: false as const },
  { code: 'M03', nom: 'TMS', actif: true, transversal: 'partiel' as const },
  { code: 'M04', nom: 'Charge physique', actif: true, transversal: false as const },
  { code: 'M05', nom: 'RPS', actif: true, transversal: true as const },
  { code: 'M06', nom: 'Chimique / CMR', actif: false, transversal: false as const },
  { code: 'M07', nom: 'Biologique', actif: false, transversal: 'partiel' as const },
  { code: 'M08', nom: 'Thermique', actif: false, transversal: true as const },
  { code: 'M09', nom: 'Rayonnements', actif: false, transversal: false as const },
] as const
```

Et un fichier `src/lib/constants/cotation.ts` avec les échelles extraites de `COTATION.txt` :

```typescript
// Échelle de gravité (risques aigus) — source : COTATION.txt
export const ECHELLE_GRAVITE = [
  { valeur: 1, label: 'Accident sans soin' },
  { valeur: 2, label: 'Accident avec soin, sans incapacité' },
  { valeur: 3, label: 'Accident avec incapacité partielle (temporaire)' },
  { valeur: 4, label: 'Accident avec incapacité permanente / Maladie professionnelle' },
  { valeur: 5, label: 'Décès' },
] as const

// Échelle de probabilité — source : COTATION.txt
export const ECHELLE_PROBABILITE = [
  { valeur: 1, label: 'Improbable — n\'est jamais arrivé' },
  { valeur: 2, label: 'Probable — peut arriver' },
  { valeur: 3, label: 'Certain — arrive parfois, précédents existent' },
  { valeur: 4, label: 'Fatal — arrive régulièrement' },
] as const

// Zones de criticité — source : COTATION.txt
export const ZONES_CRITICITE = [
  { min: 1, max: 4, niveau: 'faible', couleur: 'green', label: 'Risque acceptable' },
  { min: 5, max: 9, niveau: 'modere', couleur: 'yellow', label: 'Actions à planifier' },
  { min: 10, max: 14, niveau: 'eleve', couleur: 'orange', label: 'Actions prioritaires' },
  { min: 15, max: 20, niveau: 'critique', couleur: 'red', label: 'Actions immédiates' },
] as const

// Échelle du Plan de Maîtrise — source : COTATION.txt
export const ECHELLE_PM = [
  { valeur: 1.0, label: 'Aucune protection en place' },
  { valeur: 0.75, label: 'EPI seuls ou mesures partielles' },
  { valeur: 0.50, label: 'Protections collectives + EPI' },
  { valeur: 0.25, label: 'Protections collectives robustes + procédures + formation' },
  { valeur: 0.0, label: 'Risque totalement supprimé' },
] as const
```

## C'est fini quand

- [ ] L'écran de présélection affiche les 9 modules (5 actifs, 4 grisés)
- [ ] Les 3 questions OUI/NON s'affichent correctement pour chaque module actif
- [ ] 0 OUI → criticité 1 enregistrée automatiquement
- [ ] 1+ OUI → module complet déclenché
- [ ] Le module Bruit complet fonctionne de bout en bout (estimation → grille → PM → sauvegarde)
- [ ] La criticité résiduelle se calcule en temps réel
- [ ] Les codes couleur correspondent aux zones de COTATION.txt (vert 1-4 / jaune 5-9 / orange 10-14 / rouge 15-20)
- [ ] Les données sont enregistrées en base et persistent après rechargement
- [ ] L'UX est fluide sur tablette
