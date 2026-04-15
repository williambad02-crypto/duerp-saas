'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  TABLE_POINTS_BRUIT,
  NIVEAUX_DB,
  DUREES_EXPOSITION,
  MESURES_PREVENTION_BRUIT,
  calculerCriticiteBruit,
  NiveauDb,
  DureeExposition,
} from '@/lib/constants/bruit'
import { sauvegarderEvaluationBruit, validerEvaluationBruit, PhaseBruit } from '../../_actions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EvaluationBruitDB {
  methode?: string
  niveau_estimation?: number | null
  phases?: PhaseBruit[]
  total_points?: number | null
  zone?: string | null
  criticite_bruit?: number | null
  epi_utilises?: boolean
  epi_types?: string[]
  epi_snr?: number | null
  mesures_techniques?: string[]
  mesures_organisationnelles?: string[]
  mesures_humaines?: string[]
  criticite_residuelle_bruit?: number | null
  statut?: string
}

interface Props {
  evaluationId: string
  evaluationBruit: EvaluationBruitDB | null
  moduleStatus: 'maitrise' | 'creuser'
  preselectionResponses: boolean[] | null
  posteId: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ZONE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  vert: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', label: 'Vert — Pas de risque significatif' },
  jaune: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Jaune — Zone d\'incertitude' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', label: 'Orange — VAI dépassée (80 dB(A))' },
  rouge: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', label: 'Rouge — VAS dépassée (85 dB(A))' },
}

function BadgeZone({ zone }: { zone: string }) {
  const style = ZONE_STYLES[zone]
  if (!style) return null
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className="w-2 h-2 rounded-full" style={{
        backgroundColor: zone === 'vert' ? '#16a34a' : zone === 'jaune' ? '#ca8a04' : zone === 'orange' ? '#ea580c' : '#dc2626'
      }} />
      {style.label}
    </span>
  )
}

// ─── Formulaire principal ─────────────────────────────────────────────────────

export function FormBruit({
  evaluationId,
  evaluationBruit,
  moduleStatus,
  preselectionResponses,
  posteId,
}: Props) {
  const router = useRouter()
  const [saving, startSave] = useTransition()
  const [validating, startValidate] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)

  // Méthode
  const [methode, setMethode] = useState<'sommaire' | 'simplifiee'>(
    (evaluationBruit?.methode as 'sommaire' | 'simplifiee' | undefined) ?? 'simplifiee'
  )

  // Estimation sommaire
  const [niveauEstimation, setNiveauEstimation] = useState<number | null>(
    evaluationBruit?.niveau_estimation ?? null
  )

  // Phases simplifiée
  const [phases, setPhases] = useState<PhaseBruit[]>(
    evaluationBruit?.phases ?? []
  )

  // EPI
  const [epiUtilises, setEpiUtilises] = useState(evaluationBruit?.epi_utilises ?? false)
  const [epiTypes, setEpiTypes] = useState<string[]>(evaluationBruit?.epi_types ?? [])
  const [epiSnr, setEpiSnr] = useState<number | null>(evaluationBruit?.epi_snr ?? null)

  // Mesures
  const [mesuresTechniques, setMesuresTechniques] = useState<string[]>(evaluationBruit?.mesures_techniques ?? [])
  const [mesuresOrga, setMesuresOrga] = useState<string[]>(evaluationBruit?.mesures_organisationnelles ?? [])
  const [mesuresHumaines, setMesuresHumaines] = useState<string[]>(evaluationBruit?.mesures_humaines ?? [])

  // ── Calculs ────────────────────────────────────────────────────────────────

  const totalPoints = methode === 'simplifiee'
    ? phases.reduce((sum, p) => sum + p.points, 0)
    : null

  const getCriticiteSommaire = () => {
    if (niveauEstimation === 0) return calculerCriticiteBruit(0)
    if (niveauEstimation === 2) return calculerCriticiteBruit(9999)
    if (niveauEstimation === 1) return calculerCriticiteBruit(30) // Intermédiaire → risque incertain
    return null
  }

  const criticiteBrute = methode === 'sommaire'
    ? getCriticiteSommaire()
    : totalPoints !== null
    ? calculerCriticiteBruit(totalPoints)
    : null

  // Correction EPI : si EPI avec SNR, réduction de (SNR - 4) dB → recalcul criticité
  const getCriticiteAvecEpi = () => {
    if (!epiUtilises || !epiSnr || !criticiteBrute) return criticiteBrute
    // Réduction effective = SNR - 4 dB (méthode HML simplifiée)
    // On traduit en reduction de criticité selon les paliers
    const reduction = epiSnr - 4
    if (reduction <= 0) return criticiteBrute
    // Estimation simple : si réduction > 5 dB, on descend d'un palier
    if (reduction >= 10 && criticiteBrute.criticite > 2) {
      return calculerCriticiteBruit(Math.max(0, (totalPoints ?? 9999) * 0.1))
    }
    if (reduction >= 5 && criticiteBrute.criticite > 2) {
      return calculerCriticiteBruit(Math.max(0, (totalPoints ?? 9999) * 0.25))
    }
    return criticiteBrute
  }

  const criticiteFinale = epiUtilises ? getCriticiteAvecEpi() : criticiteBrute

  const isComplete = methode === 'sommaire'
    ? niveauEstimation !== null
    : phases.length > 0 && phases.every(p => p.niveau_db > 0 && p.duree !== '')

  const isValide = evaluationBruit?.statut === 'valide'

  // ── Phases ─────────────────────────────────────────────────────────────────

  const ajouterPhase = () => {
    setPhases(prev => [
      ...prev,
      { id: crypto.randomUUID(), label: `Phase ${prev.length + 1}`, niveau_db: 85, duree: '2h', points: TABLE_POINTS_BRUIT[85]['2h'] },
    ])
  }

  const supprimerPhase = (id: string) => {
    setPhases(prev => prev.filter(p => p.id !== id))
  }

  const mettreAJourPhase = (id: string, champ: 'label' | 'niveau_db' | 'duree', valeur: string | number) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== id) return p
      const updated = { ...p, [champ]: valeur }
      if (champ === 'niveau_db' || champ === 'duree') {
        const db = champ === 'niveau_db' ? (valeur as number) : p.niveau_db
        const dur = champ === 'duree' ? (valeur as string) : p.duree
        const tableEntry = TABLE_POINTS_BRUIT[db as NiveauDb]
        updated.points = tableEntry ? (tableEntry[dur as DureeExposition] ?? 0) : 0
      }
      return updated
    }))
  }

  // ── Mesures ────────────────────────────────────────────────────────────────

  const toggleMesure = (
    categorie: 'techniques' | 'organisationnelles' | 'humaines',
    id: string
  ) => {
    const setter = categorie === 'techniques' ? setMesuresTechniques
      : categorie === 'organisationnelles' ? setMesuresOrga
      : setMesuresHumaines
    const current = categorie === 'techniques' ? mesuresTechniques
      : categorie === 'organisationnelles' ? mesuresOrga
      : mesuresHumaines
    setter(current.includes(id) ? current.filter(m => m !== id) : [...current, id])
  }

  const toggleEpiType = (id: string) => {
    setEpiTypes(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  // ── Save & Validate ────────────────────────────────────────────────────────

  const buildPayload = useCallback(() => ({
    evaluationId,
    methode,
    niveau_estimation: methode === 'sommaire' ? niveauEstimation : null,
    phases: methode === 'simplifiee' ? phases : [],
    total_points: totalPoints,
    zone: criticiteBrute?.couleur ?? null,
    criticite_bruit: criticiteBrute?.criticite ?? null,
    epi_utilises: epiUtilises,
    epi_types: epiTypes,
    epi_snr: epiSnr,
    mesures_techniques: mesuresTechniques,
    mesures_organisationnelles: mesuresOrga,
    mesures_humaines: mesuresHumaines,
    criticite_residuelle_bruit: criticiteFinale?.criticite ?? null,
  }), [evaluationId, methode, niveauEstimation, phases, totalPoints, criticiteBrute, epiUtilises, epiTypes, epiSnr, mesuresTechniques, mesuresOrga, mesuresHumaines, criticiteFinale])

  const handleSave = () => {
    setErreur(null)
    startSave(async () => {
      const res = await sauvegarderEvaluationBruit(buildPayload())
      if (res?.erreur) setErreur(res.erreur)
    })
  }

  const handleValidate = () => {
    if (!isComplete || !criticiteBrute) return
    setErreur(null)
    startValidate(async () => {
      const payload = buildPayload()
      const res = await validerEvaluationBruit({
        ...payload,
        zone: payload.zone ?? criticiteBrute.couleur,
        criticite_bruit: criticiteBrute.criticite,
        criticite_residuelle_bruit: criticiteFinale?.criticite ?? criticiteBrute.criticite,
      })
      if (res?.erreur) setErreur(res.erreur)
      else router.push('/dashboard/modules/bruit')
    })
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Bannière validé */}
      {isValide && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">Évaluation validée</p>
            <p className="text-xs text-green-700 mt-0.5">
              La criticité résiduelle ({evaluationBruit?.criticite_residuelle_bruit ?? '—'}) est reportée dans le tableau APR.
            </p>
          </div>
          <button
            onClick={() => setErreur(null)}
            className="ml-auto text-xs text-green-600 hover:text-green-800 underline"
          >
            Modifier
          </button>
        </div>
      )}

      {/* Présélection */}
      {preselectionResponses && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Présélection (3 questions)
          </p>
          <div className="flex flex-wrap gap-2">
            {preselectionResponses.map((rep, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  rep
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                Q{idx + 1}: {rep ? 'OUI' : 'NON'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Choix de méthode ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Méthode d&apos;évaluation</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMethode('sommaire')}
            className={`p-4 rounded-xl border text-left transition-all ${
              methode === 'sommaire'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-300'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${methode === 'sommaire' ? 'border-blue-500' : 'border-gray-300'}`}>
                {methode === 'sommaire' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <span className="text-sm font-semibold text-gray-800">Estimation sommaire</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Niveau 1</span>
            </div>
            <p className="text-xs text-gray-500 pl-6">Test de communication — résultat immédiat sans mesure</p>
          </button>

          <button
            onClick={() => setMethode('simplifiee')}
            className={`p-4 rounded-xl border text-left transition-all ${
              methode === 'simplifiee'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-300'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${methode === 'simplifiee' ? 'border-blue-500' : 'border-gray-300'}`}>
                {methode === 'simplifiee' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <span className="text-sm font-semibold text-gray-800">Évaluation simplifiée</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Niveau 2</span>
            </div>
            <p className="text-xs text-gray-500 pl-6">Table des points ED 6035 — par phase d&apos;activité</p>
          </button>
        </div>
      </div>

      {/* ── Estimation sommaire ───────────────────────────────────────────── */}
      {methode === 'sommaire' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Test de communication sur le poste</h2>
          <div className="space-y-3">
            {[
              {
                valeur: 0,
                label: 'Communication aisée à 0,5 m',
                desc: 'Conversation normale possible sans hausser la voix, pas d\'événements bruyants intenses',
                risque: 'Pas de risque',
                couleur: 'green',
              },
              {
                valeur: 1,
                label: 'Doit élever la voix à 1–2 m',
                desc: 'Il faut parler fort ou répéter pour se faire comprendre',
                risque: 'Risque incertain',
                couleur: 'yellow',
              },
              {
                valeur: 2,
                label: 'Doit crier à moins de 1 m, ou bruits impulsionnels',
                desc: 'Cris nécessaires à courte distance, ou chocs / impacts intenses présents',
                risque: '≈ > 90 dB(A) — Risque certain',
                couleur: 'red',
              },
            ].map((option) => (
              <button
                key={option.valeur}
                onClick={() => setNiveauEstimation(option.valeur)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  niveauEstimation === option.valeur
                    ? option.couleur === 'green'
                      ? 'border-green-400 bg-green-50 ring-1 ring-green-200'
                      : option.couleur === 'yellow'
                      ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-200'
                      : 'border-red-400 bg-red-50 ring-1 ring-red-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      niveauEstimation === option.valeur
                        ? option.couleur === 'green' ? 'border-green-500'
                          : option.couleur === 'yellow' ? 'border-yellow-500'
                          : 'border-red-500'
                        : 'border-gray-300'
                    }`}>
                      {niveauEstimation === option.valeur && (
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          option.couleur === 'green' ? 'bg-green-500'
                          : option.couleur === 'yellow' ? 'bg-yellow-500'
                          : 'bg-red-500'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{option.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full ${
                    option.couleur === 'green' ? 'bg-green-100 text-green-700'
                    : option.couleur === 'yellow' ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {option.risque}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Évaluation simplifiée — phases ───────────────────────────────── */}
      {methode === 'simplifiee' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Phases d&apos;exposition</h2>
              <p className="text-xs text-gray-500 mt-0.5">Pour chaque phase : niveau sonore moyen + durée quotidienne</p>
            </div>
            <button
              onClick={ajouterPhase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une phase
            </button>
          </div>

          {phases.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-400">Aucune phase — cliquez sur &quot;Ajouter une phase&quot;</p>
            </div>
          ) : (
            <div>
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Phase</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Niveau (dB(A))</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Durée / jour</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Points</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Suppr.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {phases.map((phase, idx) => (
                    <tr key={phase.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-2 border border-gray-100">
                        <input
                          type="text"
                          value={phase.label}
                          onChange={e => mettreAJourPhase(phase.id, 'label', e.target.value)}
                          className="text-xs text-gray-800 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full"
                          placeholder="Libellé de la phase…"
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-100 text-center">
                        <select
                          value={phase.niveau_db}
                          onChange={e => mettreAJourPhase(phase.id, 'niveau_db', Number(e.target.value))}
                          className="text-xs text-gray-800 bg-transparent border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full"
                        >
                          {NIVEAUX_DB.map(db => (
                            <option key={db} value={db}>{db} dB(A)</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2 border border-gray-100 text-center">
                        <select
                          value={phase.duree}
                          onChange={e => mettreAJourPhase(phase.id, 'duree', e.target.value)}
                          className="text-xs text-gray-800 bg-transparent border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full"
                        >
                          {DUREES_EXPOSITION.map(d => (
                            <option key={d.valeur} value={d.valeur}>{d.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 border border-gray-100 text-center">
                        <span className={`font-mono text-sm font-semibold ${
                          phase.points >= 100 ? 'text-red-600'
                          : phase.points >= 32 ? 'text-orange-600'
                          : phase.points >= 16 ? 'text-yellow-600'
                          : 'text-green-600'
                        }`}>
                          {phase.points}
                        </span>
                      </td>
                      <td className="px-2 py-2 border border-gray-100 text-center">
                        <button
                          onClick={() => supprimerPhase(phase.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                    <td colSpan={3} className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">
                      Total points LEX,8h :
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`font-mono text-base font-bold ${
                        (totalPoints ?? 0) >= 100 ? 'text-red-700'
                        : (totalPoints ?? 0) >= 32 ? 'text-orange-600'
                        : (totalPoints ?? 0) >= 16 ? 'text-yellow-600'
                        : 'text-green-600'
                      }`}>
                        {totalPoints ?? 0}
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>

              {/* Interprétation */}
              {totalPoints !== null && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
                  {totalPoints <= 16 && (
                    <span className="text-green-700">
                      ≤ 16 pts — LEX,8h ≤ 77 dB(A) — Pas d&apos;action bruit requise
                    </span>
                  )}
                  {totalPoints > 16 && totalPoints <= 32 && (
                    <span className="text-yellow-700">
                      Entre 16 et 32 pts — Zone d&apos;incertitude (77–80 dB(A)) — Mesurage recommandé
                    </span>
                  )}
                  {totalPoints > 32 && totalPoints <= 100 && (
                    <span className="text-orange-700">
                      Entre 32 et 100 pts — VAI probablement dépassée (80 dB(A)) — Actions obligatoires
                    </span>
                  )}
                  {totalPoints > 100 && (
                    <span className="text-red-700 font-semibold">
                      &gt; 100 pts — VAS dépassée (85 dB(A)) — Protection immédiate OBLIGATOIRE
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── EPI ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Protecteurs individuels (EPI)</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-500">EPI portés</span>
            <div
              onClick={() => setEpiUtilises(!epiUtilises)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${epiUtilises ? 'bg-blue-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${epiUtilises ? 'left-5' : 'left-0.5'}`} />
            </div>
          </label>
        </div>

        {epiUtilises && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Types d&apos;EPI utilisés</p>
              <div className="grid grid-cols-2 gap-2">
                {MESURES_PREVENTION_BRUIT.epi.map(epi => (
                  <label key={epi.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={epiTypes.includes(epi.id)}
                      onChange={() => toggleEpiType(epi.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">{epi.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                SNR de l&apos;EPI (dB) — valeur sur l&apos;emballage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={40}
                  step={1}
                  value={epiSnr ?? ''}
                  onChange={e => setEpiSnr(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Ex: 26"
                  className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-xs text-gray-400">
                  → Réduction effective ≈ {epiSnr ? Math.max(0, epiSnr - 4) : '—'} dB
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mesures collectives ──────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Mesures de prévention collectives</h2>
        <div className="grid gap-5">
          {/* Techniques */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Techniques</p>
            <div className="grid grid-cols-1 gap-1.5">
              {MESURES_PREVENTION_BRUIT.techniques.map(m => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={mesuresTechniques.includes(m.id)}
                    onChange={() => toggleMesure('techniques', m.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-xs text-gray-700 group-hover:text-gray-900">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Organisationnelles */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Organisationnelles</p>
            <div className="grid grid-cols-1 gap-1.5">
              {MESURES_PREVENTION_BRUIT.organisationnelles.map(m => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={mesuresOrga.includes(m.id)}
                    onChange={() => toggleMesure('organisationnelles', m.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-xs text-gray-700 group-hover:text-gray-900">{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Humaines */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Formation / Information</p>
            <div className="grid grid-cols-1 gap-1.5">
              {MESURES_PREVENTION_BRUIT.humaines.map(m => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={mesuresHumaines.includes(m.id)}
                    onChange={() => toggleMesure('humaines', m.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span className="text-xs text-gray-700 group-hover:text-gray-900">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Résultat ────────────────────────────────────────────────────── */}
      {criticiteBrute && (
        <div className={`rounded-xl border p-5 ${
          criticiteBrute.couleur === 'vert' ? 'bg-green-50 border-green-200'
          : criticiteBrute.couleur === 'jaune' ? 'bg-yellow-50 border-yellow-200'
          : criticiteBrute.couleur === 'orange' ? 'bg-orange-50 border-orange-200'
          : 'bg-red-50 border-red-200'
        }`}>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Résultat de l&apos;évaluation</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm ${
                criticiteBrute.couleur === 'vert' ? 'bg-green-100 text-green-800'
                : criticiteBrute.couleur === 'jaune' ? 'bg-yellow-100 text-yellow-800'
                : criticiteBrute.couleur === 'orange' ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
              }`}>
                {criticiteBrute.criticite}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Criticité brute</p>
                <BadgeZone zone={criticiteBrute.couleur} />
              </div>
            </div>

            {epiUtilises && criticiteFinale && criticiteFinale.criticite !== criticiteBrute.criticite && (
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm ${
                  criticiteFinale.couleur === 'vert' ? 'bg-green-100 text-green-800'
                  : criticiteFinale.couleur === 'jaune' ? 'bg-yellow-100 text-yellow-800'
                  : criticiteFinale.couleur === 'orange' ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                  {criticiteFinale.criticite}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Avec EPI</p>
                  <BadgeZone zone={criticiteFinale.couleur} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-700 space-y-1">
            <p><strong>Interprétation :</strong> {criticiteBrute.interpretation}</p>
            <p><strong>Action requise :</strong> {criticiteBrute.action}</p>
          </div>
        </div>
      )}

      {/* ── Erreur ─────────────────────────────────────────────────────── */}
      {erreur && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {erreur}
        </div>
      )}

      {/* ── Boutons ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pb-6">
        <button
          onClick={() => router.push('/dashboard/modules/bruit')}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>

          <button
            onClick={handleValidate}
            disabled={!isComplete || !criticiteBrute || validating}
            className="px-5 py-2 bg-brand-navy text-brand-cream rounded-lg text-sm font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {validating ? 'Validation…' : 'Valider et reporter dans l\'APR'}
          </button>
        </div>
      </div>
    </div>
  )
}
