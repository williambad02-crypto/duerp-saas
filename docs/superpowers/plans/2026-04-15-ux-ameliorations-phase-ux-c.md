# UX Améliorations Phase C — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Améliorer la lisibilité et la fluidité du tableau Plan d'action (pyramide rowspan + couleurs hiérarchiques, plein écran, redimensionnement colonnes, fix dropdown overflow), déplacer la bannière essai sur le dashboard uniquement, rendre le tableau APR récap personnalisable en lecture seule, corriger le bouton "Ajouter un poste", et fluidifier l'animation de la sidebar.

**Architecture:** Modifications localisées dans des fichiers clients existants — pas de changement de schéma DB ni de Server Actions. La pyramide rowspan remplace le rendu ligne-par-ligne par un rendu groupé. Les dropdowns utilisent `createPortal` pour échapper au `overflow: hidden` du container. La sidebar fusionne ses deux modes en un seul rendu avec transitions opacity/max-width.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS, Lucide React, `createPortal` React, CSS transitions.

---

## Structure des fichiers

| Fichier | Rôle dans ce plan |
|---|---|
| `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx` | Pyramide rowspan + couleurs + plein écran + resize colonnes + Bell icon |
| `src/app/dashboard/plan-action/_components/dropdown-responsable.tsx` | Fix overflow avec createPortal |
| `src/app/dashboard/plan-action/_components/filtre-colonnes.tsx` | Supprimer emoji cloche du label |
| `src/app/dashboard/layout.tsx` | Retirer PaywallBanner |
| `src/app/dashboard/page.tsx` | Ajouter PaywallBanner (déjà import getInfoAbonnement) |
| `src/components/apr/apr-table.tsx` | Prop readOnly + bouton colonnes visibles |
| `src/app/dashboard/postes/page.tsx` | Fix bouton "Ajouter un poste" |
| `src/components/dashboard/dashboard-shell.tsx` | Fix transition sidebar |
| `src/components/dashboard/sidebar.tsx` | Rendu unifié, labels opacity transition |
| `src/app/globals.css` | Supprimer `animate-sidebar-label` |

---

## Task 1 — Fix dropdown overflow avec createPortal

**Contexte :** Le container du tableau a `overflow-x-auto` qui clippe les dropdowns. `DropdownResponsable` doit rendre son menu dans `document.body` via `createPortal`.

**Fichiers :**
- Modifier : `src/app/dashboard/plan-action/_components/dropdown-responsable.tsx`

Lire d'abord le fichier pour comprendre sa structure actuelle.

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat src/app/dashboard/plan-action/_components/dropdown-responsable.tsx
```

- [ ] **Step 2 : Réécrire avec createPortal**

Remplacer le contenu complet de `dropdown-responsable.tsx` par :

```tsx
'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { createContact, type Contact } from '../../parametres/contacts/_actions'

interface Props {
  contacts: Contact[]
  selectedId: string | null
  onChange: (contactId: string | null, newContact?: Contact) => void
}

export function DropdownResponsable({ contacts, selectedId, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const selected = contacts.find(c => c.id === selectedId)

  function openDropdown() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 200),
    })
    setOpen(true)
  }

  function handleSelect(id: string | null) {
    onChange(id ?? null)
    setOpen(false)
    setShowNew(false)
  }

  async function handleCreateContact() {
    if (!prenom.trim() || !nom.trim() || !email.trim()) return
    startTransition(async () => {
      const newContact = await createContact({
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.trim(),
        role: 'autre',
      })
      onChange(newContact.id, newContact)
      setOpen(false)
      setShowNew(false)
      setPrenom(''); setNom(''); setEmail('')
    })
  }

  // Fermer en cliquant hors du dropdown
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      const target = e.target as Node
      if (!triggerRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const dropdown = open ? (
    <div
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 9999,
      }}
      className="bg-white border border-gray-200 rounded-lg shadow-xl"
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Option "Aucun" */}
      <button
        onClick={() => handleSelect(null)}
        className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 border-b border-gray-100"
      >
        — Aucun responsable
      </button>

      {/* Liste des contacts */}
      <div className="max-h-48 overflow-y-auto">
        {contacts.map(c => (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors ${
              c.id === selectedId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
            }`}
          >
            <span className="font-medium">{c.prenom} {c.nom}</span>
            <span className="text-gray-400 ml-1">· {c.email}</span>
          </button>
        ))}
      </div>

      {/* Ajouter un contact */}
      {!showNew ? (
        <button
          onClick={() => setShowNew(true)}
          className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium"
        >
          + Nouveau contact
        </button>
      ) : (
        <div className="p-2 border-t border-gray-100 space-y-1">
          <input
            autoFocus
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
            placeholder="Prénom"
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <input
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder="Nom"
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <div className="flex gap-1 pt-0.5">
            <button
              onClick={handleCreateContact}
              disabled={isPending || !prenom.trim() || !nom.trim() || !email.trim()}
              className="flex-1 text-xs bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Création...' : 'Créer'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="text-xs text-gray-500 px-2 py-1 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openDropdown}
        className="w-full text-left text-xs text-gray-700 hover:bg-blue-50 rounded px-1 py-0.5 transition-colors truncate"
      >
        {selected ? `${selected.prenom} ${selected.nom}` : <span className="text-gray-300 italic">— Assigner</span>}
      </button>
      {mounted && dropdown && createPortal(dropdown, document.body)}
    </>
  )
}
```

- [ ] **Step 3 : Vérifier le build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓" | tail -20
```

Expected : aucune erreur TypeScript sur ce fichier.

- [ ] **Step 4 : Commit**

```bash
git add src/app/dashboard/plan-action/_components/dropdown-responsable.tsx
git commit -m "fix: dropdown responsable via createPortal (escape overflow)"
```

---

## Task 2 — Structure pyramide rowspan + couleurs hiérarchiques

**Contexte :** Refonte du rendu du tableau Plan d'action pour afficher la structure Poste → Opération → Risques avec `rowspan`. Les palettes de couleurs alternent par poste (impair=bleu navy, pair=violet). Toute la ligne risque est colorée.

**Fichiers :**
- Modifier : `src/app/dashboard/plan-action/_components/tableau-plan-action.tsx`

- [ ] **Step 1 : Ajouter les palettes et la fonction de groupement en haut du fichier**

Après les imports existants, ajouter avant le composant `BadgeCriticite` :

```tsx
// ─── Palettes de couleurs hiérarchiques ─────────────────────────────────────

const PALETTES = [
  {
    poste: { bg: '#031948', color: 'white' },
    operation: { bg: '#dbeafe', color: '#1e3a8a' },
    risque: '#eff6ff',
  },
  {
    poste: { bg: '#3730a3', color: 'white' },
    operation: { bg: '#ede9fe', color: '#4c1d95' },
    risque: '#f5f3ff',
  },
] as const

// ─── Groupement par poste → opération ────────────────────────────────────────

type GroupeOperation = { operationNom: string; risques: EvaluationAvecAction[] }
type GroupePoste = { posteNom: string; operations: GroupeOperation[] }

function groupParPosteEtOperation(rows: EvaluationAvecAction[]): GroupePoste[] {
  const postes = new Map<string, Map<string, EvaluationAvecAction[]>>()
  for (const row of rows) {
    if (!postes.has(row.poste_nom)) postes.set(row.poste_nom, new Map())
    const opMap = postes.get(row.poste_nom)!
    if (!opMap.has(row.operation_nom)) opMap.set(row.operation_nom, [])
    opMap.get(row.operation_nom)!.push(row)
  }
  return Array.from(postes.entries()).map(([posteNom, opMap]) => ({
    posteNom,
    operations: Array.from(opMap.entries()).map(([operationNom, risques]) => ({
      operationNom,
      risques,
    })),
  }))
}
```

- [ ] **Step 2 : Ajouter les imports Lucide manquants**

En tête du fichier, modifier la ligne d'import pour ajouter `Maximize2`, `Minimize2`, `Bell` :

```tsx
import { useState, useTransition, useRef, useCallback } from 'react'
import { Maximize2, Minimize2, Bell } from 'lucide-react'
```

- [ ] **Step 3 : Remplacer le rendu du tableau et de son container**

Dans le composant `TableauPlanAction`, remplacer la section `{/* Tableau */}` (ligne commençant par `<div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">`) jusqu'à la fin de la `</div>` du tableau, par :

```tsx
      {/* Tableau */}
      <div className={fullscreen ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-6 space-y-4' : ''}>
        {/* Bouton plein écran */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setFullscreen(f => !f)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
          <table className="border-collapse w-full min-w-[700px]" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {/* Super-headers */}
                <th
                  colSpan={4 + (colonnes.mesures_existantes ? 1 : 0)}
                  className="py-2 px-3 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-400 text-center uppercase tracking-wide border-r-2 border-blue-100"
                >
                  ← Depuis l&apos;APR (lecture seule)
                </th>
                <th
                  colSpan={
                    1 +
                    (colonnes.type_prevention ? 1 : 0) +
                    (colonnes.facilite ? 1 : 0) +
                    (colonnes.responsable ? 1 : 0) +
                    (colonnes.echeance ? 1 : 0) +
                    1 +
                    (colonnes.rappels ? 1 : 0)
                  }
                  className="py-2 px-3 bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 text-center uppercase tracking-wide"
                >
                  Action corrective ✏️
                </th>
                {colonnes.criticite_cible && (
                  <th className="py-2 px-3 bg-green-50 border border-green-100 text-xs font-bold text-green-600 text-center uppercase tracking-wide">
                    Résultat
                  </th>
                )}
              </tr>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th style={{ width: 36 }} className="px-3 py-2 text-center text-xs font-bold text-gray-500 whitespace-nowrap relative">
                  Poste
                  <ResizeHandle colId="poste" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                <th style={{ width: colWidths.operation ?? 110 }} className="px-3 py-2 text-center text-xs font-bold text-gray-500 whitespace-nowrap relative">
                  Opération
                  <ResizeHandle colId="operation" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                <th style={{ width: colWidths.danger ?? 160 }} className="px-3 py-2 text-center text-xs font-bold text-gray-500 relative">
                  Danger
                  <ResizeHandle colId="danger" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                <th style={{ width: colWidths.criticite ?? 70 }} className="px-3 py-2 text-center text-xs font-bold text-gray-500 whitespace-nowrap relative">
                  C. résid.
                  <ResizeHandle colId="criticite" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                {colonnes.mesures_existantes && (
                  <th style={{ width: colWidths.mesures ?? 120 }} className="px-3 py-2 text-center text-xs font-bold text-gray-500 border-r-2 border-blue-100 whitespace-nowrap relative">
                    Mesures exist.
                    <ResizeHandle colId="mesures" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                <th style={{ width: colWidths.description ?? 180 }} className="px-3 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 relative">
                  Description
                  <ResizeHandle colId="description" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                {colonnes.type_prevention && (
                  <th style={{ width: colWidths.type_prevention ?? 110 }} className="px-3 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 whitespace-nowrap relative">
                    Type PGP
                    <ResizeHandle colId="type_prevention" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                {colonnes.facilite && (
                  <th style={{ width: colWidths.facilite ?? 80 }} className="px-3 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 relative">
                    Facilité
                    <ResizeHandle colId="facilite" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                {colonnes.responsable && (
                  <th style={{ width: colWidths.responsable ?? 160 }} className="px-3 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 relative">
                    Responsable
                    <ResizeHandle colId="responsable" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                {colonnes.echeance && (
                  <th style={{ width: colWidths.echeance ?? 100 }} className="px-3 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 whitespace-nowrap relative">
                    Échéance
                    <ResizeHandle colId="echeance" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                <th style={{ width: colWidths.statut ?? 90 }} className="px-3 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 relative">
                  Statut
                  <ResizeHandle colId="statut" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                {colonnes.rappels && (
                  <th style={{ width: colWidths.rappels ?? 56 }} className="px-3 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 relative">
                    <Bell className="w-3.5 h-3.5 inline" />
                    <ResizeHandle colId="rappels" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                {colonnes.criticite_cible && (
                  <th style={{ width: colWidths.criticite_cible ?? 70 }} className="px-3 py-2 text-center text-xs font-bold text-green-600 bg-green-50/40 whitespace-nowrap relative">
                    C. cible
                    <ResizeHandle colId="criticite_cible" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={99} className="px-6 py-12 text-center text-sm text-gray-400">
                    Aucune action à afficher. Décochez les filtres ou activez l&apos;affichage des risques verts.
                  </td>
                </tr>
              ) : (
                groupParPosteEtOperation(filtered).map((groupe, posteIndex) => {
                  const palette = PALETTES[posteIndex % 2]
                  const totalRisques = groupe.operations.reduce((s, op) => s + op.risques.length, 0)
                  return groupe.operations.map((op, opIndex) =>
                    op.risques.map((row, risqueIndex) => {
                      const isFirstOfPoste = opIndex === 0 && risqueIndex === 0
                      const isFirstOfOp = risqueIndex === 0
                      const action = row.action
                      const statut: ActionPlan['statut'] = action?.statut ?? 'a_faire'
                      const rappelsActifs = action?.rappels_actifs ?? true
                      const riskBg = palette.risque

                      return (
                        <tr
                          key={row.id}
                          className="transition-colors hover:brightness-95"
                          style={{ borderTop: isFirstOfPoste && posteIndex > 0 ? '2px solid #94a3b8' : undefined }}
                        >
                          {/* Cellule Poste fusionnée */}
                          {isFirstOfPoste && (
                            <td
                              rowSpan={totalRisques}
                              style={{
                                background: palette.poste.bg,
                                color: palette.poste.color,
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: 11,
                                letterSpacing: '0.03em',
                                width: 36,
                                border: '1px solid rgba(255,255,255,0.1)',
                              }}
                            >
                              {row.poste_nom}
                            </td>
                          )}

                          {/* Cellule Opération fusionnée */}
                          {isFirstOfOp && (
                            <td
                              rowSpan={op.risques.length}
                              style={{
                                background: palette.operation.bg,
                                color: palette.operation.color,
                                fontWeight: 600,
                                fontSize: 11,
                                padding: '6px 10px',
                                border: '1px solid rgba(0,0,0,0.06)',
                                verticalAlign: 'middle',
                              }}
                            >
                              {op.operationNom}
                            </td>
                          )}

                          {/* Danger */}
                          <td style={{ background: riskBg }} className="px-3 py-2 text-sm text-gray-700 border border-gray-200">
                            {row.danger}
                          </td>

                          {/* C. résid. */}
                          <td style={{ background: riskBg }} className="px-3 py-2 text-center border border-gray-200">
                            <BadgeCriticite valeur={row.criticite_residuelle ?? row.criticite_brute} />
                          </td>

                          {/* Mesures existantes */}
                          {colonnes.mesures_existantes && (
                            <td style={{ background: riskBg }} className="px-3 py-2 text-xs text-gray-500 max-w-[120px] truncate border-r-2 border-blue-100 border border-gray-200">
                              {row.mesures_existantes || <span className="text-gray-300 italic">Aucune</span>}
                            </td>
                          )}

                          {/* Description */}
                          <td style={{ background: riskBg }} className="px-2 py-1 border border-gray-200">
                            <input
                              defaultValue={action?.description ?? ''}
                              placeholder="Cliquer pour saisir…"
                              onBlur={e => handleCellBlur(row.id, action?.id, 'description', e.target.value || null)}
                              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-300 placeholder:italic focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5"
                            />
                          </td>

                          {/* Type PGP */}
                          {colonnes.type_prevention && (
                            <td style={{ background: riskBg }} className="px-2 py-1 border border-gray-200">
                              <select
                                defaultValue={action?.type_prevention ?? ''}
                                onBlur={e => handleCellBlur(row.id, action?.id, 'type_prevention', e.target.value || null)}
                                className="text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded w-full text-gray-600"
                              >
                                <option value="">—</option>
                                {Object.entries(PGP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                              </select>
                            </td>
                          )}

                          {/* Facilité */}
                          {colonnes.facilite && (
                            <td style={{ background: riskBg }} className="px-2 py-1 text-center border border-gray-200">
                              <select
                                defaultValue={action?.facilite ?? ''}
                                onBlur={e => handleCellBlur(row.id, action?.id, 'facilite', e.target.value || null)}
                                className="text-xs bg-transparent border-none focus:outline-none w-full text-center"
                              >
                                <option value="">—</option>
                                <option value="facile">Facile</option>
                                <option value="moyen">Moyen</option>
                                <option value="complexe">Complexe</option>
                              </select>
                            </td>
                          )}

                          {/* Responsable */}
                          {colonnes.responsable && (
                            <td style={{ background: riskBg }} className="px-2 py-1 border border-gray-200">
                              <DropdownResponsable
                                contacts={contacts}
                                selectedId={action?.contact_id ?? null}
                                onChange={(contactId) => {
                                  updateRowAction(row.id, { contact_id: contactId })
                                  handleCellBlur(row.id, action?.id, 'contact_id', contactId)
                                }}
                              />
                            </td>
                          )}

                          {/* Échéance */}
                          {colonnes.echeance && (
                            <td style={{ background: riskBg }} className="px-2 py-1 border border-gray-200">
                              <input
                                type="date"
                                defaultValue={action?.echeance ?? ''}
                                onBlur={e => handleCellBlur(row.id, action?.id, 'echeance', e.target.value || null)}
                                className="text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded w-full"
                              />
                            </td>
                          )}

                          {/* Statut */}
                          <td style={{ background: riskBg }} className="px-2 py-1 border border-gray-200">
                            <select
                              value={statut}
                              onChange={e => handleStatutChange(row, e.target.value as ActionPlan['statut'])}
                              className={`text-xs font-semibold rounded-full px-2 py-0.5 border-none focus:outline-none cursor-pointer ${STATUT_COLORS[statut]}`}
                            >
                              {Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          </td>

                          {/* Rappels */}
                          {colonnes.rappels && (
                            <td style={{ background: riskBg }} className="px-2 py-1 text-center border border-gray-200">
                              <button
                                onClick={() => handleToggleRappels(row)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${rappelsActifs ? 'bg-green-500' : 'bg-gray-300'}`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${rappelsActifs ? 'translate-x-4' : 'translate-x-1'}`} />
                              </button>
                            </td>
                          )}

                          {/* C. cible */}
                          {colonnes.criticite_cible && (
                            <td style={{ background: riskBg }} className="px-3 py-2 text-center border border-gray-200">
                              <BadgeCriticite valeur={action?.criticite_cible ?? null} />
                            </td>
                          )}
                        </tr>
                      )
                    })
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
```

- [ ] **Step 4 : Ajouter le state `fullscreen` et `colWidths` dans le composant**

Dans le composant `TableauPlanAction`, après `const [isPending, startTransition] = useTransition()`, ajouter :

```tsx
  const [fullscreen, setFullscreen] = useState(false)
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('plan-action-col-widths')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
```

- [ ] **Step 5 : Ajouter le composant ResizeHandle avant TableauPlanAction**

Avant la définition de `TableauPlanAction`, ajouter :

```tsx
// ─── Redimensionnement colonnes ───────────────────────────────────────────────

function ResizeHandle({
  colId,
  colWidths,
  setColWidths,
}: {
  colId: string
  colWidths: Record<string, number>
  setColWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>
}) {
  const startX = useRef(0)
  const startW = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    startX.current = e.clientX
    startW.current = colWidths[colId] ?? 120

    function onMove(ev: MouseEvent) {
      const delta = ev.clientX - startX.current
      const newW = Math.max(50, startW.current + delta)
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
  }, [colId, colWidths, setColWidths])

  return (
    <span
      onMouseDown={onMouseDown}
      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/30 active:bg-blue-500/50 transition-colors z-10"
    />
  )
}
```

- [ ] **Step 6 : Supprimer le rendu `renderRow` et la section `par_poste` group obsolètes**

Supprimer la fonction `renderRow` et la section `grouped` (les deux ne sont plus utilisées avec la nouvelle implémentation pyramide).

Supprimer également le `onglet === 'par_poste' && grouped ? ...` dans le tbody — le nouveau rendu gère tout en un seul flux groupé via `groupParPosteEtOperation(filtered)`.

- [ ] **Step 7 : Vérifier le build**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

Expected : aucune erreur TypeScript.

- [ ] **Step 8 : Commit**

```bash
git add src/app/dashboard/plan-action/_components/tableau-plan-action.tsx
git commit -m "feat: tableau plan-action pyramide rowspan + couleurs + plein écran + resize colonnes + Bell"
```

---

## Task 3 — Supprimer emoji cloche dans filtre-colonnes.tsx

**Fichiers :**
- Modifier : `src/app/dashboard/plan-action/_components/filtre-colonnes.tsx:50-58`

- [ ] **Step 1 : Modifier le label Rappels**

Dans `COLONNES_LABELS`, remplacer :

```tsx
// Avant
rappels: '🔔 Rappels',

// Après
rappels: 'Rappels',
```

- [ ] **Step 2 : Commit**

```bash
git add src/app/dashboard/plan-action/_components/filtre-colonnes.tsx
git commit -m "fix: supprimer emoji cloche label colonnes"
```

---

## Task 4 — Bannière essai uniquement sur /dashboard

**Contexte :** `PaywallBanner` est actuellement dans `layout.tsx` (affiché sur TOUTES les pages du dashboard). L'objectif est de le déplacer dans `dashboard/page.tsx` uniquement. `dashboard/page.tsx` appelle déjà `getInfoAbonnement` en parallèle — il suffit d'utiliser le résultat.

**Fichiers :**
- Modifier : `src/app/dashboard/layout.tsx`
- Modifier : `src/app/dashboard/page.tsx`

- [ ] **Step 1 : Retirer PaywallBanner de layout.tsx**

Dans `src/app/dashboard/layout.tsx`, supprimer :
- L'import `PaywallBanner`
- L'import `serializeAbonnement` (si plus utilisé)  
- Le calcul `const aboProp = serializeAbonnement(infoAbonnement)`
- La section `{aboProp.bandeau && (<PaywallBanner .../>)}`

Garder `abonnement={aboProp}` dans `<DashboardShell>` — il faut donc garder `serializeAbonnement` et `aboProp`. Ne supprimer que la partie PaywallBanner :

```tsx
// Supprimer uniquement ces lignes dans layout.tsx :
import { PaywallBanner } from '@/components/dashboard/paywall-banner'

// Et dans le JSX, supprimer :
{aboProp.bandeau && (
  <PaywallBanner
    bandeau={aboProp.bandeau}
    joursRestantsTrial={aboProp.joursRestantsTrial}
  />
)}
```

- [ ] **Step 2 : Ajouter PaywallBanner dans dashboard/page.tsx**

Dans `src/app/dashboard/page.tsx`, ajouter l'import :

```tsx
import { PaywallBanner } from '@/components/dashboard/paywall-banner'
import { serializeAbonnement } from '@/lib/abonnement'
```

`getInfoAbonnement` est déjà importé et `infoAbonnement` est déjà dans les données parallèles (ligne 83 du fichier). Ajouter après la ligne `const infoAbonnement` est récupéré :

```tsx
const abonnement = serializeAbonnement(infoAbonnement)
```

Dans le JSX, en tout premier dans le `return`, avant `{/* En-tête */}` :

```tsx
{/* Bannière essai/paywall — uniquement sur cette page */}
{abonnement.bandeau && (
  <PaywallBanner
    bandeau={abonnement.bandeau}
    joursRestantsTrial={abonnement.joursRestantsTrial}
  />
)}
```

- [ ] **Step 3 : Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

- [ ] **Step 4 : Commit**

```bash
git add src/app/dashboard/layout.tsx src/app/dashboard/page.tsx
git commit -m "fix: bannière essai uniquement sur /dashboard (retrait layout)"
```

---

## Task 5 — Tableau APR récap lecture seule + colonnes masquables

**Contexte :** Ajouter une prop `readOnly?: boolean` à `APRTable`. Quand `true` : supprimer la colonne "Voir →", afficher un badge "Lecture seule", et ajouter un bouton "Colonnes ▾" pour masquer/afficher les colonnes.

**Fichiers :**
- Modifier : `src/components/apr/apr-table.tsx`

- [ ] **Step 1 : Définir le type ColonnesAPR et ajouter le state**

Après les imports, avant `interface APRTableProps`, ajouter :

```tsx
type ColonneAPRId = 'poste' | 'operation' | 'module' | 'brute' | 'mesures' | 'pm' | 'residuelle'

const COLONNES_APR_LABELS: Record<ColonneAPRId, string> = {
  poste: 'Poste',
  operation: 'Opération',
  module: 'Module',
  brute: 'Criticité brute',
  mesures: 'Mesures PM',
  pm: 'Coeff. PM',
  residuelle: 'Criticité résiduelle',
}

const COLONNES_APR_DEFAUT: Record<ColonneAPRId, boolean> = {
  poste: true,
  operation: true,
  module: true,
  brute: true,
  mesures: false, // masquée par défaut
  pm: true,
  residuelle: true,
}

const STORAGE_KEY_APR = 'apr-recap-columns'
```

- [ ] **Step 2 : Modifier APRTableProps et ajouter les states**

Modifier l'interface :

```tsx
interface APRTableProps {
  lignes: LigneAPR[]
  postes: { id: string; nom: string }[]
  readOnly?: boolean
}
```

Dans le composant `APRTable`, après les states de filtres existants, ajouter :

```tsx
  const [showColonnes, setShowColonnes] = useState(false)
  const [colonnes, setColonnes] = useState<Record<ColonneAPRId, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APR)
      return saved ? { ...COLONNES_APR_DEFAUT, ...JSON.parse(saved) } : COLONNES_APR_DEFAUT
    } catch { return COLONNES_APR_DEFAUT }
  })
  const colPopoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (colPopoverRef.current && !colPopoverRef.current.contains(e.target as Node)) {
        setShowColonnes(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function toggleColonne(key: ColonneAPRId) {
    setColonnes(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(STORAGE_KEY_APR, JSON.stringify(next)) } catch {}
      return next
    })
  }
```

Ajouter `useRef` dans les imports React.

- [ ] **Step 3 : Ajouter le bouton Colonnes dans la barre de filtres**

Dans la barre de filtres (div `flex flex-wrap items-center gap-3`), après le bouton "Réinitialiser", avant `{lignesFiltrees.length} ligne`, ajouter :

```tsx
        {/* Badge lecture seule */}
        {readOnly && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
            Lecture seule
          </span>
        )}

        {/* Bouton Colonnes */}
        <div ref={colPopoverRef} className="relative ml-auto">
          <button
            onClick={() => setShowColonnes(s => !s)}
            className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 hover:border-gray-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Colonnes ▾
          </button>
          {showColonnes && (
            <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Afficher / masquer</div>
              {(Object.keys(COLONNES_APR_LABELS) as ColonneAPRId[]).map(key => (
                <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={colonnes[key]}
                    onChange={() => toggleColonne(key)}
                    className="rounded border-gray-300 text-blue-500"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-900">
                    {COLONNES_APR_LABELS[key]}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
```

- [ ] **Step 4 : Conditionner les colonnes du tableau**

Dans le `<thead>`, remplacer le tableau de définition des colonnes par une version conditionnelle. Le tableau actuel itère sur un array d'objets `{ col, label }`. Remplacer ce rendu par :

```tsx
<tr>
  {colonnes.poste && (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('poste')}>
      <span className="flex items-center gap-1.5">Poste <SortIcon actif={sortCol === 'poste'} direction={sortDir} /></span>
    </th>
  )}
  {colonnes.operation && (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('operation')}>
      <span className="flex items-center gap-1.5">Opération <SortIcon actif={sortCol === 'operation'} direction={sortDir} /></span>
    </th>
  )}
  {colonnes.module && (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('module')}>
      <span className="flex items-center gap-1.5">Module <SortIcon actif={sortCol === 'module'} direction={sortDir} /></span>
    </th>
  )}
  {colonnes.brute && (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('brute')}>
      <span className="flex items-center gap-1.5">Criticité brute <SortIcon actif={sortCol === 'brute'} direction={sortDir} /></span>
    </th>
  )}
  {colonnes.mesures && (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Mesures PM</th>
  )}
  {colonnes.pm && (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('pm')}>
      <span className="flex items-center gap-1.5">Coeff. PM <SortIcon actif={sortCol === 'pm'} direction={sortDir} /></span>
    </th>
  )}
  {colonnes.residuelle && (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort('residuelle')}>
      <span className="flex items-center gap-1.5">Criticité résiduelle <SortIcon actif={sortCol === 'residuelle'} direction={sortDir} /></span>
    </th>
  )}
  {!readOnly && <th className="px-4 py-3"></th>}
</tr>
```

Dans le `<tbody>`, dans le `lignesFiltrees.map((ligne) => { return (<tr ...>`, conditionner chaque `<td>` :

```tsx
{colonnes.poste && <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{ligne.posteNom}</td>}
{colonnes.operation && (
  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
    <span className="flex items-center gap-1.5">
      {ligne.estTransversale && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
      {ligne.operationNom}
    </span>
  </td>
)}
{colonnes.module && <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{ligne.nomModule}</td>}
{colonnes.brute && <td className="px-4 py-3"><CriticitePill score={ligne.criticiteBrute} module={ligne.codeModule} moduleIgnore={ligne.moduleIgnore} /></td>}
{colonnes.mesures && (
  <td className="px-4 py-3">
    {ligne.moduleIgnore ? <span className="text-xs text-gray-400">—</span> : <MesuresDots t={ligne.mesuresT} o={ligne.mesuresO} h={ligne.mesuresH} epi={ligne.mesuresEPI} />}
  </td>
)}
{colonnes.pm && (
  <td className="px-4 py-3 text-gray-700">
    {ligne.coefficientPm !== null ? <span className="font-medium">{ligne.coefficientPm === 0 ? '0,0' : ligne.coefficientPm.toString().replace('.', ',')}</span> : <span className="text-gray-400">—</span>}
  </td>
)}
{colonnes.residuelle && <td className="px-4 py-3"><CriticitePill score={scoreResid} module={ligne.codeModule} moduleIgnore={ligne.moduleIgnore} /></td>}
{!readOnly && (
  <td className="px-4 py-3">
    <Link href={`/dashboard/postes/${ligne.posteId}/operations/${ligne.operationId}/risques/${ligne.codeModule}`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">Voir →</Link>
  </td>
)}
```

- [ ] **Step 5 : Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

- [ ] **Step 6 : Commit**

```bash
git add src/components/apr/apr-table.tsx
git commit -m "feat: APR table readOnly + sélecteur colonnes masquables"
```

---

## Task 6 — Fix bouton "Ajouter un poste"

**Contexte :** Le bouton a `border-2 border-dashed` + `min-h-[140px]` + hover navy alors que les PosteCard ont `border border-gray-200` + hover `border-blue-300`. L'aligner sur les cartes.

**Fichiers :**
- Modifier : `src/app/dashboard/postes/page.tsx:145-157`

- [ ] **Step 1 : Remplacer le bouton**

Dans `postes/page.tsx`, remplacer le bouton `NouveauPosteModal` (le bloc non-`limiteAtteinte`) :

```tsx
// Avant
<NouveauPosteModal>
  <button className="group bg-white border-2 border-dashed border-gray-200 rounded-xl p-5 shadow-sm hover:border-brand-navy hover:shadow-md transition-all text-left w-full flex flex-col items-center justify-center gap-3 min-h-[140px]">
    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-brand-navy flex items-center justify-center transition-colors">
      <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-navy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </div>
    <span className="text-sm font-medium text-gray-400 group-hover:text-brand-navy transition-colors">
      Ajouter un poste
    </span>
  </button>
</NouveauPosteModal>

// Après
<NouveauPosteModal>
  <button className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all w-full h-full flex flex-col items-center justify-center gap-3 min-h-[100px]">
    <div className="w-10 h-10 rounded-xl border border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </div>
    <span className="text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
      Ajouter un poste
    </span>
  </button>
</NouveauPosteModal>
```

- [ ] **Step 2 : Commit**

```bash
git add src/app/dashboard/postes/page.tsx
git commit -m "fix: bouton ajouter un poste — même taille et hover bleu que les cartes"
```

---

## Task 7 — Sidebar animations fluides

**Contexte :** La sidebar est saccadée car (1) le switch `position: relative → absolute` sur l'inner div est instantané, et (2) les labels disparaissent brusquement lors du collapse (re-render JSX complet). Fix : fusionner les deux modes de rendu avec transitions opacity/max-width sur les labels.

**Fichiers :**
- Modifier : `src/components/dashboard/sidebar.tsx`
- Modifier : `src/components/dashboard/dashboard-shell.tsx`
- Modifier : `src/app/globals.css`

- [ ] **Step 1 : Réécrire sidebar.tsx avec rendu unifié**

Remplacer le contenu complet de `sidebar.tsx` par :

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AbonnementBadge } from './abonnement-badge'
import { Logo } from '@/components/brand/logo'
import type { AbonnementProps } from '@/lib/abonnement'

const navigation = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Postes de travail',
    href: '/dashboard/postes',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Tableau APR',
    href: '/dashboard/apr',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Module Bruit',
    href: '/dashboard/modules/bruit',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
      </svg>
    ),
  },
  {
    label: "Plan d'action",
    href: '/dashboard/plan-action',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Paramètres',
    href: '/dashboard/parametres',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  nomEntreprise?: string
  onClose?: () => void
  abonnement?: Pick<AbonnementProps, 'statut' | 'joursRestantsTrial'>
  collapsed?: boolean
}

export function Sidebar({ nomEntreprise, onClose, abonnement, collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full w-full bg-brand-navy overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-brand-navy-light" style={{ minHeight: 72 }}>
        <div
          style={{
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 200,
            overflow: 'hidden',
            transition: collapsed
              ? 'opacity 80ms ease, max-width 220ms cubic-bezier(0.4,0,0.2,1)'
              : 'opacity 150ms ease 80ms, max-width 220ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <Logo variant="full" theme="white" height={28} />
        </div>
        <div
          style={{
            opacity: collapsed ? 1 : 0,
            maxWidth: collapsed ? 40 : 0,
            overflow: 'hidden',
            transition: collapsed
              ? 'opacity 150ms ease 80ms, max-width 220ms cubic-bezier(0.4,0,0.2,1)'
              : 'opacity 80ms ease, max-width 220ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-brand-gold-light flex items-center justify-center">
            <span className="text-brand-navy font-bold text-base leading-none">S</span>
          </div>
        </div>
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="lg:hidden text-brand-cream/50 hover:text-brand-cream ml-2"
            aria-label="Fermer le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nom entreprise */}
      {nomEntreprise && (
        <div
          className="border-b border-brand-navy-light overflow-hidden"
          style={{
            maxHeight: collapsed ? 0 : 60,
            opacity: collapsed ? 0 : 1,
            transition: collapsed
              ? 'max-height 220ms cubic-bezier(0.4,0,0.2,1), opacity 80ms ease'
              : 'max-height 220ms cubic-bezier(0.4,0,0.2,1), opacity 150ms ease 80ms',
          }}
        >
          <div className="px-6 py-3">
            <p className="text-xs text-brand-cream/40 uppercase tracking-wide font-medium">Entreprise</p>
            <p className="text-sm font-medium text-brand-cream truncate mt-0.5">{nomEntreprise}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-navy-light text-brand-off'
                    : 'text-brand-off/70 hover:bg-brand-navy-light hover:text-brand-off'
                )}
              >
                {/* Barre active gauche */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-gold-light rounded-r-full" />
                )}
                <span className={isActive ? 'text-brand-gold-light' : 'text-brand-off/50'}>
                  {item.icon}
                </span>
                {/* Label avec transition opacity/max-width */}
                <span
                  style={{
                    opacity: collapsed ? 0 : 1,
                    maxWidth: collapsed ? 0 : 180,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    transition: collapsed
                      ? 'opacity 80ms ease, max-width 220ms cubic-bezier(0.4,0,0.2,1)'
                      : 'opacity 150ms ease 80ms, max-width 220ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  {item.label}
                </span>
              </Link>

              {/* Tooltip — visible uniquement en mode collapsed */}
              <span
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-brand-navy-light text-brand-cream text-xs px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none z-[60] shadow-lg border border-white/10"
                style={{
                  opacity: collapsed ? undefined : 0,
                  transition: 'opacity 100ms ease',
                }}
              >
                {item.label}
              </span>
            </div>
          )
        })}
      </nav>

      {/* Badge abonnement + pied */}
      <div
        className="px-4 py-4 border-t border-brand-navy-light space-y-2 overflow-hidden"
        style={{
          maxHeight: collapsed ? 48 : 120,
          transition: 'max-height 220ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {abonnement && !collapsed && (
          <AbonnementBadge
            statut={abonnement.statut}
            joursRestantsTrial={abonnement.joursRestantsTrial}
          />
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
    </div>
  )
}
```

- [ ] **Step 2 : Améliorer dashboard-shell.tsx — supprimer le toggle position**

Dans `dashboard-shell.tsx`, remplacer le bloc `<div style={{ width: isFloating ? 256 : undefined, position: isFloating ? 'absolute' : 'relative', ...` par :

```tsx
        {/* Panneau réel — toujours en relative, overflow via aside */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transition: 'box-shadow 250ms ease',
            boxShadow: isFloating ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
          }}
          className="flex overflow-hidden"
        >
```

Et modifier le style de `<aside>` pour utiliser le même cubic-bezier amélioré :

```tsx
        style={{
          width: collapsed ? 64 : 256,
          flexShrink: 0,
          transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
          zIndex: isFloating ? 40 : 'auto',
          willChange: 'width',
        }}
```

- [ ] **Step 3 : Supprimer animate-sidebar-label de globals.css**

Dans `src/app/globals.css`, supprimer les lignes :

```css
/* Supprimer : */
/* Sidebar — label fade-in quand la sidebar s'étend */
@keyframes sa-sidebar-label {
  from { opacity: 0; transform: translateX(-4px); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-sidebar-label {
  animation: sa-sidebar-label 150ms cubic-bezier(0.32, 0.72, 0, 1) 80ms both;
}
```

- [ ] **Step 4 : Build complet**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

Expected : aucune erreur.

- [ ] **Step 5 : Commit**

```bash
git add src/components/dashboard/sidebar.tsx src/components/dashboard/dashboard-shell.tsx src/app/globals.css
git commit -m "fix: sidebar animations fluides — rendu unifié opacity/max-width + easing amélioré"
```

---

## Task 8 — Build final et push

- [ ] **Step 1 : Build complet**

```bash
npm run build 2>&1 | tail -30
```

Expected : `✓ Compiled successfully` ou équivalent, 0 erreurs TypeScript.

- [ ] **Step 2 : Push**

```bash
git push origin main
```

- [ ] **Step 3 : Mettre à jour CLAUDE.md**

Dans `CLAUDE.md`, section 6 "État d'avancement", ajouter sous Phase 3 :

```
- [x] PHASE_UX_C : Tableau plan-action pyramide rowspan + couleurs + plein écran + resize + fix dropdown portal — APR récap lecture seule + colonnes — Bannière essai /dashboard only — Bouton postes fix — Sidebar animations fluides
```
