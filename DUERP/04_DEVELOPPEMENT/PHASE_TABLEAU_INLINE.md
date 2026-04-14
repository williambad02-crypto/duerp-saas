# Phase TABLEAU INLINE — Interface d'édition type tableur pour le DUERP

## Contexte

L'interface actuelle du poste de travail repose sur des popups et des formulaires séparés. William veut une expérience beaucoup plus fluide, proche d'un **tableur (Excel / Notion database)** : tout se passe directement dans le tableau, l'édition est inline, les risques peuvent être créés partiellement et déplacés facilement.

Cette phase concerne **uniquement l'interface du poste de travail** (la vue détail d'un poste). La création d'un nouveau poste (depuis la liste des postes) reste en modale — ce qui n'est pas à changer.

## Prérequis

- Phase REVISION terminée (tableau APR avec 20 risques ED840 fonctionnel)
- Migration DB OK

## Fichiers de référence à lire

1. `DUERP/02_METHODOLOGIE/FONCTIONNEMENT_OUTIL.txt` — Section "MODULE 5 — APR / EVR"
2. `DUERP/01_FONDATIONS/ED840_SYNTHESE.txt` — liste des 20 risques
3. `DUERP/01_FONDATIONS/COTATION.txt` — règles G×P et G×DE
4. `DUERP/04_DEVELOPPEMENT/BRAND.md` — charte visuelle à respecter
5. `DUERP/02_METHODOLOGIE/STANDARD_PRESELECTION.txt` — présélection des modules chroniques

## Ce qu'il faut construire

### 1. Page détail d'un poste — nouvelle version

**Route** : `/dashboard/postes/[id]`

**Structure de la page :**
```
[Header du poste]
  Nom du poste — [Bouton Renommer] [Bouton Supprimer]
  Effectif concerné · Description courte

[Actions rapides]
  [+ Ajouter une opération]   [Télécharger l'export PDF du poste]

[Tableau APR du poste — vue éditable]
  Groupe 1 : "Toutes opérations" (toujours en tête, non supprimable)
    Risque 1 (ligne éditable)
    Risque 2 (ligne éditable)
    [+ Ajouter un risque à cette opération]
  
  Groupe 2 : "Opération A" [Renommer] [Supprimer]
    Risque 1
    Risque 2
    [+ Ajouter un risque à cette opération]
  
  Groupe 3 : "Opération B" ...
```

### 2. Comportement du tableau

#### Structure par groupes (opérations)

- Le tableau affiche les **lignes de risques regroupées par opération**
- Chaque groupe a un en-tête clair : nom de l'opération + boutons renommer/supprimer (sauf "Toutes opérations" qui ne peut être ni renommée ni supprimée)
- Chaque groupe contient les lignes de risques de cette opération + une ligne "+ Ajouter un risque" en dernière position
- L'opération "Toutes opérations" est **créée automatiquement avec le poste** (flag `est_transversale = true`), **toujours affichée en premier**, non supprimable

#### Colonnes du tableau (identiques pour tous les groupes)

| Colonne | Largeur | Type de champ | Éditable inline |
|---|---|---|---|
| ID auto | étroite | Texte auto (UT01-R001) | Non (auto-généré) |
| ↕ | très étroite | Handle drag | N/A |
| Danger | moyenne | Texte libre | Oui |
| Situation dangereuse | moyenne | Texte libre | Oui |
| Risque | moyenne | Dropdown 20 risques ED840 | Oui |
| Type | étroite | AIGU / CHRONIQUE (auto) | Oui si type = LES_DEUX |
| Événement dangereux | moyenne | Texte libre (si AIGU) | Oui |
| Dommage | moyenne | Texte libre | Oui |
| Siège des lésions | moyenne | Texte libre | Oui |
| G | étroite | Dropdown 1-5 | Oui |
| P / DE | étroite | Dropdown 1-4 | Oui |
| Criticité brute | étroite | Auto (G × P/DE) avec couleur | Non |
| T.H.O. / EPI | moyenne | Texte libre court | Oui |
| PM | étroite | Dropdown 0.0 / 0.25 / 0.5 / 0.75 / 1.0 | Oui |
| Criticité résiduelle | étroite | Auto avec couleur | Non |
| ⋮ | très étroite | Menu (Supprimer, Dupliquer) | N/A |

**Pour les risques avec module dédié** (Bruit, TMS, Vibrations...) : afficher un petit badge "Module ⏵" dans la colonne G ou Criticité brute. Clic sur le badge → ouvre la présélection sommaire (3 questions OUI/NON) puis le module normé. Le résultat remplit automatiquement la criticité brute de la ligne.

### 3. Édition inline (comme Excel)

**Principe** : clic sur une cellule → passage en mode édition → saisie → blur/Enter → sauvegarde automatique en base.

- **Champs texte** : clic → input apparaît avec le texte actuel → modification → Enter ou blur → save (POST côté serveur, indicateur de sauvegarde bref)
- **Dropdowns** : clic → popover avec options → choix → save
- **Tab** pour passer à la cellule suivante (comme Excel)
- **Échap** pour annuler la modification en cours
- **Indicateur visuel** de sauvegarde : léger pulsing/checkmark discret à droite de la cellule après save réussi

Utilise une librairie légère type `@tanstack/react-table` ou fait du sur-mesure. Pas besoin de react-data-grid (trop lourd).

### 4. Création inline d'une nouvelle opération

Bouton `+ Ajouter une opération` au-dessus du tableau OU après le dernier groupe :

- Clic → un nouveau groupe apparaît en bas avec un champ texte pour le nom (focus auto)
- L'utilisateur tape le nom de l'opération
- Enter ou blur → création en base (POST)
- Le groupe est prêt à accueillir des risques

### 5. Création inline d'un nouveau risque

Dans chaque groupe (opération), une ligne fantôme `+ Ajouter un risque` en dernière position :

- Clic → une nouvelle ligne vide est créée en base (POST avec operation_id, sans autres champs)
- La ligne apparaît en édition sur la colonne "Danger" (focus auto)
- L'utilisateur remplit progressivement : Danger → Situation → Risque (dropdown) → etc.
- Chaque champ est sauvegardé au fur et à mesure (save par cellule)

**Important** : un risque incomplet est valide côté base. La complétude est signalée visuellement dans le tableau (ex: ligne légèrement grisée si criticité non calculable, petit indicateur "incomplet") mais ne bloque rien.

### 6. Drag-and-drop pour déplacer un risque entre opérations

- Chaque ligne de risque a un **handle de drag** (icône ⋮⋮ à gauche de la ligne)
- Utilise `@dnd-kit/sortable` (standard React moderne, accessible, performant)
- Drag d'une ligne vers un autre groupe → change `operation_id` en base (PATCH)
- Feedback visuel pendant le drag : ligne semi-transparente suit le curseur, zone de drop surlignée
- Pas de drag entre postes (juste entre opérations du même poste)

### 7. Opération "Toutes opérations" — règles spéciales

- Créée automatiquement à la création d'un poste (insertion en DB avec `est_transversale = true`)
- **Toujours en première position** dans le tableau (sort côté client + contrainte DB)
- **Non renommable** (pas de bouton "Renommer" visible)
- **Non supprimable** (pas de bouton "Supprimer" visible)
- Visuellement distincte : fond légèrement différent (ex: `bg-brand-cream-light`), icône spéciale (globe ou similar), étiquette "Risques transversaux au poste"

**Migration nécessaire** : pour les postes existants qui n'ont pas encore d'opération "Toutes opérations", créer un script/migration pour l'ajouter automatiquement.

### 8. Suppression d'un risque

- Menu ⋮ à droite de chaque ligne → "Supprimer"
- Modale de confirmation : "Supprimer ce risque ? Cette action est irréversible."
- DELETE côté base, retrait de la ligne côté front

### 9. Suppression d'une opération

- Bouton "Supprimer" dans l'en-tête du groupe (sauf "Toutes opérations")
- Si l'opération contient des risques : modale de confirmation avec deux options :
  - "Supprimer l'opération et tous ses risques"
  - "Déplacer les risques vers 'Toutes opérations' puis supprimer"

### 10. Responsive tablette

Le tableau est large (16 colonnes). Sur tablette < 1024px :
- Scroll horizontal dans le tableau
- Colonnes figées à gauche : ID, handle drag, Danger (3 premières)
- Optionnel : un mode "card view" sur mobile < 768px (carte par risque avec les champs empilés)

## Structure des composants

```
src/app/dashboard/postes/[id]/
├── page.tsx                              # Page détail du poste
├── _components/
│   ├── poste-header.tsx                  # En-tête avec nom + actions
│   ├── tableau-apr/
│   │   ├── index.tsx                     # Composant tableau principal (orchestrateur)
│   │   ├── groupe-operation.tsx          # Un groupe (opération + ses risques)
│   │   ├── ligne-risque.tsx              # Une ligne éditable
│   │   ├── cellule-editable.tsx          # Cellule avec édition inline
│   │   ├── cellule-dropdown.tsx          # Cellule avec dropdown (risque, G, P, PM...)
│   │   ├── badge-module.tsx              # Badge "Module ⏵" pour risques normés
│   │   ├── ajout-operation.tsx           # Bouton/ligne d'ajout d'opération
│   │   └── ajout-risque.tsx              # Ligne fantôme d'ajout de risque
│   └── actions/
│       ├── creer-operation.ts            # Server action
│       ├── creer-risque.ts
│       ├── mettre-a-jour-cellule.ts      # Server action générique pour PATCH d'un champ
│       ├── deplacer-risque.ts            # Change operation_id
│       ├── supprimer-risque.ts
│       └── supprimer-operation.ts
```

## Actions serveur (Server Actions)

Utilise des Server Actions Next.js pour toutes les mutations :

```typescript
// Exemple : mise à jour d'une cellule
export async function mettreAJourCellule(
  risqueId: string,
  colonne: string,
  valeur: unknown
) {
  const supabase = await createClient()
  // Validation Zod selon la colonne
  // UPDATE en base
  // revalidatePath ou revalidateTag
  return { success: true }
}
```

**Optimistic updates** : la UI met à jour immédiatement, rollback en cas d'échec serveur avec toast d'erreur.

## Schéma DB — vérifications et ajouts

La table `evaluations` doit supporter les champs partiels (pas de NOT NULL sur les champs métier) :

```sql
-- À appliquer si pas déjà fait
ALTER TABLE evaluations 
  ALTER COLUMN numero_risque_ed840 DROP NOT NULL,
  ALTER COLUMN danger DROP NOT NULL,
  ALTER COLUMN situation_dangereuse DROP NOT NULL,
  ALTER COLUMN dommage DROP NOT NULL,
  ALTER COLUMN siege_lesions DROP NOT NULL;

-- Colonne "ordre" pour gérer la réorganisation drag-and-drop
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS ordre INTEGER DEFAULT 0;

-- Colonne "ordre" sur les opérations aussi
ALTER TABLE operations ADD COLUMN IF NOT EXISTS ordre INTEGER DEFAULT 0;

-- Contrainte : toujours une opération "Toutes opérations" par poste
CREATE OR REPLACE FUNCTION ensure_toutes_operations() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO operations (poste_id, nom, est_transversale, ordre)
  VALUES (NEW.id, 'Toutes opérations', true, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_poste_insert
AFTER INSERT ON postes
FOR EACH ROW EXECUTE FUNCTION ensure_toutes_operations();

-- Migration : ajouter "Toutes opérations" aux postes existants qui n'en ont pas
INSERT INTO operations (poste_id, nom, est_transversale, ordre)
SELECT p.id, 'Toutes opérations', true, 0
FROM postes p
WHERE NOT EXISTS (
  SELECT 1 FROM operations o 
  WHERE o.poste_id = p.id AND o.est_transversale = true
);
```

## Style (application de la charte SafeAnalyse.)

- Tableau : fond `bg-brand-off`, bordures `border-brand-sand`
- En-tête de colonnes : fond `bg-brand-cream-light`, texte `text-brand-navy`, font-semibold, text-sm
- En-tête de groupe (opération) : fond `bg-brand-navy`, texte `text-brand-cream`, font-semibold
- En-tête de groupe "Toutes opérations" : fond `bg-brand-navy` + accent or à gauche (border-l-4 `border-brand-gold-light`)
- Lignes : alternance `bg-brand-off` / `bg-brand-cream-light`
- Cellule en édition : bordure `border-brand-navy` + ring 3px navy/10%
- Cellule hover : fond `bg-brand-cream-light`
- Badge criticité : couleurs fonctionnelles (vert/jaune/orange/rouge) selon BRAND.md
- Badge "Module ⏵" : fond `bg-brand-gold-pale`, texte `text-brand-bronze`
- Ligne "Ajouter un risque" : fond subtil, texte `text-brand-bronze`, icône +

## C'est fini quand

- [ ] La page `/dashboard/postes/[id]` affiche un tableau groupé par opération
- [ ] "Toutes opérations" apparaît automatiquement en tête et n'est ni renommable ni supprimable
- [ ] On peut ajouter une opération depuis le tableau (bouton dédié)
- [ ] On peut ajouter un risque à une opération (bouton `+` dans chaque groupe)
- [ ] On peut créer un risque partiellement rempli (pas de validation bloquante)
- [ ] Toutes les cellules sont éditables inline (clic → édition → save auto)
- [ ] Tab permet de passer à la cellule suivante
- [ ] Les dropdowns (risque, G, P, PM) fonctionnent inline
- [ ] Les lignes peuvent être déplacées entre opérations par drag-and-drop
- [ ] Les criticités brute et résiduelle se recalculent en temps réel
- [ ] Pour les risques avec module dédié, on peut déclencher le module depuis le tableau
- [ ] Le tableau applique la charte SafeAnalyse. (couleurs, typo)
- [ ] Les modifications sont persistées (rechargement de page → les données sont là)
- [ ] Tout fonctionne sur tablette (scroll horizontal OK)
- [ ] `npm run build` passe sans erreur

## Ce qu'il ne faut PAS toucher

- La création d'un nouveau poste (reste en modale depuis `/dashboard/postes`)
- Le schéma de cotation (G×P aigu, G×DE chronique APR, PM 0-1)
- La logique des modules normés existants (Bruit)
- Les routes Stripe
- Les pages légales et la landing

## Commit suggéré

```
git add .
git commit -m "Interface tableau inline éditable pour le DUERP (style Excel/Notion)"
git push
```

## Ressources techniques utiles

- `@dnd-kit/sortable` : https://docs.dndkit.com (drag-and-drop léger et accessible)
- `@tanstack/react-table` : https://tanstack.com/table (headless, très souple)
- Pattern "optimistic update" avec Server Actions : https://react.dev/reference/react/useOptimistic
