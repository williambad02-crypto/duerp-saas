'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { Maximize2, Minimize2, Bell } from 'lucide-react'
import {
  upsertAction,
  terminerAction,
  toggleRappelsAction,
  type EvaluationAvecAction,
  type ActionPlan,
} from '../_actions'
import { DropdownResponsable } from './dropdown-responsable'
import {
  FiltreBarre,
  FILTRES_DEFAUT,
  COLONNES_DEFAUT,
  type Filtres,
  type ColonnesVisibles,
} from './filtre-colonnes'
import type { Contact } from '../../parametres/contacts/_actions'

// ─── Palettes alternantes par poste ──────────────────────────────────────────

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

// ─── Helpers d'affichage ──────────────────────────────────────────────────────

function BadgeCriticite({ valeur }: { valeur: number | null }) {
  if (valeur == null) return <span className="text-gray-300 text-xs">—</span>
  const bg =
    valeur >= 15 ? 'bg-red-100 text-red-700' :
    valeur >= 10 ? 'bg-orange-100 text-orange-700' :
    valeur >= 5  ? 'bg-yellow-100 text-yellow-700' :
                   'bg-green-100 text-green-700'
  return (
    <span className={`${bg} font-bold text-sm px-2 py-0.5 rounded-full`}>{valeur}</span>
  )
}

const STATUT_LABELS: Record<ActionPlan['statut'], string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  termine: 'Terminé ✓',
}

const STATUT_COLORS: Record<ActionPlan['statut'], string> = {
  a_faire: 'bg-yellow-100 text-yellow-700',
  en_cours: 'bg-blue-100 text-blue-700',
  termine: 'bg-green-100 text-green-700',
}

const PGP_LABELS: Record<string, string> = {
  technique: '🔧 Technique',
  organisationnelle: '📋 Orga.',
  formation_epi: '🎓 Formation/EPI',
}

// ─── Groupement hiérarchique ──────────────────────────────────────────────────

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

// ─── Poignée de redimensionnement ────────────────────────────────────────────

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

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  evaluations: EvaluationAvecAction[]
  contacts: Contact[]
}

export function TableauPlanAction({ evaluations, contacts }: Props) {
  const [rows, setRows] = useState(evaluations)
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_DEFAUT)
  const [colonnes, setColonnes] = useState<ColonnesVisibles>(COLONNES_DEFAUT)
  const [isPending, startTransition] = useTransition()
  const [fullscreen, setFullscreen] = useState(false)
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('plan-action-col-widths')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const postes = [...new Set(rows.map(r => r.poste_nom))].sort()

  const filtered = rows.filter(row => {
    const crit = row.criticite_residuelle ?? row.criticite_brute ?? 0
    if (!filtres.afficher_verts && crit <= 4) return false
    if (filtres.poste && row.poste_nom !== filtres.poste) return false
    if (filtres.statut && (row.action?.statut ?? 'a_faire') !== filtres.statut) return false
    if (filtres.type_prevention && row.action?.type_prevention !== filtres.type_prevention) return false
    if (filtres.facilite && row.action?.facilite !== filtres.facilite) return false
    return true
  })

  // ── Mutation helper ─────────────────────────────────────────────────────────
  function updateRowAction(evalId: string, patch: Partial<ActionPlan>) {
    setRows(prev => prev.map(r => {
      if (r.id !== evalId) return r
      return { ...r, action: r.action ? { ...r.action, ...patch } : { id: '', evaluation_id: evalId, contact_id: null, description: null, type_prevention: null, facilite: null, echeance: null, statut: 'a_faire', rappels_actifs: true, coefficient_pm_cible: null, criticite_cible: null, commentaire: null, date_realisation: null, ...patch } }
    }))
  }

  function handleCellBlur(
    evalId: string,
    actionId: string | undefined,
    champ: keyof Omit<ActionPlan, 'id' | 'evaluation_id'>,
    valeur: string | number | boolean | null
  ) {
    startTransition(async () => {
      const result = await upsertAction({ evaluationId: evalId, actionId, champ, valeur })
      updateRowAction(evalId, { id: result.actionId, [champ]: valeur })
    })
  }

  async function handleStatutChange(row: EvaluationAvecAction, newStatut: ActionPlan['statut']) {
    const action = row.action
    updateRowAction(row.id, { statut: newStatut })

    if (newStatut === 'termine' && action?.coefficient_pm_cible != null) {
      startTransition(async () => {
        await terminerAction(action.id, row.id, action.coefficient_pm_cible!)
      })
    } else {
      handleCellBlur(row.id, action?.id, 'statut', newStatut)
    }
  }

  function handleToggleRappels(row: EvaluationAvecAction) {
    const newVal = !(row.action?.rappels_actifs ?? true)
    updateRowAction(row.id, { rappels_actifs: newVal })
    if (row.action?.id) {
      startTransition(async () => { await toggleRappelsAction(row.action!.id, newVal) })
    }
  }

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpiAFaire = rows.filter(r => (r.action?.statut ?? 'a_faire') === 'a_faire').length
  const kpiEnCours = rows.filter(r => r.action?.statut === 'en_cours').length
  const kpiTermine = rows.filter(r => r.action?.statut === 'termine').length

  // ── Groupement hiérarchique ─────────────────────────────────────────────────
  const groupes = groupParPosteEtOperation(filtered)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-red-600">{kpiAFaire}</div>
          <div className="text-xs text-amber-700 uppercase tracking-wide font-medium">À faire</div>
        </div>
        <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-orange-500">{kpiEnCours}</div>
          <div className="text-xs text-amber-700 uppercase tracking-wide font-medium">En cours</div>
        </div>
        <div className="bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
          <div className="text-2xl font-extrabold text-green-600">{kpiTermine}</div>
          <div className="text-xs text-amber-700 uppercase tracking-wide font-medium">Terminé</div>
        </div>
        {isPending && (
          <span className="text-xs text-gray-400 animate-pulse ml-2">Enregistrement…</span>
        )}
      </div>

      {/* Filtres */}
      <FiltreBarre
        postes={postes}
        filtres={filtres}
        onFiltresChange={setFiltres}
        colonnes={colonnes}
        onColonnesChange={setColonnes}
      />

      {/* Tableau avec mode plein écran */}
      <div className={fullscreen ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-6 space-y-4' : ''}>
        {/* Bouton plein écran */}
        <div className="flex justify-end mb-1">
          <button
            onClick={() => setFullscreen(f => !f)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-brand-navy border border-gray-200 rounded-lg hover:border-brand-navy/30 transition-colors"
          >
            {fullscreen
              ? <><Minimize2 className="w-3.5 h-3.5" /> Réduire</>
              : <><Maximize2 className="w-3.5 h-3.5" /> Plein écran</>
            }
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
          <table className="border-collapse w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              {/* Poste — vertical, largeur fixe */}
              <col style={{ width: 36 }} />
              {/* Opération */}
              <col style={{ width: colWidths.operation ?? 110 }} />
              {/* Danger */}
              <col style={{ width: colWidths.danger ?? 160 }} />
              {/* C. résid. */}
              <col style={{ width: colWidths.criticite ?? 70 }} />
              {/* Mesures exist. */}
              {colonnes.mesures_existantes && <col style={{ width: colWidths.mesures ?? 120 }} />}
              {/* Description */}
              <col style={{ width: colWidths.description ?? 180 }} />
              {/* Type PGP */}
              {colonnes.type_prevention && <col style={{ width: colWidths.type_prevention ?? 110 }} />}
              {/* Facilité */}
              {colonnes.facilite && <col style={{ width: colWidths.facilite ?? 90 }} />}
              {/* Responsable */}
              {colonnes.responsable && <col style={{ width: colWidths.responsable ?? 160 }} />}
              {/* Échéance */}
              {colonnes.echeance && <col style={{ width: colWidths.echeance ?? 100 }} />}
              {/* Statut */}
              <col style={{ width: colWidths.statut ?? 100 }} />
              {/* Rappels */}
              {colonnes.rappels && <col style={{ width: colWidths.rappels ?? 60 }} />}
              {/* C. cible */}
              {colonnes.criticite_cible && <col style={{ width: colWidths.criticite_cible ?? 70 }} />}
            </colgroup>

            <thead>
              {/* Ligne 1 : super-headers */}
              <tr>
                <th
                  colSpan={4 + (colonnes.mesures_existantes ? 1 : 0)}
                  className="py-2 px-3 bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-400 text-center uppercase tracking-wide border-r-2 border-blue-100"
                >
                  ← Depuis l&apos;APR (lecture seule)
                </th>
                <th
                  colSpan={
                    1 + // description
                    (colonnes.type_prevention ? 1 : 0) +
                    (colonnes.facilite ? 1 : 0) +
                    (colonnes.responsable ? 1 : 0) +
                    (colonnes.echeance ? 1 : 0) +
                    1 + // statut
                    (colonnes.rappels ? 1 : 0)
                  }
                  className="py-2 px-3 bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600 text-center uppercase tracking-wide"
                >
                  Action corrective ✏️
                </th>
                {colonnes.criticite_cible && (
                  <th className="py-2 px-3 bg-green-50 border border-green-100 text-xs font-semibold text-green-600 text-center uppercase tracking-wide">
                    Résultat
                  </th>
                )}
              </tr>

              {/* Ligne 2 : headers colonnes */}
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="relative px-1 py-2 text-center text-xs font-bold text-gray-500 whitespace-nowrap overflow-hidden">
                  Poste
                  <ResizeHandle colId="poste" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                <th className="relative px-2 py-2 text-center text-xs font-bold text-gray-500 whitespace-nowrap overflow-hidden">
                  Opération
                  <ResizeHandle colId="operation" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                <th className="relative px-3 py-2 text-center text-xs font-bold text-gray-500 overflow-hidden">
                  Danger
                  <ResizeHandle colId="danger" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                <th className="relative px-2 py-2 text-center text-xs font-bold text-gray-500 whitespace-nowrap overflow-hidden">
                  C. résid.
                  <ResizeHandle colId="criticite" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                {colonnes.mesures_existantes && (
                  <th className="relative px-3 py-2 text-center text-xs font-bold text-gray-500 border-r-2 border-blue-100 whitespace-nowrap overflow-hidden">
                    Mesures exist.
                    <ResizeHandle colId="mesures" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                <th className="relative px-3 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 overflow-hidden">
                  Description
                  <ResizeHandle colId="description" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                {colonnes.type_prevention && (
                  <th className="relative px-2 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 whitespace-nowrap overflow-hidden">
                    Type PGP
                    <ResizeHandle colId="type_prevention" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                {colonnes.facilite && (
                  <th className="relative px-2 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 overflow-hidden">
                    Facilité
                    <ResizeHandle colId="facilite" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                {colonnes.responsable && (
                  <th className="relative px-2 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 overflow-hidden">
                    Responsable
                    <ResizeHandle colId="responsable" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                {colonnes.echeance && (
                  <th className="relative px-2 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 whitespace-nowrap overflow-hidden">
                    Échéance
                    <ResizeHandle colId="echeance" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                <th className="relative px-2 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 overflow-hidden">
                  Statut
                  <ResizeHandle colId="statut" colWidths={colWidths} setColWidths={setColWidths} />
                </th>
                {colonnes.rappels && (
                  <th className="relative px-2 py-2 text-center text-xs font-bold text-blue-500 bg-blue-50/30 overflow-hidden">
                    <Bell className="w-3.5 h-3.5 inline" />
                    <ResizeHandle colId="rappels" colWidths={colWidths} setColWidths={setColWidths} />
                  </th>
                )}
                {colonnes.criticite_cible && (
                  <th className="relative px-2 py-2 text-center text-xs font-bold text-green-600 bg-green-50/40 whitespace-nowrap overflow-hidden">
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
                groupes.map((groupe, posteIndex) => {
                  const palette = PALETTES[posteIndex % 2]
                  const totalRisques = groupe.operations.reduce((sum, op) => sum + op.risques.length, 0)
                  const isNewPoste = posteIndex > 0

                  return groupe.operations.map((op, opIndex) =>
                    op.risques.map((row, risqueIndex) => {
                      const action = row.action
                      const statut: ActionPlan['statut'] = action?.statut ?? 'a_faire'
                      const rappelsActifs = action?.rappels_actifs ?? true
                      const riskBg = palette.risque
                      const isFirstRowOfPoste = opIndex === 0 && risqueIndex === 0
                      const isFirstRowOfOp = risqueIndex === 0

                      return (
                        <tr
                          key={row.id}
                          style={isFirstRowOfPoste && isNewPoste ? { borderTop: '2px solid #94a3b8' } : undefined}
                          className="border-b border-gray-100"
                        >
                          {/* Cellule Poste — rowspan total du poste */}
                          {isFirstRowOfPoste && (
                            <td
                              rowSpan={totalRisques}
                              style={{
                                background: palette.poste.bg,
                                color: palette.poste.color,
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                transform: 'rotate(180deg)',
                                textAlign: 'center',
                                verticalAlign: 'middle',
                                padding: '8px 4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                borderRight: '1px solid rgba(255,255,255,0.15)',
                              }}
                            >
                              {groupe.posteNom}
                            </td>
                          )}

                          {/* Cellule Opération — rowspan sur les risques de cette opération */}
                          {isFirstRowOfOp && (
                            <td
                              rowSpan={op.risques.length}
                              style={{
                                background: palette.operation.bg,
                                color: palette.operation.color,
                                verticalAlign: 'middle',
                                padding: '6px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                borderRight: '1px solid rgba(0,0,0,0.06)',
                              }}
                            >
                              {op.operationNom}
                            </td>
                          )}

                          {/* Danger */}
                          <td className="px-3 py-2 text-sm text-gray-700 truncate" style={{ background: riskBg }}>
                            {row.danger}
                          </td>
                          {/* C. résid. */}
                          <td className="px-2 py-2 text-center" style={{ background: riskBg }}>
                            <BadgeCriticite valeur={row.criticite_residuelle ?? row.criticite_brute} />
                          </td>
                          {/* Mesures existantes */}
                          {colonnes.mesures_existantes && (
                            <td className="px-3 py-2 text-xs text-gray-500 truncate border-r-2 border-blue-100" style={{ background: riskBg }}>
                              {row.mesures_existantes || <span className="text-gray-300 italic">Aucune</span>}
                            </td>
                          )}
                          {/* Description */}
                          <td className="px-2 py-1" style={{ background: riskBg }}>
                            <input
                              defaultValue={action?.description ?? ''}
                              placeholder="Cliquer pour saisir…"
                              onBlur={e => handleCellBlur(row.id, action?.id, 'description', e.target.value || null)}
                              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-300 placeholder:italic focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5"
                            />
                          </td>
                          {/* Type PGP */}
                          {colonnes.type_prevention && (
                            <td className="px-2 py-1" style={{ background: riskBg }}>
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
                            <td className="px-2 py-1 text-center" style={{ background: riskBg }}>
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
                            <td className="px-2 py-1" style={{ background: riskBg }}>
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
                            <td className="px-2 py-1" style={{ background: riskBg }}>
                              <input
                                type="date"
                                defaultValue={action?.echeance ?? ''}
                                onBlur={e => handleCellBlur(row.id, action?.id, 'echeance', e.target.value || null)}
                                className="text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded w-full"
                              />
                            </td>
                          )}
                          {/* Statut */}
                          <td className="px-2 py-1" style={{ background: riskBg }}>
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
                            <td className="px-2 py-1 text-center" style={{ background: riskBg }}>
                              <button
                                onClick={() => handleToggleRappels(row)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                  rappelsActifs ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                  rappelsActifs ? 'translate-x-4' : 'translate-x-1'
                                }`} />
                              </button>
                            </td>
                          )}
                          {/* C. cible */}
                          {colonnes.criticite_cible && (
                            <td className="px-2 py-2 text-center" style={{ background: riskBg }}>
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
    </div>
  )
}
