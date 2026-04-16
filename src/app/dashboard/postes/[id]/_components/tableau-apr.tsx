'use client'

import { useState, useCallback, useRef, useTransition, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Maximize2, Minimize2, Plus, RotateCcw, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { EditerPosteModal } from '@/components/postes/editer-poste-modal'
import { SupprimerPosteButton } from '@/components/postes/supprimer-poste-button'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RISQUES_ED840 } from '@/lib/constants/ed840'
import { COEFFICIENTS_PM } from '@/lib/constants/cotation'
import { QUESTIONS_PRESELECTION } from '@/lib/constants/preselection'
import { MODULE_PAR_CODE, type ModuleRisque } from '@/lib/constants/modules'
import type { CodeModule } from '@/types'
import * as actions from './actions'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RisqueUI {
  id: string
  operation_id: string
  identifiant_auto: string | null
  numero_risque_ed840: number | null
  type_risque: 'aigu' | 'chronique'
  danger: string | null
  situation_dangereuse: string | null
  evenement_dangereux: string | null
  dommage: string | null
  siege_lesions: string | null
  gravite: number | null
  probabilite: number | null
  duree_exposition: number | null
  criticite_brute: number | null
  coefficient_pm: number
  criticite_residuelle: number | null
  mesures_techniques: string | null
  ordre: number
  module_status: 'non_initie' | 'maitrise' | 'creuser' | null
  preselection_responses: boolean[] | null
}

export interface OperationUI {
  id: string
  nom: string
  est_transversale: boolean
  ordre: number
  risques: RisqueUI[]
}

type CelluleActive = { ligneId: string; colonne: string } | null
type ModaleEtat =
  | { type: 'risque'; id: string }
  | { type: 'operation'; id: string; nom: string; nbRisques: number }
  | null
type ModalePreselEtat = { risqueId: string; moduleCode: Exclude<CodeModule, 'APR'> } | null
type CriticiteZone = 'rouge' | 'orange' | 'jaune' | 'vert' | 'incomplet'

// ─── Constantes colonnes ─────────────────────────────────────────────────────

const COLONNES_TAB = [
  'danger', 'situation_dangereuse', 'numero_risque_ed840', 'type_risque',
  'evenement_dangereux', 'dommage', 'siege_lesions', 'gravite', 'second',
  'mesures_techniques', 'coefficient_pm',
]

// ─── Styles communs ───────────────────────────────────────────────────────────

const TH = 'bg-gray-100 border-r border-b border-t border-gray-300 px-3 py-2.5 text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em] relative'
const TD = 'border-r border-b border-gray-200 px-3 py-2 text-xs text-gray-800'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGroupBg(op: OperationUI, groupIndex: number): string {
  if (op.est_transversale) return 'bg-amber-50'
  return groupIndex % 2 === 0 ? 'bg-white' : 'bg-slate-100'
}

function getClasseCriticite(score: number): string {
  if (score <= 4) return 'bg-green-50 text-green-800 border border-green-200'
  if (score <= 9) return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
  if (score <= 14) return 'bg-orange-100 text-orange-800 border border-orange-200'
  return 'bg-red-100 text-red-800 border border-red-200'
}

function getModuleInfo(risque: RisqueUI): ModuleRisque | null {
  if (risque.type_risque !== 'chronique') return null
  if (!risque.numero_risque_ed840) return null
  const risqueED840 = RISQUES_ED840.find(r => r.numero === risque.numero_risque_ed840)
  if (!risqueED840?.module) return null
  return MODULE_PAR_CODE[risqueED840.module] ?? null
}

function champsManquants(risque: RisqueUI): string[] {
  const manquants: string[] = []
  if (!risque.danger?.trim()) manquants.push('Danger')
  if (risque.numero_risque_ed840 === null) manquants.push('Risque ED840')
  if (risque.gravite === null) manquants.push('Gravité')
  if (risque.type_risque === 'aigu' && risque.probabilite === null) manquants.push('Probabilité')
  if (risque.type_risque === 'chronique' && risque.duree_exposition === null) manquants.push("Durée d'exposition")
  if (risque.coefficient_pm === null || risque.coefficient_pm === undefined) manquants.push('Coefficient PM')
  if ((risque.criticite_residuelle ?? 0) > 4 && !risque.mesures_techniques?.trim()) {
    manquants.push('Moyens de maîtrise')
  }
  return manquants
}

// ─── useColumnWidths ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'tableau-apr-column-widths-v1'

const DEFAULT_WIDTHS: Record<string, number> = {
  operation: 140, handle: 32, ref: 72, danger: 180,
  situation_dangereuse: 200, numero_risque_ed840: 240, type_risque: 88,
  evenement_dangereux: 175, dommage: 150, siege_lesions: 140,
  gravite: 120, second: 130, criticite_brute: 100,
  mesures_techniques: 280, coefficient_pm: 110, criticite_residuelle: 110,
  actions: 36,
}

function useColumnWidths() {
  const [widths, setWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setWidths({ ...DEFAULT_WIDTHS, ...JSON.parse(saved) })
    } catch {}
  }, [])

  const setWidth = useCallback((id: string, delta: number) => {
    setWidths(prev => {
      const next = { ...prev, [id]: Math.max(40, Math.min(600, (prev[id] ?? DEFAULT_WIDTHS[id] ?? 100) + delta)) }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const resetWidths = useCallback(() => {
    setWidths(DEFAULT_WIDTHS)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { widths, setWidth, resetWidths }
}

// ─── ColonneResizer ───────────────────────────────────────────────────────────

function ColonneResizer({ colId, onResize }: { colId: string; onResize: (id: string, delta: number) => void }) {
  const [dragging, setDragging] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    const startX = e.clientX
    let lastX = startX

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - lastX
      lastX = ev.clientX
      onResize(colId, delta)
    }
    const onMouseUp = () => {
      setDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 transition-colors ${dragging ? 'bg-blue-400' : 'hover:bg-blue-300'}`}
      onMouseDown={handleMouseDown}
    />
  )
}

// ─── CelluleTexte ────────────────────────────────────────────────────────────

function CelluleTexte({
  ligneId, colonne, valeur, placeholder = '—',
  isActive, onActivate, onSave, onTab,
  style, tdClassName = '',
}: {
  ligneId: string; colonne: string; valeur: string | null; placeholder?: string
  isActive: boolean; onActivate: () => void; onSave: (v: string | null) => Promise<void>
  onTab?: () => void; style?: React.CSSProperties; tdClassName?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(valeur ?? '')

  useEffect(() => {
    if (isActive) {
      setDraft(valeur ?? '')
      ref.current?.focus()
      ref.current?.select()
    }
  }, [isActive, valeur])

  const handleCommit = async () => {
    const trimmed = draft.trim() || null
    if (trimmed !== valeur) {
      await onSave(trimmed)
    }
  }

  if (isActive) {
    return (
      <td className={`px-3 py-2 border-r border-b border-gray-200 bg-white ${tdClassName}`} style={style}>
        <input
          ref={ref}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); handleCommit(); onTab?.() }
            if (e.key === 'Escape') { setDraft(valeur ?? ''); onTab?.() }
            if (e.key === 'Tab') { e.preventDefault(); handleCommit().then(() => onTab?.()) }
          }}
          className="w-full text-xs px-2 py-1 border border-blue-500 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </td>
    )
  }

  return (
    <td
      className={`${TD} cursor-pointer hover:bg-gray-50 overflow-hidden ${tdClassName}`}
      style={style}
      onClick={onActivate}
      title={valeur ?? undefined}
    >
      <span className={`block truncate ${!valeur ? 'text-gray-400 italic' : ''}`}>
        {valeur || placeholder}
      </span>
    </td>
  )
}

// ─── CelluleSelect ───────────────────────────────────────────────────────────

function CelluleSelect({
  ligneId, colonne, valeur, options, isActive, onActivate, onSave, onTab,
  renderLabel, style, disabled = false, tdClassName = '', center = false,
}: {
  ligneId: string; colonne: string; valeur: number | string | null
  options: { valeur: number | string; label: string }[]
  isActive: boolean; onActivate: () => void
  onSave: (v: number | string | null) => Promise<void>; onTab?: () => void
  renderLabel?: (v: number | string | null) => string; style?: React.CSSProperties; disabled?: boolean
  tdClassName?: string; center?: boolean
}) {
  const ref = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (isActive) ref.current?.focus()
  }, [isActive])

  const handleChange = async (v: string) => {
    const parsed = isNaN(Number(v)) ? v : Number(v)
    await onSave(parsed)
    onTab?.()
  }

  const label = renderLabel ? renderLabel(valeur) : (options.find(o => o.valeur === valeur)?.label ?? '—')

  if (isActive && !disabled) {
    return (
      <td className={`px-2 py-2 border-r border-b border-gray-200 bg-white ${tdClassName}`} style={style}>
        <select
          ref={ref}
          defaultValue={String(valeur ?? '')}
          onChange={e => handleChange(e.target.value)}
          onBlur={() => onTab?.()}
          onKeyDown={e => {
            if (e.key === 'Escape') onTab?.()
            if (e.key === 'Tab') { e.preventDefault(); onTab?.() }
          }}
          className="w-full text-xs border border-blue-500 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 py-1"
        >
          <option value="">—</option>
          {options.map(o => (
            <option key={String(o.valeur)} value={String(o.valeur)}>{o.label}</option>
          ))}
        </select>
      </td>
    )
  }

  return (
    <td
      className={`${TD} ${center ? 'text-center' : ''} ${disabled ? 'opacity-50 cursor-default' : 'cursor-pointer hover:bg-gray-50'} ${tdClassName}`}
      style={style}
      onClick={disabled ? undefined : onActivate}
    >
      <span className={!valeur && valeur !== 0 ? 'text-gray-400' : ''}>
        {label}
      </span>
    </td>
  )
}

// ─── CelluleNoteBoutons (saisie rapide G / P / DE par boutons 1-N colorés) ───

function CelluleNoteBoutons({
  ligneId: _ligneId, colonne: _colonne, valeur, isActive: _isActive, onActivate, onSave, onTab,
  style, tdClassName = '', disabled = false, max = 5,
}: {
  ligneId: string; colonne: string; valeur: number | null
  isActive: boolean; onActivate: () => void
  onSave: (v: number | null) => Promise<void>
  onTab?: () => void
  style?: React.CSSProperties
  tdClassName?: string
  disabled?: boolean
  max?: number
}) {
  // Palette par zone de criticité potentielle : 1-2 vert, 3 jaune, 4 orange, 5 rouge
  const zones: { n: number; bg: string; bgActive: string }[] = [
    { n: 1, bg: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100', bgActive: 'bg-green-500 text-white border-green-600' },
    { n: 2, bg: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100', bgActive: 'bg-green-500 text-white border-green-600' },
    { n: 3, bg: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100', bgActive: 'bg-yellow-500 text-white border-yellow-600' },
    { n: 4, bg: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100', bgActive: 'bg-orange-500 text-white border-orange-600' },
    { n: 5, bg: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', bgActive: 'bg-red-500 text-white border-red-600' },
  ].slice(0, max)

  const handleClick = async (n: number) => {
    await onSave(n)
    onTab?.()
  }

  return (
    <td
      className={`border-r border-b border-gray-200 px-1 py-1 ${disabled ? 'opacity-50' : ''} ${tdClassName}`}
      style={style}
      onClick={!disabled ? onActivate : undefined}
    >
      <div className="flex items-center justify-center gap-0.5">
        {zones.map(z => {
          const selected = valeur === z.n
          return (
            <button
              key={z.n}
              type="button"
              disabled={disabled}
              onClick={e => { e.stopPropagation(); handleClick(z.n) }}
              className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                selected ? z.bgActive : z.bg
              }`}
              title={`Note ${z.n}`}
              aria-label={`Note ${z.n}`}
              aria-pressed={selected}
            >
              {z.n}
            </button>
          )
        })}
      </div>
    </td>
  )
}

// ─── CelluleCombobox (Risque ED840 avec recherche) ───────────────────────────

interface ComboboxOption {
  valeur: number
  label: string
  badge: 'AIGU' | 'CHRONIQUE' | 'LES_DEUX'
}

function CelluleCombobox({
  ligneId, colonne, valeur, options, isActive, onActivate, onSave, onTab,
  style, tdClassName = '',
}: {
  ligneId: string; colonne: string; valeur: number | null
  options: ComboboxOption[]
  isActive: boolean; onActivate: () => void
  onSave: (v: number | null) => Promise<void>; onTab?: () => void
  style?: React.CSSProperties; tdClassName?: string
}) {
  const cellRef = useRef<HTMLTableCellElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [recherche, setRecherche] = useState('')
  const [cursorIdx, setCursorIdx] = useState(0)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 360 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (isActive && cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 360) })
      setRecherche('')
      setCursorIdx(0)
      const t = setTimeout(() => searchRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const close = () => onTab?.()
    window.addEventListener('scroll', close, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', close, { capture: true })
  }, [isActive, onTab])

  const optionsFiltrees = useMemo(() => {
    if (!recherche) return options
    const q = recherche.toLowerCase()
    return options.filter(o => String(o.valeur).includes(q) || o.label.toLowerCase().includes(q))
  }, [options, recherche])

  useEffect(() => {
    itemRefs.current[cursorIdx]?.scrollIntoView({ block: 'nearest' })
  }, [cursorIdx])

  const handleSelect = async (val: number) => {
    await onSave(val)
    onTab?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursorIdx(i => Math.min(i + 1, optionsFiltrees.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursorIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const opt = optionsFiltrees[cursorIdx]; if (opt) handleSelect(opt.valeur) }
    else if (e.key === 'Escape') { e.preventDefault(); onTab?.() }
    else if (e.key === 'Tab') { e.preventDefault(); const opt = optionsFiltrees[cursorIdx]; if (opt) handleSelect(opt.valeur); else onTab?.() }
  }

  const risqueActif = options.find(o => o.valeur === valeur)
  const displayLabel = risqueActif ? `${valeur}. ${risqueActif.label}` : '—'

  const badgeColors: Record<string, string> = {
    AIGU: 'bg-orange-100 text-orange-700', CHRONIQUE: 'bg-blue-100 text-blue-700', LES_DEUX: 'bg-gray-100 text-gray-600',
  }
  const badgeLabels: Record<string, string> = { AIGU: 'A', CHRONIQUE: 'C', LES_DEUX: 'A+C' }

  return (
    <td
      ref={cellRef}
      className={`${TD} cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'} overflow-hidden ${tdClassName}`}
      style={style}
      onClick={!isActive ? onActivate : undefined}
      title={!isActive ? displayLabel : undefined}
    >
      <span className={`block truncate ${!valeur ? 'text-gray-400 italic' : ''}`}>{displayLabel}</span>

      {isActive && mounted && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={onTab} />
          <div
            className="fixed z-[9999] bg-white border-2 border-blue-500 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: dropPos.top, left: dropPos.left, width: Math.min(dropPos.width, window.innerWidth - dropPos.left - 16) }}
          >
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchRef}
                  value={recherche}
                  onChange={e => { setRecherche(e.target.value); setCursorIdx(0) }}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher un risque ED840…"
                  className="flex-1 text-xs bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {optionsFiltrees.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400">Aucun résultat</div>
              )}
              {optionsFiltrees.map((opt, idx) => (
                <button
                  key={opt.valeur}
                  ref={el => { itemRefs.current[idx] = el }}
                  onClick={() => handleSelect(opt.valeur)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${idx === cursorIdx ? 'bg-blue-50' : 'hover:bg-gray-50'} ${opt.valeur === valeur ? 'font-semibold' : ''}`}
                >
                  <span className="text-gray-400 font-mono text-[11px] w-5 shrink-0 text-right">{opt.valeur}.</span>
                  <span className="flex-1 text-gray-800 truncate">{opt.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${badgeColors[opt.badge]}`}>{badgeLabels[opt.badge]}</span>
                </button>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </td>
  )
}

// ─── BadgeCriticite ──────────────────────────────────────────────────────────

function BadgeCriticite({ score, style, tdClassName = '' }: { score: number | null; style?: React.CSSProperties; tdClassName?: string }) {
  if (!score) {
    return (
      <td className={`${TD} text-center ${tdClassName}`} style={style}>
        <span className="text-gray-300">—</span>
      </td>
    )
  }
  return (
    <td className={`${TD} text-center ${tdClassName}`} style={style}>
      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold tabular-nums min-w-[32px] ${getClasseCriticite(score)}`}>
        {score}
      </span>
    </td>
  )
}

// ─── LigneRisque ─────────────────────────────────────────────────────────────

function LigneRisque({
  risque, posteId, celluleActive, onActivateCell, onSaveCell,
  onDelete, onMove, autresOperations, groupBg,
  firstInGroup, isLastInGroup, operationRowSpan, operationCell, isFirstGroup,
  widths, onOpenPresel,
}: {
  risque: RisqueUI; posteId: string; celluleActive: CelluleActive
  onActivateCell: (ligneId: string, colonne: string) => void
  onSaveCell: (ligneId: string, colonne: string, valeur: unknown) => Promise<void>
  onDelete: () => void; onMove: (operationId: string) => Promise<void>
  autresOperations: OperationUI[]; groupBg: string
  firstInGroup?: boolean; isLastInGroup?: boolean
  operationRowSpan?: number; operationCell?: React.ReactNode; isFirstGroup?: boolean
  widths: Record<string, number>
  onOpenPresel: (risqueId: string, moduleCode: Exclude<CodeModule, 'APR'>) => void
}) {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: risque.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOuvert(false)
    }
    if (menuOuvert) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOuvert])

  const isCell = (col: string) => celluleActive?.ligneId === risque.id && celluleActive?.colonne === col
  const activate = (col: string) => onActivateCell(risque.id, col)

  const nextCol = (col: string) => {
    const idx = COLONNES_TAB.indexOf(col)
    if (idx === -1 || idx === COLONNES_TAB.length - 1) return
    const next = COLONNES_TAB[idx + 1]
    if (next === 'second') {
      onActivateCell(risque.id, risque.type_risque === 'aigu' ? 'probabilite' : 'duree_exposition')
    } else if (next === 'evenement_dangereux' && risque.type_risque !== 'aigu') {
      onActivateCell(risque.id, 'dommage')
    } else {
      onActivateCell(risque.id, next)
    }
  }

  const risqueED840 = risque.numero_risque_ed840
    ? RISQUES_ED840.find(r => r.numero === risque.numero_risque_ed840) : null
  const typeAuto = risqueED840?.type === 'AIGU' ? 'aigu'
    : risqueED840?.type === 'CHRONIQUE' ? 'chronique' : null

  // Fond solide pour sticky
  const stickyBg = groupBg === 'bg-amber-50' ? 'bg-amber-50'
    : groupBg === 'bg-slate-100' ? 'bg-slate-100'
    : 'bg-white'

  // Classe séparateur sur dernière ligne de groupe
  const sepClass = isLastInGroup ? ' border-b-2 border-b-gray-400' : ''

  // Module normé : risque chronique avec module dédié
  const moduleInfo = getModuleInfo(risque)

  return (
    <tr ref={setNodeRef} style={style} className={`${groupBg} border-0`}>
      {/* Cellule opération — rowSpan sur la première ligne uniquement */}
      {firstInGroup && (
        <td
          rowSpan={operationRowSpan}
          className={`sticky left-0 z-[12] ${stickyBg} border-l border-l-gray-300 border-r-2 border-r-gray-400 border-b border-b-gray-200 w-[140px] min-w-[140px] max-w-[140px] p-0 align-top ${!isFirstGroup ? 'border-t-2 border-t-gray-400' : ''}`}
          style={{ width: widths.operation }}
        >
          {operationCell}
        </td>
      )}

      {/* Handle drag */}
      <td
        className={`border-r border-b border-gray-200 w-8 px-1.5 py-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors${sepClass}`}
        style={{ width: widths.handle }}
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4 mx-auto" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" /><circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" /><circle cx="11" cy="12" r="1.5" />
        </svg>
      </td>

      {/* Réf */}
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

      {/* — APR zone — */}
      {/* Danger */}
      <CelluleTexte
        ligneId={risque.id} colonne="danger" valeur={risque.danger} placeholder="Danger…"
        isActive={isCell('danger')} onActivate={() => activate('danger')}
        onSave={v => onSaveCell(risque.id, 'danger', v)}
        onTab={() => nextCol('danger')}
        style={{ width: widths.danger }}
        tdClassName={sepClass}
      />

      {/* Situation dangereuse */}
      <CelluleTexte
        ligneId={risque.id} colonne="situation_dangereuse" valeur={risque.situation_dangereuse} placeholder="Situation…"
        isActive={isCell('situation_dangereuse')} onActivate={() => activate('situation_dangereuse')}
        onSave={v => onSaveCell(risque.id, 'situation_dangereuse', v)}
        onTab={() => nextCol('situation_dangereuse')}
        style={{ width: widths.situation_dangereuse }}
        tdClassName={sepClass}
      />

      {/* Risque ED840 */}
      <CelluleCombobox
        ligneId={risque.id} colonne="numero_risque_ed840" valeur={risque.numero_risque_ed840}
        options={RISQUES_ED840.map(r => ({ valeur: r.numero, label: r.intitule, badge: r.type }))}
        isActive={isCell('numero_risque_ed840')} onActivate={() => activate('numero_risque_ed840')}
        onSave={async v => {
          await onSaveCell(risque.id, 'numero_risque_ed840', v ? Number(v) : null)
          const r = RISQUES_ED840.find(r => r.numero === Number(v))
          if (r?.type !== 'LES_DEUX') {
            const t = r?.type === 'AIGU' ? 'aigu' : 'chronique'
            await onSaveCell(risque.id, 'type_risque', t)
          }
        }}
        onTab={() => nextCol('numero_risque_ed840')}
        style={{ width: widths.numero_risque_ed840 }}
        tdClassName={sepClass}
      />

      {/* Type aigu / chronique */}
      <CelluleSelect
        ligneId={risque.id} colonne="type_risque" valeur={risque.type_risque}
        options={[{ valeur: 'aigu', label: 'Aigu' }, { valeur: 'chronique', label: 'Chronique' }]}
        isActive={isCell('type_risque')} onActivate={() => activate('type_risque')}
        onSave={v => onSaveCell(risque.id, 'type_risque', v)}
        onTab={() => nextCol('type_risque')}
        disabled={typeAuto !== null}
        style={{ width: widths.type_risque }}
        center
        renderLabel={v => v === 'aigu' ? 'Aigu' : v === 'chronique' ? 'Chronique' : '—'}
        tdClassName={sepClass}
      />

      {/* Événement dangereux (aigu seulement) */}
      {risque.type_risque === 'aigu' ? (
        <CelluleTexte
          ligneId={risque.id} colonne="evenement_dangereux" valeur={risque.evenement_dangereux} placeholder="Événement…"
          isActive={isCell('evenement_dangereux')} onActivate={() => activate('evenement_dangereux')}
          onSave={v => onSaveCell(risque.id, 'evenement_dangereux', v)}
          onTab={() => nextCol('evenement_dangereux')}
          style={{ width: widths.evenement_dangereux }}
          tdClassName={sepClass}
        />
      ) : (
        <td className={`${TD} text-gray-300${sepClass}`} style={{ width: widths.evenement_dangereux }}>—</td>
      )}

      {/* Dommage */}
      <CelluleTexte
        ligneId={risque.id} colonne="dommage" valeur={risque.dommage} placeholder="Dommage…"
        isActive={isCell('dommage')} onActivate={() => activate('dommage')}
        onSave={v => onSaveCell(risque.id, 'dommage', v)}
        onTab={() => nextCol('dommage')}
        style={{ width: widths.dommage }}
        tdClassName={sepClass}
      />

      {/* Siège des lésions */}
      <CelluleTexte
        ligneId={risque.id} colonne="siege_lesions" valeur={risque.siege_lesions} placeholder="Siège…"
        isActive={isCell('siege_lesions')} onActivate={() => activate('siege_lesions')}
        onSave={v => onSaveCell(risque.id, 'siege_lesions', v)}
        onTab={() => nextCol('siege_lesions')}
        style={{ width: widths.siege_lesions }}
        tdClassName={sepClass}
      />

      {/* — Évaluation zone — colSpan=3 si module normé chronique, sinon 3 cellules séparées */}
      {moduleInfo ? (
        <td
          colSpan={3}
          className={`border-r border-b border-gray-200 border-l-[3px] border-l-blue-200 px-3 py-2 text-center${sepClass}`}
          style={{ width: (widths.gravite ?? 52) + (widths.second ?? 52) + (widths.criticite_brute ?? 84) }}
        >
          <CelluleModuleNorme
            risque={risque}
            moduleInfo={moduleInfo}
            posteId={posteId}
            onOpenPresel={onOpenPresel}
          />
        </td>
      ) : (
        <>
          {/* G — Gravité : 5 boutons 1-5 colorés */}
          <CelluleNoteBoutons
            ligneId={risque.id} colonne="gravite" valeur={risque.gravite}
            isActive={isCell('gravite')} onActivate={() => activate('gravite')}
            onSave={v => onSaveCell(risque.id, 'gravite', v)}
            onTab={() => nextCol('gravite')}
            style={{ width: widths.gravite }}
            tdClassName={`border-l-[3px] border-l-blue-200${sepClass}`}
            max={5}
          />

          {/* P (aigu) ou DE (chronique) : 4 boutons 1-4 colorés */}
          <CelluleNoteBoutons
            ligneId={risque.id}
            colonne={risque.type_risque === 'aigu' ? 'probabilite' : 'duree_exposition'}
            valeur={risque.type_risque === 'aigu' ? risque.probabilite : risque.duree_exposition}
            isActive={risque.type_risque === 'aigu' ? isCell('probabilite') : isCell('duree_exposition')}
            onActivate={() => activate(risque.type_risque === 'aigu' ? 'probabilite' : 'duree_exposition')}
            onSave={v => onSaveCell(risque.id, risque.type_risque === 'aigu' ? 'probabilite' : 'duree_exposition', v)}
            onTab={() => nextCol('second')}
            style={{ width: widths.second }}
            tdClassName={sepClass}
            max={4}
          />

          {/* Criticité brute */}
          <BadgeCriticite score={risque.criticite_brute} style={{ width: widths.criticite_brute }} tdClassName={sepClass} />
        </>
      )}

      {/* — Maîtrise zone — */}
      {/* T.H.O./EPI */}
      <CelluleTexte
        ligneId={risque.id} colonne="mesures_techniques" valeur={risque.mesures_techniques} placeholder="Mesures…"
        isActive={isCell('mesures_techniques')} onActivate={() => activate('mesures_techniques')}
        onSave={v => onSaveCell(risque.id, 'mesures_techniques', v)}
        onTab={() => nextCol('mesures_techniques')}
        style={{ width: widths.mesures_techniques }}
        tdClassName={`border-l-[3px] border-l-green-200${sepClass}`}
      />

      {/* PM */}
      <CelluleSelect
        ligneId={risque.id} colonne="coefficient_pm" valeur={risque.coefficient_pm}
        options={COEFFICIENTS_PM.map(c => ({ valeur: c.valeur, label: `×${c.valeur} — ${c.label}` }))}
        isActive={isCell('coefficient_pm')} onActivate={() => activate('coefficient_pm')}
        onSave={v => onSaveCell(risque.id, 'coefficient_pm', v !== null ? Number(v) : 1)}
        onTab={() => onActivateCell('', '')}
        renderLabel={v => v !== null ? `×${v}` : '×1'}
        style={{ width: widths.coefficient_pm }}
        center
        tdClassName={sepClass}
      />

      {/* Criticité résiduelle */}
      <BadgeCriticite score={risque.criticite_residuelle} style={{ width: widths.criticite_residuelle }} tdClassName={sepClass} />

      {/* Menu ⋮ */}
      <td className={`${TD} px-1${sepClass}`} style={{ width: widths.actions }}>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {menuOuvert && (
            <div className="absolute right-0 top-8 z-20 w-52 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              {autresOperations.length > 0 && (
                <div className="border-b border-gray-100">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Déplacer vers</p>
                  {autresOperations.map(op => (
                    <button
                      key={op.id}
                      onClick={() => { onMove(op.id); setMenuOuvert(false) }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      {op.est_transversale ? (
                        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className="truncate">{op.nom}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => { onDelete(); setMenuOuvert(false) }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer ce risque
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── CelluleModuleNorme ───────────────────────────────────────────────────────

function CelluleModuleNorme({
  risque, moduleInfo, posteId, onOpenPresel,
}: {
  risque: RisqueUI
  moduleInfo: ModuleRisque
  posteId: string
  onOpenPresel: (risqueId: string, moduleCode: Exclude<CodeModule, 'APR'>) => void
}) {
  const [resetPending, startReset] = useTransition()

  if (risque.module_status === 'maitrise') {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[11px] font-semibold">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Maîtrisé
        </span>
        <button
          onClick={() => startReset(async () => { await actions.resetPreselectionModule(risque.id, posteId) })}
          disabled={resetPending}
          className="text-gray-300 hover:text-gray-500 transition-colors"
          title="Refaire la présélection"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    )
  }

  if (risque.module_status === 'creuser') {
    if (moduleInfo.statut === 'actif') {
      // M01_BRUIT → page dédiée /modules/bruit/[evalId]
      const href = moduleInfo.code === 'M01_BRUIT'
        ? `/dashboard/modules/bruit/${risque.id}`
        : `/dashboard/postes/${posteId}/operations/${risque.operation_id}/risques/${moduleInfo.code}`
      return (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <Link
            href={href}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Méthode normée {moduleInfo.nom}
          </Link>
          <button
            onClick={() => startReset(async () => { await actions.resetPreselectionModule(risque.id, posteId) })}
            disabled={resetPending}
            className="text-gray-300 hover:text-gray-500 transition-colors"
            title="Refaire la présélection"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      )
    }
    // Coming soon
    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded text-[11px]">
          À venir — {moduleInfo.nom}
        </span>
        <button
          onClick={() => startReset(async () => { await actions.resetPreselectionModule(risque.id, posteId) })}
          disabled={resetPending}
          className="text-gray-300 hover:text-gray-500 transition-colors"
          title="Refaire"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    )
  }

  // Non initié — bouton lancer
  return (
    <button
      onClick={() => onOpenPresel(risque.id, moduleInfo.code as Exclude<CodeModule, 'APR'>)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      Lancer {moduleInfo.nom}
    </button>
  )
}

// ─── GroupeOperation ──────────────────────────────────────────────────────────

function GroupeOperation({
  operation, posteId, celluleActive, onActivateCell, onSaveCell,
  onAddRisque, onDeleteRisque, onMoveRisque, onRenameOperation, onDeleteOperation,
  autresOperations, groupIndex, widths, onOpenPresel,
}: {
  operation: OperationUI; posteId: string; celluleActive: CelluleActive
  onActivateCell: (l: string, c: string) => void
  onSaveCell: (l: string, c: string, v: unknown) => Promise<void>
  onAddRisque: (opId: string) => Promise<void>
  onDeleteRisque: (id: string) => void
  onMoveRisque: (risqueId: string, opId: string) => Promise<void>
  onRenameOperation: (id: string, nom: string) => Promise<void>
  onDeleteOperation: (id: string, nom: string, nb: number) => void
  autresOperations: OperationUI[]
  groupIndex: number
  widths: Record<string, number>
  onOpenPresel: (risqueId: string, moduleCode: Exclude<CodeModule, 'APR'>) => void
}) {
  const [renaming, setRenaming] = useState(false)
  const [nomDraft, setNomDraft] = useState(operation.nom)
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) renameRef.current?.focus()
  }, [renaming])

  const handleRenameCommit = async () => {
    if (nomDraft.trim() && nomDraft.trim() !== operation.nom) {
      await onRenameOperation(operation.id, nomDraft.trim())
    } else {
      setNomDraft(operation.nom)
    }
    setRenaming(false)
  }

  const handleAddInline = async () => {
    setAjoutEnCours(true)
    await onAddRisque(operation.id)
    setAjoutEnCours(false)
  }

  const groupBg = getGroupBg(operation, groupIndex)
  const isFirstGroup = groupIndex === 0

  const opCellBg = groupBg === 'bg-slate-100' ? 'bg-slate-100' : 'bg-white'

  const nbLignes = Math.max(operation.risques.length, 1)
  const operationRowSpan = Math.max(operation.risques.length, 1)

  // Contenu de la cellule opération — layout uniforme pour transversale et normale
  const operationCell = (
    <div
      className="flex flex-col h-full px-2.5 py-2 text-gray-800"
      style={{ minHeight: `${nbLignes * 36 + 4}px` }}
    >
      {/* Haut : nom centré + bouton + */}
      <div className="flex items-start gap-1.5">
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              ref={renameRef}
              value={nomDraft}
              onChange={e => setNomDraft(e.target.value)}
              onBlur={handleRenameCommit}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRenameCommit()
                if (e.key === 'Escape') { setNomDraft(operation.nom); setRenaming(false) }
              }}
              className="text-[13px] font-semibold bg-white text-gray-800 border border-blue-400 rounded px-1.5 py-0.5 focus:outline-none w-full"
            />
          ) : (
            <span className="text-[13px] font-semibold leading-snug break-words text-gray-900">
              {operation.nom}
            </span>
          )}
        </div>
        {/* Bouton + inline */}
        <button
          onClick={handleAddInline}
          disabled={ajoutEnCours}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-500 hover:text-brand-navy hover:border-brand-navy transition-colors disabled:opacity-50"
          title="Ajouter un risque"
        >
          {ajoutEnCours ? (
            <svg className="w-3 h-3 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Bas : actions renommer / supprimer alignées à droite (sauf Toutes opérations) */}
      {!operation.est_transversale && (
        <div className="flex items-center justify-end gap-0.5 mt-auto pt-2">
          <button
            onClick={() => setRenaming(true)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-200"
            title="Renommer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteOperation(operation.id, operation.nom, operation.risques.length)}
            className="text-red-400/60 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
            title="Supprimer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )

  return (
    <SortableContext items={operation.risques.map(r => r.id)} strategy={verticalListSortingStrategy}>
      {/* Opération vide : 1 ligne placeholder */}
      {operation.risques.length === 0 && (
        <tr className={groupBg}>
          <td
            rowSpan={1}
            className={`sticky left-0 z-[12] ${opCellBg} border-l border-l-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 w-[140px] min-w-[140px] max-w-[140px] p-0 align-top ${!isFirstGroup ? 'border-t-2 border-t-gray-400' : ''}`}
            style={{ width: widths.operation }}
          >
            {operationCell}
          </td>
          <td
            colSpan={16}
            className={`px-4 py-3 text-xs text-gray-400 border-r border-gray-200 border-b-2 border-b-gray-400 italic ${!isFirstGroup ? 'border-t-2 border-t-gray-400' : ''}`}
          >
            Aucun risque — cliquez <Plus className="inline w-3 h-3 mx-0.5" /> pour ajouter
          </td>
        </tr>
      )}

      {/* Lignes de risques */}
      {operation.risques.map((risque, idx) => (
        <LigneRisque
          key={risque.id}
          risque={risque}
          posteId={posteId}
          celluleActive={celluleActive}
          onActivateCell={onActivateCell}
          onSaveCell={onSaveCell}
          onDelete={() => onDeleteRisque(risque.id)}
          onMove={opId => onMoveRisque(risque.id, opId)}
          autresOperations={autresOperations}
          groupBg={groupBg}
          firstInGroup={idx === 0}
          isLastInGroup={idx === operation.risques.length - 1}
          operationRowSpan={operationRowSpan}
          operationCell={operationCell}
          isFirstGroup={isFirstGroup}
          widths={widths}
          onOpenPresel={onOpenPresel}
        />
      ))}
    </SortableContext>
  )
}

// ─── Modales ─────────────────────────────────────────────────────────────────

function ModaleConfirm({
  titre, description, onConfirm, onCancel, confirmLabel = 'Confirmer', confirmVariant = 'red',
}: {
  titre: string; description: string; onConfirm: () => void; onCancel: () => void
  confirmLabel?: string; confirmVariant?: 'red' | 'navy'
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="font-semibold text-gray-900 mb-2">{titre}</h3>
        <p className="text-sm text-gray-600 mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">Annuler</button>
          <button
            onClick={onConfirm}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${confirmVariant === 'red' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModaleSuppressionOperation({
  nom, nbRisques, onCascade, onDeplacer, onCancel,
}: {
  nom: string; nbRisques: number; onCascade: () => void; onDeplacer: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="font-semibold text-gray-900 mb-2">Supprimer &quot;{nom}&quot; ?</h3>
        {nbRisques > 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Cette opération contient <strong>{nbRisques} risque{nbRisques > 1 ? 's' : ''}</strong>. Que souhaitez-vous faire ?
            </p>
            <div className="space-y-2 mb-4">
              <button onClick={onDeplacer} className="w-full text-left text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:border-amber-400 transition-colors">
                <p className="font-medium text-amber-900">Déplacer vers &quot;Toutes opérations&quot;</p>
                <p className="text-xs text-amber-700 mt-0.5">Les risques sont conservés et rattachés au poste entier.</p>
              </button>
              <button onClick={onCascade} className="w-full text-left text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:border-red-400 transition-colors">
                <p className="font-medium text-red-700">Supprimer l&apos;opération et ses risques</p>
                <p className="text-xs text-red-600 mt-0.5">Action irréversible — {nbRisques} risque{nbRisques > 1 ? 's' : ''} supprimé{nbRisques > 1 ? 's' : ''}.</p>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-6">Cette opération est vide. Supprimer ?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">Annuler</button>
              <button onClick={onCascade} className="text-sm font-semibold px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">Supprimer</button>
            </div>
          </>
        )}
        {nbRisques > 0 && (
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">Annuler</button>
        )}
      </div>
    </div>
  )
}

function ModalePreselection({
  risqueId, posteId, moduleCode, onClose, onSubmit,
}: {
  risqueId: string
  posteId: string
  moduleCode: Exclude<CodeModule, 'APR'>
  onClose: () => void
  onSubmit: (risqueId: string, reponses: boolean[], moduleStatus: 'maitrise' | 'creuser') => void
}) {
  const questions = QUESTIONS_PRESELECTION[moduleCode]
  const module = MODULE_PAR_CODE[moduleCode]
  const [reponses, setReponses] = useState<(boolean | null)[]>([null, null, null])
  const [isPending, startTransition] = useTransition()

  const allAnswered = reponses.every(r => r !== null)

  const handleSubmit = () => {
    if (!allAnswered) return
    const rep = reponses as boolean[]
    startTransition(async () => {
      const result = await actions.enregistrerPreselectionModule(risqueId, posteId, rep)
      if (result.succes) {
        onSubmit(risqueId, rep, result.moduleStatus as 'maitrise' | 'creuser')
        onClose()
      }
    })
  }

  const toggle = (i: number, val: boolean) => {
    setReponses(prev => { const r = [...prev]; r[i] = val; return r })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-gray-200 rounded-2xl p-6 max-w-lg w-full shadow-xl">
        <div className="mb-5">
          <p className="text-xs font-bold text-brand-bronze uppercase tracking-wider mb-0.5">Présélection</p>
          <h3 className="font-bold text-gray-900 text-base">{module.nom}</h3>
          <p className="text-xs text-gray-500 mt-1">3 questions pour déterminer si une évaluation normée est nécessaire. 0 OUI = risque maîtrisé, 1+ OUI = module à compléter.</p>
        </div>

        <div className="space-y-4 mb-6">
          {questions.map((q, i) => (
            <div key={q.id}>
              <p className="text-sm text-gray-800 mb-2 leading-snug">{i + 1}. {q.texte}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(i, true)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg border-2 transition-colors ${reponses[i] === true ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  Oui
                </button>
                <button
                  onClick={() => toggle(i, false)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg border-2 transition-colors ${reponses[i] === false ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  Non
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2">Annuler</button>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isPending}
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-brand-navy text-white disabled:opacity-50 hover:bg-brand-navy/90 transition-colors"
          >
            {isPending ? 'Enregistrement…' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── TableauAPR (orchestrateur) ───────────────────────────────────────────────

// ─── MenuPoste (dropdown ⋮ dans la toolbar) ──────────────────────────────────

function CompteurCriticites({
  total, compteurs, filtre, onFiltre,
}: {
  total: number
  compteurs: Record<CriticiteZone, number>
  filtre: CriticiteZone | null
  onFiltre: (zone: CriticiteZone | null) => void
}) {
  const zones: { key: CriticiteZone; label: string; dot: string }[] = [
    { key: 'rouge',     label: 'Rouge',     dot: 'bg-red-500' },
    { key: 'orange',    label: 'Orange',    dot: 'bg-orange-500' },
    { key: 'jaune',     label: 'Jaune',     dot: 'bg-yellow-400' },
    { key: 'vert',      label: 'Vert',      dot: 'bg-green-500' },
    { key: 'incomplet', label: 'Incomplets', dot: 'bg-gray-300' },
  ]
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <button
        onClick={() => onFiltre(null)}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          filtre === null
            ? 'bg-brand-navy text-white font-semibold'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="Afficher tous les risques"
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
          title={z.label}
        >
          <span className={`w-2 h-2 rounded-full ${z.dot}`} />
          <span className="font-medium">{compteurs[z.key]}</span>
        </button>
      ))}
    </div>
  )
}

function MenuPoste({ posteId, nomPoste, descriptionPoste }: {
  posteId: string
  nomPoste: string
  descriptionPoste: string | null
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
          aria-label="Actions du poste"
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
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              Supprimer le poste
            </button>
          </div>
        )}
      </div>

      <EditerPosteModal
        poste={{ id: posteId, nom: nomPoste, description: descriptionPoste ?? '' }}
        open={editer}
        onOpenChange={setEditer}
        hideTrigger
      />
      <SupprimerPosteButton
        posteId={posteId}
        nomPoste={nomPoste}
        open={supprimer}
        onOpenChange={setSupprimer}
        hideTrigger
      />
    </>
  )
}

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
  const [operations, setOperations] = useState<OperationUI[]>(operationsInitiales)
  const [celluleActive, setCelluleActive] = useState<CelluleActive>(null)
  const [modale, setModale] = useState<ModaleEtat>(null)
  const [modalePresel, setModalePresel] = useState<ModalePreselEtat>(null)
  const [filtreCriticite, setFiltreCriticite] = useState<CriticiteZone | null>(null)
  const [isPending, startTransition] = useTransition()
  const [ajoutOpEnCours, startAjoutOp] = useTransition()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pleinEcran, setPleinEcran] = useState(false)
  const [savedRecently, setSavedRecently] = useState(false)
  const prevPendingRef = useRef(false)
  const { widths, setWidth, resetWidths } = useColumnWidths()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    if (!pleinEcran) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setPleinEcran(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [pleinEcran])

  useEffect(() => {
    if (prevPendingRef.current && !isPending) {
      setSavedRecently(true)
      const timer = setTimeout(() => setSavedRecently(false), 1500)
      prevPendingRef.current = false
      return () => clearTimeout(timer)
    }
    prevPendingRef.current = isPending
  }, [isPending])

  // ── Helpers d'état ──────────────────────────────────────────────────────────

  const updateRisque = useCallback((risqueId: string, updates: Partial<RisqueUI>) => {
    setOperations(prev => prev.map(op => ({
      ...op,
      risques: op.risques.map(r => r.id === risqueId ? { ...r, ...updates } : r),
    })))
  }, [])

  const removeRisque = useCallback((risqueId: string) => {
    setOperations(prev => prev.map(op => ({
      ...op,
      risques: op.risques.filter(r => r.id !== risqueId),
    })))
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveCell = useCallback(async (ligneId: string, colonne: string, valeur: unknown) => {
    if (colonne === 'gravite' || colonne === 'probabilite' || colonne === 'duree_exposition' || colonne === 'type_risque') {
      const risque = operations.flatMap(op => op.risques).find(r => r.id === ligneId)
      if (risque) {
        const g = colonne === 'gravite' ? (valeur as number) : (risque.gravite ?? 0)
        const typeRisque = colonne === 'type_risque' ? (valeur as string) : risque.type_risque
        const p = colonne === 'probabilite' ? (valeur as number) : (risque.probabilite ?? 0)
        const de = colonne === 'duree_exposition' ? (valeur as number) : (risque.duree_exposition ?? 0)
        const second = typeRisque === 'aigu' ? p : de
        const critBrute = (g > 0 && second > 0) ? g * second : null
        const critRes = critBrute !== null ? critBrute * risque.coefficient_pm : null
        updateRisque(ligneId, { [colonne]: valeur, criticite_brute: critBrute, criticite_residuelle: critRes })
      }
    } else if (colonne === 'coefficient_pm') {
      const risque = operations.flatMap(op => op.risques).find(r => r.id === ligneId)
      if (risque) {
        const pm = Number(valeur)
        const critRes = risque.criticite_brute !== null ? risque.criticite_brute * pm : null
        updateRisque(ligneId, { coefficient_pm: pm, criticite_residuelle: critRes })
      }
    } else if (colonne === 'numero_risque_ed840') {
      updateRisque(ligneId, { numero_risque_ed840: valeur !== null ? Number(valeur) : null })
    } else {
      updateRisque(ligneId, { [colonne]: valeur })
    }

    startTransition(async () => {
      await actions.mettreAJourCellule(ligneId, posteId, colonne, valeur)
    })
  }, [operations, posteId, updateRisque])

  const handleAddOperation = () => {
    startAjoutOp(async () => {
      // Numéroter pour éviter les doublons silencieux "Nouvelle opération" × N
      const existants = operations.filter(op => op.nom.startsWith('Nouvelle opération'))
      const nomNouvelle = existants.length === 0
        ? 'Nouvelle opération'
        : `Nouvelle opération ${existants.length + 1}`
      const result = await actions.creerOperationInline(posteId, nomNouvelle)
      if (result.succes && result.operation) {
        setOperations(prev => [...prev, { ...result.operation!, risques: [] }])
      } else {
        console.error('Erreur création opération', result)
        alert("Impossible de créer l'opération. Vérifie ta connexion et réessaie.")
      }
    })
  }

  const handleAddRisque = async (operationId: string) => {
    const result = await actions.creerRisqueVide(operationId, posteId)
    if (result.succes && result.evaluation) {
      const nouvelleRisque: RisqueUI = {
        id: result.evaluation.id,
        operation_id: operationId,
        identifiant_auto: result.evaluation.identifiant_auto ?? null,
        numero_risque_ed840: null,
        type_risque: 'aigu',
        danger: null,
        situation_dangereuse: null,
        evenement_dangereux: null,
        dommage: null,
        siege_lesions: null,
        gravite: null,
        probabilite: null,
        duree_exposition: null,
        criticite_brute: null,
        coefficient_pm: 1.0,
        criticite_residuelle: null,
        mesures_techniques: null,
        ordre: result.evaluation.ordre,
        module_status: null,
        preselection_responses: null,
      }
      setOperations(prev => prev.map(op =>
        op.id === operationId ? { ...op, risques: [...op.risques, nouvelleRisque] } : op
      ))
      setCelluleActive({ ligneId: result.evaluation.id, colonne: 'danger' })
    }
  }

  const handleDeleteRisque = async (risqueId: string) => {
    removeRisque(risqueId)
    startTransition(async () => { await actions.supprimerRisque(risqueId, posteId) })
    setModale(null)
  }

  const handleMoveRisque = async (risqueId: string, nouvelOperationId: string) => {
    const risque = operations.flatMap(op => op.risques).find(r => r.id === risqueId)
    if (!risque) return
    setOperations(prev => prev.map(op => {
      if (op.risques.some(r => r.id === risqueId)) return { ...op, risques: op.risques.filter(r => r.id !== risqueId) }
      if (op.id === nouvelOperationId) return { ...op, risques: [...op.risques, { ...risque, operation_id: nouvelOperationId }] }
      return op
    }))
    startTransition(async () => { await actions.deplacerRisque(risqueId, nouvelOperationId, posteId) })
  }

  const handleDeleteOperation = async (operationId: string, mode: 'cascade' | 'deplacer') => {
    if (mode === 'deplacer') {
      const transversale = operations.find(op => op.est_transversale)
      const risquesToMove = operations.find(op => op.id === operationId)?.risques ?? []
      setOperations(prev => prev
        .filter(op => op.id !== operationId)
        .map(op => op.id === transversale?.id
          ? { ...op, risques: [...op.risques, ...risquesToMove.map(r => ({ ...r, operation_id: op.id }))] }
          : op
        )
      )
    } else {
      setOperations(prev => prev.filter(op => op.id !== operationId))
    }
    startTransition(async () => { await actions.supprimerOperationAvecOptions(operationId, posteId, mode) })
    setModale(null)
  }

  const handleRenameOperation = async (operationId: string, nom: string) => {
    setOperations(prev => prev.map(op => op.id === operationId ? { ...op, nom } : op))
    await actions.renommerOperation(operationId, posteId, nom)
  }

  const handlePreselectionSubmit = useCallback((risqueId: string, _reponses: boolean[], moduleStatus: 'maitrise' | 'creuser') => {
    updateRisque(risqueId, {
      module_status: moduleStatus,
      preselection_responses: _reponses,
      ...(moduleStatus === 'maitrise' ? { criticite_brute: 1, gravite: 1 } : {}),
    })
  }, [updateRisque])

  // ── DnD ─────────────────────────────────────────────────────────────────────

  const findOperationByRisqueId = (risqueId: string) =>
    operations.find(op => op.risques.some(r => r.id === risqueId))

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setCelluleActive(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const activeOp = findOperationByRisqueId(active.id as string)
    const overOp = findOperationByRisqueId(over.id as string)
    if (!activeOp) return

    if (overOp && activeOp.id === overOp.id) {
      setOperations(prev => prev.map(op => {
        if (op.id !== activeOp.id) return op
        const oldIdx = op.risques.findIndex(r => r.id === active.id)
        const newIdx = op.risques.findIndex(r => r.id === over.id)
        return { ...op, risques: arrayMove(op.risques, oldIdx, newIdx) }
      }))
    } else if (overOp && activeOp.id !== overOp.id) {
      handleMoveRisque(active.id as string, overOp.id)
    }
  }

  const risqueActif = activeId
    ? operations.flatMap(op => op.risques).find(r => r.id === activeId)
    : null

  const operationsTri = [...operations].sort((a, b) => {
    if (a.est_transversale && !b.est_transversale) return -1
    if (!a.est_transversale && b.est_transversale) return 1
    return a.ordre - b.ordre
  })

  // ── Compteurs criticités + filtre ───────────────────────────────────────────

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

  // ── Super-header labels ──────────────────────────────────────────────────────

  const TH_ZONE = 'border-r border-b border-t border-gray-300 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-center'
  const TH2 = 'bg-gray-50 border-r border-b border-gray-300 px-2 py-2 text-[12px] font-semibold text-gray-700 tracking-normal text-center relative'

  // ── Toolbar ─────────────────────────────────────────────────────────────────

  const toolbar = (
    <div className="flex items-center gap-3 h-12 px-4 lg:px-6">

      {/* Gauche : retour + nom poste + menu */}
      <div className="flex items-center gap-2 shrink-0 min-w-0">
        <Link
          href="/dashboard/postes"
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          title="Retour aux postes"
          aria-label="Retour aux postes"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1
          className="text-sm font-semibold text-brand-navy truncate max-w-[300px]"
          title={descriptionPoste ?? nomPoste}
        >
          {nomPoste}
        </h1>
        <MenuPoste posteId={posteId} nomPoste={nomPoste} descriptionPoste={descriptionPoste} />
      </div>

      {/* Centre : compteur criticités cliquable (filtre toggle) */}
      <div className="flex-1 flex justify-center min-w-0">
        <CompteurCriticites
          total={totalRisques}
          compteurs={compteurs}
          filtre={filtreCriticite}
          onFiltre={setFiltreCriticite}
        />
      </div>

      {/* Droite : indicateur sauvegarde + icônes actions */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="h-5 flex items-center mr-1">
          {isPending && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />Sauvegarde…
            </span>
          )}
          {!isPending && savedRecently && (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Sauvegardé
            </span>
          )}
        </div>

        <button
          onClick={resetWidths}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
          title="Remettre les largeurs par défaut"
          aria-label="Remettre les largeurs par défaut"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setPleinEcran(v => !v)}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
          title={pleinEcran ? 'Quitter le plein écran (Échap)' : 'Plein écran'}
          aria-label={pleinEcran ? 'Quitter le plein écran' : 'Plein écran'}
        >
          {pleinEcran ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  // ── Contenu du tableau ───────────────────────────────────────────────────────

  const tableauContent = (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <table style={{ minWidth: '1850px', borderCollapse: 'separate', borderSpacing: 0 }} className="w-full">

        {/* En-tête sticky — 2 lignes */}
        <thead className="sticky top-0 z-20">
          {/* Ligne 1 : zones super-headers */}
          <tr>
            {/* APR zone — couvre Opération + handle + 8 cols APR */}
            <th colSpan={10} className={`${TH_ZONE} bg-blue-50 text-blue-700 border-b-0`}>
              APR — Analyse Préliminaire des Risques
            </th>
            {/* Évaluation zone — bordure gauche bleue */}
            <th colSpan={3} className={`${TH_ZONE} bg-yellow-50 text-yellow-700 border-l-4 border-l-blue-300 border-b-0`}>
              Évaluation
            </th>
            {/* Maîtrise zone */}
            <th colSpan={3} className={`${TH_ZONE} bg-green-50 text-green-700 border-l-4 border-l-green-300 border-b-0`}>
              Plan de Maîtrise
            </th>
            {/* Actions — rowSpan=2 */}
            <th rowSpan={2} className={`${TH} border-r-0`} style={{ width: widths.actions }} />
          </tr>

          {/* Ligne 2 : colonnes individuelles */}
          <tr>
            {/* Opération (sticky left) — bordures en classes pour border-collapse: separate */}
            <th
              className={`${TH2} sticky left-0 z-30 border-l border-l-gray-300 border-r-2 border-r-gray-400`}
              style={{ width: widths.operation, minWidth: widths.operation }}
            >
              Opération
              <ColonneResizer colId="operation" onResize={setWidth} />
            </th>
            {/* Handle */}
            <th className={TH2} style={{ width: widths.handle, minWidth: widths.handle }} />
            {/* APR cols */}
            <th className={TH2} style={{ width: widths.ref }}>Réf.<ColonneResizer colId="ref" onResize={setWidth} /></th>
            <th className={TH2} style={{ width: widths.danger }}>
              Danger<ColonneResizer colId="danger" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.situation_dangereuse }}>
              Situation<ColonneResizer colId="situation_dangereuse" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.numero_risque_ed840 }}>
              Risque ED840<ColonneResizer colId="numero_risque_ed840" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.type_risque }}>
              Type<ColonneResizer colId="type_risque" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.evenement_dangereux }}>
              Événement<ColonneResizer colId="evenement_dangereux" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.dommage }}>
              Dommage<ColonneResizer colId="dommage" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.siege_lesions }}>
              Siège<ColonneResizer colId="siege_lesions" onResize={setWidth} />
            </th>
            {/* Eval cols — bordure gauche bleue */}
            <th className={`${TH2} border-l-4 border-l-blue-200`} style={{ width: widths.gravite }}>
              Gravité<ColonneResizer colId="gravite" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.second }}>
              Probabilité<ColonneResizer colId="second" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.criticite_brute }}>
              C. brute<ColonneResizer colId="criticite_brute" onResize={setWidth} />
            </th>
            {/* Maîtrise cols — bordure gauche verte */}
            <th className={`${TH2} border-l-4 border-l-green-200`} style={{ width: widths.mesures_techniques }}>
              Moyens de maîtrise<ColonneResizer colId="mesures_techniques" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.coefficient_pm }}>
              PM<ColonneResizer colId="coefficient_pm" onResize={setWidth} />
            </th>
            <th className={TH2} style={{ width: widths.criticite_residuelle }}>
              C. résid.<ColonneResizer colId="criticite_residuelle" onResize={setWidth} />
            </th>
          </tr>
        </thead>

        <tbody>
          {operationsAffichees.map((op, groupIdx) => (
            <GroupeOperation
              key={op.id}
              operation={op}
              posteId={posteId}
              celluleActive={celluleActive}
              onActivateCell={(l, c) => setCelluleActive(l ? { ligneId: l, colonne: c } : null)}
              onSaveCell={handleSaveCell}
              onAddRisque={handleAddRisque}
              onDeleteRisque={id => setModale({ type: 'risque', id })}
              onMoveRisque={handleMoveRisque}
              onRenameOperation={handleRenameOperation}
              onDeleteOperation={(id, nom, nb) => setModale({ type: 'operation', id, nom, nbRisques: nb })}
              autresOperations={operations.filter(o => o.id !== op.id)}
              groupIndex={groupIdx}
              widths={widths}
              onOpenPresel={(risqueId, moduleCode) => setModalePresel({ risqueId, moduleCode })}
            />
          ))}

          {/* Ligne d'ajout opération (pattern Notion/Linear) */}
          <tr>
            <td colSpan={17} className="border-b border-gray-200 p-0 bg-gray-50">
              <button
                onClick={handleAddOperation}
                disabled={ajoutOpEnCours}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-brand-navy hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {ajoutOpEnCours ? 'Ajout…' : 'Ajouter une opération'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <DragOverlay>
        {risqueActif ? (
          <div className="bg-white border border-blue-400 rounded-lg px-4 py-2 text-xs text-gray-800 shadow-xl opacity-95 flex items-center gap-3">
            <span className="font-mono text-gray-400 text-[11px]">{risqueActif.identifiant_auto}</span>
            <span className="font-medium">{risqueActif.danger ?? '(risque sans danger)'}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )

  return (
    <>
      {!pleinEcran && (
        <div className="h-full bg-white border-t border-b border-gray-200 flex flex-col">
          <div className="shrink-0 border-b border-gray-200 bg-gray-50">
            {toolbar}
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            {tableauContent}
          </div>
        </div>
      )}

      {pleinEcran && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 shrink-0">
            {toolbar}
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            {tableauContent}
          </div>
        </div>
      )}

      {/* Modales suppression */}
      {modale?.type === 'risque' && (
        <ModaleConfirm
          titre="Supprimer ce risque ?"
          description="Cette action est irréversible. Le risque et son plan de maîtrise seront définitivement supprimés."
          confirmLabel="Supprimer"
          onConfirm={() => handleDeleteRisque(modale.id)}
          onCancel={() => setModale(null)}
        />
      )}
      {modale?.type === 'operation' && (
        <ModaleSuppressionOperation
          nom={modale.nom}
          nbRisques={modale.nbRisques}
          onCascade={() => handleDeleteOperation(modale.id, 'cascade')}
          onDeplacer={() => handleDeleteOperation(modale.id, 'deplacer')}
          onCancel={() => setModale(null)}
        />
      )}

      {/* Modale présélection module normé */}
      {modalePresel && (
        <ModalePreselection
          risqueId={modalePresel.risqueId}
          posteId={posteId}
          moduleCode={modalePresel.moduleCode}
          onClose={() => setModalePresel(null)}
          onSubmit={handlePreselectionSubmit}
        />
      )}
    </>
  )
}
