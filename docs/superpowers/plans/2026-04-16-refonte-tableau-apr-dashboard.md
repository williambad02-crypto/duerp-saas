# Refonte tableau APR + sidebar + améliorations UX — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fixer définitivement le bug des bordures + refondre l'UI tableau APR en pleine page + réparer la sidebar + intégrer 5 améliorations UX (compteur criticités, détection incomplets, boutons G/P, duplication d'opération, templates métier).

**Architecture:** Modifications concentrées dans `tableau-apr.tsx` (~85% du travail), `dashboard-shell.tsx` + `sidebar.tsx` (fix sidebar), nouvelle server action `dupliquerOperation`, nouveau fichier `templates-metier.ts` + création de poste enrichie avec choix de template.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind CSS, Supabase (Postgres + RLS), Server Actions, dnd-kit, Motion, Zod.

**Spec:** `docs/superpowers/specs/2026-04-16-refonte-tableau-apr-dashboard-design.md`

**Stratégie de test:** Pas de tests unitaires automatisés (projet sans suite de tests). Validation par `npm run build` (typecheck + lint) + tests manuels navigateur (dev server déjà tournant en background).

---

## Task 1 — Bordures stables (`border-collapse: separate`)

Objectif : régler le bug des bordures qui disparaissent au scroll en donnant à chaque cellule ses propres bordures non partagées.

**Files:**
- Modify: `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx`

- [ ] **Step 1: Changer `borderCollapse` sur la table**

Localiser la balise `<table>` (chercher `minWidth: '1850px'`) et remplacer :
```tsx
<table style={{ minWidth: '1850px', borderCollapse: 'separate', borderSpacing: 0 }} className="w-full">
```

- [ ] **Step 2: Réécrire les constantes TH / TH_ZONE / TH2**

Constante `TH` (début du fichier, ~ligne 82) — remplacer :
```tsx
const TH = 'bg-gray-100 border-r border-b border-gray-300 px-3 py-2.5 text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] relative'
```

Constantes `TH_ZONE` et `TH2` dans la fonction `TableauAPR` (~ligne 1427) — remplacer :
```tsx
const TH_ZONE = 'border-r border-b border-t border-gray-300 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-center'
const TH2 = 'bg-gray-50 border-r border-b border-gray-300 px-2 py-2 text-[12px] font-semibold text-gray-700 tracking-normal text-center relative'
```

Règle adoptée : chaque cellule porte `border-r border-b`. TH_ZONE (première rangée) porte aussi `border-t` pour fermer le haut du tableau.

- [ ] **Step 3: Retirer les `style={{ boxShadow }}` des cellules thead colorées et remettre des `border-l-*` classiques**

Localiser `<th colSpan={3}` pour Évaluation — remplacer :
```tsx
<th colSpan={3} className={`${TH_ZONE} bg-yellow-50 text-yellow-700 border-l-4 border-l-blue-300 border-b-0`}>
  Évaluation
</th>
```

Idem pour Plan de Maîtrise :
```tsx
<th colSpan={3} className={`${TH_ZONE} bg-green-50 text-green-700 border-l-4 border-l-green-300 border-b-0`}>
  Plan de Maîtrise
</th>
```

Cellule Opération TH2 — remplacer son `style` par un `style` minimal (juste widths) et mettre les bordures en classe :
```tsx
<th
  className={`${TH2} sticky left-0 z-30 border-l border-l-gray-300 border-r-2 border-r-gray-400`}
  style={{ width: widths.operation, minWidth: widths.operation }}
>
  Opération
  <ColonneResizer colId="operation" onResize={setWidth} />
</th>
```

Cellule Gravité — remettre border-l-4 classique :
```tsx
<th className={`${TH2} border-l-4 border-l-blue-200`} style={{ width: widths.gravite }}>
  Gravité<ColonneResizer colId="gravite" onResize={setWidth} />
</th>
```

Cellule Moyens de maîtrise — idem :
```tsx
<th className={`${TH2} border-l-4 border-l-green-200`} style={{ width: widths.mesures_techniques }}>
  Moyens de maîtrise<ColonneResizer colId="mesures_techniques" onResize={setWidth} />
</th>
```

- [ ] **Step 4: Mettre à jour la constante TD (cellules body)**

Chercher la constante `TD` dans le fichier. Si elle contient `border border-gray-200` (border all sides), la remplacer par :
```tsx
const TD = 'border-r border-b border-gray-200 px-3 py-2 text-xs text-gray-800'
```

Le changement de `px-2 py-1` → `px-3 py-2` sera fait dans Task 4 (aération). Pour Task 1 on conserve le padding actuel, on change seulement la logique des bordures.

- [ ] **Step 5: Mettre à jour la cellule Opération body (sticky left)**

Chercher les deux occurrences de `sticky left-0 z-[12]` dans le fichier (une dans `GroupeOperation` ~ligne 533, une dans l'autre rendu ~ligne 1001).

Pour chaque occurrence, remplacer le className de la `<td>` sticky par :
```tsx
className={`sticky left-0 z-[12] ${stickyBg} border-l border-l-gray-300 border-r-2 border-r-gray-400 border-b border-b-gray-200 w-[140px] min-w-[140px] max-w-[140px] p-0 align-top ${!isFirstGroup ? 'border-t-2 border-t-gray-400' : ''}`}
```

(Remplacer `stickyBg` par `opCellBg` dans l'occurrence du bas si c'est la variable utilisée.)

- [ ] **Step 6: Mettre à jour la cellule Réf body et la Danger body**

Chercher `identifiant_auto` (cellule Réf) et sa className. Remplacer par :
```tsx
<td className={`border-r border-b border-gray-200 px-2 py-2.5 text-[11px] text-gray-400 font-mono whitespace-nowrap${sepClass}`} style={{ width: widths.ref }}>
  {risque.identifiant_auto ?? '—'}
</td>
```

Pour Danger : vérifier que son `tdClassName` n'a que `sepClass` (pas de sticky restant). Déjà fait dans une étape précédente ; si ce n'est pas le cas, retirer tout `sticky left-0 z-[11]` et `shadow-[...]`.

- [ ] **Step 7: Mettre à jour les cellules body avec bordures colorées**

Chercher les 3 occurrences de `border-l-[3px]` dans le fichier. Pour chacune, s'assurer que le `tdClassName` est :
- Gravité body : `border-l-[3px] border-l-blue-200${sepClass}` (et son `<td>` parent a déjà border-r + border-b)
- Criticité brute body (si applicable) : similaire
- Moyens de maîtrise (mesures_techniques) body : `border-l-[3px] border-l-green-200${sepClass}`

- [ ] **Step 8: Vérifier build et test manuel**

Run:
```bash
npm run build
```
Expected: succès sans erreur TypeScript.

Tester dans le navigateur (dev server en background) :
- Ouvrir `/dashboard/postes/[un-id]`
- Scroll vertical dans le tableau → le thead reste sticky, aucune bordure ne disparaît
- Scroll horizontal → colonne Opération sticky, bordures colorées (bleu/vert/gris) restent exactement à leur place
- Resize d'une colonne puis scroll → bordures stables
- Cliquer plein écran, refaire le test

- [ ] **Step 9: Commit**

```bash
git add src/app/dashboard/postes/\[id\]/_components/tableau-apr.tsx
git commit -m "$(cat <<'EOF'
fix(apr): bordures stables au scroll via border-collapse separate

Chaque cellule possède désormais ses propres bordures (right + bottom,
plus left/top sur les bords du tableau) sans partage. Retire les hacks
box-shadow inset qu'on avait empilés sur le thead et les cellules sticky.

Règle définitivement le bug des lignes qui disparaissaient ou bougeaient
quand on scrollait le tbody ou qu'on redimensionnait une colonne.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2 — Sidebar : fix hover + suppression bandeau Entreprise + animations

**Files:**
- Modify: `src/components/dashboard/dashboard-shell.tsx`
- Modify: `src/components/dashboard/sidebar.tsx`

- [ ] **Step 1: Fix width de l'aside en hover (dashboard-shell.tsx)**

Dans `DashboardShell` (~ligne 68), remplacer la `style` de `<aside>` :
```tsx
style={{
  width: (collapsed && !hovered) ? 64 : 256,
  flexShrink: 0,
  transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)',
  position: 'relative',
  zIndex: isFloating ? 40 : 'auto',
  willChange: 'width',
}}
```

Changement : `collapsed ? 64 : 256` → `(collapsed && !hovered) ? 64 : 256`.

- [ ] **Step 2: Retirer le bloc "Entreprise / [nom]" du haut de la sidebar**

Dans `sidebar.tsx`, supprimer intégralement le bloc entre les commentaires `{/* Nom entreprise */}` (~lignes 127-144). Le bloc commence par `{nomEntreprise && (` et se termine par le `)}` de fermeture.

- [ ] **Step 3: Ajouter le nom entreprise en bas, dans le footer existant**

Dans `sidebar.tsx`, remplacer le bloc footer (~lignes 202-225, qui contient le badge abonnement + `SafeAnalyse. — v1.0`) par :
```tsx
<div
  className="px-4 py-4 border-t border-brand-navy-light space-y-2 overflow-hidden"
  style={{
    maxHeight: collapsed ? 48 : 140,
    transition: 'max-height 220ms cubic-bezier(0.4,0,0.2,1)',
  }}
>
  {abonnement && !collapsed && (
    <AbonnementBadge
      statut={abonnement.statut}
      joursRestantsTrial={abonnement.joursRestantsTrial}
    />
  )}
  {nomEntreprise && !collapsed && (
    <p className="text-xs text-brand-cream/70 truncate" title={nomEntreprise}>
      {nomEntreprise}
    </p>
  )}
  <p
    style={{
      opacity: collapsed ? 0 : 0.3,
      transition: 'opacity 150ms ease',
    }}
    className="text-xs text-brand-cream"
  >
    SafeAnalyse. — v1.0
  </p>
</div>
```

- [ ] **Step 4: Simplifier les animations des labels de navigation**

Dans `sidebar.tsx`, dans le `.map` sur `navigation` (~ligne 172), remplacer le `<span>` du label par :
```tsx
<span
  style={{
    opacity: collapsed ? 0 : 1,
    transition: 'opacity 150ms ease',
  }}
  className="whitespace-nowrap overflow-hidden"
>
  {item.label}
</span>
```

Suppression des `maxWidth: collapsed ? 0 : 180` qui causaient du jank. Le clipping est maintenant géré par `overflow: hidden` sur le parent (l'élément `<Link>` a déjà un width contraint par l'aside).

- [ ] **Step 5: Simplifier l'animation du Logo en haut de sidebar**

Même principe pour le `Logo variant="full"` (~lignes 88-98) et le symbole "S" collapsed (~lignes 100-113). Remplacer chaque bloc par une version simplifiée :
```tsx
<div
  style={{
    opacity: collapsed ? 0 : 1,
    transition: 'opacity 150ms ease',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }}
>
  <Logo variant="full" theme="white" height={28} />
</div>
<div
  style={{
    opacity: collapsed ? 1 : 0,
    transition: 'opacity 150ms ease',
    position: 'absolute',
    left: 14,
  }}
>
  <div className="w-8 h-8 rounded-lg bg-brand-gold-light flex items-center justify-center">
    <span className="text-brand-navy font-bold text-base leading-none">S</span>
  </div>
</div>
```

Note : le conteneur du logo doit être `relative` pour que le symbole en absolute se positionne correctement. Vérifier en affichant.

- [ ] **Step 6: Build et tests manuels**

```bash
npm run build
```

Dans le navigateur :
- Sidebar ouverte → tout visible, padding correct.
- Cliquer le bouton toggle → sidebar se replie à 64px sans saccade.
- Hover sur la sidebar repliée → elle s'ouvre complète (256px) doucement.
- Nom entreprise visible en bas, au-dessus de `SafeAnalyse. — v1.0`.
- Pas de bandeau Entreprise en haut.

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/dashboard-shell.tsx src/components/dashboard/sidebar.tsx
git commit -m "$(cat <<'EOF'
fix(sidebar): hover-to-open + nom entreprise en bas + animations fluides

- Fix largeur aside qui ne s'ouvrait pas au hover (condition manquait hovered).
- Suppression du bandeau Entreprise en haut (jankait l'animation).
- Nom entreprise déplacé dans le footer sidebar, au-dessus de la version.
- Animations labels/logo en opacity simple (plus de max-width imbriquées).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 — Aération EVR + Moyens de maîtrise

**Files:**
- Modify: `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx`

- [ ] **Step 1: Mettre à jour DEFAULT_WIDTHS**

Remplacer le bloc `DEFAULT_WIDTHS` (~ligne 111) :
```tsx
const DEFAULT_WIDTHS: Record<string, number> = {
  operation: 140, handle: 32, ref: 72, danger: 180,
  situation_dangereuse: 200, numero_risque_ed840: 240, type_risque: 88,
  evenement_dangereux: 175, dommage: 150, siege_lesions: 140,
  gravite: 120, second: 130, criticite_brute: 100,
  mesures_techniques: 280, coefficient_pm: 110, criticite_residuelle: 110,
  actions: 36,
}
```

- [ ] **Step 2: Changer le padding body cells (TD)**

La constante `TD` a été créée/touchée en Task 1. La remettre à jour :
```tsx
const TD = 'border-r border-b border-gray-200 px-3 py-2 text-xs text-gray-800'
```

Si dans le fichier il existe des cellules hardcodées avec `px-2 py-1` (ex: `<td className="px-2 py-1 border ...">`), les mettre à jour aussi à `px-3 py-2`.

- [ ] **Step 3: Build + test manuel**

```bash
npm run build
```

Dans le navigateur :
- Cliquer le bouton `↻` reset des largeurs dans la toolbar.
- Colonnes Gravité / Probabilité / Moyens de maîtrise / PM / Criticité résiduelle doivent apparaître plus larges.
- Hauteur des lignes visuellement plus confortable.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/postes/\[id\]/_components/tableau-apr.tsx
git commit -m "$(cat <<'EOF'
feat(apr): aération colonnes EVR + Moyens de maîtrise

Nouvelles largeurs par défaut (Gravité 120, Probabilité 130, Maîtrise
280, PM 110, Résiduelle 110) et padding body cells px-3 py-2 pour
plus de respiration. Users avec widths cachés en localStorage : reset
via la toolbar ↻.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 — Détection des risques incomplets

Ajouter un indicateur visuel (point orange) sur chaque ligne dont un champ obligatoire est manquant.

**Files:**
- Modify: `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx`

- [ ] **Step 1: Ajouter une fonction `isRisqueIncomplet` et sa liste des champs manquants**

À ajouter dans le fichier (avant `export function TableauAPR`), bloc de helpers :
```tsx
function champsManquants(risque: RisqueUI): string[] {
  const manquants: string[] = []
  if (!risque.danger?.trim()) manquants.push('Danger')
  if (risque.numero_risque_ed840 === null) manquants.push('Risque ED840')
  if (risque.gravite === null) manquants.push('Gravité')
  if (risque.type_risque === 'aigu' && risque.probabilite === null) manquants.push('Probabilité')
  if (risque.type_risque === 'chronique' && risque.duree_exposition === null) manquants.push('Durée d\'exposition')
  if (risque.coefficient_pm === null || risque.coefficient_pm === undefined) manquants.push('Coefficient PM')
  if ((risque.criticite_residuelle ?? 0) > 4 && !risque.mesures_techniques?.trim()) {
    manquants.push('Moyens de maîtrise')
  }
  return manquants
}
```

- [ ] **Step 2: Afficher le point orange dans la cellule Réf**

Dans le rendu des lignes de risque (chercher la cellule Réf, qui affiche `{risque.identifiant_auto ?? '—'}`), modifier pour inclure un indicateur :
```tsx
<td className={`border-r border-b border-gray-200 px-2 py-2.5 text-[11px] text-gray-400 font-mono whitespace-nowrap${sepClass}`} style={{ width: widths.ref }}>
  <div className="flex items-center gap-1.5">
    {(() => {
      const manquants = champsManquants(risque)
      return manquants.length > 0 ? (
        <span
          className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"
          title={`Champs manquants : ${manquants.join(', ')}`}
          aria-label={`Incomplet : ${manquants.join(', ')}`}
        />
      ) : null
    })()}
    <span>{risque.identifiant_auto ?? '—'}</span>
  </div>
</td>
```

- [ ] **Step 3: Build + test manuel**

```bash
npm run build
```

Dans le navigateur : ajouter un risque sans le remplir (laisser Danger vide) → point orange visible à côté de son R-XXX. Compléter le Danger → le point disparaît après save.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/postes/\[id\]/_components/tableau-apr.tsx
git commit -m "$(cat <<'EOF'
feat(apr): indicateur visuel risques incomplets

Point orange 6px à côté de la référence (R-XXX) quand au moins un champ
obligatoire manque (Danger, ED840, G, P/DE, PM, Moyens de maîtrise si
criticité résiduelle > 4). Tooltip liste les champs manquants.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 — Intégration pleine page (toolbar refondue + ajout opération en fin tbody)

**Files:**
- Modify: `src/app/dashboard/postes/[id]/page.tsx`
- Modify: `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx`

- [ ] **Step 1: Dépouiller page.tsx — plus de bandeau titre/breadcrumb/actions**

Remplacer le contenu de `return (...)` dans `page.tsx` par :
```tsx
return (
  <div className="h-full flex flex-col">
    <div className="-mx-4 lg:-mx-6 flex-1 min-h-0">
      <TableauAPR
        operationsInitiales={operationsUI}
        posteId={poste.id}
        nomPoste={poste.nom}
        descriptionPoste={poste.description ?? null}
      />
    </div>
  </div>
)
```

Retirer les imports de `EditerPosteModal`, `SupprimerPosteButton`, `Link` si devenus inutiles dans `page.tsx`.

- [ ] **Step 2: Accepter les nouvelles props dans TableauAPR**

Dans `tableau-apr.tsx`, modifier la signature du composant `TableauAPR` :
```tsx
export function TableauAPR({
  operationsInitiales,
  posteId,
  nomPoste,
  descriptionPoste,
}: {
  operationsInitiales: OperationUI[]
  posteId: string
  nomPoste: string
  descriptionPoste: string | null
}) {
```

- [ ] **Step 3: Remplacer la toolbar existante par la nouvelle structure**

Localiser la toolbar (bloc `{toolbar}` rendu avant le `<table>`). Remplacer son JSX par :
```tsx
const toolbar = (
  <div className="flex items-center gap-3 h-12 px-4 lg:px-6">

    {/* Gauche : retour + nom poste + menu */}
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href="/dashboard/postes"
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
        title="Retour aux postes"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <h1 className="text-sm font-semibold text-brand-navy truncate max-w-[300px]" title={descriptionPoste ?? nomPoste}>
        {nomPoste}
      </h1>
      <MenuPoste posteId={posteId} nomPoste={nomPoste} descriptionPoste={descriptionPoste} />
    </div>

    {/* Centre : compteur criticités — Task 6 */}
    <div className="flex-1 flex justify-center">
      {/* placeholder pour Task 6 — compteur sera injecté ici */}
    </div>

    {/* Droite : icônes */}
    <div className="flex items-center gap-1 shrink-0">
      <input
        type="text"
        placeholder="Rechercher…"
        value={recherche}
        onChange={e => setRecherche(e.target.value)}
        className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/10 bg-white text-gray-700 w-40"
      />
      <button
        onClick={resetWidths}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
        title="Réinitialiser les largeurs"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={() => setPleinEcran(v => !v)}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
        title={pleinEcran ? 'Quitter le plein écran' : 'Plein écran'}
      >
        {pleinEcran ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
      {/* Bouton PDF et masquer colonnes si déjà présents : garder le même pattern icônes 8×8 */}
    </div>
  </div>
)
```

Ajouter `ArrowLeft` aux imports lucide-react si absent.

- [ ] **Step 4: Créer le composant `MenuPoste` (client component inline dans le fichier)**

À ajouter avant `export function TableauAPR` :
```tsx
function MenuPoste({ posteId, nomPoste, descriptionPoste }: {
  posteId: string; nomPoste: string; descriptionPoste: string | null
}) {
  const [ouvert, setOuvert] = useState(false)
  const [editer, setEditer] = useState(false)
  const [supprimer, setSupprimer] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOuvert(false)
    }
    if (ouvert) document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [ouvert])

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOuvert(v => !v)}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
          title="Actions du poste"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {ouvert && (
          <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
            <button
              onClick={() => { setEditer(true); setOuvert(false) }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Renommer le poste
            </button>
            <button
              onClick={() => { setSupprimer(true); setOuvert(false) }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer le poste
            </button>
            <Link
              href="/dashboard/postes"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              Retour aux postes
            </Link>
          </div>
        )}
      </div>
      {editer && (
        <EditerPosteModal
          poste={{ id: posteId, nom: nomPoste, description: descriptionPoste ?? '' }}
          trigger={false}
          onClose={() => setEditer(false)}
        />
      )}
      {supprimer && (
        <SupprimerPosteModal
          posteId={posteId}
          nomPoste={nomPoste}
          onClose={() => setSupprimer(false)}
        />
      )}
    </>
  )
}
```

Ajouter les imports de `EditerPosteModal` et `SupprimerPosteModal` (à vérifier/créer) dans `tableau-apr.tsx`.

**Note importante :** les composants `EditerPosteModal` et `SupprimerPosteButton` existent actuellement dans `src/components/postes/`. Vérifier leur API (prop `trigger` ou `onClose`) et adapter. Si `SupprimerPosteButton` ne supporte pas le mode "programmatique sans bouton trigger", créer un `SupprimerPosteModal` extrait.

- [ ] **Step 5: Ajouter la ligne "+ Ajouter une opération" en fin de tbody**

À la fin du `<tbody>` (après le `.map` sur `operationsTri`), ajouter :
```tsx
<tr>
  <td
    colSpan={17}
    className="border-b border-gray-200 p-0"
  >
    <button
      onClick={handleAddOperation}
      className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-brand-navy hover:bg-gray-50 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Ajouter une opération
    </button>
  </td>
</tr>
```

Vérifier que `handleAddOperation` (ou son équivalent) existe dans le composant. Sinon, créer :
```tsx
const [ajoutOp, startAjoutOp] = useTransition()
const handleAddOperation = () => {
  startAjoutOp(async () => {
    await actions.ajouterOperation(posteId)
  })
}
```

Vérifier l'existence de `actions.ajouterOperation` dans `actions.ts`. Si absente, l'ajouter (devrait déjà exister car le bouton "Ajouter une opération" dans la toolbar actuelle l'appelle).

- [ ] **Step 6: Supprimer le bouton "Ajouter une opération" de la toolbar ancienne**

Déjà fait implicitement via la nouvelle toolbar (Step 3). Vérifier qu'aucun résidu ne traîne.

- [ ] **Step 7: Build et test manuel**

```bash
npm run build
```

Dans le navigateur, sur `/dashboard/postes/[id]` :
- Le bandeau titre en haut a disparu. La toolbar montre `← [Nom du poste] ⋮` à gauche.
- Cliquer `←` revient à `/dashboard/postes`.
- Cliquer `⋮` ouvre le menu avec Renommer / Supprimer / Retour.
- En bas du tableau, `+ Ajouter une opération` fonctionne.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(apr): intégration pleine page — toolbar refondue + ajout op en fin

- Supprime le bandeau titre poste + Éditer/Supprimer.
- Toolbar en 1 ligne : retour + nom poste + menu ⋮ à gauche ;
  placeholder central pour le compteur criticités ; icônes à droite.
- Ajout d'opération passé dans une dernière ligne du tbody (pattern
  Notion/Linear) — plus de bouton dédié dans la toolbar.
- Ajoute MenuPoste (inline) avec Renommer / Supprimer / Retour.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6 — Compteur criticités + filtres cliquables

**Files:**
- Modify: `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx`

- [ ] **Step 1: Calculer les compteurs (useMemo)**

Dans `TableauAPR`, après la déclaration de `operations` / `operationsTri`, ajouter :
```tsx
type CriticiteZone = 'rouge' | 'orange' | 'jaune' | 'vert' | 'incomplet'

const compteurs = useMemo(() => {
  const c: Record<CriticiteZone, number> = {
    rouge: 0, orange: 0, jaune: 0, vert: 0, incomplet: 0,
  }
  operations.forEach(op => op.risques.forEach(r => {
    if (champsManquants(r).length > 0) { c.incomplet += 1; return }
    const cr = r.criticite_residuelle ?? 0
    if (cr >= 15) c.rouge += 1
    else if (cr >= 10) c.orange += 1
    else if (cr >= 5) c.jaune += 1
    else c.vert += 1
  }))
  return c
}, [operations])

const totalRisques = useMemo(
  () => operations.reduce((n, op) => n + op.risques.length, 0),
  [operations]
)
```

- [ ] **Step 2: Ajouter l'état de filtre**

Après les autres useState dans `TableauAPR` :
```tsx
const [filtreCriticite, setFiltreCriticite] = useState<CriticiteZone | null>(null)
```

- [ ] **Step 3: Filtrer les risques affichés**

Modifier `operationsTri` (ou le filtrage en amont du `.map` sur opérations) pour appliquer le filtre :
```tsx
const operationsAffichees = useMemo(() => {
  if (!filtreCriticite) return operationsTri
  return operationsTri.map(op => ({
    ...op,
    risques: op.risques.filter(r => {
      const incomplet = champsManquants(r).length > 0
      if (filtreCriticite === 'incomplet') return incomplet
      if (incomplet) return false
      const cr = r.criticite_residuelle ?? 0
      if (filtreCriticite === 'rouge') return cr >= 15
      if (filtreCriticite === 'orange') return cr >= 10 && cr < 15
      if (filtreCriticite === 'jaune') return cr >= 5 && cr < 10
      if (filtreCriticite === 'vert') return cr < 5
      return true
    }),
  }))
}, [operationsTri, filtreCriticite])
```

Puis utiliser `operationsAffichees` à la place de `operationsTri` dans le `.map` du `<tbody>`.

- [ ] **Step 4: Créer le composant CompteurCriticites**

À ajouter dans le fichier (avant TableauAPR) :
```tsx
function CompteurCriticites({
  total, compteurs, filtre, onFiltre,
}: {
  total: number
  compteurs: Record<CriticiteZone, number>
  filtre: CriticiteZone | null
  onFiltre: (zone: CriticiteZone | null) => void
}) {
  const zones: { key: CriticiteZone; label: string; color: string }[] = [
    { key: 'rouge', label: 'Rouge', color: 'bg-red-500' },
    { key: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { key: 'jaune', label: 'Jaune', color: 'bg-yellow-400' },
    { key: 'vert', label: 'Vert', color: 'bg-green-500' },
    { key: 'incomplet', label: 'Incomplets', color: 'bg-gray-300' },
  ]
  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={() => onFiltre(null)}
        className={`px-2 py-1 rounded-md transition-colors ${
          filtre === null
            ? 'bg-brand-navy text-white font-semibold'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {total} risques
      </button>
      {zones.map(z => (
        <button
          key={z.key}
          onClick={() => onFiltre(filtre === z.key ? null : z.key)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
            filtre === z.key
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${z.color}`} />
          <span className="font-medium">{compteurs[z.key]}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Intégrer le compteur dans la toolbar**

Dans le JSX `toolbar` de TableauAPR (Task 5 step 3), remplacer le placeholder central par :
```tsx
<div className="flex-1 flex justify-center">
  <CompteurCriticites
    total={totalRisques}
    compteurs={compteurs}
    filtre={filtreCriticite}
    onFiltre={setFiltreCriticite}
  />
</div>
```

- [ ] **Step 6: Build + test manuel**

```bash
npm run build
```

Dans le navigateur :
- Compteurs affichés dans la toolbar.
- Cliquer "Rouge" → seuls les risques rouges visibles, le bouton devient foncé.
- Re-cliquer "Rouge" → affichage complet, bouton désactivé.
- Cliquer "Incomplets" → seuls les risques avec champs manquants.

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/postes/\[id\]/_components/tableau-apr.tsx
git commit -m "$(cat <<'EOF'
feat(apr): compteur criticités + filtres cliquables

Bandeau au centre de la toolbar : total + 5 pills (rouge/orange/jaune/
vert/incomplets). Chaque pill est un filtre toggleable → n'affiche que
les risques de la zone. Bouton "X risques" reset.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7 — Saisie G et P par boutons 1-5

**Files:**
- Modify: `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx`

- [ ] **Step 1: Créer le composant CelluleNoteBoutons**

À ajouter dans le fichier (près des autres CelluleXxx) :
```tsx
function CelluleNoteBoutons({
  ligneId, colonne, valeur, isActive, onActivate, onSave, onTab,
  style, tdClassName = '', disabled = false,
}: {
  ligneId: string; colonne: string; valeur: number | null
  isActive: boolean; onActivate: () => void
  onSave: (v: number | null) => Promise<void>
  onTab?: () => void
  style?: React.CSSProperties
  tdClassName?: string
  disabled?: boolean
}) {
  const zones: { n: number; bg: string; bgActive: string; ring: string }[] = [
    { n: 1, bg: 'bg-green-100 text-green-800 border-green-200', bgActive: 'bg-green-500 text-white border-green-600', ring: 'ring-green-500' },
    { n: 2, bg: 'bg-green-100 text-green-800 border-green-200', bgActive: 'bg-green-500 text-white border-green-600', ring: 'ring-green-500' },
    { n: 3, bg: 'bg-yellow-100 text-yellow-800 border-yellow-200', bgActive: 'bg-yellow-500 text-white border-yellow-600', ring: 'ring-yellow-500' },
    { n: 4, bg: 'bg-orange-100 text-orange-800 border-orange-200', bgActive: 'bg-orange-500 text-white border-orange-600', ring: 'ring-orange-500' },
    { n: 5, bg: 'bg-red-100 text-red-800 border-red-200', bgActive: 'bg-red-500 text-white border-red-600', ring: 'ring-red-500' },
  ]

  const handleClick = async (n: number) => {
    await onSave(n)
    onTab?.()
  }

  return (
    <td
      className={`border-r border-b border-gray-200 p-1 ${disabled ? 'opacity-50' : ''} ${tdClassName}`}
      style={style}
      onClick={!isActive && !disabled ? onActivate : undefined}
    >
      <div className="flex items-center justify-center gap-0.5">
        {zones.map(z => {
          const selected = valeur === z.n
          return (
            <button
              key={z.n}
              disabled={disabled}
              onClick={e => { e.stopPropagation(); handleClick(z.n) }}
              className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-semibold border transition-colors ${
                selected ? z.bgActive : z.bg + ' hover:opacity-80'
              }`}
              title={`Note ${z.n}`}
            >
              {z.n}
            </button>
          )
        })}
      </div>
    </td>
  )
}
```

- [ ] **Step 2: Remplacer les appels CelluleSelect pour gravité et second**

Trouver les 2 cellules `<CelluleSelect ... colonne="gravite"` et `colonne="second"` (pour probabilité/durée exposition).

Pour gravité — remplacer par :
```tsx
<CelluleNoteBoutons
  ligneId={risque.id} colonne="gravite" valeur={risque.gravite}
  isActive={isCell('gravite')} onActivate={() => activate('gravite')}
  onSave={v => onSaveCell(risque.id, 'gravite', v)}
  onTab={() => nextCol('gravite')}
  style={{ width: widths.gravite }}
  tdClassName={`border-l-[3px] border-l-blue-200${sepClass}`}
/>
```

Pour second (probabilité) — identique, avec `colonne="probabilite"` ou `"duree_exposition"` selon le type de risque. Vérifier le code actuel pour conserver la logique existante (notamment le switch aigu/chronique).

- [ ] **Step 3: Build + test manuel**

```bash
npm run build
```

Dans le navigateur :
- Colonnes Gravité et Probabilité affichent 5 boutons colorés.
- Cliquer sur un bouton → valeur sauvée, criticité recalculée.
- La valeur actuelle apparaît en fond solide.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/postes/\[id\]/_components/tableau-apr.tsx
git commit -m "$(cat <<'EOF'
feat(apr): saisie rapide G et P via boutons 1-5 colorés

Remplace les <select> par 5 boutons colorés (vert/jaune/orange/rouge
selon la zone de criticité). Un clic = saisie. Gain significatif sur
les tableaux denses.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8 — Duplication d'opération

**Files:**
- Modify: `src/app/dashboard/postes/[id]/_components/actions.ts`
- Modify: `src/app/dashboard/postes/[id]/_components/tableau-apr.tsx`

- [ ] **Step 1: Créer la server action `dupliquerOperation`**

Dans `actions.ts`, ajouter :
```tsx
export async function dupliquerOperation(operationId: string, posteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // Charger l'opération source + évaluations + plans de maîtrise
  const { data: opSource } = await supabase
    .from('operations')
    .select(`
      id, nom, est_transversale, ordre, poste_id,
      evaluations (
        id, numero_risque_ed840, identifiant_auto, type_risque,
        danger, situation_dangereuse, evenement_dangereux,
        dommage, siege_lesions, gravite, probabilite, duree_exposition,
        criticite_brute, ordre, code_module,
        plans_maitrise (
          coefficient_pm, criticite_residuelle, mesures_techniques,
          mesures_humaines, mesures_organisationnelles, mesures_epi
        )
      )
    `)
    .eq('id', operationId)
    .single()

  if (!opSource) throw new Error('Opération introuvable')
  if (opSource.est_transversale) throw new Error('Impossible de dupliquer l\'opération transversale')

  // Créer la nouvelle opération juste après la source (ordre + 1, décaler les suivantes)
  const nouvelOrdre = (opSource.ordre ?? 0) + 1
  await supabase
    .from('operations')
    .update({ ordre: supabase.rpc('increment_ordre') })
    .gte('ordre', nouvelOrdre)
    .eq('poste_id', posteId)

  const { data: nouvelleOp, error: errOp } = await supabase
    .from('operations')
    .insert({
      poste_id: posteId,
      nom: `${opSource.nom} (copie)`,
      est_transversale: false,
      ordre: nouvelOrdre,
    })
    .select('id')
    .single()

  if (errOp) throw errOp

  // Cloner les évaluations (uniquement APR pour V1)
  const evalsAPR = (opSource.evaluations ?? []).filter((e: any) => e.code_module === 'APR')
  for (const ev of evalsAPR) {
    const { data: newEval, error: errEval } = await supabase
      .from('evaluations')
      .insert({
        operation_id: nouvelleOp.id,
        numero_risque_ed840: ev.numero_risque_ed840,
        type_risque: ev.type_risque,
        danger: ev.danger,
        situation_dangereuse: ev.situation_dangereuse,
        evenement_dangereux: ev.evenement_dangereux,
        dommage: ev.dommage,
        siege_lesions: ev.siege_lesions,
        gravite: ev.gravite,
        probabilite: ev.probabilite,
        duree_exposition: ev.duree_exposition,
        criticite_brute: ev.criticite_brute,
        ordre: ev.ordre,
        code_module: 'APR',
      })
      .select('id')
      .single()

    if (errEval) throw errEval

    // Cloner plan de maîtrise si présent
    const pm = Array.isArray(ev.plans_maitrise) ? ev.plans_maitrise[0] : null
    if (pm) {
      await supabase.from('plans_maitrise').insert({
        evaluation_id: newEval.id,
        coefficient_pm: pm.coefficient_pm,
        criticite_residuelle: pm.criticite_residuelle,
        mesures_techniques: pm.mesures_techniques,
        mesures_humaines: pm.mesures_humaines,
        mesures_organisationnelles: pm.mesures_organisationnelles,
        mesures_epi: pm.mesures_epi,
      })
    }
  }

  revalidatePath(`/dashboard/postes/${posteId}`)
  return { id: nouvelleOp.id, nom: `${opSource.nom} (copie)` }
}
```

**Note :** la fonction `supabase.rpc('increment_ordre')` n'existe peut-être pas. Si oui, remplacer par une stratégie alternative : charger les opérations avec `ordre >= nouvelOrdre`, et les `update` une par une avec `ordre: ordre + 1`. Ou plus simple : insérer la nouvelle opération avec un `ordre` très grand (ex: 9999) et trier en UI par `ordre` — accepter que l'ordre soit "au pire" à la fin.

- [ ] **Step 2: Ajouter l'item "Dupliquer" dans le menu ⋮ de l'opération**

Dans `tableau-apr.tsx`, trouver le menu contextuel des opérations (chercher `onDeleteOperation` dans le rendu d'une opération — il y a probablement un menu avec Renommer / Supprimer). Ajouter un item "Dupliquer" :
```tsx
<button
  onClick={() => {
    setMenuOuvert(false)
    startTransition(async () => {
      await actions.dupliquerOperation(operation.id, posteId)
    })
  }}
  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
>
  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
  </svg>
  Dupliquer l'opération
</button>
```

Cet item ne doit PAS apparaître pour l'opération transversale — masquer conditionnellement : `{!operation.est_transversale && (...)}`.

- [ ] **Step 3: Build + test manuel**

```bash
npm run build
```

Dans le navigateur :
- Ouvrir le menu `⋮` d'une opération non-transversale → "Dupliquer l'opération" visible.
- Cliquer → une nouvelle opération "X (copie)" apparaît juste après, avec tous les risques + PM clonés.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/postes/\[id\]/_components/actions.ts src/app/dashboard/postes/\[id\]/_components/tableau-apr.tsx
git commit -m "$(cat <<'EOF'
feat(apr): duplication d'opération avec tous ses risques + PM

Server action dupliquerOperation clone l'opération, ses évaluations
APR, et leurs plans de maîtrise. Insertion immédiatement après
l'original. Disponible via menu ⋮ (sauf opération transversale).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9 — Templates métier (bibliothèque de risques types)

**Files:**
- Create: `src/lib/constants/templates-metier.ts`
- Modify: `src/components/postes/nouveau-poste-modal.tsx` (ou équivalent — vérifier le nom exact du composant de création)
- Modify: `src/app/dashboard/postes/actions.ts` (ou l'endroit où la création du poste est gérée)

- [ ] **Step 1: Définir les 3 templates métier**

Créer `src/lib/constants/templates-metier.ts` avec :
```tsx
import type { RisqueUI } from '@/app/dashboard/postes/[id]/_components/tableau-apr'

export type TemplateRisque = Pick<
  RisqueUI,
  'numero_risque_ed840' | 'danger' | 'situation_dangereuse' |
  'evenement_dangereux' | 'dommage' | 'type_risque' | 'gravite' | 'probabilite'
> & {
  mesures_techniques_modele?: string | null
}

export type TemplateMetier = {
  code: string
  nom: string
  description: string
  icone: string // emoji pour simplicité V1
  risques: TemplateRisque[]
}

export const TEMPLATES_METIER: TemplateMetier[] = [
  {
    code: 'agro_operateur_production',
    nom: 'Opérateur production agroalimentaire',
    description: 'Préparation, conditionnement, nettoyage en atelier alimentaire.',
    icone: '🏭',
    risques: [
      {
        numero_risque_ed840: 8, // Manutentions manuelles
        danger: 'Manutention manuelle de cartons et bacs',
        situation_dangereuse: 'Port de charges > 15kg de façon répétée',
        evenement_dangereux: 'Lombalgie aiguë',
        dommage: 'Trouble musculo-squelettique lombaire',
        type_risque: 'chronique',
        gravite: 3, probabilite: 3,
        mesures_techniques_modele: 'Aide à la manutention, bacs plus petits, rotation des tâches',
      },
      {
        numero_risque_ed840: 6, // Bruit
        danger: 'Bruit machine de conditionnement',
        situation_dangereuse: 'Exposition continue 8h > 85 dBA',
        evenement_dangereux: 'Dégradation auditive',
        dommage: 'Surdité professionnelle',
        type_risque: 'chronique',
        gravite: 4, probabilite: 3,
        mesures_techniques_modele: 'Capotage machine, EPI bouchons moulés, mesure Lex,8h annuelle',
      },
      {
        numero_risque_ed840: 5, // Chute de plain-pied
        danger: 'Sols humides après nettoyage',
        situation_dangereuse: 'Circulation sur sol mouillé',
        evenement_dangereux: 'Glissade et chute',
        dommage: 'Contusion, fracture membre',
        type_risque: 'aigu',
        gravite: 3, probabilite: 3,
        mesures_techniques_modele: 'Signalétique sol mouillé, chaussures antidérapantes',
      },
      {
        numero_risque_ed840: 3, // Chute de hauteur
        danger: 'Travail sur plateforme élévatrice pour approvisionnement',
        situation_dangereuse: 'Travail à > 2m sans harnais',
        evenement_dangereux: 'Chute de hauteur',
        dommage: 'Traumatisme grave',
        type_risque: 'aigu',
        gravite: 5, probabilite: 2,
        mesures_techniques_modele: 'Plateforme certifiée, harnais obligatoire, formation',
      },
      {
        numero_risque_ed840: 2, // Coupures
        danger: 'Utilisation de couteaux de parage',
        situation_dangereuse: 'Découpe manuelle produits',
        evenement_dangereux: 'Coupure main/doigt',
        dommage: 'Plaie, section de tendon',
        type_risque: 'aigu',
        gravite: 3, probabilite: 3,
        mesures_techniques_modele: 'Gants anti-coupures, affûtage régulier, formation geste',
      },
      {
        numero_risque_ed840: 11, // Ambiance thermique
        danger: 'Travail en chambre froide',
        situation_dangereuse: 'Exposition prolongée à 4°C',
        evenement_dangereux: 'Hypothermie, engelures',
        dommage: 'Affections dues au froid',
        type_risque: 'chronique',
        gravite: 3, probabilite: 3,
        mesures_techniques_modele: 'EPI thermiques, rotation, boisson chaude accessible',
      },
      {
        numero_risque_ed840: 12, // Biologique
        danger: 'Contact avec produits alimentaires crus',
        situation_dangereuse: 'Manipulation viande/volaille fraîche',
        evenement_dangereux: 'Contamination cutanée ou digestive',
        dommage: 'Infection (salmonelle, listeria)',
        type_risque: 'chronique',
        gravite: 3, probabilite: 2,
        mesures_techniques_modele: 'Hygiène stricte, gants, vestiaires séparés',
      },
      {
        numero_risque_ed840: 9, // Postures
        danger: 'Posture debout prolongée',
        situation_dangereuse: '8h debout sur ligne de production',
        evenement_dangereux: 'Fatigue, TMS membre inférieur',
        dommage: 'Insuffisance veineuse, TMS',
        type_risque: 'chronique',
        gravite: 2, probabilite: 4,
        mesures_techniques_modele: 'Tapis anti-fatigue, rotation, sièges debout',
      },
    ],
  },
  {
    code: 'chauffeur_livreur_pl',
    nom: 'Chauffeur-livreur poids lourd',
    description: 'Conduite longue distance, livraisons, manutention.',
    icone: '🚚',
    risques: [
      {
        numero_risque_ed840: 14, // Risque routier
        danger: 'Conduite sur route/autoroute',
        situation_dangereuse: 'Longs trajets, fatigue',
        evenement_dangereux: 'Accident de la circulation',
        dommage: 'Traumatisme, décès',
        type_risque: 'aigu',
        gravite: 5, probabilite: 2,
        mesures_techniques_modele: 'Pauses régulières, limitateur vitesse, GPS, formation ECO',
      },
      {
        numero_risque_ed840: 8,
        danger: 'Manutention de colis lourds',
        situation_dangereuse: 'Chargement/déchargement multiple par jour',
        evenement_dangereux: 'Lombalgie',
        dommage: 'TMS rachis',
        type_risque: 'chronique',
        gravite: 3, probabilite: 4,
        mesures_techniques_modele: 'Transpalette électrique, hayon, gestes et postures',
      },
      {
        numero_risque_ed840: 5,
        danger: 'Sortie/entrée cabine camion',
        situation_dangereuse: 'Descente sans utiliser les marches',
        evenement_dangereux: 'Chute',
        dommage: 'Entorse, fracture',
        type_risque: 'aigu',
        gravite: 3, probabilite: 3,
        mesures_techniques_modele: 'Marchepieds propres, formation "3 points de contact"',
      },
      {
        numero_risque_ed840: 9,
        danger: 'Posture assise prolongée',
        situation_dangereuse: '>6h/j au volant',
        evenement_dangereux: 'TMS dos, jambes',
        dommage: 'Lombalgie chronique',
        type_risque: 'chronique',
        gravite: 3, probabilite: 4,
        mesures_techniques_modele: 'Siège ergonomique, pauses marche',
      },
      {
        numero_risque_ed840: 15, // RPS
        danger: 'Stress délais livraison',
        situation_dangereuse: 'Contraintes temporelles fortes',
        evenement_dangereux: 'Épuisement, burn-out',
        dommage: 'Trouble anxio-dépressif',
        type_risque: 'chronique',
        gravite: 3, probabilite: 3,
        mesures_techniques_modele: 'Planning réaliste, écoute RH, formation gestion stress',
      },
    ],
  },
  {
    code: 'agent_bureau',
    nom: 'Agent administratif / bureau',
    description: 'Poste sédentaire sur écran en open-space ou bureau.',
    icone: '💼',
    risques: [
      {
        numero_risque_ed840: 9,
        danger: 'Travail prolongé sur écran',
        situation_dangereuse: 'Posture statique > 7h/j',
        evenement_dangereux: 'Douleurs cou/épaules/poignet',
        dommage: 'TMS membres supérieurs, cervicalgie',
        type_risque: 'chronique',
        gravite: 2, probabilite: 4,
        mesures_techniques_modele: 'Fauteuil ergonomique, écran à hauteur des yeux, pauses visuelles 20-20-20',
      },
      {
        numero_risque_ed840: 15,
        danger: 'Charge mentale / pression temps',
        situation_dangereuse: 'Multiplicité tâches, interruptions, deadlines',
        evenement_dangereux: 'Stress chronique',
        dommage: 'Burn-out, troubles du sommeil',
        type_risque: 'chronique',
        gravite: 3, probabilite: 3,
        mesures_techniques_modele: 'Formation gestion temps, régulation charge, droit déconnexion',
      },
      {
        numero_risque_ed840: 14,
        danger: 'Trajet domicile-travail',
        situation_dangereuse: 'Conduite quotidienne',
        evenement_dangereux: 'Accident de trajet',
        dommage: 'Traumatisme',
        type_risque: 'aigu',
        gravite: 4, probabilite: 2,
        mesures_techniques_modele: 'Covoiturage, transport en commun, sensibilisation',
      },
      {
        numero_risque_ed840: 5,
        danger: 'Câbles au sol dans le bureau',
        situation_dangereuse: 'Passage fréquent entre postes',
        evenement_dangereux: 'Chute de plain-pied',
        dommage: 'Entorse, contusion',
        type_risque: 'aigu',
        gravite: 2, probabilite: 2,
        mesures_techniques_modele: 'Gaine-câbles, rangement',
      },
    ],
  },
]
```

**À valider par William :** le contenu métier (numéros ED840 exacts, G/P suggérés, mesures type). Pour l'instant, valeurs initiales plausibles. Marquer `code` pour pouvoir référencer ultérieurement.

- [ ] **Step 2: Trouver et adapter le modal de création de poste**

Exécuter pour trouver :
```bash
grep -rn "nouveau.*poste\|creerPoste\|AddPoste\|CreatePoste" src/
```

Identifier le composant responsable (probablement dans `src/components/postes/`). Le modal actuel doit accepter un nom + description. Modifier pour ajouter une 2e étape "Template" :

```tsx
// Dans le modal de création
const [etape, setEtape] = useState<'infos' | 'template'>('infos')
const [templateChoisi, setTemplateChoisi] = useState<string | null>(null)

// Étape 1 : formulaire actuel (nom + description) + bouton "Suivant"
// Étape 2 : grid de 4 cards (Partir de zéro + 3 templates)

{etape === 'template' && (
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={() => setTemplateChoisi(null)}
      className={`p-4 border-2 rounded-xl text-left transition-colors ${
        templateChoisi === null ? 'border-brand-navy bg-brand-navy/5' : 'border-gray-200 hover:border-brand-navy/40'
      }`}
    >
      <div className="text-2xl mb-2">📋</div>
      <div className="text-sm font-semibold text-brand-navy">Partir de zéro</div>
      <div className="text-xs text-gray-500 mt-1">Aucun risque pré-rempli</div>
    </button>
    {TEMPLATES_METIER.map(t => (
      <button
        key={t.code}
        onClick={() => setTemplateChoisi(t.code)}
        className={`p-4 border-2 rounded-xl text-left transition-colors ${
          templateChoisi === t.code ? 'border-brand-navy bg-brand-navy/5' : 'border-gray-200 hover:border-brand-navy/40'
        }`}
      >
        <div className="text-2xl mb-2">{t.icone}</div>
        <div className="text-sm font-semibold text-brand-navy">{t.nom}</div>
        <div className="text-xs text-gray-500 mt-1">{t.risques.length} risques pré-remplis</div>
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 3: Modifier la server action de création de poste**

Dans la server action qui crée le poste, ajouter la prise en compte du template :
```tsx
export async function creerPoste(params: {
  nom: string
  description?: string | null
  templateCode?: string | null
}) {
  const supabase = await createClient()
  // ... création du poste habituelle ...
  const { data: nouveauPoste } = await supabase
    .from('postes')
    .insert({ /* ... */ })
    .select('id')
    .single()

  // Si un template est choisi, injecter les risques dans l'opération "Toutes opérations"
  if (params.templateCode) {
    const template = TEMPLATES_METIER.find(t => t.code === params.templateCode)
    if (!template) return { id: nouveauPoste.id }

    // Récupérer l'opération transversale (créée par trigger DB)
    const { data: opTransverse } = await supabase
      .from('operations')
      .select('id')
      .eq('poste_id', nouveauPoste.id)
      .eq('est_transversale', true)
      .single()

    if (!opTransverse) return { id: nouveauPoste.id }

    // Insérer chaque risque du template
    for (let i = 0; i < template.risques.length; i++) {
      const r = template.risques[i]
      const { data: newEval } = await supabase
        .from('evaluations')
        .insert({
          operation_id: opTransverse.id,
          numero_risque_ed840: r.numero_risque_ed840,
          type_risque: r.type_risque,
          danger: r.danger,
          situation_dangereuse: r.situation_dangereuse,
          evenement_dangereux: r.evenement_dangereux,
          dommage: r.dommage,
          gravite: r.gravite,
          probabilite: r.type_risque === 'aigu' ? r.probabilite : null,
          duree_exposition: r.type_risque === 'chronique' ? r.probabilite : null,
          ordre: i,
          code_module: 'APR',
        })
        .select('id')
        .single()

      if (newEval && r.mesures_techniques_modele) {
        await supabase.from('plans_maitrise').insert({
          evaluation_id: newEval.id,
          coefficient_pm: 0,
          mesures_techniques: r.mesures_techniques_modele,
        })
      }
    }
  }

  return { id: nouveauPoste.id }
}
```

**Note** : vérifier que les colonnes et contraintes DB correspondent à ce schéma. Si le trigger DB crée déjà l'évaluation "Aucun risque" par défaut, ne pas la créer en doublon.

- [ ] **Step 4: Build + test manuel**

```bash
npm run build
```

Dans le navigateur :
- Créer un nouveau poste → étape 1 (nom) puis étape 2 (templates).
- Choisir "Opérateur production agroalimentaire" → création du poste avec 8 risques pré-remplis dans "Toutes opérations".
- Vérifier que les G/P/mesures sont bien là.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(postes): bibliothèque de templates métier (3 templates V1)

Ajoute 3 templates : Opérateur agroalimentaire, Chauffeur-livreur PL,
Agent administratif. À la création d'un poste, une 2e étape permet
de choisir un template → pré-remplit l'opération "Toutes opérations"
avec 5-8 risques ED 840 avec G, P et mesures types modifiables.

Le contenu doit être affiné par William (expert HSE) avant validation.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10 — Push final & vérification prod

- [ ] **Step 1: Push vers origin**

```bash
git push
```

- [ ] **Step 2: Attendre build Vercel**

Vérifier sur https://vercel.com/dashboard que le déploiement passe.

- [ ] **Step 3: Test rapide prod**

Sur https://duerp-saas.vercel.app, login, ouvrir un poste, vérifier les 9 points :
1. Pas de bordures qui bougent au scroll.
2. Toolbar minimaliste avec nom poste + menu ⋮.
3. Compteur criticités fonctionnel.
4. Point orange sur les risques incomplets.
5. Boutons G/P 1-5 colorés.
6. Sidebar hover ouvre bien + pas de bandeau Entreprise (en haut).
7. Colonnes EVR / Maîtrise plus larges (reset widths si besoin).
8. Duplication d'opération fonctionne.
9. Templates disponibles à la création d'un poste.

---

## Self-Review

**Spec coverage :** toutes les 9 sections du spec ont un task associé (1→1, 2→5, 3→2, 4→3, 5→6, 6→4, 7→7, 8→8, 9→9). ✓

**Placeholder scan :** aucun TBD / TODO / "similar to Task N" sans code. Quelques "à valider" (contenu templates métier) explicitement flaggés comme nécessitant validation humaine, ce qui est acceptable. ✓

**Type consistency :** `RisqueUI` / `OperationUI` référencés cohéremment, types alignés avec le schéma actuel. ✓

**Points de vigilance :**
- Task 5 (toolbar refonte) : les composants `EditerPosteModal` / `SupprimerPosteButton` existants ne sont peut-être pas conçus pour un usage programmatique sans bouton trigger. Si leur API ne le permet pas, il faudra soit les refondre (simple), soit créer un wrapper.
- Task 8 (duplication) : la fonction SQL `increment_ordre` est mentionnée mais n'existe probablement pas. La stratégie alternative (insertion à `ordre=9999`) est acceptable en V1.
- Task 9 (templates) : le contenu métier (G/P/mesures) doit être validé par William avant validation. Le plan livre une V1 plausible.

---
