'use client'

import { useState, useCallback, useRef, useTransition, useEffect } from 'react'
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

// ─── Helpers visuels ─────────────────────────────────────────────────────────

function getBadgeCriticite(score: number | null) {
  if (!score) return null
  const n = getNiveauCriticite(score)
  const classes: Record<string, string> = {
    vert:   'bg-green-100 text-green-800 ring-green-200',
    jaune:  'bg-yellow-100 text-yellow-800 ring-yellow-200',
    orange: 'bg-orange-100 text-orange-800 ring-orange-200',
    rouge:  'bg-red-100 text-red-800 ring-red-200',
  }
  return { score, classe: classes[n.niveau] ?? classes.rouge }
}

// ─── CelluleTexte ────────────────────────────────────────────────────────────

function CelluleTexte({
  ligneId, colonne, valeur, placeholder = '—',
  isActive, onActivate, onSave, onTab,
  minWidth = 'min-w-[140px]',
}: {
  ligneId: string; colonne: string; valeur: string | null; placeholder?: string
  isActive: boolean; onActivate: () => void; onSave: (v: string | null) => Promise<void>
  onTab?: () => void; minWidth?: string
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
      <td className={`px-2 py-1 ${minWidth}`}>
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
          className="w-full text-xs px-2 py-1 border border-brand-navy rounded bg-brand-off text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/10"
        />
      </td>
    )
  }

  return (
    <td
      className={`px-2 py-1 text-xs text-brand-navy cursor-pointer hover:bg-brand-cream-light group ${minWidth}`}
      onClick={onActivate}
    >
      <span className={!valeur ? 'text-brand-bronze/40 italic' : ''}>
        {valeur || placeholder}
      </span>
    </td>
  )
}

// ─── CelluleSelect ───────────────────────────────────────────────────────────

function CelluleSelect({
  ligneId, colonne, valeur, options, isActive, onActivate, onSave, onTab,
  renderLabel, minWidth = 'min-w-[60px]', disabled = false,
}: {
  ligneId: string; colonne: string; valeur: number | string | null
  options: { valeur: number | string; label: string }[]
  isActive: boolean; onActivate: () => void
  onSave: (v: number | string | null) => Promise<void>; onTab?: () => void
  renderLabel?: (v: number | string | null) => string; minWidth?: string; disabled?: boolean
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
      <td className={`px-1 py-1 ${minWidth}`}>
        <select
          ref={ref}
          defaultValue={String(valeur ?? '')}
          onChange={e => handleChange(e.target.value)}
          onBlur={() => onTab?.()}
          onKeyDown={e => {
            if (e.key === 'Escape') onTab?.()
            if (e.key === 'Tab') { e.preventDefault(); onTab?.() }
          }}
          className="w-full text-xs border border-brand-navy rounded bg-brand-off text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/10 py-1"
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
      className={`px-2 py-1 text-xs cursor-pointer hover:bg-brand-cream-light ${minWidth} ${disabled ? 'opacity-50 cursor-default' : ''}`}
      onClick={disabled ? undefined : onActivate}
    >
      <span className={!valeur && valeur !== 0 ? 'text-brand-bronze/40' : 'text-brand-navy'}>
        {label}
      </span>
    </td>
  )
}

// ─── BadgeCriticite ──────────────────────────────────────────────────────────

function BadgeCriticite({ score }: { score: number | null }) {
  const badge = getBadgeCriticite(score)
  if (!badge) return <td className="px-2 py-1 text-xs text-brand-bronze/30 text-center min-w-[64px]">—</td>
  return (
    <td className="px-2 py-1 text-center min-w-[64px]">
      <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold ring-1 ${badge.classe}`}>
        {badge.score}
      </span>
    </td>
  )
}

// ─── LigneRisque ─────────────────────────────────────────────────────────────

function LigneRisque({
  risque, posteId, celluleActive, onActivateCell, onSaveCell,
  onDelete, onMove, autresOperations, isEven,
}: {
  risque: RisqueUI; posteId: string; celluleActive: CelluleActive
  onActivateCell: (ligneId: string, colonne: string) => void
  onSaveCell: (ligneId: string, colonne: string, valeur: unknown) => Promise<void>
  onDelete: () => void; onMove: (operationId: string) => Promise<void>
  autresOperations: OperationUI[]; isEven: boolean
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
    // 'second' dépend du type_risque
    if (next === 'second') {
      onActivateCell(risque.id, risque.type_risque === 'aigu' ? 'probabilite' : 'duree_exposition')
    } else if (next === 'evenement_dangereux' && risque.type_risque !== 'aigu') {
      // Skip evenement_dangereux for chronic
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
    : null // LES_DEUX → user choisit

  const rowBg = isEven ? 'bg-brand-off' : 'bg-brand-cream-light'

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${rowBg} border-b border-brand-sand/40 hover:bg-brand-cream transition-colors`}
    >
      {/* Handle drag */}
      <td
        className="px-2 py-2 w-8 cursor-grab active:cursor-grabbing text-brand-bronze/30 hover:text-brand-bronze transition-colors"
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
      <td className="px-2 py-1 text-xs text-brand-bronze/60 font-mono whitespace-nowrap w-20">
        {risque.identifiant_auto ?? '—'}
      </td>

      {/* Danger */}
      <CelluleTexte
        ligneId={risque.id} colonne="danger" valeur={risque.danger} placeholder="Danger..."
        isActive={isCell('danger')} onActivate={() => activate('danger')}
        onSave={v => onSaveCell(risque.id, 'danger', v)}
        onTab={() => nextCol('danger')} minWidth="min-w-[160px]"
      />

      {/* Situation dangereuse */}
      <CelluleTexte
        ligneId={risque.id} colonne="situation_dangereuse" valeur={risque.situation_dangereuse} placeholder="Situation..."
        isActive={isCell('situation_dangereuse')} onActivate={() => activate('situation_dangereuse')}
        onSave={v => onSaveCell(risque.id, 'situation_dangereuse', v)}
        onTab={() => nextCol('situation_dangereuse')} minWidth="min-w-[160px]"
      />

      {/* Risque ED840 — dropdown */}
      <CelluleSelect
        ligneId={risque.id} colonne="numero_risque_ed840" valeur={risque.numero_risque_ed840}
        options={RISQUES_ED840.map(r => ({ valeur: r.numero, label: `${r.numero}. ${r.intitule}` }))}
        isActive={isCell('numero_risque_ed840')} onActivate={() => activate('numero_risque_ed840')}
        onSave={async v => {
          await onSaveCell(risque.id, 'numero_risque_ed840', v ? Number(v) : null)
          // Auto-type si risque non mixte
          const r = RISQUES_ED840.find(r => r.numero === Number(v))
          if (r?.type !== 'LES_DEUX') {
            const t = r?.type === 'AIGU' ? 'aigu' : 'chronique'
            await onSaveCell(risque.id, 'type_risque', t)
          }
        }}
        onTab={() => nextCol('numero_risque_ed840')}
        renderLabel={v => {
          const r = RISQUES_ED840.find(r => r.numero === v)
          return r ? `${r.numero}. ${r.intitule.substring(0, 28)}…` : '—'
        }}
        minWidth="min-w-[180px]"
      />

      {/* Type aigu / chronique — seulement éditable si LES_DEUX */}
      <CelluleSelect
        ligneId={risque.id} colonne="type_risque" valeur={risque.type_risque}
        options={[{ valeur: 'aigu', label: 'Aigu' }, { valeur: 'chronique', label: 'Chronique' }]}
        isActive={isCell('type_risque')} onActivate={() => activate('type_risque')}
        onSave={v => onSaveCell(risque.id, 'type_risque', v)}
        onTab={() => nextCol('type_risque')}
        disabled={typeAuto !== null}
        minWidth="min-w-[80px]"
        renderLabel={v => v === 'aigu' ? 'Aigu' : v === 'chronique' ? 'Chronique' : '—'}
      />

      {/* Événement dangereux — visible si aigu */}
      {risque.type_risque === 'aigu' ? (
        <CelluleTexte
          ligneId={risque.id} colonne="evenement_dangereux" valeur={risque.evenement_dangereux} placeholder="Événement..."
          isActive={isCell('evenement_dangereux')} onActivate={() => activate('evenement_dangereux')}
          onSave={v => onSaveCell(risque.id, 'evenement_dangereux', v)}
          onTab={() => nextCol('evenement_dangereux')} minWidth="min-w-[140px]"
        />
      ) : (
        <td className="px-2 py-1 text-xs text-brand-bronze/20 min-w-[140px]">—</td>
      )}

      {/* Dommage */}
      <CelluleTexte
        ligneId={risque.id} colonne="dommage" valeur={risque.dommage} placeholder="Dommage..."
        isActive={isCell('dommage')} onActivate={() => activate('dommage')}
        onSave={v => onSaveCell(risque.id, 'dommage', v)}
        onTab={() => nextCol('dommage')} minWidth="min-w-[140px]"
      />

      {/* Siège des lésions */}
      <CelluleTexte
        ligneId={risque.id} colonne="siege_lesions" valeur={risque.siege_lesions} placeholder="Siège..."
        isActive={isCell('siege_lesions')} onActivate={() => activate('siege_lesions')}
        onSave={v => onSaveCell(risque.id, 'siege_lesions', v)}
        onTab={() => nextCol('siege_lesions')} minWidth="min-w-[120px]"
      />

      {/* G — Gravité */}
      <CelluleSelect
        ligneId={risque.id} colonne="gravite" valeur={risque.gravite}
        options={ECHELLE_GRAVITE.map(e => ({ valeur: e.valeur, label: `${e.valeur} — ${e.label}` }))}
        isActive={isCell('gravite')} onActivate={() => activate('gravite')}
        onSave={v => onSaveCell(risque.id, 'gravite', v ? Number(v) : null)}
        onTab={() => nextCol('gravite')}
        renderLabel={v => v ? String(v) : '—'}
        minWidth="min-w-[52px]"
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
        minWidth="min-w-[52px]"
      />

      {/* Criticité brute — auto */}
      <BadgeCriticite score={risque.criticite_brute} />

      {/* T.H.O./EPI */}
      <CelluleTexte
        ligneId={risque.id} colonne="mesures_techniques" valeur={risque.mesures_techniques} placeholder="Mesures..."
        isActive={isCell('mesures_techniques')} onActivate={() => activate('mesures_techniques')}
        onSave={v => onSaveCell(risque.id, 'mesures_techniques', v)}
        onTab={() => nextCol('mesures_techniques')} minWidth="min-w-[140px]"
      />

      {/* PM */}
      <CelluleSelect
        ligneId={risque.id} colonne="coefficient_pm" valeur={risque.coefficient_pm}
        options={COEFFICIENTS_PM.map(c => ({ valeur: c.valeur, label: `×${c.valeur} — ${c.label}` }))}
        isActive={isCell('coefficient_pm')} onActivate={() => activate('coefficient_pm')}
        onSave={v => onSaveCell(risque.id, 'coefficient_pm', v !== null ? Number(v) : 1)}
        onTab={() => onActivateCell('', '')} // fin de ligne
        renderLabel={v => v !== null ? `×${v}` : '×1'}
        minWidth="min-w-[60px]"
      />

      {/* Criticité résiduelle — auto */}
      <BadgeCriticite score={risque.criticite_residuelle} />

      {/* Menu ⋮ */}
      <td className="px-1 py-1 w-10">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="w-7 h-7 flex items-center justify-center text-brand-bronze/50 hover:text-brand-navy hover:bg-brand-cream rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {menuOuvert && (
            <div className="absolute right-0 top-8 z-20 w-52 bg-brand-off border border-brand-sand rounded-lg shadow-lg overflow-hidden">
              {/* Déplacer vers */}
              {autresOperations.length > 0 && (
                <div className="border-b border-brand-sand">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-brand-bronze uppercase tracking-wide">
                    Déplacer vers
                  </p>
                  {autresOperations.map(op => (
                    <button
                      key={op.id}
                      onClick={() => { onMove(op.id); setMenuOuvert(false) }}
                      className="w-full text-left px-3 py-1.5 text-xs text-brand-navy hover:bg-brand-cream transition-colors flex items-center gap-2"
                    >
                      {op.est_transversale ? (
                        <span className="w-4 h-4 text-brand-gold">
                          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" /></svg>
                        </span>
                      ) : (
                        <span className="w-4 h-4 text-brand-bronze/40">
                          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        </span>
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
  autresOperations,
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

  const headerBg = operation.est_transversale
    ? 'bg-brand-navy border-l-4 border-brand-gold-light'
    : 'bg-brand-navy'

  return (
    <>
      {/* En-tête de groupe */}
      <tr className={`${headerBg} select-none`}>
        <td colSpan={16} className="px-4 py-2">
          <div className="flex items-center gap-3">
            {/* Icône opération */}
            {operation.est_transversale ? (
              <span className="text-brand-gold shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
              </span>
            ) : (
              <span className="text-brand-cream/40 shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </span>
            )}

            {/* Nom — renommable si non transversal */}
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
                className="text-sm font-semibold bg-brand-navy-light text-brand-cream border border-brand-cream/30 rounded px-2 py-0.5 focus:outline-none w-64"
              />
            ) : (
              <span className="text-sm font-semibold text-brand-cream flex-1">
                {operation.nom}
              </span>
            )}

            {operation.est_transversale && (
              <span className="text-[10px] text-brand-gold-light/70 italic">
                Risques transversaux au poste
              </span>
            )}

            <span className="text-xs text-brand-cream/40 ml-auto">
              {operation.risques.length} risque{operation.risques.length !== 1 ? 's' : ''}
            </span>

            {/* Actions — sauf pour transversale */}
            {!operation.est_transversale && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRenaming(true)}
                  className="text-brand-cream/50 hover:text-brand-cream transition-colors p-1 rounded hover:bg-brand-cream/10"
                  title="Renommer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteOperation(operation.id, operation.nom, operation.risques.length)}
                  className="text-red-400/60 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10"
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
          <tr>
            <td colSpan={16} className="px-6 py-3 text-xs text-brand-bronze/50 italic bg-brand-off/50">
              Aucun risque identifié pour cette opération — cliquez sur &quot;+ Ajouter un risque&quot; ci-dessous.
            </td>
          </tr>
        )}
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
            isEven={idx % 2 === 0}
          />
        ))}
      </SortableContext>

      {/* Ligne + ajouter risque */}
      <tr className="bg-brand-cream border-b border-brand-sand">
        <td colSpan={16} className="px-4 py-2">
          {ajoutEnCours ? (
            <div className="flex items-center gap-2 text-xs text-brand-bronze">
              <svg className="w-3.5 h-3.5 animate-spin text-brand-gold" fill="none" viewBox="0 0 24 24">
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
              className="flex items-center gap-2 text-xs text-brand-bronze hover:text-brand-navy transition-colors"
            >
              <span className="w-5 h-5 rounded border border-brand-sand flex items-center justify-center text-base leading-none">+</span>
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
      <div className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-brand-off border border-brand-sand rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="font-semibold text-brand-navy mb-2">{titre}</h3>
        <p className="text-sm text-brand-bronze mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="text-sm text-brand-bronze hover:text-brand-navy transition-colors px-4 py-2">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              confirmVariant === 'red'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-brand-navy hover:bg-brand-navy/90 text-brand-cream'
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
      <div className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-brand-off border border-brand-sand rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="font-semibold text-brand-navy mb-2">Supprimer &quot;{nom}&quot; ?</h3>
        {nbRisques > 0 ? (
          <>
            <p className="text-sm text-brand-bronze mb-4">
              Cette opération contient <strong>{nbRisques} risque{nbRisques > 1 ? 's' : ''}</strong>. Que souhaitez-vous faire ?
            </p>
            <div className="space-y-2 mb-4">
              <button
                onClick={onDeplacer}
                className="w-full text-left text-sm bg-brand-gold-pale border border-brand-sand rounded-xl px-4 py-3 hover:border-brand-navy transition-colors"
              >
                <p className="font-medium text-brand-navy">Déplacer vers &quot;Toutes opérations&quot;</p>
                <p className="text-xs text-brand-bronze mt-0.5">Les risques sont conservés et rattachés au poste entier.</p>
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
          <p className="text-sm text-brand-bronze mb-6">Cette opération est vide. Supprimer ?</p>
        )}
        <button onClick={onCancel} className="text-sm text-brand-bronze hover:text-brand-navy transition-colors">
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

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
    // Mise à jour optimiste
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
    setCelluleActive(null) // Fermer l'édition pendant le drag
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const activeOp = findOperationByRisqueId(active.id as string)
    const overOp = findOperationByRisqueId(over.id as string)

    if (!activeOp) return

    if (overOp && activeOp.id === overOp.id) {
      // Réordonner dans la même opération
      setOperations(prev => prev.map(op => {
        if (op.id !== activeOp.id) return op
        const oldIdx = op.risques.findIndex(r => r.id === active.id)
        const newIdx = op.risques.findIndex(r => r.id === over.id)
        return { ...op, risques: arrayMove(op.risques, oldIdx, newIdx) }
      }))
    } else if (overOp && activeOp.id !== overOp.id) {
      // Déplacer vers une autre opération
      handleMoveRisque(active.id as string, overOp.id)
    }
  }

  // Risque actif pour DragOverlay
  const risqueActif = activeId
    ? operations.flatMap(op => op.risques).find(r => r.id === activeId)
    : null

  // Tri opérations : transversale en tête
  const operationsTri = [...operations].sort((a, b) => {
    if (a.est_transversale && !b.est_transversale) return -1
    if (!a.est_transversale && b.est_transversale) return 1
    return a.ordre - b.ordre
  })

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-brand-sand shadow-sm bg-brand-off">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-sm border-collapse" style={{ minWidth: '1500px' }}>

            {/* En-tête de colonnes */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-brand-cream-light border-b-2 border-brand-sand">
                <th className="w-8 px-2 py-2.5" />
                <th className="w-20 px-2 py-2.5 text-left text-xs font-semibold text-brand-navy/60">Réf.</th>
                <th className="min-w-[160px] px-2 py-2.5 text-left text-xs font-semibold text-brand-navy">Danger</th>
                <th className="min-w-[160px] px-2 py-2.5 text-left text-xs font-semibold text-brand-navy">Situation dangereuse</th>
                <th className="min-w-[180px] px-2 py-2.5 text-left text-xs font-semibold text-brand-navy">Risque (ED840)</th>
                <th className="min-w-[80px] px-2 py-2.5 text-left text-xs font-semibold text-brand-navy">Type</th>
                <th className="min-w-[140px] px-2 py-2.5 text-left text-xs font-semibold text-brand-navy">Événement dangereux</th>
                <th className="min-w-[140px] px-2 py-2.5 text-left text-xs font-semibold text-brand-navy">Dommage</th>
                <th className="min-w-[120px] px-2 py-2.5 text-left text-xs font-semibold text-brand-navy">Siège lésions</th>
                <th className="min-w-[52px] px-2 py-2.5 text-center text-xs font-semibold text-brand-navy">G</th>
                <th className="min-w-[52px] px-2 py-2.5 text-center text-xs font-semibold text-brand-navy">P/DE</th>
                <th className="min-w-[64px] px-2 py-2.5 text-center text-xs font-semibold text-brand-navy">C. brute</th>
                <th className="min-w-[140px] px-2 py-2.5 text-left text-xs font-semibold text-brand-navy">T.H.O./EPI</th>
                <th className="min-w-[60px] px-2 py-2.5 text-center text-xs font-semibold text-brand-navy">PM</th>
                <th className="min-w-[64px] px-2 py-2.5 text-center text-xs font-semibold text-brand-navy">C. résid.</th>
                <th className="w-10 px-1 py-2.5" />
              </tr>
            </thead>

            <tbody>
              {operationsTri.map(op => (
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
                />
              ))}

              {/* Ligne + Ajouter une opération */}
              <tr className="bg-brand-cream border-t-2 border-brand-sand">
                <td colSpan={16} className="px-4 py-2.5">
                  {ajoutOpOuvert ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={nomNouvelleOp}
                        onChange={e => setNomNouvelleOp(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddOperation()
                          if (e.key === 'Escape') { setAjoutOpOuvert(false); setNomNouvelleOp('') }
                        }}
                        placeholder="Nom de la nouvelle opération…"
                        className="flex-1 max-w-xs text-sm px-3 py-1.5 border border-brand-navy rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy/10 bg-brand-off text-brand-navy"
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
                    </div>
                  ) : (
                    <button
                      onClick={() => setAjoutOpOuvert(true)}
                      className="flex items-center gap-2 text-sm text-brand-bronze hover:text-brand-navy transition-colors"
                    >
                      <span className="w-5 h-5 rounded border border-brand-sand bg-brand-off flex items-center justify-center text-base leading-none text-brand-bronze">+</span>
                      Ajouter une opération
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* DragOverlay — aperçu de la ligne draggée */}
          <DragOverlay>
            {risqueActif ? (
              <div className="bg-brand-cream border border-brand-navy/30 rounded px-4 py-2 text-xs text-brand-navy shadow-lg opacity-90 flex items-center gap-3">
                <span className="font-mono text-brand-bronze/60">{risqueActif.identifiant_auto}</span>
                <span className="font-medium">{risqueActif.danger ?? '(risque sans danger)'}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Indicateur de sauvegarde */}
      {isPending && (
        <div className="fixed bottom-4 right-4 z-50 bg-brand-navy text-brand-cream text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Sauvegarde…
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
