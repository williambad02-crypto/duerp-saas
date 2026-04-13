# Phase 1D — Tableau APR de synthèse + Polish final

## Contexte

Les postes, opérations, présélection et module Bruit sont fonctionnels (Phases 1A-1C).
On termine la Phase 1 avec le tableau de synthèse et le polish global.

## Fichiers de référence

- `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` — Section "MODULE 5 — APR / EVR"
- `DUERP/01_FONDATIONS/COTATION.txt` — zones de criticité pour le code couleur

## Ce que tu dois faire

### 1. Tableau APR de synthèse — `/dashboard/apr`

Vue tableau récapitulatif de TOUTES les évaluations de l'entreprise.

**Colonnes du tableau :**

| Poste | Opération | Module | Criticité brute | Mesures PM | Coeff. PM | Criticité résiduelle |
|---|---|---|---|---|---|---|

**Fonctionnalités :**

- **Code couleur** sur les cellules de criticité :
  - Vert (1-4), Jaune (5-9), Orange (10-14), Rouge (15-20)
- **Tri** par colonne (par défaut : criticité résiduelle décroissante → les plus urgents en haut)
- **Filtres** :
  - Par poste (dropdown)
  - Par module de risque (dropdown)
  - Par zone de criticité (vert/jaune/orange/rouge)
- **Badge "Non applicable"** pour les présélections négatives (criticité 1 automatique)
- Clic sur une ligne → ouvre l'évaluation détaillée (lien vers le module)

**État vide** : si aucune évaluation, afficher :
> "Aucune évaluation réalisée. Commencez par créer des postes et évaluer les risques de chaque opération."

### 2. Dashboard — `/dashboard`

Améliore la page d'accueil du dashboard avec :

- **Compteurs** : nombre de postes, nombre d'opérations, nombre de risques évalués
- **Répartition des risques** : petit graphique ou badges montrant combien de risques sont vert/jaune/orange/rouge
- **Top 5 risques critiques** : les 5 évaluations avec la criticité résiduelle la plus élevée (avec lien vers l'évaluation)
- **Progression** : barre ou pourcentage montrant combien de couples (opération × module actif) ont été évalués vs le total possible

### 3. Polish UX global

Passe en revue TOUTE l'application et assure-toi que :

- **Loading states** : chaque page qui fetch des données affiche un skeleton ou spinner
- **Erreurs** : les erreurs Supabase sont catchées et affichées proprement (toast ou alert)
- **Confirmations de suppression** : modale de confirmation pour toute suppression (poste, opération, évaluation)
- **Navigation** : breadcrumbs sur les pages profondes (Dashboard > Postes > Soudeur > Meulage > Bruit)
- **Responsive** : vérifier CHAQUE page sur viewport tablette (768px) et mobile (375px)
- **Empty states** : chaque liste vide a un message pédagogique
- **Transitions** : les changements de page ne sont pas brutaux (loading doux)

### 4. Seed de données de test

Crée un script `scripts/seed.ts` qui insère des données de démonstration :

- 1 entreprise (Menuiserie Dupont, BTP, 25 salariés)
- 3 postes (Menuisier, Cariste, Secrétaire)
- 2-3 opérations par poste (dont une "Toutes opérations" sur Menuisier)
- Quelques évaluations complétées (module Bruit sur Menuisier)
- Quelques présélections négatives

Cela permet de voir l'app avec des données réalistes.

### 5. Vérification build Vercel

- Lancer `npm run build` et corriger toutes les erreurs
- Vérifier que les variables d'environnement sont documentées
- S'assurer qu'il n'y a aucun `console.log` qui traîne en production

## C'est fini quand

- [ ] Le tableau APR affiche toutes les évaluations avec code couleur
- [ ] Les filtres et le tri fonctionnent
- [ ] Le dashboard affiche les compteurs et le top 5 des risques
- [ ] Chaque page a des loading states et gère les erreurs
- [ ] Les breadcrumbs fonctionnent sur les pages profondes
- [ ] Le script de seed s'exécute et peuple la base
- [ ] L'application ENTIÈRE est responsive sur tablette et mobile
- [ ] `npm run build` passe sans erreur
- [ ] On peut faire le parcours complet : inscription → entreprise → poste → opération → présélection → évaluation bruit → tableau APR
