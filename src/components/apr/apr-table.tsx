'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LigneAPR } from '@/app/dashboard/apr/page'
import { CodeModule } from '@/types'
import { MODULES_RISQUES } from '@/lib/constants/modules'

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
  mesures: false,
  pm: true,
  residuelle: true,
}

const STORAGE_KEY_APR = 'apr-recap-columns'

interface APRTableProps {
  lignes: LigneAPR[]
  postes: { id: string; nom: string }[]
  readOnly?: boolean
}

type ColonneSort = 'poste' | 'operation' | 'module' | 'brute' | 'pm' | 'residuelle'
type DirectionSort = 'asc' | 'desc'
type ZoneCriticite = 'vert' | 'jaune' | 'orange' | 'rouge' | 'na'

function getCouleur(
  score: number | null,
  module: CodeModule,
  moduleIgnore: boolean
): ZoneCriticite {
  if (moduleIgnore || score === null) return 'na'
  if (score <= 1) return 'vert'
  if (module === 'M01_BRUIT') {
    if (score <= 2) return 'vert'
    if (score <= 4) return 'jaune'
    if (score <= 8) return 'orange'
    return 'rouge'
  }
  if (score <= 4) return 'vert'
  if (score <= 9) return 'jaune'
  if (score <= 14) return 'orange'
  return 'rouge'
}

const COULEURS_CLASSES: Record<ZoneCriticite, string> = {
  vert: 'bg-green-100 text-green-800',
  jaune: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  rouge: 'bg-red-100 text-red-800',
  na: 'bg-gray-100 text-gray-500',
}

const COULEURS_DOT: Record<ZoneCriticite, string> = {
  vert: 'bg-green-500',
  jaune: 'bg-yellow-500',
  orange: 'bg-orange-500',
  rouge: 'bg-red-500',
  na: 'bg-gray-300',
}

function CriticitePill({
  score,
  module,
  moduleIgnore,
}: {
  score: number | null
  module: CodeModule
  moduleIgnore: boolean
}) {
  if (moduleIgnore) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
        Non applicable
      </span>
    )
  }
  if (score === null) {
    return <span className="text-xs text-gray-400">—</span>
  }
  const couleur = getCouleur(score, module, false)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${COULEURS_CLASSES[couleur]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${COULEURS_DOT[couleur]}`} />
      {score}
    </span>
  )
}

function MesuresDots({ t, o, h, epi }: { t: number; o: number; h: number; epi: number }) {
  const categories = [
    { label: 'T', count: t, title: 'Techniques' },
    { label: 'O', count: o, title: 'Organisationnelles' },
    { label: 'H', count: h, title: 'Humaines / Formation' },
    { label: 'EPI', count: epi, title: 'EPI' },
  ]
  return (
    <div className="flex items-center gap-1">
      {categories.map((c) => (
        <span
          key={c.label}
          title={`${c.title} : ${c.count} mesure(s)`}
          className={`inline-flex items-center justify-center rounded text-xs font-medium px-1 py-0.5 ${
            c.count > 0
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {c.label}
        </span>
      ))}
    </div>
  )
}

function SortIcon({ actif, direction }: { actif: boolean; direction: DirectionSort }) {
  if (!actif)
    return (
      <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
  return direction === 'desc' ? (
    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}

export function APRTable({ lignes, postes, readOnly = false }: APRTableProps) {
  const [filtrePoste, setFiltrePoste] = useState<string>('tous')
  const [filtreModule, setFiltreModule] = useState<string>('tous')
  const [filtreZone, setFiltreZone] = useState<string>('toutes')
  const [sortCol, setSortCol] = useState<ColonneSort>('residuelle')
  const [sortDir, setSortDir] = useState<DirectionSort>('desc')
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

  function handleSort(col: ColonneSort) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
  }

  const lignesFiltrees = useMemo(() => {
    let result = [...lignes]

    if (filtrePoste !== 'tous') {
      result = result.filter((l) => l.posteId === filtrePoste)
    }

    if (filtreModule !== 'tous') {
      result = result.filter((l) => l.codeModule === filtreModule)
    }

    if (filtreZone !== 'toutes') {
      result = result.filter((l) => {
        const score = l.criticiteResiduelle ?? l.criticiteBrute
        const couleur = getCouleur(score, l.codeModule, l.moduleIgnore)
        return couleur === filtreZone
      })
    }

    result.sort((a, b) => {
      let va: number | string = 0
      let vb: number | string = 0

      if (sortCol === 'poste') { va = a.posteNom; vb = b.posteNom }
      else if (sortCol === 'operation') { va = a.operationNom; vb = b.operationNom }
      else if (sortCol === 'module') { va = a.nomModule; vb = b.nomModule }
      else if (sortCol === 'brute') { va = a.criticiteBrute ?? -1; vb = b.criticiteBrute ?? -1 }
      else if (sortCol === 'pm') { va = a.coefficientPm ?? 2; vb = b.coefficientPm ?? 2 }
      else if (sortCol === 'residuelle') {
        va = a.criticiteResiduelle ?? a.criticiteBrute ?? -1
        vb = b.criticiteResiduelle ?? b.criticiteBrute ?? -1
      }

      if (typeof va === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb as string) : (vb as string).localeCompare(va)
      }
      return sortDir === 'asc' ? va - (vb as number) : (vb as number) - va
    })

    return result
  }, [lignes, filtrePoste, filtreModule, filtreZone, sortCol, sortDir])

  const modules = MODULES_RISQUES.filter((m) =>
    lignes.some((l) => l.codeModule === m.code)
  )

  // État vide
  if (lignes.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
        <svg
          className="mx-auto w-12 h-12 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700 mb-1">Aucune évaluation réalisée</p>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
          Commencez par créer des postes et évaluer les risques de chaque opération.
        </p>
        <Link
          href="/dashboard/postes"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 underline"
        >
          Gérer les postes →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filtres</span>

        <select
          value={filtrePoste}
          onChange={(e) => setFiltrePoste(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="tous">Tous les postes</option>
          {postes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>

        <select
          value={filtreModule}
          onChange={(e) => setFiltreModule(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="tous">Tous les modules</option>
          {modules.map((m) => (
            <option key={m.code} value={m.code}>
              {m.nom}
            </option>
          ))}
        </select>

        <select
          value={filtreZone}
          onChange={(e) => setFiltreZone(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="toutes">Toutes les criticités</option>
          <option value="rouge">Rouge — Critique</option>
          <option value="orange">Orange — Élevé</option>
          <option value="jaune">Jaune — Modéré</option>
          <option value="vert">Vert — Faible</option>
          <option value="na">Non applicable</option>
        </select>

        {(filtrePoste !== 'tous' || filtreModule !== 'tous' || filtreZone !== 'toutes') && (
          <button
            onClick={() => {
              setFiltrePoste('tous')
              setFiltreModule('tous')
              setFiltreZone('toutes')
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            Réinitialiser
          </button>
        )}

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

        <span className="text-xs text-gray-400">
          {lignesFiltrees.length} ligne{lignesFiltrees.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau — scrollable horizontalement sur mobile */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
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
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lignesFiltrees.length === 0 ? (
              <tr>
                <td colSpan={99} className="px-4 py-8 text-center text-sm text-gray-400">
                  Aucune ligne ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            ) : (
              lignesFiltrees.map((ligne) => {
                const scoreResid = ligne.criticiteResiduelle ?? ligne.criticiteBrute
                const couleurResid = getCouleur(scoreResid, ligne.codeModule, ligne.moduleIgnore)

                return (
                  <tr
                    key={ligne.id}
                    className={`transition-colors hover:bg-gray-50 ${
                      couleurResid === 'rouge'
                        ? 'border-l-4 border-l-red-400'
                        : couleurResid === 'orange'
                        ? 'border-l-4 border-l-orange-400'
                        : ''
                    }`}
                  >
                    {colonnes.poste && (
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{ligne.posteNom}</td>
                    )}
                    {colonnes.operation && (
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          {ligne.estTransversale && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
                          {ligne.operationNom}
                        </span>
                      </td>
                    )}
                    {colonnes.module && (
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{ligne.nomModule}</td>
                    )}
                    {colonnes.brute && (
                      <td className="px-4 py-3">
                        <CriticitePill score={ligne.criticiteBrute} module={ligne.codeModule} moduleIgnore={ligne.moduleIgnore} />
                      </td>
                    )}
                    {colonnes.mesures && (
                      <td className="px-4 py-3">
                        {ligne.moduleIgnore ? <span className="text-xs text-gray-400">—</span> : <MesuresDots t={ligne.mesuresT} o={ligne.mesuresO} h={ligne.mesuresH} epi={ligne.mesuresEPI} />}
                      </td>
                    )}
                    {colonnes.pm && (
                      <td className="px-4 py-3 text-gray-700">
                        {ligne.coefficientPm !== null ? (
                          <span className="font-medium">{ligne.coefficientPm === 0 ? '0,0' : ligne.coefficientPm.toString().replace('.', ',')}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    {colonnes.residuelle && (
                      <td className="px-4 py-3">
                        <CriticitePill score={scoreResid} module={ligne.codeModule} moduleIgnore={ligne.moduleIgnore} />
                      </td>
                    )}
                    {!readOnly && (
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/postes/${ligne.posteId}/operations/${ligne.operationId}/risques/${ligne.codeModule}`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                          Voir →
                        </Link>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="font-medium">Légende :</span>
        {(
          [
            { couleur: 'vert', label: 'Faible (≤2 bruit / ≤4 standard)' },
            { couleur: 'jaune', label: 'Modéré' },
            { couleur: 'orange', label: 'Élevé — VAI' },
            { couleur: 'rouge', label: 'Critique — VAS' },
          ] as const
        ).map(({ couleur, label }) => (
          <span key={couleur} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${COULEURS_DOT[couleur]}`} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 text-gray-400 text-xs">NA</span>
          Non applicable (présélection négative)
        </span>
      </div>
    </div>
  )
}
