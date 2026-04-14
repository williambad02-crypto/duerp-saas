'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CriticiteBadge } from './criticite-badge'
import {
  NIVEAUX_ESTIMATION_BRUIT,
  NIVEAUX_DB,
  DUREES_EXPOSITION,
  TABLE_POINTS_BRUIT,
  MESURES_PREVENTION_BRUIT,
  calculerCriticiteBruit,
  suggererCoefficientPM,
  NiveauEstimationBruit,
  NiveauDb,
  DureeExposition,
  MesuresBruit,
  CriticiteBruit,
} from '@/lib/constants/bruit'
import { COEFFICIENTS_PM } from '@/lib/constants/cotation'
import { sauvegarderEvaluationBruit } from '@/app/dashboard/postes/[id]/operations/[opId]/risques/actions'
import { CoefficientPM } from '@/types'

interface ModuleBruitProps {
  operationId: string
  posteId: string
  nomOperation: string
}

const MESURES_VIDES: MesuresBruit = {
  techniques: [],
  organisationnelles: [],
  humaines: [],
  epi: [],
  risque_supprime: false,
}

type Etape = 1 | 2 | 3 | 4

export function ModuleBruit({ operationId, posteId, nomOperation }: ModuleBruitProps) {
  const router = useRouter()
  const [etape, setEtape] = useState<Etape>(1)
  const [niveauEstimation, setNiveauEstimation] = useState<NiveauEstimationBruit | null>(null)
  const [niveauDb, setNiveauDb] = useState<NiveauDb | null>(null)
  const [dureeExposition, setDureeExposition] = useState<DureeExposition | null>(null)
  const [mesures, setMesures] = useState<MesuresBruit>(MESURES_VIDES)
  const [coefficientPm, setCoefficientPm] = useState<CoefficientPM>(1.0)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  // Calculer les points pour l'étape 2
  const totalPoints =
    niveauDb !== null && dureeExposition !== null
      ? TABLE_POINTS_BRUIT[niveauDb][dureeExposition]
      : null

  // Criticité brute calculée
  const criticiteBrute: CriticiteBruit | null =
    niveauEstimation === 2
      ? calculerCriticiteBruit(9999)
      : niveauEstimation === 0
      ? calculerCriticiteBruit(0)
      : totalPoints !== null
      ? calculerCriticiteBruit(totalPoints)
      : null

  const criticiteResiduelle =
    criticiteBrute !== null
      ? coefficientPm === 0
        ? 0
        : criticiteBrute.criticite * coefficientPm
      : null

  // Suggestion auto PM quand les mesures changent
  function handleMesureToggle(
    categorie: keyof Omit<MesuresBruit, 'risque_supprime'>,
    id: string
  ) {
    setMesures((prev) => {
      const liste = prev[categorie] as string[]
      const nouvelles = liste.includes(id) ? liste.filter((m) => m !== id) : [...liste, id]
      const nouvellesMesures = { ...prev, [categorie]: nouvelles }
      const suggestion = suggererCoefficientPM(nouvellesMesures)
      setCoefficientPm(suggestion as CoefficientPM)
      return nouvellesMesures
    })
  }

  function handleRisqueSupprimeToggle() {
    setMesures((prev) => {
      const nouveau = { ...prev, risque_supprime: !prev.risque_supprime }
      if (nouveau.risque_supprime) setCoefficientPm(0.0)
      else setCoefficientPm(suggererCoefficientPM({ ...nouveau, risque_supprime: false }) as CoefficientPM)
      return nouveau
    })
  }

  function allerEtapeSuivante() {
    if (etape === 1) {
      if (niveauEstimation === 1) setEtape(2)
      else setEtape(3)
    } else if (etape === 2) {
      setEtape(3)
    } else if (etape === 3) {
      setEtape(4)
    }
  }

  async function handleSauvegarder() {
    if (!criticiteBrute) return
    setChargement(true)
    setErreur(null)

    const donnees = {
      niveau_estimation: niveauEstimation as NiveauEstimationBruit,
      ...(niveauEstimation === 1 && niveauDb !== null && dureeExposition !== null
        ? {
            niveau_db: niveauDb,
            duree_exposition: dureeExposition,
            total_points: totalPoints ?? undefined,
          }
        : {}),
    }

    const resultat = await sauvegarderEvaluationBruit(
      operationId,
      posteId,
      donnees,
      mesures,
      coefficientPm
    )

    if ('erreur' in resultat) {
      setErreur(String(resultat.erreur))
      setChargement(false)
      return
    }

    router.push(`/dashboard/postes/${posteId}/operations/${operationId}/risques`)
  }

  // ── Étapes ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2">
        {([1, 2, 3, 4] as Etape[]).map((e) => (
          <div key={e} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                e === etape
                  ? 'bg-blue-600 text-white'
                  : e < etape
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {e < etape ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                e
              )}
            </div>
            {e < 4 && <div className={`h-px w-8 ${e < etape ? 'bg-blue-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <div className="ml-2 text-xs text-gray-500">
          {etape === 1 && 'Test de communication'}
          {etape === 2 && 'Méthode des points'}
          {etape === 3 && 'Plan de maîtrise'}
          {etape === 4 && 'Récapitulatif'}
        </div>
      </div>

      {/* ── ÉTAPE 1 : Test de communication ───────────────────────────────── */}
      {etape === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Étape 1 — Test de communication
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Lors de cette opération (<strong>{nomOperation}</strong>), quelle est la situation ?
            </p>
          </div>

          <div className="space-y-3">
            {NIVEAUX_ESTIMATION_BRUIT.map((niveau) => (
              <button
                key={niveau.valeur}
                type="button"
                onClick={() => setNiveauEstimation(niveau.valeur)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  niveauEstimation === niveau.valeur
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      niveauEstimation === niveau.valeur
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {niveauEstimation === niveau.valeur && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{niveau.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{niveau.description}</p>
                    <p
                      className={`text-xs mt-1.5 font-medium ${
                        niveau.risque === 'faible'
                          ? 'text-green-700'
                          : niveau.risque === 'incertain'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}
                    >
                      → {niveau.interpretation}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={allerEtapeSuivante} disabled={niveauEstimation === null}>
              Continuer →
            </Button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : Méthode des points ──────────────────────────────────── */}
      {etape === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Étape 2 — Méthode des points
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Sélectionnez le niveau sonore dominant et la durée d&apos;exposition quotidienne.
              Référence : ED 6035 INRS, Figure 9.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sélecteur niveau dB */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Niveau sonore (dB(A))
              </label>
              <div className="space-y-1.5">
                {NIVEAUX_DB.map((db) => (
                  <button
                    key={db}
                    type="button"
                    onClick={() => setNiveauDb(db)}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                      niveauDb === db
                        ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {db} dB(A)
                  </button>
                ))}
              </div>
            </div>

            {/* Sélecteur durée */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Durée d&apos;exposition journalière
              </label>
              <div className="space-y-1.5">
                {DUREES_EXPOSITION.map((duree) => (
                  <button
                    key={duree.valeur}
                    type="button"
                    onClick={() => setDureeExposition(duree.valeur)}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                      dureeExposition === duree.valeur
                        ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {duree.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Résultat en temps réel */}
          {totalPoints !== null && niveauDb !== null && dureeExposition !== null && (() => {
            const crit = calculerCriticiteBruit(totalPoints)
            return (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Points d&apos;exposition cumulés</p>
                    <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{crit.interpretation}</p>
                  </div>
                  <CriticiteBadge
                    score={crit.criticite}
                    couleur={crit.couleur}
                    label={crit.niveauRisque}
                  />
                </div>
              </div>
            )
          })()}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setEtape(1)}>
              ← Retour
            </Button>
            <Button
              onClick={allerEtapeSuivante}
              disabled={niveauDb === null || dureeExposition === null}
            >
              Continuer →
            </Button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 : Plan de maîtrise ────────────────────────────────────── */}
      {etape === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Étape 3 — Plan de maîtrise existant
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Quelles mesures de prévention sont déjà en place pour ce poste ?
            </p>
          </div>

          {/* Risque supprimé */}
          <button
            type="button"
            onClick={handleRisqueSupprimeToggle}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              mesures.risque_supprime
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  mesures.risque_supprime ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}
              >
                {mesures.risque_supprime && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Risque totalement supprimé</p>
                <p className="text-xs text-gray-500">
                  Ex : bruit supprimé à la source, poste délocalisé hors zone bruyante (PM = 0.0)
                </p>
              </div>
            </div>
          </button>

          {!mesures.risque_supprime && (
            <div className="space-y-4">
              {/* Mesures techniques */}
              <MesureCategorie
                titre="Protections collectives (techniques)"
                items={MESURES_PREVENTION_BRUIT.techniques}
                selectionnes={mesures.techniques}
                onToggle={(id) => handleMesureToggle('techniques', id)}
                couleur="blue"
              />

              {/* Mesures organisationnelles */}
              <MesureCategorie
                titre="Mesures organisationnelles"
                items={MESURES_PREVENTION_BRUIT.organisationnelles}
                selectionnes={mesures.organisationnelles}
                onToggle={(id) => handleMesureToggle('organisationnelles', id)}
                couleur="purple"
              />

              {/* Mesures humaines / formation */}
              <MesureCategorie
                titre="Formation et information"
                items={MESURES_PREVENTION_BRUIT.humaines}
                selectionnes={mesures.humaines}
                onToggle={(id) => handleMesureToggle('humaines', id)}
                couleur="teal"
              />

              {/* EPI */}
              <MesureCategorie
                titre="EPI — Protections individuelles (PICB)"
                items={MESURES_PREVENTION_BRUIT.epi}
                selectionnes={mesures.epi}
                onToggle={(id) => handleMesureToggle('epi', id)}
                couleur="amber"
              />
            </div>
          )}

          {/* Coefficient PM suggéré */}
          {criticiteBrute && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Coefficient PM suggéré</p>
                  <p className="text-xl font-bold text-gray-900">
                    {coefficientPm === 0 ? '0,0' : coefficientPm.toString().replace('.', ',')}
                  </p>
                </div>
                {criticiteResiduelle !== null && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Criticité résiduelle</p>
                    <CriticiteBadge
                      score={criticiteResiduelle}
                      couleur={criticiteBrute.couleur}
                    />
                  </div>
                )}
              </div>

              {/* Sélecteur PM manuel */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Ajuster si nécessaire :</p>
                <div className="flex gap-2 flex-wrap">
                  {COEFFICIENTS_PM.map((pm) => (
                    <button
                      key={pm.valeur}
                      type="button"
                      onClick={() => setCoefficientPm(pm.valeur as CoefficientPM)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        coefficientPm === pm.valeur
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                      title={pm.description}
                    >
                      {pm.valeur === 0 ? '0,0' : pm.valeur.toString().replace('.', ',')} — {pm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setEtape(niveauEstimation === 1 ? 2 : 1)}>
              ← Retour
            </Button>
            <Button onClick={allerEtapeSuivante}>
              Continuer →
            </Button>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 4 : Récapitulatif ───────────────────────────────────────── */}
      {etape === 4 && criticiteBrute && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Étape 4 — Récapitulatif
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Vérifiez les données avant de sauvegarder.
            </p>
          </div>

          {/* Carte récapitulative */}
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Opération</span>
              <span className="text-sm font-medium text-gray-900">{nomOperation}</span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Méthode d&apos;estimation</span>
              <span className="text-sm font-medium text-gray-900">
                {niveauEstimation === 0
                  ? 'Test de communication — Niveau 0'
                  : niveauEstimation === 1
                  ? 'Méthode des points (ED 6035)'
                  : 'Test de communication — Niveau 2'}
              </span>
            </div>

            {niveauEstimation === 1 && niveauDb !== null && dureeExposition !== null && (
              <>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exposition</span>
                  <span className="text-sm font-medium text-gray-900">
                    {niveauDb} dB(A) ×{' '}
                    {DUREES_EXPOSITION.find((d) => d.valeur === dureeExposition)?.label}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points d&apos;exposition</span>
                  <span className="text-sm font-medium text-gray-900">{totalPoints}</span>
                </div>
              </>
            )}

            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Criticité brute</span>
              <CriticiteBadge
                score={criticiteBrute.criticite}
                couleur={criticiteBrute.couleur}
                label={criticiteBrute.niveauRisque}
                size="sm"
              />
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Coefficient PM</span>
              <span className="text-sm font-medium text-gray-900">
                {coefficientPm === 0 ? '0,0' : coefficientPm.toString().replace('.', ',')}
              </span>
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Criticité résiduelle</span>
              {criticiteResiduelle !== null && (
                <CriticiteBadge
                  score={criticiteResiduelle}
                  couleur={
                    criticiteResiduelle === 0
                      ? 'vert'
                      : criticiteBrute.couleur
                  }
                  size="sm"
                />
              )}
            </div>
          </div>

          {/* Action requise */}
          <div
            className={`rounded-xl p-4 ${
              criticiteBrute.couleur === 'vert'
                ? 'bg-green-50 border border-green-200'
                : criticiteBrute.couleur === 'jaune'
                ? 'bg-yellow-50 border border-yellow-200'
                : criticiteBrute.couleur === 'orange'
                ? 'bg-orange-50 border border-orange-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className="text-sm font-medium text-gray-900 mb-1">{criticiteBrute.niveauRisque}</p>
            <p className="text-sm text-gray-600">{criticiteBrute.action}</p>
          </div>

          {erreur && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {erreur}
            </p>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setEtape(3)}>
              ← Retour
            </Button>
            <Button onClick={handleSauvegarder} disabled={chargement}>
              {chargement ? 'Sauvegarde...' : 'Sauvegarder l\'évaluation'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sous-composant : catégorie de mesures ──────────────────────────────────

interface MesureCategorieProps {
  titre: string
  items: readonly { id: string; label: string }[]
  selectionnes: string[]
  onToggle: (id: string) => void
  couleur: 'blue' | 'purple' | 'teal' | 'amber'
}

const COULEURS_CATEGORIE = {
  blue: {
    badge: 'bg-blue-50 border-blue-200 text-blue-700',
    check: 'border-blue-500 bg-blue-500',
    checked: 'border-blue-500 bg-blue-50',
  },
  purple: {
    badge: 'bg-purple-50 border-purple-200 text-purple-700',
    check: 'border-purple-500 bg-purple-500',
    checked: 'border-purple-500 bg-purple-50',
  },
  teal: {
    badge: 'bg-teal-50 border-teal-200 text-teal-700',
    check: 'border-teal-500 bg-teal-500',
    checked: 'border-teal-500 bg-teal-50',
  },
  amber: {
    badge: 'bg-amber-50 border-amber-200 text-amber-700',
    check: 'border-amber-500 bg-amber-500',
    checked: 'border-amber-500 bg-amber-50',
  },
}

function MesureCategorie({ titre, items, selectionnes, onToggle, couleur }: MesureCategorieProps) {
  const styles = COULEURS_CATEGORIE[couleur]

  return (
    <div>
      <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium mb-2 ${styles.badge}`}>
        {titre}
      </div>
      <div className="space-y-1.5">
        {items.map((item) => {
          const selectionne = selectionnes.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                selectionne
                  ? styles.checked
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                    selectionne ? styles.check : 'border-gray-300'
                  }`}
                >
                  {selectionne && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
