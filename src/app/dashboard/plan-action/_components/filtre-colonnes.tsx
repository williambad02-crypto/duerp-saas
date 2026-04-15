'use client'

import { useEffect, useRef, useState } from 'react'

export interface Filtres {
  poste: string
  statut: string
  type_prevention: string
  facilite: string
  afficher_verts: boolean
}

export const FILTRES_DEFAUT: Filtres = {
  poste: '',
  statut: '',
  type_prevention: '',
  facilite: '',
  afficher_verts: false,
}

export type ColonneId =
  | 'mesures_existantes'
  | 'type_prevention'
  | 'facilite'
  | 'responsable'
  | 'echeance'
  | 'rappels'
  | 'criticite_cible'

export interface ColonnesVisibles {
  mesures_existantes: boolean
  type_prevention: boolean
  facilite: boolean
  responsable: boolean
  echeance: boolean
  rappels: boolean
  criticite_cible: boolean
}

export const COLONNES_DEFAUT: ColonnesVisibles = {
  mesures_existantes: false,
  type_prevention: true,
  facilite: true,
  responsable: true,
  echeance: true,
  rappels: true,
  criticite_cible: true,
}

const COLONNES_LABELS: Record<ColonneId, string> = {
  mesures_existantes: 'Mesures existantes',
  type_prevention: 'Type PGP',
  facilite: 'Facilité',
  responsable: 'Responsable',
  echeance: 'Échéance',
  rappels: '🔔 Rappels',
  criticite_cible: 'C. cible',
}

const STORAGE_KEY = 'plan-action-columns'

interface Props {
  postes: string[]
  filtres: Filtres
  onFiltresChange: (f: Filtres) => void
  colonnes: ColonnesVisibles
  onColonnesChange: (c: ColonnesVisibles) => void
}

export function FiltreBarre({ postes, filtres, onFiltresChange, colonnes, onColonnesChange }: Props) {
  const [showColonnes, setShowColonnes] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Charger depuis localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) onColonnesChange(JSON.parse(saved))
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sauvegarder dans localStorage à chaque changement
  function handleColonneToggle(key: ColonneId) {
    const next = { ...colonnes, [key]: !colonnes[key] }
    onColonnesChange(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  // Fermer le popover en cliquant dehors
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowColonnes(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-amber-800 font-medium">Filtrer :</span>

      {/* Poste */}
      <select
        value={filtres.poste}
        onChange={e => onFiltresChange({ ...filtres, poste: e.target.value })}
        className="text-xs border border-amber-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <option value="">Tous les postes</option>
        {postes.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Statut */}
      <select
        value={filtres.statut}
        onChange={e => onFiltresChange({ ...filtres, statut: e.target.value })}
        className="text-xs border border-amber-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <option value="">Tous les statuts</option>
        <option value="a_faire">À faire</option>
        <option value="en_cours">En cours</option>
        <option value="termine">Terminé</option>
      </select>

      {/* Type PGP */}
      <select
        value={filtres.type_prevention}
        onChange={e => onFiltresChange({ ...filtres, type_prevention: e.target.value })}
        className="text-xs border border-amber-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <option value="">Tous les types</option>
        <option value="technique">🔧 Technique</option>
        <option value="organisationnelle">📋 Organisationnelle</option>
        <option value="formation_epi">🎓 Formation / EPI</option>
      </select>

      {/* Facilité */}
      <select
        value={filtres.facilite}
        onChange={e => onFiltresChange({ ...filtres, facilite: e.target.value })}
        className="text-xs border border-amber-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-300"
      >
        <option value="">Toutes facilités</option>
        <option value="facile">Facile</option>
        <option value="moyen">Moyen</option>
        <option value="complexe">Complexe</option>
      </select>

      {/* Risques verts */}
      <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer ml-1">
        <input
          type="checkbox"
          checked={filtres.afficher_verts}
          onChange={e => onFiltresChange({ ...filtres, afficher_verts: e.target.checked })}
          className="rounded border-gray-300 text-blue-500"
        />
        Afficher risques maîtrisés (verts)
      </label>

      {/* Bouton Colonnes */}
      <div ref={popoverRef} className="relative ml-auto">
        <button
          onClick={() => setShowColonnes(!showColonnes)}
          className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 hover:border-gray-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Colonnes ▾
        </button>

        {showColonnes && (
          <div className="absolute right-0 top-full mt-1 z-20 w-52 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">Afficher / masquer</div>
            {(Object.keys(COLONNES_LABELS) as ColonneId[]).map(key => (
              <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={colonnes[key]}
                  onChange={() => handleColonneToggle(key)}
                  className="rounded border-gray-300 text-blue-500"
                />
                <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                  {COLONNES_LABELS[key]}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
