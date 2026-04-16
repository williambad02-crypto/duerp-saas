# Design — Refonte tableau APR + sidebar + améliorations UX

**Date** : 2026-04-16
**Statut** : Validé par William, prêt pour implémentation
**Scope estimé** : ~2 journées (hors templates métier = bonus différable)

## Contexte

Après plusieurs itérations sur le tableau APR (`/dashboard/postes/[id]`), subsistent :
- Un bug de bordures qui "bougent" au scroll (partage de bordures en `border-collapse: collapse`).
- Une UI encore trop "SaaS" (bandeaux + toolbar lourds) — manque de sensation "feuille de travail pleine page".
- Une sidebar dont le hover-to-open ne fonctionne plus + animations saccadées + bandeau Entreprise superflu.
- Un tableau dense / peu aéré sur la partie EVR + moyens de maîtrise.

En parallèle, plusieurs améliorations UX à forte valeur ajoutée sont absentes (compteur criticités, détection risques incomplets, saisie rapide G/P, duplication d'opération, templates métier).

## Objectifs

1. Régler définitivement le bug de bordures (rendu Excel propre, aucune ligne ne bouge au scroll).
2. Intégrer le tableau "pleine page" : supprimer les chromes redondants, toolbar minimaliste.
3. Réparer et fluidifier la sidebar.
4. Aérer EVR + moyens de maîtrise.
5. Ajouter des aides à la saisie et à la vue d'ensemble (compteur, filtres, détection, boutons G/P, dupliquer, templates).

## Scope

### Section 1 — Bordures `border-collapse: separate`

- Table `<table>` passe de `borderCollapse: 'collapse'` à `borderCollapse: 'separate', borderSpacing: 0`.
- Convention : chaque `<td>` / `<th>` porte uniquement `border-right` + `border-bottom` (plus les bordures colorées épaisses en `border-left` là où il y a un séparateur de zone : gris 2px sur Opération, bleu 4px avant Évaluation/Gravité, vert 4px avant Moyens de maîtrise).
- Première ligne du `<thead>` → ajout `border-top`.
- Première colonne (Opération) → ajout `border-left`.
- Dernière colonne (Actions) → pas de `border-right`.
- Suppression de toutes les `box-shadow inset` ajoutées récemment (TH, TH_ZONE, TH2, cellules sticky individuelles) — inutiles après la restructure.

**Résultat attendu** : les bordures appartiennent chacune à UNE cellule, plus de partage → plus de "ligne qui bouge" au scroll, quelle que soit la direction.

### Section 2 — Intégration pleine page

- Suppression de la ligne actuelle "breadcrumb + titre + Éditer/Supprimer".
- Suppression du bouton "Ajouter une opération" de la toolbar.
- Nouvelle toolbar (1 ligne ~48px) structurée :
  - **Gauche** : `[←]` bouton retour `/dashboard/postes` · `[Nom du poste]` titre gras cliquable (ouvre EditerPosteModal) · `[⋮]` menu (Renommer, Supprimer le poste, Retour aux postes).
  - **Centre** : bandeau compteur criticités (cf. section 5).
  - **Droite** : icônes `[🔍]` recherche · `[↻]` reset widths · `[⛶]` plein écran · `[👁]` masquer colonnes · `[PDF]` générer PDF.
- Bouton "+ Ajouter une opération" → dernière `<tr>` du `<tbody>`, colSpan 17, fond `bg-gray-50`, hover `bg-gray-100`, texte centré `+ Ajouter une opération`. Clic → création immédiate + mise en mode rename.

### Section 3 — Sidebar

- **Fix hover** : largeur `<aside>` passe de `collapsed ? 64 : 256` à `(collapsed && !hovered) ? 64 : 256`. La sidebar s'ouvre vraiment au hover.
- **Suppression** du bloc "Entreprise / [nom]" actuel en haut (`sidebar.tsx` lignes 127-144).
- **Ajout** du nom entreprise en bas, dans le footer existant : structure `Nom entreprise` (sm, cream) puis `SafeAnalyse. — v1.0` (xs, cream/30).
- **Animations simplifiées** : retrait des transitions imbriquées `max-width`/`max-height` sur labels et bandeaux. Transitions conservées :
  - `width` sur `<aside>` : 220ms cubic-bezier(0.4,0,0.2,1).
  - `opacity` sur labels : 150ms ease (collapsed=0 / open=1).
  - Reste en `overflow: hidden; white-space: nowrap`.
- Résultat attendu : ouverture/fermeture fluide sans layout jank.

### Section 4 — Aération EVR + Moyens de maîtrise

- Largeurs par défaut (`DEFAULT_WIDTHS` dans tableau-apr.tsx) :
  - `gravite` : 84 → **120**
  - `second` (probabilité/DE) : 104 → **130**
  - `criticite_brute` : 84 → **100**
  - `mesures_techniques` : 180 → **280**
  - `coefficient_pm` : 72 → **110**
  - `criticite_residuelle` : 88 → **110**
- Padding des cellules body : `px-2 py-1` → `px-3 py-2` (hauteur ligne +4-6px).
- Users avec widths cachés en localStorage : les nouvelles valeurs n'apparaissent qu'au clic sur `↻` reset.

### Section 5 — Compteur de criticités + filtres (amélioration A)

- Bandeau horizontal compact au centre de la toolbar (ou sous la toolbar si manque de place) :
  ```
  12 risques · 🔴 3 · 🟠 2 · 🟡 5 · 🟢 2 · ⚪ incomplets 0
  ```
- Chaque pill cliquable → filtre le `<tbody>` pour ne montrer que les risques concernés. Pill active = highlight + bordure navy.
- Bouton "Tout" (reset) à gauche.
- Compteurs basés sur `criticite_residuelle` (après PM). Si `criticite_residuelle` null → classé "incomplet".
- Zones :
  - 🔴 Rouge 15-20
  - 🟠 Orange 10-14
  - 🟡 Jaune 5-9
  - 🟢 Vert 1-4
  - ⚪ Incomplet (champs manquants, cf. section 6)

### Section 6 — Détection des risques incomplets (amélioration B)

- Règle "complet" : `danger` ET `numero_risque_ed840` ET `gravite` ET (`probabilite` OU `duree_exposition` selon type_risque) ET `coefficient_pm` renseignés. Si `criticite_residuelle > 4` alors `mesures_techniques` est aussi obligatoire.
- Indicateur visuel : point orange `●` (6px) à côté de la référence auto (R-XXX) quand incomplet.
- Tooltip au hover du point : liste des champs manquants ("Gravité, Probabilité").
- Compteur "⚪ incomplets N" dans le bandeau (section 5) agrège ça.

### Section 7 — Saisie G et P par boutons 1-5 (amélioration C)

- Remplace `<select>` pour les colonnes `gravite` et `second` (probabilité/DE).
- 5 boutons carrés 22×22px horizontaux, numérotés 1-5.
- Couleur fond selon la zone de criticité potentielle :
  - 1, 2 → vert pâle
  - 3 → jaune pâle
  - 4 → orange pâle
  - 5 → rouge pâle
- Bouton sélectionné : fond solide + contour navy épais.
- Tab après clic → passe à la cellule suivante (même comportement que `<select>` actuel).
- Fallback `<select>` conservé pour accessibilité clavier / écran lecteur.

### Section 8 — Duplication d'opération (amélioration D)

- Menu `⋮` existant sur chaque opération (sauf "Toutes opérations") → ajout item "Dupliquer cette opération".
- Server Action `dupliquerOperation(operationId)` :
  - Clone l'opération avec nouveau nom `"{nom} (copie)"`.
  - Clone toutes les `evaluations` associées (code_module = APR uniquement dans V1).
  - Clone les `plans_maitrise` associés.
  - Insertion juste après l'original dans l'ordre.
- Pas de copie des `evaluations_bruit` en V1 (trop spécifique, risque d'incohérence).
- Feedback : toast succès + scroll vers la nouvelle opération.

### Section 9 — Bibliothèque de risques types par métier (amélioration E)

**Scope V1 — 3 templates seulement** pour tester l'approche :
- `Opérateur production agroalimentaire` (8-10 risques typiques : TMS, bruit, froid, coupure, chute, etc.)
- `Chauffeur-livreur poids lourd` (routier, TMS port charge, accident, etc.)
- `Agent administratif / bureau` (TMS écran, RPS, trajet, etc.)

**Livraison** :
- Nouveau fichier `src/lib/constants/templates-metier.ts` définissant les 3 templates avec pour chaque risque : `numero_risque_ed840`, `danger`, `situation_dangereuse`, `evenement_dangereux`, `dommage`, `type_risque`, `gravite` suggérée, `probabilite` suggérée, `mesures_techniques` modèle.
- À la création d'un poste (bouton "+ Ajouter un poste"), écran modal 2 étapes :
  1. Nom du poste + description.
  2. Choix template : "Partir de zéro" · 3 cards templates (icône + titre + "N risques pré-remplis").
- Validation → création poste + opération "Toutes opérations" + insertion des N risques template avec les valeurs pré-remplies (user peut tout modifier ensuite).

**Note** : le contenu métier des 3 templates doit être validé par William (expert HSE). Si pas dispo dans le sprint, on peut livrer le squelette UI + 1 seul template test, et compléter les 2 autres plus tard.

## Non-scope

- Mesures T/H/O/EPI découpées en 4 cellules (proposition F — rejetée explicitement).
- Vue mobile alternative du tableau (backlog post-lancement).
- Copier/coller multi-ligne depuis Excel (backlog post-lancement).
- Historique des modifications / audit log (backlog v2).
- Templates pour secteurs autres que les 3 prioritaires (backlog).

## Risques / Points d'attention

- **Refonte border-collapse** : ~20 `<th>` / `<td>` à ajuster dans `tableau-apr.tsx`. Oublier un coin = bordure manquante visible. Mitigation : tests visuels sur scroll vertical + horizontal + plein écran.
- **localStorage** masque les nouvelles largeurs par défaut (section 4). Mitigation : communication dans la toolbar (tooltip "Reset des largeurs" renforcé) + option : invalider le cache via changement de clé (`apr-col-widths-v2`).
- **Duplication d'opération** : attention aux triggers DB qui créent les évaluations auto. Vérifier que le clone n'en recréer pas de doublon.
- **Template agroalimentaire** : contenu doit être conforme INRS ED 840 + ISO. William à valider avant go.
- **Compteur criticités + filtre** : attention aux performances si poste avec 100+ risques. useMemo sur le filtrage.

## Tests manuels attendus avant merge

- Scroll vertical : thead sticky, bordures stables.
- Scroll horizontal : colonne Opération sticky, bordures stables, bannières de zone stables.
- Plein écran : idem + bordures intactes.
- Resize d'une colonne puis scroll : bordures restent intactes.
- Reset widths : nouvelles valeurs par défaut appliquées.
- Hover sidebar collapsée : ouverture complète, sans jank.
- Filtre criticité : seuls les risques concernés visibles.
- Champs incomplets : point orange visible + tooltip descriptif.
- Dupliquer une op : l'op clone apparaît avec tous les risques et PM.
- Template métier : N risques pré-remplis à la création du poste.

## Fichiers principaux touchés

- `src/app/dashboard/postes/[id]/page.tsx` (suppression bandeau, intégration toolbar)
- `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx` (bordures, aération, toolbar, compteur, filtres, incomplets, boutons G/P, dupliquer, ajout opération en fin)
- `src/app/dashboard/postes/[id]/_components/actions.ts` (action `dupliquerOperation`)
- `src/components/dashboard/dashboard-shell.tsx` (fix hover width)
- `src/components/dashboard/sidebar.tsx` (suppression bandeau Entreprise, déplacement en bas, simplification animations)
- `src/lib/constants/templates-metier.ts` (nouveau — 3 templates)
- `src/app/dashboard/postes/_components/nouveau-poste-modal.tsx` (ou équivalent — écran 2 étapes avec choix template)
- Server action création poste : insertion des risques template si choisi
