'use client'

import { useState, useTransition } from 'react'
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

// ─── Helpers d'affichage ──────────────────────────────────────────────────────

function BadgeCriticite({ valeur }: { valeur: number | null }) {
  if (valeur == null) return <span className="text-gray-300 text-xs">—</span>
  const [bg, text] =
    valeur >= 15 ? ['bg-red-100 text-red-700', 'rouge'] :
    valeur >= 10 ? ['bg-orange-100 text-orange-700', 'orange'] :
    valeur >= 5  ? ['bg-yellow-100 text-yellow-700', 'jaune'] :
                   ['bg-green-100 text-green-700', 'vert']
  void text
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

const FACILITE_COLORS: Record<string, string> = {
  facile: 'bg-green-100 text-green-700',
  moyen: 'bg-yellow-100 text-yellow-700',
  complexe: 'bg-red-100 text-red-700',
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  evaluations: EvaluationAvecAction[]
  contacts: Contact[]
  onglet: 'priorites' | 'par_poste'
}

export function TableauPlanAction({ evaluations, contacts, onglet }: Props) {
  const [rows, setRows] = useState(evaluations)
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_DEFAUT)
  const [colonnes, setColonnes] = useState<ColonnesVisibles>(COLONNES_DEFAUT)
  const [isPending, startTransition] = useTransition()

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

  // ── Groupement par poste (onglet "Par poste") ───────────────────────────────
  const grouped = onglet === 'par_poste'
    ? filtered.reduce<Record<string, EvaluationAvecAction[]>>((acc, row) => {
        (acc[row.poste_nom] ??= []).push(row)
        return acc
      }, {})
    : null

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

  // ── Rendu d'une ligne ────────────────────────────────────────────────────────
  function renderRow(row: EvaluationAvecAction) {
    const action = row.action
    const statut: ActionPlan['statut'] = action?.statut ?? 'a_faire'
    const rappelsActifs = action?.rappels_actifs ?? true

    return (
      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
        {/* Poste · Opération */}
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          <span className="font-semibold text-brand-navy">{row.poste_nom}</span>
          <span className="text-gray-400 text-xs block">{row.operation_nom}</span>
        </td>
        {/* Danger */}
        <td className="px-3 py-2 text-sm text-gray-700">{row.danger}</td>
        {/* C. résid. */}
        <td className="px-3 py-2 text-center">
          <BadgeCriticite valeur={row.criticite_residuelle ?? row.criticite_brute} />
        </td>
        {/* Mesures existantes */}
        {colonnes.mesures_existantes && (
          <td className="px-3 py-2 text-xs text-gray-500 max-w-[120px] truncate border-r-2 border-blue-100">
            {row.mesures_existantes || <span className="text-gray-300 italic">Aucune</span>}
          </td>
        )}
        {/* Description */}
        <td className="px-2 py-1 min-w-[160px] bg-blue-50/30">
          <input
            defaultValue={action?.description ?? ''}
            placeholder="Cliquer pour saisir…"
            onBlur={e => handleCellBlur(row.id, action?.id, 'description', e.target.value || null)}
            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-300 placeholder:italic focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5"
          />
        </td>
        {/* Type PGP */}
        {colonnes.type_prevention && (
          <td className="px-2 py-1 bg-blue-50/30">
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
          <td className="px-2 py-1 text-center bg-blue-50/30">
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
          <td className="px-2 py-1 bg-blue-50/30 min-w-[160px]">
            <DropdownResponsable
              contacts={contacts}
              selectedId={action?.contact_id ?? null}
              onChange={(contactId, newContact) => {
                updateRowAction(row.id, { contact_id: contactId })
                handleCellBlur(row.id, action?.id, 'contact_id', contactId)
                if (newContact) {
                  // Le nouveau contact est déjà créé en DB via createContact
                }
              }}
            />
          </td>
        )}
        {/* Échéance */}
        {colonnes.echeance && (
          <td className="px-2 py-1 bg-blue-50/30">
            <input
              type="date"
              defaultValue={action?.echeance ?? ''}
              onBlur={e => handleCellBlur(row.id, action?.id, 'echeance', e.target.value || null)}
              className="text-xs bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded w-full"
            />
          </td>
        )}
        {/* Statut */}
        <td className="px-2 py-1 bg-blue-50/30">
          <select
            value={statut}
            onChange={e => handleStatutChange(row, e.target.value as ActionPlan['statut'])}
            className={`text-xs font-semibold rounded-full px-2 py-0.5 border-none focus:outline-none cursor-pointer ${STATUT_COLORS[statut]}`}
          >
            {Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </td>
        {/* 🔔 Rappels */}
        {colonnes.rappels && (
          <td className="px-2 py-1 text-center bg-blue-50/30">
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
          <td className="px-3 py-2 text-center bg-green-50/40">
            <BadgeCriticite valeur={action?.criticite_cible ?? null} />
          </td>
        )}
      </tr>
    )
  }

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpiAFaire = rows.filter(r => (r.action?.statut ?? 'a_faire') === 'a_faire').length
  const kpiEnCours = rows.filter(r => r.action?.statut === 'en_cours').length
  const kpiTermine = rows.filter(r => r.action?.statut === 'termine').length

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

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
        <table className="border-collapse w-full min-w-[700px]">
          <thead>
            <tr>
              {/* Super-headers */}
              <th colSpan={3 + (colonnes.mesures_existantes ? 1 : 0)}
                className="py-2 px-3 bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-400 text-center uppercase tracking-wide border-r-2 border-blue-100">
                ← Depuis l&apos;APR (lecture seule)
              </th>
              <th colSpan={
                  1 + // description
                  (colonnes.type_prevention ? 1 : 0) +
                  (colonnes.facilite ? 1 : 0) +
                  (colonnes.responsable ? 1 : 0) +
                  (colonnes.echeance ? 1 : 0) +
                  1 + // statut
                  (colonnes.rappels ? 1 : 0)
                }
                className="py-2 px-3 bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600 text-center uppercase tracking-wide">
                Action corrective ✏️
              </th>
              {colonnes.criticite_cible && (
                <th className="py-2 px-3 bg-green-50 border border-green-100 text-xs font-semibold text-green-600 text-center uppercase tracking-wide">
                  Résultat
                </th>
              )}
            </tr>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Poste · Opération</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Danger</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">C. résid.</th>
              {colonnes.mesures_existantes && <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-r-2 border-blue-100 whitespace-nowrap">Mesures exist.</th>}
              <th className="px-3 py-2 text-left text-xs font-semibold text-blue-500 bg-blue-50/30 min-w-[160px]">Description</th>
              {colonnes.type_prevention && <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30 whitespace-nowrap">Type PGP</th>}
              {colonnes.facilite && <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30">Facilité</th>}
              {colonnes.responsable && <th className="px-3 py-2 text-left text-xs font-semibold text-blue-500 bg-blue-50/30 min-w-[150px]">Responsable</th>}
              {colonnes.echeance && <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30 whitespace-nowrap">Échéance</th>}
              <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30">Statut</th>
              {colonnes.rappels && <th className="px-3 py-2 text-center text-xs font-semibold text-blue-500 bg-blue-50/30">🔔</th>}
              {colonnes.criticite_cible && <th className="px-3 py-2 text-center text-xs font-semibold text-green-600 bg-green-50/40 whitespace-nowrap">C. cible</th>}
            </tr>
          </thead>
          <tbody>
            {onglet === 'par_poste' && grouped
              ? Object.entries(grouped).map(([poste, rows]) => (
                  <>
                    <tr key={`group-${poste}`} className="bg-brand-navy/5">
                      <td colSpan={99} className="px-3 py-1.5 text-xs font-bold text-brand-navy uppercase tracking-wide">
                        🏭 {poste} — {rows.length} action{rows.length > 1 ? 's' : ''}
                      </td>
                    </tr>
                    {rows.map(renderRow)}
                  </>
                ))
              : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={99} className="px-6 py-12 text-center text-sm text-gray-400">
                      Aucune action à afficher. Décochez les filtres ou activez l&apos;affichage des risques verts.
                    </td>
                  </tr>
                )
                : filtered.map(renderRow)
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
