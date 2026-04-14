# Phase 2B — Modules M02 à M05 (Vibrations, TMS, Charge physique, RPS)

## Contexte

L'application est en ligne avec Stripe (Phases 1A-2A). Le module Bruit (M01) est fonctionnel.
On active maintenant les 4 autres modules actifs : Vibrations, TMS, Charge physique, RPS.

**Important** : cette phase se fait en 4 sous-phases distinctes, un module à la fois. Ne pas implémenter les 4 en une seule session — tu perdrais en qualité. Chaque module suit le même pattern que le module Bruit déjà codé.

## Pattern à suivre (déjà en place pour M01)

Pour chaque module, la structure existe déjà :
1. Présélection : questions dans `src/lib/constants/preselection.ts` (déjà codé pour les 9 modules)
2. Constantes métier : fichier `src/lib/constants/[module].ts` (à créer)
3. Composant wizard : `src/app/dashboard/postes/[id]/operations/[opId]/risques/evaluation/module-[module].tsx` (à créer)
4. Routage : existe déjà dans `risques/[module]/page.tsx`

Il suffit de dupliquer le pattern du module Bruit pour chaque nouveau module, en adaptant la grille d'évaluation selon le fichier METHODE correspondant.

---

## Phase 2B-1 — Module Vibrations (M02)

### Fichier de référence à lire OBLIGATOIREMENT

`DUERP/03_MODULES_RISQUES/02_VIBRATIONS/VIBRATIONS_METHODE.txt`

### Ce que tu dois faire

1. Créer `src/lib/constants/vibrations.ts` avec :
   - Les 2 types de vibrations : main-bras (MB) et corps-entier (CE)
   - Les listes d'outils/machines avec leurs valeurs d'émission (extraites de la méthode OSEV INRS)
   - Les seuils légaux (valeur d'exposition journalière A(8))
   - La logique de calcul d'exposition

2. Créer le composant wizard `evaluation/module-vibrations.tsx` :
   - Étape 1 : type de vibration (MB ou CE)
   - Étape 2 : sélection de l'outil/machine utilisé
   - Étape 3 : durée d'exposition quotidienne
   - Étape 4 : Plan de Maîtrise (mesures T.H.O. + EPI spécifiques aux vibrations)
   - Étape 5 : récapitulatif + sauvegarde

3. Adapter la page de routage et le module-card pour activer M02

---

## Phase 2B-2 — Module TMS (M03)

### Fichier de référence à lire OBLIGATOIREMENT

`DUERP/03_MODULES_RISQUES/03_TMS/TMS_METHODE.txt`

### Ce que tu dois faire

1. Créer `src/lib/constants/tms.ts` avec :
   - Les 6 facteurs de risque TMS
   - La grille de dépistage (méthode TMS PRO / CARSAT)
   - Les seuils de criticité selon le nombre de facteurs présents

2. Créer `evaluation/module-tms.tsx` :
   - Étape 1 : zones corporelles concernées
   - Étape 2 : évaluation des 6 facteurs (répétition, force, posture, durée, etc.)
   - Étape 3 : Plan de Maîtrise adapté aux TMS
   - Étape 4 : récapitulatif + sauvegarde

---

## Phase 2B-3 — Module Charge Physique (M04)

### Fichier de référence à lire OBLIGATOIREMENT

`DUERP/03_MODULES_RISQUES/04_CHARGE_PHYSIQUE/CHARGE_PHYSIQUE_METHODE.txt`

### Ce que tu dois faire

1. Créer `src/lib/constants/charge-physique.ts` avec :
   - Les 5 indicateurs de la méthode INRS ED 6161 :
     1. Manutention manuelle de charges
     2. Port de charges lourdes
     3. Poussées et tractions
     4. Effort physique global
     5. Gestes et postures contraignants
   - Les échelles 0 / + / ++ / +++ pour chaque indicateur
   - L'échelle de Borg pour l'effort physique ressenti

2. Créer `evaluation/module-charge-physique.tsx` :
   - Étape 1 : sélection des indicateurs pertinents
   - Étape 2 : évaluation de chaque indicateur sélectionné (0 / + / ++ / +++)
   - Étape 3 : Plan de Maîtrise
   - Étape 4 : récapitulatif + sauvegarde

---

## Phase 2B-4 — Module RPS (M05)

### Fichier de référence à lire OBLIGATOIREMENT

`DUERP/03_MODULES_RISQUES/05_RPS/RPS_METHODE.txt`

### Ce que tu dois faire

1. Créer `src/lib/constants/rps.ts` avec :
   - Les 6 axes Gollac
   - La grille RPS-DU INRS (questionnaire simplifié)
   - Les seuils de criticité

2. Créer `evaluation/module-rps.tsx` :
   - Étape 1 : sélection des axes Gollac pertinents
   - Étape 2 : évaluation axe par axe
   - Étape 3 : Plan de Maîtrise (mesures organisationnelles prioritaires)
   - Étape 4 : récapitulatif + sauvegarde

**Attention** : les RPS sont souvent transversaux. Encourage l'utilisateur à utiliser l'opération "Toutes opérations" pour les RPS organisationnels.

---

## À la fin de la Phase 2B complète

Les 5 modules actifs (M01-M05) sont tous fonctionnels de bout en bout. Le tableau APR affiche désormais des évaluations de tous types. Le PDF inclut automatiquement toutes les évaluations.

## Méthode de travail recommandée

Pour chaque sous-phase (2B-1 à 2B-4) :
1. Lance une nouvelle session Claude Code
2. Colle UNIQUEMENT le bloc de la sous-phase concernée
3. Valide que le module fonctionne en local
4. Commit + push → Vercel redéploie automatiquement
5. Teste en production
6. Passe à la sous-phase suivante
