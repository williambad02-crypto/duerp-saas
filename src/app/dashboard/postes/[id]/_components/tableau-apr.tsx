'use client'

import { useState, useCallback, useRef, useTransition, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Minimize2 } from 'lucide-react'
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
import { ECHELLE_GRAVITE, ECHELLE_PROBABILITE, COEFFICIENTS_PM, getNiveauCriticite } from '@/lib/constants/cotation'
import { ECHELLE_DUREE_EXPOSITION } from '@/lib/constants/ed840'
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

// ─── Constantes colonnes ─────────────────────────────────────────────────────

const COLONNES_TAB = [
  'danger', 'situation_dangereuse', 'numero_risque_ed840', 'type_risque',
  'evenement_dangereux', 'dommage', 'siege_lesions', 'gravite', 'second',
  'mesures_techniques', 'coefficient_pm',
]

// ─── Styles communs ───────────────────────────────────────────────────────────

// Classe de base pour les <th>
const TH = 'bg-gray-100 border-b-2 border-b-gray-300 border-r border-r-gray-200 px-3 py-3 text-[11px] font-semibold text-gray-600 uppercase tracking-[0.05em]'

// Classe de base pour les <td> non éditables
const TD = 'px-3 py-2.5 text-xs border-r border-b border-gray-200 text-gray-900'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGroupBg(op: OperationUI, groupIndex: number): string {
  if (op.est_transversale) return 'bg-amber-50'
  return groupIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
}

function getClasseCriticite(score: number): string {
  if (score <= 4) return 'bg-green-50 text-green-800 border border-green-200'
  if (score <= 9) return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
  if (score <= 14) return 'bg-orange-100 text-orange-800 border border-orange-200'
  return 'bg-red-100 text-red-800 border border-red-200'
}

// ─── CelluleTexte ────────────────────────────────────────────────────────────

function CelluleTexte({
  ligneId, colonne, valeur, placeholder = '—',
  isActive, onActivate, onSave, onTab,
  minWidth = 'min-w-[140px]',
  maxWidth,
  tdClassName = '',
}: {
  ligneId: string; colonne: string; valeur: string | null; placeholder?: string
  isActive: boolean; onActivate: () => void; onSave: (v: string | null) => Promise<void>
  onTab?: () => void; minWidth?: string; maxWidth?: string; tdClassName?: string
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

  const sizeClass = `${minWidth}${maxWidth ? ` ${maxWidth}` : ''}`

  if (isActive) {
    return (
      <td className={`px-2 py-1 ${sizeClass} border-r border-b border-gray-200 bg-white ${tdClassName}`}>
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
      className={`${TD} cursor-pointer hover:bg-gray-50 ${sizeClass} overflow-hidden ${tdClassName}`}
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
  renderLabel, minWidth = 'min-w-[60px]', disabled = false, tdClassName = '',
  center = false,
}: {
  ligneId: string; colonne: string; valeur: number | string | null
  options: { valeur: number | string; label: string }[]
  isActive: boolean; onActivate: () => void
  onSave: (v: number | string | null) => Promise<void>; onTab?: () => void
  renderLabel?: (v: number | string | null) => string; minWidth?: string; disabled?: boolean
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
      <td className={`px-1 py-1 ${minWidth} border-r border-b border-gray-200 bg-white ${tdClassName}`}>
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
      className={`${TD} ${minWidth} ${center ? 'text-center' : ''} ${disabled ? 'opacity-50 cursor-default' : 'cursor-pointer hover:bg-gray-50'} ${tdClassName}`}
      onClick={disabled ? undefined : onActivate}
    >
      <span className={!valeur && valeur !== 0 ? 'text-gray-400' : ''}>
        {label}
      </span>
    </td>
  )
}

// ─── CelluleCombobox (Risque ED840 avec recherche) ───────────────────────────

interface ComboboxOption {
  valeur: number
  label: string  // intitulé seul (sans le numéro)
  badge: 'AIGU' | 'CHRONIQUE' | 'LES_DEUX'
}

function CelluleCombobox({
  ligneId, colonne, valeur, options, isActive, onActivate, onSave, onTab,
  minWidth = 'min-w-[240px]', tdClassName = '',
}: {
  ligneId: string; colonne: string; valeur: number | null
  options: ComboboxOption[]
  isActive: boolean; onActivate: () => void
  onSave: (v: number | null) => Promise<void>; onTab?: () => void
  minWidth?: string; tdClassName?: string
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
      setDropPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 360),
      })
      setRecherche('')
      setCursorIdx(0)
      const t = setTimeout(() => searchRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [isActive])

  // Fermer si scroll pendant l'ouverture
  useEffect(() => {
    if (!isActive) return
    const close = () => onTab?.()
    window.addEventListener('scroll', close, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', close, { capture: true })
  }, [isActive, onTab])

  const optionsFiltrees = useMemo(() => {
    if (!recherche) return options
    const q = recherche.toLowerCase()
    return options.filter(o =>
      String(o.valeur).includes(q) || o.label.toLowerCase().includes(q)
    )
  }, [options, recherche])

  // Scroll l'item actif dans la liste
  useEffect(() => {
    itemRefs.current[cursorIdx]?.scrollIntoView({ block: 'nearest' })
  }, [cursorIdx])

  const handleSelect = async (val: number) => {
    await onSave(val)
    onTab?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursorIdx(i => Math.min(i + 1, optionsFiltrees.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursorIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = optionsFiltrees[cursorIdx]
      if (opt) handleSelect(opt.valeur)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onTab?.()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const opt = optionsFiltrees[cursorIdx]
      if (opt) handleSelect(opt.valeur)
      else onTab?.()
    }
  }

  const risqueActif = options.find(o => o.valeur === valeur)
  const displayLabel = risqueActif ? `${valeur}. ${risqueActif.label}` : '—'

  const badgeColors: Record<string, string> = {
    AIGU: 'bg-orange-100 text-orange-700',
    CHRONIQUE: 'bg-blue-100 text-blue-700',
    LES_DEUX: 'bg-gray-100 text-gray-600',
  }
  const badgeLabels: Record<string, string> = {
    AIGU: 'A', CHRONIQUE: 'C', LES_DEUX: 'A+C',
  }

  return (
    <td
      ref={cellRef}
      className={`${minWidth} max-w-[320px] ${TD} cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'} overflow-hidden ${tdClassName}`}
      onClick={!isActive ? onActivate : undefined}
      title={!isActive ? displayLabel : undefined}
    >
      <span className={`block truncate ${!valeur ? 'text-gray-400 italic' : ''}`}>
        {displayLabel}
      </span>

      {isActive && mounted && createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9998]" onClick={onTab} />
          {/* Dropdown */}
          <div
            className="fixed z-[9999] bg-white border-2 border-blue-500 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: dropPos.top, left: dropPos.left, width: Math.min(dropPos.width, window.innerWidth - dropPos.left - 16) }}
          >
            {/* Champ de recherche */}
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
            {/* Liste filtrée */}
            <div className="max-h-64 overflow-y-auto">
              {optionsFiltrees.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-gray-400">Aucun résultat</div>
              )}
              {optionsFiltrees.map((opt, idx) => (
                <button
                  key={opt.valeur}
                  ref={el => { itemRefs.current[idx] = el }}
                  onClick={() => handleSelect(opt.valeur)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                    idx === cursorIdx ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } ${opt.valeur === valeur ? 'font-semibold' : ''}`}
                >
                  <span className="text-gray-400 font-mono text-[11px] w-5 shrink-0 text-right">{opt.valeur}.</span>
                  <span className="flex-1 text-gray-800 truncate">{opt.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${badgeColors[opt.badge]}`}>
                    {badgeLabels[opt.badge]}
                  </span>
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

function BadgeCriticite({ score }: { score: number | null }) {
  if (!score) {
    return (
      <td className={`${TD} text-center min-w-[90px]`}>
        <span className="text-gray-300">—</span>
      </td>
    )
  }
  return (
    <td className={`${TD} text-center min-w-[90px]`}>
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
}: {
  risque: RisqueUI; posteId: string; celluleActive: CelluleActive
  onActivateCell: (ligneId: string, colonne: string) => void
  onSaveCell: (ligneId: string, colonne: string, valeur: unknown) => Promise<void>
  onDelete: () => void; onMove: (operationId: string) => Promise<void>
  autresOperations: OperationUI[]; groupBg: string
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

  // Fermer le menu au clic extérieur
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOuvert(false)
      }
    }
    if (menuOuvert) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOuvert])

  const isCell = (col: string) => celluleActive?.ligneId === risque.id && celluleActive?.colonne === col

  const activate = (col: string) => onActivateCell(risque.id, col)

  // Colonne suivante pour Tab
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

  // Infos risque ED840 sélectionné
  const risqueED840 = risque.numero_risque_ed840
    ? RISQUES_ED840.find(r => r.numero === risque.numero_risque_ed840) : null
  const typeAuto = risqueED840?.type === 'AIGU' ? 'aigu'
    : risqueED840?.type === 'CHRONIQUE' ? 'chronique'
    : null

  // Classe de fond sticky — doit être solide (pas de transparence) pour que sticky fonctionne
  const stickyBg = groupBg === 'bg-amber-50' ? 'bg-amber-50'
    : groupBg === 'bg-gray-50' ? 'bg-gray-50'
    : 'bg-white'

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${groupBg} border-0`}
    >
      {/* Handle drag — sticky col 1 */}
      <td
        className={`sticky left-0 z-[11] ${stickyBg} border-r border-b border-gray-200 w-8 px-1.5 py-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors`}
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4 mx-auto" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" /><circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" /><circle cx="11" cy="12" r="1.5" />
        </svg>
      </td>

      {/* Réf — sticky col 2 */}
      <td className={`sticky left-[32px] z-[11] ${stickyBg} border-r border-b border-gray-200 w-20 px-3 py-2.5 text-[11px] text-gray-400 font-mono whitespace-nowrap`}>
        {risque.identifiant_auto ?? '—'}
      </td>

      {/* Danger — sticky col 3 + ombre de séparation */}
      <CelluleTexte
        ligneId={risque.id} colonne="danger" valeur={risque.danger} placeholder="Danger…"
        isActive={isCell('danger')} onActivate={() => activate('danger')}
        onSave={v => onSaveCell(risque.id, 'danger', v)}
        onTab={() => nextCol('danger')}
        minWidth="min-w-[180px]" maxWidth="max-w-[250px]"
        tdClassName={`sticky left-[112px] z-[11] ${stickyBg} shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]`}
      />

      {/* Situation dangereuse */}
      <CelluleTexte
        ligneId={risque.id} colonne="situation_dangereuse" valeur={risque.situation_dangereuse} placeholder="Situation…"
        isActive={isCell('situation_dangereuse')} onActivate={() => activate('situation_dangereuse')}
        onSave={v => onSaveCell(risque.id, 'situation_dangereuse', v)}
        onTab={() => nextCol('situation_dangereuse')} minWidth="min-w-[200px]" maxWidth="max-w-[280px]"
      />

      {/* Risque ED840 — combobox avec recherche */}
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
        minWidth="min-w-[240px]"
      />

      {/* Type aigu / chronique */}
      <CelluleSelect
        ligneId={risque.id} colonne="type_risque" valeur={risque.type_risque}
        options={[{ valeur: 'aigu', label: 'Aigu' }, { valeur: 'chronique', label: 'Chronique' }]}
        isActive={isCell('type_risque')} onActivate={() => activate('type_risque')}
        onSave={v => onSaveCell(risque.id, 'type_risque', v)}
        onTab={() => nextCol('type_risque')}
        disabled={typeAuto !== null}
        minWidth="min-w-[90px]" center
        renderLabel={v => {
          if (v === 'aigu') return 'Aigu'
          if (v === 'chronique') return 'Chronique'
          return '—'
        }}
      />

      {/* Événement dangereux — visible si aigu */}
      {risque.type_risque === 'aigu' ? (
        <CelluleTexte
          ligneId={risque.id} colonne="evenement_dangereux" valeur={risque.evenement_dangereux} placeholder="Événement…"
          isActive={isCell('evenement_dangereux')} onActivate={() => activate('evenement_dangereux')}
          onSave={v => onSaveCell(risque.id, 'evenement_dangereux', v)}
          onTab={() => nextCol('evenement_dangereux')} minWidth="min-w-[180px]" maxWidth="max-w-[250px]"
        />
      ) : (
        <td className={`${TD} min-w-[180px] text-gray-300`}>—</td>
      )}

      {/* Dommage */}
      <CelluleTexte
        ligneId={risque.id} colonne="dommage" valeur={risque.dommage} placeholder="Dommage…"
        isActive={isCell('dommage')} onActivate={() => activate('dommage')}
        onSave={v => onSaveCell(risque.id, 'dommage', v)}
        onTab={() => nextCol('dommage')} minWidth="min-w-[150px]" maxWidth="max-w-[220px]"
      />

      {/* Siège des lésions */}
      <CelluleTexte
        ligneId={risque.id} colonne="siege_lesions" valeur={risque.siege_lesions} placeholder="Siège…"
        isActive={isCell('siege_lesions')} onActivate={() => activate('siege_lesions')}
        onSave={v => onSaveCell(risque.id, 'siege_lesions', v)}
        onTab={() => nextCol('siege_lesions')} minWidth="min-w-[140px]" maxWidth="max-w-[200px]"
      />

      {/* G — Gravité */}
      <CelluleSelect
        ligneId={risque.id} colonne="gravite" valeur={risque.gravite}
        options={ECHELLE_GRAVITE.map(e => ({ valeur: e.valeur, label: `${e.valeur} — ${e.label}` }))}
        isActive={isCell('gravite')} onActivate={() => activate('gravite')}
        onSave={v => onSaveCell(risque.id, 'gravite', v ? Number(v) : null)}
        onTab={() => nextCol('gravite')}
        renderLabel={v => v ? String(v) : '—'}
        minWidth="min-w-[56px]" center
      />

      {/* P (aigu) ou DE (chronique) */}
      <CelluleSelect
        ligneId={risque.id}
        colonne={risque.type_risque === 'aigu' ? 'probabilite' : 'duree_exposition'}
        valeur={risque.type_risque === 'aigu' ? risque.probabilite : risque.duree_exposition}
        options={risque.type_risque === 'aigu'
          ? ECHELLE_PROBABILITE.map(e => ({ valeur: e.valeur, label: `${e.valeur} — ${e.label}` }))
          : ECHELLE_DUREE_EXPOSITION.map(e => ({ valeur: e.valeur, label: `${e.valeur} — ${e.label}` }))
        }
        isActive={
          risque.type_risque === 'aigu'
            ? isCell('probabilite')
            : isCell('duree_exposition')
        }
        onActivate={() => activate(risque.type_risque === 'aigu' ? 'probabilite' : 'duree_exposition')}
        onSave={v => onSaveCell(
          risque.id,
          risque.type_risque === 'aigu' ? 'probabilite' : 'duree_exposition',
          v ? Number(v) : null
        )}
        onTab={() => nextCol('second')}
        renderLabel={v => v ? String(v) : '—'}
        minWidth="min-w-[56px]" center
      />

      {/* Criticité brute — calculée auto */}
      <BadgeCriticite score={risque.criticite_brute} />

      {/* T.H.O./EPI */}
      <CelluleTexte
        ligneId={risque.id} colonne="mesures_techniques" valeur={risque.mesures_techniques} placeholder="Mesures…"
        isActive={isCell('mesures_techniques')} onActivate={() => activate('mesures_techniques')}
        onSave={v => onSaveCell(risque.id, 'mesures_techniques', v)}
        onTab={() => nextCol('mesures_techniques')} minWidth="min-w-[180px]" maxWidth="max-w-[250px]"
      />

      {/* PM */}
      <CelluleSelect
        ligneId={risque.id} colonne="coefficient_pm" valeur={risque.coefficient_pm}
        options={COEFFICIENTS_PM.map(c => ({ valeur: c.valeur, label: `×${c.valeur} — ${c.label}` }))}
        isActive={isCell('coefficient_pm')} onActivate={() => activate('coefficient_pm')}
        onSave={v => onSaveCell(risque.id, 'coefficient_pm', v !== null ? Number(v) : 1)}
        onTab={() => onActivateCell('', '')}
        renderLabel={v => v !== null ? `×${v}` : '×1'}
        minWidth="min-w-[72px]" center
      />

      {/* Criticité résiduelle — calculée auto */}
      <BadgeCriticite score={risque.criticite_residuelle} />

      {/* Menu ⋮ */}
      <td className={`${TD} w-10 px-1`}>
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
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    Déplacer vers
                  </p>
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

// ─── GroupeOperation ──────────────────────────────────────────────────────────

function GroupeOperation({
  operation, posteId, celluleActive, onActivateCell, onSaveCell,
  onAddRisque, onDeleteRisque, onMoveRisque, onRenameOperation, onDeleteOperation,
  autresOperations, groupIndex,
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

  const groupBg = getGroupBg(operation, groupIndex)

  // Fond de l'en-tête de groupe — légèrement plus contrasté
  const headerBg = operation.est_transversale
    ? 'bg-amber-100/60 border-b border-amber-200'
    : groupBg === 'bg-gray-50'
      ? 'bg-gray-100 border-b border-gray-200'
      : 'bg-gray-50 border-b border-gray-200'

  return (
    <>
      {/* En-tête de groupe */}
      <tr className="select-none">
        <td colSpan={16} className={`${headerBg} px-4 py-2.5 border-b border-gray-300`}>
          <div className="flex items-center gap-3">
            {/* Icône */}
            {operation.est_transversale ? (
              <svg className="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            )}

            {/* Nom */}
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
                className="text-sm font-semibold bg-white text-gray-800 border border-blue-400 rounded px-2 py-0.5 focus:outline-none w-64"
              />
            ) : (
              <span className={`text-sm font-semibold flex-1 ${operation.est_transversale ? 'text-amber-800' : 'text-gray-800'}`}>
                {operation.nom}
              </span>
            )}

            {operation.est_transversale && (
              <span className="text-[11px] text-amber-600/80 italic">
                Risques transversaux au poste
              </span>
            )}

            <span className="text-xs text-gray-400 ml-auto">
              {operation.risques.length} risque{operation.risques.length !== 1 ? 's' : ''}
            </span>

            {/* Actions — sauf transversale */}
            {!operation.est_transversale && (
              <div className="flex items-center gap-1">
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
        </td>
      </tr>

      {/* Lignes de risques */}
      <SortableContext
        items={operation.risques.map(r => r.id)}
        strategy={verticalListSortingStrategy}
      >
        {operation.risques.length === 0 && (
          <tr className={groupBg}>
            <td colSpan={16} className="px-6 py-3 text-xs text-gray-400 italic border-b border-gray-200">
              Aucun risque identifié — cliquez sur &quot;+ Ajouter un risque&quot; ci-dessous.
            </td>
          </tr>
        )}
        {operation.risques.map((risque) => (
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
          />
        ))}
      </SortableContext>

      {/* Ligne + Ajouter un risque */}
      <tr className={groupBg}>
        <td colSpan={16} className="px-4 py-2 border-b border-gray-300">
          {ajoutEnCours ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Création en cours…
            </div>
          ) : (
            <button
              onClick={async () => {
                setAjoutEnCours(true)
                await onAddRisque(operation.id)
                setAjoutEnCours(false)
              }}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <span className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center text-gray-400 text-base leading-none">+</span>
              Ajouter un risque à <em className="not-italic font-medium">{operation.nom}</em>
            </button>
          )}
        </td>
      </tr>
    </>
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
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              confirmVariant === 'red'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            }`}
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
              <button
                onClick={onDeplacer}
                className="w-full text-left text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:border-amber-400 transition-colors"
              >
                <p className="font-medium text-amber-900">Déplacer vers &quot;Toutes opérations&quot;</p>
                <p className="text-xs text-amber-700 mt-0.5">Les risques sont conservés et rattachés au poste entier.</p>
              </button>
              <button
                onClick={onCascade}
                className="w-full text-left text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:border-red-400 transition-colors"
              >
                <p className="font-medium text-red-700">Supprimer l&apos;opération et ses risques</p>
                <p className="text-xs text-red-600 mt-0.5">Action irréversible — {nbRisques} risque{nbRisques > 1 ? 's' : ''} supprimé{nbRisques > 1 ? 's' : ''}.</p>
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600 mb-6">Cette opération est vide. Supprimer ?</p>
        )}
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
          Annuler
        </button>
      </div>
    </div>
  )
}

// ─── TableauAPR (orchestrateur) ───────────────────────────────────────────────

export function TableauAPR({
  operationsInitiales,
  posteId,
}: {
  operationsInitiales: OperationUI[]
  posteId: string
}) {
  const [operations, setOperations] = useState<OperationUI[]>(operationsInitiales)
  const [celluleActive, setCelluleActive] = useState<CelluleActive>(null)
  const [ajoutOpOuvert, setAjoutOpOuvert] = useState(false)
  const [nomNouvelleOp, setNomNouvelleOp] = useState('')
  const [modale, setModale] = useState<ModaleEtat>(null)
  const [isPending, startTransition] = useTransition()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pleinEcran, setPleinEcran] = useState(false)
  const [savedRecently, setSavedRecently] = useState(false)
  const prevPendingRef = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Touche Escape pour quitter le plein écran
  useEffect(() => {
    if (!pleinEcran) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPleinEcran(false)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [pleinEcran])

  // Indicateur "sauvegardé" — s'affiche 1.5s après la fin d'une transition
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

  const handleAddOperation = async () => {
    const nom = nomNouvelleOp.trim()
    if (!nom) return
    const result = await actions.creerOperationInline(posteId, nom)
    if (result.succes && result.operation) {
      setOperations(prev => [...prev, { ...result.operation!, risques: [] }])
      setNomNouvelleOp('')
      setAjoutOpOuvert(false)
    }
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
      }
      setOperations(prev => prev.map(op =>
        op.id === operationId ? { ...op, risques: [...op.risques, nouvelleRisque] } : op
      ))
      setCelluleActive({ ligneId: result.evaluation.id, colonne: 'danger' })
    }
  }

  const handleDeleteRisque = async (risqueId: string) => {
    removeRisque(risqueId)
    startTransition(async () => {
      await actions.supprimerRisque(risqueId, posteId)
    })
    setModale(null)
  }

  const handleMoveRisque = async (risqueId: string, nouvelOperationId: string) => {
    const risque = operations.flatMap(op => op.risques).find(r => r.id === risqueId)
    if (!risque) return

    setOperations(prev => prev.map(op => {
      if (op.risques.some(r => r.id === risqueId)) {
        return { ...op, risques: op.risques.filter(r => r.id !== risqueId) }
      }
      if (op.id === nouvelOperationId) {
        return { ...op, risques: [...op.risques, { ...risque, operation_id: nouvelOperationId }] }
      }
      return op
    }))

    startTransition(async () => {
      await actions.deplacerRisque(risqueId, nouvelOperationId, posteId)
    })
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

    startTransition(async () => {
      await actions.supprimerOperationAvecOptions(operationId, posteId, mode)
    })
    setModale(null)
  }

  const handleRenameOperation = async (operationId: string, nom: string) => {
    setOperations(prev => prev.map(op => op.id === operationId ? { ...op, nom } : op))
    await actions.renommerOperation(operationId, posteId, nom)
  }

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

  // ── Toolbar ─────────────────────────────────────────────────────────────────

  const toolbar = (
    <div className="flex items-center justify-between gap-4 px-1">
      {/* Gauche : Ajouter une opération */}
      <div className="flex items-center gap-2">
        {ajoutOpOuvert ? (
          <>
            <input
              autoFocus
              value={nomNouvelleOp}
              onChange={e => setNomNouvelleOp(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddOperation()
                if (e.key === 'Escape') { setAjoutOpOuvert(false); setNomNouvelleOp('') }
              }}
              placeholder="Nom de la nouvelle opération…"
              className="text-sm px-3 py-1.5 border border-brand-navy rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/10 bg-brand-off text-brand-navy w-64"
            />
            <button
              onClick={handleAddOperation}
              className="text-sm font-medium bg-brand-navy text-brand-cream px-4 py-1.5 rounded-lg hover:bg-brand-navy/90 transition-colors"
            >
              Créer
            </button>
            <button
              onClick={() => { setAjoutOpOuvert(false); setNomNouvelleOp('') }}
              className="text-sm text-brand-bronze hover:text-brand-navy transition-colors px-2"
            >
              Annuler
            </button>
          </>
        ) : (
          <button
            onClick={() => setAjoutOpOuvert(true)}
            className="flex items-center gap-2 text-sm font-medium bg-brand-navy text-brand-cream px-4 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            Ajouter une opération
          </button>
        )}
      </div>

      {/* Droite : indicateur de sauvegarde + plein écran */}
      <div className="flex items-center gap-3">
        <div className="h-5 flex items-center">
          {isPending && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Sauvegarde…
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
          onClick={() => setPleinEcran(v => !v)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          aria-label={pleinEcran ? 'Quitter le plein écran' : 'Plein écran'}
          title={pleinEcran ? 'Quitter le plein écran (Échap)' : 'Plein écran'}
        >
          {pleinEcran ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  // ── Contenu du tableau ───────────────────────────────────────────────────────

  const tableauContent = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <table className="w-full border-separate border-spacing-0" style={{ minWidth: '1900px' }}>

        {/* En-tête sticky */}
        <thead className="sticky top-0 z-20">
          <tr>
            {/* Handle — sticky col 1 */}
            <th className={`${TH} sticky left-0 z-30 w-8`} />
            {/* Réf — sticky col 2 */}
            <th className={`${TH} sticky left-[32px] z-30 w-20 text-left`}>Réf.</th>
            {/* Danger — sticky col 3 + ombre */}
            <th className={`${TH} sticky left-[112px] z-30 min-w-[180px] text-left shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)]`}>
              Danger
            </th>
            <th className={`${TH} min-w-[200px] text-left`}>Situation dangereuse</th>
            <th className={`${TH} min-w-[240px] text-left`}>Risque (ED840)</th>
            <th className={`${TH} min-w-[90px] text-center`}>Type</th>
            <th className={`${TH} min-w-[180px] text-left`}>Événement dangereux</th>
            <th className={`${TH} min-w-[150px] text-left`}>Dommage</th>
            <th className={`${TH} min-w-[140px] text-left`}>Siège lésions</th>
            <th className={`${TH} w-14 text-center`}>G</th>
            <th className={`${TH} w-14 text-center`}>P/DE</th>
            <th className={`${TH} min-w-[90px] text-center`}>C. brute</th>
            <th className={`${TH} min-w-[180px] text-left`}>T.H.O./EPI</th>
            <th className={`${TH} w-20 text-center`}>PM</th>
            <th className={`${TH} min-w-[100px] text-center`}>C. résid.</th>
            <th className={`${TH} w-10 border-r-0`} />
          </tr>
        </thead>

        <tbody>
          {operationsTri.map((op, groupIdx) => (
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
            />
          ))}
        </tbody>
      </table>

      {/* DragOverlay */}
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
      {/* Mode normal */}
      {!pleinEcran && (
        <div className="space-y-3">
          {toolbar}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            {tableauContent}
          </div>
        </div>
      )}

      {/* Mode plein écran */}
      {pleinEcran && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
            {toolbar}
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            {tableauContent}
          </div>
        </div>
      )}

      {/* Modales */}
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
    </>
  )
}
