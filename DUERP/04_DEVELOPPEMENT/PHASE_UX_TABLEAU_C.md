ultrathink

use library /vercel/next.js
use library /clauderic/dnd-kit
use library /tailwindlabs/tailwindcss

# Phase UX TABLEAU C — Affinage tableau APR + sidebar fluide

## Avant tout, lire impérativement

1. `CLAUDE.md` à la racine
2. `DUERP/01_FONDATIONS/COTATION.txt`
3. `DUERP/02_METHODOLOGIE/STANDARD_PRESELECTION.txt` (3 questions OUI/NON par module)
4. `DUERP/03_MODULES_RISQUES/M01_BRUIT/` (référence pour le module Bruit déjà implémenté)
5. Le code de la Phase UX_TABLEAU_B2 doit être en place (structure rowspan + drag inter-opérations)

## Contexte

9 améliorations sur le tableau APR + 1 fix sur la sidebar. Le tableau est utilisé en conditions réelles, on affine pour le rendre vraiment exploitable comme un tableur pro.

**Règle absolue** : ne casse pas l'édition inline, le drag-and-drop, ni les Server Actions existantes. Tout le travail ici porte sur la couche présentation + un nouveau comportement modal pour les modules normés.

## Fichiers concernés

- `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx` — refonte structure colonnes + super-headers
- `src/app/dashboard/postes/[id]/_components/ligne-risque.tsx` — adaptation cellules + remplacement Évaluation par module
- `src/app/dashboard/postes/[id]/_components/cellule-editable.tsx`
- `src/app/dashboard/postes/[id]/_components/groupe-operation.tsx` — bouton + déplacé, suppression compteur
- `src/app/dashboard/postes/[id]/_components/module-trigger.tsx` — **nouveau composant** pour bouton module
- `src/app/dashboard/postes/[id]/_components/colonne-resizer.tsx` — **nouveau composant** pour resize
- `src/app/dashboard/postes/[id]/_hooks/use-column-widths.ts` — **nouveau hook** localStorage
- `src/components/dashboard/sidebar.tsx` — fluidité hover

## 1. Resize des colonnes + persistance localStorage

Ajouter un handle de redimensionnement entre chaque colonne (sauf colonne Opération sticky).

### Implémentation

**Hook custom** `use-column-widths.ts` :

```typescript
const STORAGE_KEY = 'tableau-apr-column-widths-v1'

export function useColumnWidths(defaultWidths: Record<string, number>) {
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return defaultWidths
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...defaultWidths, ...JSON.parse(saved) } : defaultWidths
  })
  
  const setWidth = useCallback((columnId: string, width: number) => {
    setWidths(prev => {
      const next = { ...prev, [columnId]: Math.max(40, Math.min(600, width)) }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])
  
  const resetWidths = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setWidths(defaultWidths)
  }, [defaultWidths])
  
  return { widths, setWidth, resetWidths }
}
```

**Composant** `colonne-resizer.tsx` :
- Petit handle 4px de large positionné en bordure droite de chaque `<th>`
- `cursor: col-resize` au hover
- Au mouse down → écoute `mousemove` sur `window`, calcule la nouvelle width
- Au mouse up → relâche les listeners et appelle `setWidth(columnId, newWidth)`
- Visuel : ligne fine grise, devient bleu accent au hover, plus épaisse pendant le drag

Bouton "Réinitialiser les colonnes" dans le menu contextuel ou en haut à droite du tableau (icône `RotateCcw` Lucide).

## 2. Quadrillage complet (fix bug B2)

**Vérifier et forcer** :
- Toutes les cellules `<td>` et `<th>` ont `border: 1px solid #E5E7EB`
- `border-collapse: collapse` sur le `<table>`
- Aucun `border-l: 0` ou `border-r: 0` qui supprimerait les verticales

Le bug actuel est probablement dû à `border-collapse: separate` ou à des bordures retirées sur les cellules sticky. À chasser.

## 3. Alternance par opération renforcée

Actuellement l'alternance utilise `#FFFFFF` / `#F9FAFB` qui est trop subtil.

Passer à :
- Opération impaire : `#FFFFFF`
- Opération paire : `#F1F5F9` (slate-100, plus marqué)
- "Toutes opérations" : `#FEF3C7` à 35% d'opacité (déjà OK)

L'alternance se fait **par GROUPE d'opération** (toutes les lignes d'une opération ont le même fond), pas par ligne individuelle.

## 4. Sticky left : seule la colonne "Opération"

**Retirer** le sticky de Réf et Danger.

**Garder** la cellule "Opération" (avec rowspan) en `sticky left-0 z-10 bg-inherit` pour qu'elle reste visible au scroll horizontal.

Avec ce changement, le trait vertical foncé entre opérations va naturellement parcourir toute la largeur du tableau.

## 5. Suppression du bruit visuel + déplacement bouton "+ Ajouter risque"

Dans la cellule "Opération" (rowspan) :

**À retirer** :
- L'icône à côté du nom d'opération (sauf cas particulier "Toutes opérations" — voir ci-dessous)
- Le compteur "X risques" sous le nom

**À garder** :
- Pour "Toutes opérations" UNIQUEMENT : icône globe `Globe` Lucide à gauche du nom (pédagogique, rappelle que c'est transversal)
- Boutons "Renommer" (icône `Pencil`) et "Supprimer" (icône `Trash2`) en discret à droite du nom

**À ajouter** :
- Petit bouton `+` (icône `Plus` Lucide, taille sm) à côté du nom d'opération, juste après le label
- Tooltip "Ajouter un risque"
- Au clic → crée une nouvelle ligne de risque vide dans cette opération (même Server Action que l'actuel bouton "+ Ajouter un risque")

**À supprimer** :
- La ligne fantôme "+ Ajouter un risque" en bas de chaque groupe — remplacée par le petit bouton ci-dessus

## 6. Trait vertical foncé entre chaque opération

La bordure horizontale épaisse entre opérations existe déjà (B2). Vérifier qu'elle est :
- 2px solid `#9CA3AF` (gris moyen)
- Appliquée sur la dernière `<tr>` d'une opération via `border-bottom`
- Va de la colonne Opération jusqu'à la dernière colonne (point 4 résout le problème de coupure par sticky)

## 7. Super-headers avec couleurs douces

Au-dessus des en-têtes de colonnes actuels, ajouter une ligne de super-headers via `<th colSpan>` :

```tsx
<thead>
  {/* Super-headers */}
  <tr className="text-xs font-bold uppercase tracking-wider">
    <th rowSpan={2} className="bg-gray-50">Opération</th>
    <th colSpan={8} className="bg-blue-50 text-blue-900 border-l-4 border-l-gray-400">
      Analyse Préliminaire des Risques
    </th>
    <th colSpan={3} className="bg-yellow-50 text-yellow-900 border-l-4 border-l-gray-400">
      Évaluation des risques
    </th>
    <th colSpan={3} className="bg-green-50 text-green-900 border-l-4 border-l-gray-400">
      Moyens de maîtrise
    </th>
    <th rowSpan={2} className="bg-gray-50">⋮</th>
  </tr>
  
  {/* Headers détaillés (existants) */}
  <tr>
    {/* Réf, Danger, Situation, Risque ED840, Type, Événement, Dommage, Siège lésions */}
    {/* G, P/DE, Criticité brute */}
    {/* T.H.O. EPI, PM, Criticité résiduelle */}
  </tr>
</thead>
```

**Couleurs des super-headers** (douces, ne pas surcharger) :
- Analyse Préliminaire : `bg-blue-50` + texte `text-blue-900`
- Évaluation des risques : `bg-yellow-50` + texte `text-yellow-900`
- Moyens de maîtrise : `bg-green-50` + texte `text-green-900`

**Bordures verticales épaisses** entre les 3 zones : `border-l-4 border-l-gray-400` sur les premières cellules de chaque zone (Événement, G, T.H.O.). Cette bordure se prolonge sur toutes les lignes du tableau (pas juste les headers).

**Vérification colSpan** :
- APR = 8 colonnes (Réf, Danger, Situation, Risque ED840, Type, Événement, Dommage, Siège)
- Évaluation = 3 colonnes (G, P/DE, Criticité brute)
- Moyens de maîtrise = 3 colonnes (T.H.O./EPI, PM, Criticité résiduelle)

Si le décompte ne colle pas avec ton implémentation actuelle, ajuste — l'idée structurelle est ce qui compte.

## 8. Modules normés : remplacement de la zone Évaluation par un bouton

**Logique métier (relire `STANDARD_PRESELECTION.txt`)** :

Quand le risque sélectionné dans la colonne "Risque (ED840)" est de type `CHRONIQUE` ET appartient à un module normé (M01 Bruit, M02 Vibrations, M03 TMS, M04 Charge physique, M05 RPS), alors :

### Affichage de base
La zone "Évaluation des risques" (3 cellules : G, P/DE, Criticité brute) est **fusionnée en une seule cellule** (`colSpan={3}`) qui contient un bouton :

```tsx
<td colSpan={3} className="bg-yellow-50 p-2 text-center">
  <Button variant="outline" size="sm" onClick={() => openModuleModal(risque)}>
    <Sparkles /> Lancer le module {moduleName}
  </Button>
</td>
```

### Au clic du bouton : modale présélection

Modale shadcn/ui qui affiche les 3 questions OUI/NON spécifiques au module (charge depuis `STANDARD_PRESELECTION.txt` ou table DB si déjà persisté).

3 boutons OUI / NON pour chaque question, pas de "Je ne sais pas".

### Cas A : 0 OUI (risque maîtrisé)

Au submit :
- Server Action enregistre `criticite_brute = 1`, `module_status = 'maitrise'`, `preselection_responses = [false, false, false]`
- La cellule fusionnée se ré-affiche avec :

```tsx
<td colSpan={3} className="bg-green-50 text-center">
  <Badge variant="success" className="bg-green-100 text-green-800">
    <Check /> Maîtrisé
  </Badge>
  <span className="ml-2 text-green-900 font-bold tabular-nums">1</span>
</td>
```

- Discret bouton "Refaire l'évaluation" en hover (icône `RotateCcw`)

### Cas B : 1+ OUI (creuser nécessaire)

Au submit :
- Server Action enregistre `module_status = 'creuser'`, `preselection_responses = [...]`
- **Pour le module Bruit (M01)** qui est implémenté : la cellule fusionnée + les colonnes "Moyens de maîtrise" (T.H.O., PM, Criticité résiduelle) deviennent un lien cliquable vers la page module existante
- **Pour les autres modules pas encore codés (M02-M05)** : la cellule fusionnée Évaluation reste avec un badge `À venir` (orange/warning), MAIS reverte temporairement aux 3 cellules G/P/Crit éditables manuellement pour que l'utilisateur ne soit pas bloqué

```tsx
{/* Cas B - module à venir */}
<td colSpan={3} className="bg-yellow-50 border-b-2 border-yellow-200">
  <div className="flex flex-col items-center gap-1 p-1">
    <Badge variant="warning" className="bg-orange-100 text-orange-800 text-[10px]">
      Module {moduleName} — À venir
    </Badge>
    <div className="flex gap-1 w-full">
      <CelluleEditable type="select" colonne="gravite" ... />
      <CelluleEditable type="select" colonne="probabilite" ... />
      <BadgeCriticite valeur={calc(g, p)} />
    </div>
  </div>
</td>
```

```tsx
{/* Cas B - module Bruit (M01) déjà codé */}
<td colSpan={3} className="bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
  <Link href={`/dashboard/modules/bruit/${risque.id}`} className="block p-2 text-center text-sm text-yellow-900 font-medium">
    <ExternalLink className="inline w-3 h-3 mr-1" />
    Compléter l'analyse Bruit
  </Link>
</td>
{/* Idem pour les 3 cellules Moyens de maîtrise */}
```

### Migration DB nécessaire

Ajouter dans `evaluations` :
```sql
ALTER TABLE evaluations ADD COLUMN module_status TEXT CHECK (module_status IN ('non_initie', 'maitrise', 'creuser'));
ALTER TABLE evaluations ADD COLUMN preselection_responses JSONB;
ALTER TABLE evaluations ADD COLUMN module_completed_at TIMESTAMP WITH TIME ZONE;
```

Migration : `supabase/migrations/009_module_status.sql`

### Server Actions à créer

- `enregistrer_preselection_module(risqueId, responses[])` → calcule maîtrisé/creuser, met à jour la ligne
- `reset_preselection_module(risqueId)` → remet à `non_initie` pour permettre de refaire

## 9. Sidebar : hover plus fluide

**Bug actuel** : ouverture/fermeture saccadée et trop rapide.

**Fix** :

```tsx
const SIDEBAR_OPEN_DELAY = 80   // ms avant ouverture (évite ouverture accidentelle)
const SIDEBAR_CLOSE_DELAY = 250 // ms avant fermeture (laisse le temps à la souris de revenir)

// Dans le composant
const [isHovered, setIsHovered] = useState(false)
const openTimer = useRef<NodeJS.Timeout>()
const closeTimer = useRef<NodeJS.Timeout>()

const handleMouseEnter = () => {
  clearTimeout(closeTimer.current)
  openTimer.current = setTimeout(() => setIsHovered(true), SIDEBAR_OPEN_DELAY)
}

const handleMouseLeave = () => {
  clearTimeout(openTimer.current)
  closeTimer.current = setTimeout(() => setIsHovered(false), SIDEBAR_CLOSE_DELAY)
}

// Sur le <aside>
<aside
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
  style={{
    width: effectiveWidth,
    transition: 'width 220ms cubic-bezier(0.32, 0.72, 0, 1)', // ease "premium" Apple-like
  }}
>
```

**À ajouter aussi** :
- Fade-in 150ms du contenu interne (labels des items) quand la sidebar s'ouvre — sinon les textes apparaissent brusquement
- Pas de hover si tactile (on l'a déjà fait, vérifier que c'est encore en place)

## C'est fini quand

- [ ] Resize colonnes fonctionne (handle drag, persistance localStorage)
- [ ] Bouton "Réinitialiser largeurs" disponible
- [ ] Quadrillage complet visible (verticales et horizontales sur toutes les cellules)
- [ ] Alternance par opération bien marquée (blanc / `#F1F5F9`)
- [ ] Seule la colonne Opération est sticky left
- [ ] Compteur risques retiré
- [ ] Icône retirée sauf globe pour "Toutes opérations"
- [ ] Bouton "+ Ajouter un risque" remplacé par petit bouton + à côté du nom d'opération
- [ ] Plus de ligne fantôme "+ Ajouter un risque" en bas de groupe
- [ ] Trait vertical foncé entre opérations va jusqu'au bout (plus coupé)
- [ ] Super-headers en place : APR (bleu) / Évaluation (jaune) / Moyens de maîtrise (vert)
- [ ] Bordure verticale épaisse entre les 3 zones APR/Évaluation/Maîtrise sur toutes les lignes
- [ ] Risque chronique avec module normé : zone Évaluation = bouton "Lancer le module X"
- [ ] Modale de présélection (3 questions OUI/NON) fonctionne
- [ ] Cas 0 OUI : badge vert "Maîtrisé" + criticité 1
- [ ] Cas 1+ OUI module Bruit : lien vers page module
- [ ] Cas 1+ OUI autres modules : badge "À venir" + cellules manuelles G/P en attendant
- [ ] Migration DB 009_module_status.sql appliquée
- [ ] Sidebar hover fluide avec délai ouverture 80ms / fermeture 250ms + easing premium
- [ ] Édition inline toujours fonctionnelle (régression check)
- [ ] Drag-and-drop toujours fonctionnel (régression check)
- [ ] `npm run build` passe

## Ne PAS toucher

- Server Actions existantes pour création/édition/suppression de risques (juste en ajouter pour module)
- Le schéma de cotation (G×P, G×DE, PM, zones de couleur)
- Le module Bruit M01 lui-même (juste l'intégration dans le tableau)
- Les pages vitrine
- La charte graphique sidebar/header (navy/or)

## Migration DB — instructions manuelles pour William

Une fois Claude Code a généré `supabase/migrations/009_module_status.sql` :

1. Ouvrir Supabase Dashboard → SQL Editor → New query
2. Copier le contenu de la migration
3. Run
4. Vérifier que les 3 nouvelles colonnes existent dans `evaluations` :
   - `module_status` (text, nullable)
   - `preselection_responses` (jsonb, nullable)
   - `module_completed_at` (timestamptz, nullable)

## À la fin

Mettre à jour `CLAUDE.md` section 6 : ajouter `[x] PHASE_UX_TABLEAU_C` dans Phase 2.

## Commit

```bash
git add .
git commit -m "UX tableau C - resize cols + super-headers + modules normés intégrés + sidebar fluide"
git push
```
