# UX Améliorations — Plan d'action / APR / Sidebar / Postes — Design Spec

> **Pour les agents d'implémentation :** utiliser `superpowers:subagent-driven-development` pour exécuter ce plan tâche par tâche.

**Objectif :** Améliorer la lisibilité, la fluidité et l'ergonomie de 4 zones du dashboard SafeAnalyse. — tableau Plan d'action, tableau APR récap, page Postes, sidebar.

**Architecture :** Modifications localisées fichier par fichier, sans changement de schéma DB ni de Server Actions. Tout est côté client ou layout.

**Stack :** Next.js App Router, Tailwind CSS, Lucide, `createPortal` React, CSS transitions.

---

## Zone 1 — Tableau Plan d'action (6 changements)

**Fichiers concernés :**
- Modifier : `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx`
- Modifier : `src/app/dashboard/plan-action/_components/dropdown-responsable.tsx`
- Modifier : `src/app/dashboard/plan-action/_components/filtre-colonnes.tsx`

---

### Task 1 : Structure pyramide avec rowspan et couleurs hiérarchiques

**Comportement validé :**
- Colonne "Poste" fusionnée verticalement (`rowspan`) pour tous les risques d'un même poste — texte vertical (`writing-mode: vertical-rl; transform: rotate(180deg)`), fond navy foncé (#031948) texte blanc pour les postes impairs, fond violet foncé (#3730a3) texte blanc pour les postes pairs
- Colonne "Opération" fusionnée verticalement pour tous les risques d'une même opération — fond bleu moyen (#dbeafe, texte #1e3a8a) pour les postes impairs, fond violet moyen (#ede9fe, texte #4c1d95) pour les postes pairs
- **Toutes les cellules** de la ligne risque (y compris Description, Type PGP, Responsable, Échéance, Statut, Rappels, C.cible) ont la couleur claire : #eff6ff pour postes impairs, #f5f3ff pour postes pairs
- Séparation entre postes : bordure supérieure épaisse `border-t-2 border-slate-400` sur la première ligne de chaque nouveau poste
- Headers (`<th>`) : `font-bold text-center` sur toutes les colonnes

**Implémentation :**

Le tableau doit passer d'un rendu ligne par ligne (`filtered.map(renderRow)`) à un rendu groupé par poste → opération → risque avec calcul de rowspan.

```typescript
// Calculer les groupes pour rowspan
type GroupePoste = {
  posteNom: string
  postes: Array<{
    operationNom: string
    risques: EvaluationAvecAction[]
  }>
}

function groupParPosteEtOperation(rows: EvaluationAvecAction[]): GroupePoste[] {
  const map = new Map<string, Map<string, EvaluationAvecAction[]>>()
  for (const row of rows) {
    if (!map.has(row.poste_nom)) map.set(row.poste_nom, new Map())
    const opMap = map.get(row.poste_nom)!
    if (!opMap.has(row.operation_nom)) opMap.set(row.operation_nom, [])
    opMap.get(row.operation_nom)!.push(row)
  }
  return Array.from(map.entries()).map(([posteNom, opMap]) => ({
    posteNom,
    postes: Array.from(opMap.entries()).map(([operationNom, risques]) => ({ operationNom, risques })),
  }))
}
```

Palettes de couleurs (constantes en haut du fichier) :
```typescript
const PALETTE_IMPAIR = {
  poste: { bg: '#031948', text: 'white' },
  operation: { bg: '#dbeafe', text: '#1e3a8a' },
  risque: '#eff6ff',
}
const PALETTE_PAIR = {
  poste: { bg: '#3730a3', text: 'white' },
  operation: { bg: '#ede9fe', text: '#4c1d95' },
  risque: '#f5f3ff',
}
```

Dans le rendu : `posteIndex % 2 === 0` → PALETTE_IMPAIR, sinon PALETTE_PAIR.

---

### Task 2 : Fix overflow — dropdowns clippés par le container

**Problème :** Le container `overflow-x-auto` coupe les dropdowns qui s'ouvrent vers le bas. Tout élément positionné `absolute` à l'intérieur d'un `overflow: auto/hidden` est clippé.

**Fichier :** `src/app/dashboard/plan-action/_components/dropdown-responsable.tsx`

**Fix :** Convertir le dropdown en portal React via `createPortal(dropdown, document.body)`. Le dropdown est rendu dans `document.body` et positionné via `getBoundingClientRect()` du bouton déclencheur.

```typescript
'use client'
import { createPortal } from 'react-dom'
import { useRef, useState, useEffect } from 'react'

// Dans le composant DropdownResponsable :
const triggerRef = useRef<HTMLButtonElement>(null)
const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

function openDropdown() {
  const rect = triggerRef.current?.getBoundingClientRect()
  if (!rect) return
  setDropdownStyle({
    position: 'fixed',
    top: rect.bottom + window.scrollY + 4,
    left: rect.left + window.scrollX,
    zIndex: 9999,
    minWidth: rect.width,
  })
  setOpen(true)
}

// Le dropdown lui-même rendu via createPortal :
{open && typeof document !== 'undefined' && createPortal(
  <div style={dropdownStyle} className="bg-white border border-gray-200 rounded-lg shadow-lg ...">
    {/* options */}
  </div>,
  document.body
)}
```

---

### Task 3 : Redimensionnement des colonnes

**Fichier :** `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx`

**Comportement :** Chaque colonne a une poignée de redimensionnement (ligne verticale) sur le bord droit de son `<th>`. Drag pour redimensionner. Largeurs persistées en `localStorage` (clé `plan-action-col-widths`).

```typescript
// State dans le composant
const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
  try {
    const saved = localStorage.getItem('plan-action-col-widths')
    return saved ? JSON.parse(saved) : {}
  } catch { return {} }
})

// Poignée de resize sur chaque <th>
function ResizeHandle({ colId }: { colId: string }) {
  const startX = useRef(0)
  const startW = useRef(0)

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    startX.current = e.clientX
    startW.current = colWidths[colId] ?? 120
    function onMove(ev: MouseEvent) {
      const delta = ev.clientX - startX.current
      const newW = Math.max(60, startW.current + delta)
      setColWidths(prev => {
        const next = { ...prev, [colId]: newW }
        try { localStorage.setItem('plan-action-col-widths', JSON.stringify(next)) } catch {}
        return next
      })
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <span
      onMouseDown={onMouseDown}
      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/40 active:bg-blue-500/60 transition-colors"
    />
  )
}
```

Appliquer `style={{ width: colWidths[colId] ?? defaultWidth }}` sur chaque `<th>` + `<table style={{ tableLayout: 'fixed' }}`.

---

### Task 4 : Mode plein écran

**Fichier :** `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx`

**Comportement :** Bouton `Maximize2` / `Minimize2` (Lucide) en haut à droite du tableau. En mode plein écran : `position: fixed; inset: 0; z-index: 50; background: white; overflow-y: auto; padding: 1.5rem`. Même pattern que `tableau-apr.tsx` ligne ~210.

```typescript
import { Maximize2, Minimize2 } from 'lucide-react'
const [fullscreen, setFullscreen] = useState(false)

// Wrapper du tableau :
<div className={fullscreen ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-6' : 'space-y-4'}>
  {/* bouton en haut à droite */}
  <div className="flex justify-end mb-2">
    <button onClick={() => setFullscreen(f => !f)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
      {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
    </button>
  </div>
  {/* ... reste du tableau */}
</div>
```

---

### Task 5 : Icône Rappels — Lucide Bell

**Fichier :** `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx` et `filtre-colonnes.tsx`

- Remplacer `🔔` par `<Bell className="w-3.5 h-3.5 inline" />` (import `Bell` depuis `lucide-react`)
- Dans le `<th>` de rappels : `<Bell className="w-3.5 h-3.5" />`
- Dans le label du popover colonnes : `COLONNES_LABELS.rappels = 'Rappels'` (supprimer l'emoji)

---

## Zone 2 — Bannière essai uniquement sur /dashboard

**Fichiers concernés :**
- Modifier : `src/app/dashboard/layout.tsx`
- Modifier : `src/app/dashboard/page.tsx`

**Comportement :** La `PaywallBanner` s'affiche uniquement sur `/dashboard` (page d'accueil du dashboard), pas sur toutes les pages.

**Implémentation :**
1. Retirer le `<PaywallBanner>` et sa condition `{aboProp.bandeau && ...}` de `layout.tsx`
2. Passer `aboProp` depuis le layout au `children` n'est pas possible directement — la page doit faire sa propre query d'abonnement

Alternative plus simple : passer `aboProp` via props de layout est impossible avec le App Router. Solution : dans `dashboard/page.tsx`, appeler `getInfoAbonnement` et `serializeAbonnement` directement, puis afficher `<PaywallBanner>` dans la page.

```typescript
// dashboard/page.tsx — ajouter :
import { getInfoAbonnement, serializeAbonnement } from '@/lib/abonnement'
import { PaywallBanner } from '@/components/dashboard/paywall-banner'

// Dans le composant :
const abo = serializeAbonnement(await getInfoAbonnement(user.id))
// Afficher : {abo.bandeau && <PaywallBanner bandeau={abo.bandeau} joursRestantsTrial={abo.joursRestantsTrial} />}
```

---

## Zone 3 — Tableau APR récap lecture seule + colonnes visibles

**Fichiers concernés :**
- Modifier : `src/components/apr/apr-table.tsx`

**Comportement :**
- Ajouter prop `readOnly?: boolean` à `APRTable`
- Quand `readOnly=true` : supprimer la colonne "Voir →" (lien vers détail poste), ajouter un badge "Lecture seule" dans la barre de filtres
- Ajouter un bouton "Colonnes ▾" (popover, même pattern que `filtre-colonnes.tsx`) permettant de masquer/afficher : Poste, Opération, Module, Criticité brute, Mesures PM, Coeff. PM, Criticité résiduelle
- Colonnes visibles par défaut : toutes sauf "Mesures PM" (masquée par défaut car peu lisible)
- Persistance des préférences colonnes APR en `localStorage` (clé `apr-recap-columns`)

**Pas de refactorisation lourde** — modifier `APRTable` directement plutôt que de créer un nouveau composant.

---

## Zone 4 — Bouton "Ajouter un poste"

**Fichier :** `src/app/dashboard/postes/page.tsx`

**Problèmes :**
1. `min-h-[140px]` force le bouton plus haut que les cartes PosteCard
2. `border-2 border-dashed` → style pointillé différent des cartes
3. Hover `hover:border-brand-navy` → couleur navy au lieu du bleu des cartes

**Fix :**
```tsx
// Avant
<button className="group bg-white border-2 border-dashed border-gray-200 rounded-xl p-5 shadow-sm hover:border-brand-navy hover:shadow-md transition-all text-left w-full flex flex-col items-center justify-center gap-3 min-h-[140px]">

// Après
<button className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all w-full h-full flex flex-col items-center justify-center gap-3 min-h-[100px]">
  <div className="w-10 h-10 rounded-xl border border-gray-300 group-hover:border-blue-400 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
    <svg ... className="... text-gray-400 group-hover:text-blue-500 transition-colors" />
  </div>
  <span className="text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
    Ajouter un poste
  </span>
```

---

## Zone 5 — Sidebar animations fluides

**Fichier :** `src/components/dashboard/dashboard-shell.tsx` + `src/components/dashboard/sidebar.tsx` + `src/app/globals.css`

**Problèmes identifiés :**
1. Le switch `position: relative → absolute` sur l'inner div (quand `isFloating`) est instantané → saut visuel
2. Quand la sidebar se ferme (expanded → collapsed), les labels disparaissent brusquement (re-render JSX complet, pas d'animation de sortie)
3. Survol répété provoque un effet saccadé dû aux timers qui se déclenchent en rafale

**Fixes :**

**1. Supprimer le changement de position** : L'inner div est toujours en `position: absolute` quand collapsed, `position: relative` quand expanded. Le `isFloating` n'a plus besoin de changer le type de positionnement — il ne change que la largeur.

```tsx
// dashboard-shell.tsx — inner div :
<div
  style={{
    width: (collapsed && !hovered) ? '64px' : '256px',
    transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
    position: collapsed ? 'absolute' : 'relative',
    top: 0,
    left: 0,
    height: '100%',
    boxShadow: isFloating ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
    willChange: 'width',
    zIndex: isFloating ? 40 : 'auto',
  }}
>
```

**2. Labels avec transition opacity plutôt que CSS animation** : Remplacer `animate-sidebar-label` par une transition CSS sur `opacity` et `max-width`, déclenchée par un prop `collapsed` passé à chaque label :

```tsx
// sidebar.tsx — label de chaque item :
<span
  style={{
    opacity: collapsed ? 0 : 1,
    maxWidth: collapsed ? 0 : 200,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: collapsed
      ? 'opacity 100ms ease, max-width 220ms cubic-bezier(0.4, 0, 0.2, 1)'
      : 'opacity 150ms ease 80ms, max-width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
  }}
>
  {item.label}
</span>
```

Cela nécessite de **supprimer le rendu conditionnel** (le `if (collapsed) { return ... }` dans `Sidebar`). Les deux modes (collapsed icons-only et expanded) fusionnent en un seul rendu où les labels s'animent en opacity/max-width.

Le tooltip (visible uniquement en mode collapsed sur hover) doit être conditionnel au collapsed state via `pointer-events` et `opacity` :
```tsx
// Tooltip — visible seulement quand collapsed
<span
  className="absolute left-full ml-3 ..."
  style={{ opacity: collapsed ? undefined : 0, pointerEvents: collapsed ? undefined : 'none' }}
>
  {item.label}
</span>
```

**3. Easing amélioré** : Utiliser `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard, plus fluide que `0.32,0.72,0,1`).

**4. Supprimer `animate-sidebar-label` de globals.css** — plus utilisé.

---

## Résumé des fichiers à toucher

| Fichier | Changements |
|---|---|
| `plan-action/_components/tableau-plan-action.tsx` | Structure pyramide, plein écran, redimensionnement colonnes, icône Bell, headers centrés |
| `plan-action/_components/dropdown-responsable.tsx` | Portal fix overflow |
| `plan-action/_components/filtre-colonnes.tsx` | Label rappels sans emoji |
| `dashboard/layout.tsx` | Retirer PaywallBanner |
| `dashboard/page.tsx` | Ajouter PaywallBanner |
| `components/apr/apr-table.tsx` | Prop readOnly + sélecteur colonnes |
| `dashboard/postes/page.tsx` | Fix bouton "Ajouter un poste" |
| `components/dashboard/dashboard-shell.tsx` | Fix position/transition sidebar |
| `components/dashboard/sidebar.tsx` | Labels en opacity transition, suppr. if-collapsed |
| `app/globals.css` | Supprimer animate-sidebar-label |
