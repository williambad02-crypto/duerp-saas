'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RISQUES_ED840, ECHELLE_DUREE_EXPOSITION, RisqueED840, aModuleDedieActif } from '@/lib/constants/ed840'
import { ECHELLE_GRAVITE, ECHELLE_PROBABILITE, COEFFICIENTS_PM, getNiveauCriticite } from '@/lib/constants/cotation'
import { ajouterLigneAPR, supprimerLigneAPR, DonneesLigneAPR } from '@/app/dashboard/postes/[id]/operations/[opId]/risques/actions'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LigneAPRUI {
  id: string
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
  pm: {
    coefficient_pm: number
    criticite_residuelle: number | null
    mesures_techniques: string | null
    mesures_humaines: string | null
    mesures_organisationnelles: string | null
    mesures_epi: string | null
  } | null
}

interface Props {
  lignes: LigneAPRUI[]
  operationId: string
  posteId: string
  operationNom: string
  moduleUrl: string  // ex: /dashboard/postes/[id]/operations/[opId]/risques/M01_BRUIT
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function couleurBadge(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-500'
  const z = getNiveauCriticite(score)
  switch (z.niveau) {
    case 'vert':   return 'bg-green-100 text-green-800'
    case 'jaune':  return 'bg-yellow-100 text-yellow-800'
    case 'orange': return 'bg-orange-100 text-orange-800'
    case 'rouge':  return 'bg-red-100 text-red-800'
    default:       return 'bg-gray-100 text-gray-500'
  }
}

function couleurDot(score: number | null): string {
  if (score === null) return 'bg-gray-300'
  const z = getNiveauCriticite(score)
  switch (z.niveau) {
    case 'vert':   return 'bg-green-500'
    case 'jaune':  return 'bg-yellow-400'
    case 'orange': return 'bg-orange-500'
    case 'rouge':  return 'bg-red-500'
    default:       return 'bg-gray-300'
  }
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400">—</span>
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${couleurBadge(score)}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${couleurDot(score)}`} />
      {Math.round(score * 100) / 100}
    </span>
  )
}

// ─── État formulaire ──────────────────────────────────────────────────────────

interface FormState {
  etape: 1 | 2 | 3 | 4
  // Étape 1 — risque
  numero_risque_ed840: string
  type_choisi: 'aigu' | 'chronique' | ''
  // Étape 2 — contexte
  danger: string
  situation_dangereuse: string
  evenement_dangereux: string
  dommage: string
  siege_lesions: string
  // Étape 3 — cotation
  gravite: string
  probabilite: string
  duree_exposition: string
  // Étape 4 — PM
  mesures_t: string
  mesures_h: string
  mesures_o: string
  mesures_epi: string
  coefficient_pm: string
}

const FORM_VIDE: FormState = {
  etape: 1,
  numero_risque_ed840: '',
  type_choisi: '',
  danger: '',
  situation_dangereuse: '',
  evenement_dangereux: '',
  dommage: '',
  siege_lesions: '',
  gravite: '',
  probabilite: '',
  duree_exposition: '',
  mesures_t: '',
  mesures_h: '',
  mesures_o: '',
  mesures_epi: '',
  coefficient_pm: '1.0',
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function AprTableOperation({ lignes, operationId, posteId, operationNom, moduleUrl }: Props) {
  const [dialogOuvert, setDialogOuvert] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_VIDE)
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const risqueSelectionne: RisqueED840 | null = form.numero_risque_ed840
    ? RISQUES_ED840.find((r) => r.numero === parseInt(form.numero_risque_ed840)) ?? null
    : null

  // Déterminer si le type peut être choisi (LES_DEUX) ou est figé
  const typeFixe = risqueSelectionne
    ? risqueSelectionne.type !== 'LES_DEUX'
    : false

  const typeEffectif: 'aigu' | 'chronique' | null = risqueSelectionne
    ? risqueSelectionne.type === 'AIGU' ? 'aigu'
    : risqueSelectionne.type === 'CHRONIQUE' ? 'chronique'
    : (form.type_choisi || null) as 'aigu' | 'chronique' | null
    : null

  // Calculer la criticité brute en temps réel
  const g = parseFloat(form.gravite) || 0
  const p = parseFloat(form.probabilite) || 0
  const de = parseFloat(form.duree_exposition) || 0
  const second = typeEffectif === 'aigu' ? p : de
  const critBrute = g > 0 && second > 0 ? g * second : null
  const pm = parseFloat(form.coefficient_pm)
  const critResid = critBrute !== null ? critBrute * pm : null

  // Validation étape 1
  const etape1Valide = risqueSelectionne !== null &&
    (risqueSelectionne.type !== 'LES_DEUX' || form.type_choisi !== '')

  // Validation étape 2
  const etape2Valide = form.danger.trim() !== '' &&
    form.situation_dangereuse.trim() !== '' &&
    form.dommage.trim() !== '' &&
    form.siege_lesions.trim() !== '' &&
    (typeEffectif !== 'aigu' || form.evenement_dangereux.trim() !== '')

  // Validation étape 3
  const etape3Valide = g >= 1 && second >= 1

  function ouvrirDialog() {
    setForm(FORM_VIDE)
    setErreur(null)
    setDialogOuvert(true)
  }

  function fermerDialog() {
    setDialogOuvert(false)
    setForm(FORM_VIDE)
    setErreur(null)
  }

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function precedent() {
    setForm((prev) => ({ ...prev, etape: (prev.etape - 1) as FormState['etape'] }))
  }

  function suivant() {
    setForm((prev) => ({ ...prev, etape: (prev.etape + 1) as FormState['etape'] }))
    setErreur(null)
  }

  function soumettre() {
    if (!risqueSelectionne || !typeEffectif || !etape1Valide || !etape2Valide || !etape3Valide) {
      setErreur('Veuillez compléter tous les champs obligatoires.')
      return
    }

    const donnees: DonneesLigneAPR = {
      numero_risque_ed840: risqueSelectionne.numero,
      type_risque: typeEffectif,
      danger: form.danger.trim(),
      situation_dangereuse: form.situation_dangereuse.trim(),
      evenement_dangereux: typeEffectif === 'aigu' ? form.evenement_dangereux.trim() || null : null,
      dommage: form.dommage.trim(),
      siege_lesions: form.siege_lesions.trim(),
      gravite: g,
      probabilite: typeEffectif === 'aigu' ? p : undefined,
      duree_exposition: typeEffectif === 'chronique' ? de : undefined,
      mesures_t: form.mesures_t.trim() || null,
      mesures_h: form.mesures_h.trim() || null,
      mesures_o: form.mesures_o.trim() || null,
      mesures_epi: form.mesures_epi.trim() || null,
      coefficient_pm: pm,
    }

    startTransition(async () => {
      const res = await ajouterLigneAPR(operationId, posteId, donnees)
      if (res.erreur) {
        setErreur(res.erreur)
      } else {
        fermerDialog()
      }
    })
  }

  function handleSupprimer(evalId: string) {
    if (!confirm('Supprimer cette ligne APR ?')) return
    startTransition(async () => {
      await supprimerLigneAPR(evalId, operationId, posteId)
    })
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* En-tête actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {lignes.length === 0
            ? 'Aucun risque identifié pour cette opération.'
            : `${lignes.length} risque${lignes.length > 1 ? 's' : ''} identifié${lignes.length > 1 ? 's' : ''}`}
        </p>
        <Button size="sm" onClick={ouvrirDialog}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un risque
        </Button>
      </div>

      {/* Table APR */}
      {lignes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-medium text-gray-700 mb-1">Tableau APR vide</p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Identifiez les risques auxquels les salariés sont exposés lors de cette opération.
            Sélectionnez un risque dans la liste ED 840 (20 fiches INRS).
          </p>
          <Button className="mt-4" size="sm" onClick={ouvrirDialog}>
            Ajouter le premier risque
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm min-w-[1200px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  'ID', 'Risque ED840', 'Type', 'Danger', 'Situation dangereuse',
                  'Événement dangereux', 'Dommage', 'Siège', 'G', 'P/DE',
                  'Criticité brute', 'T.H.O. / EPI', 'PM', 'Criticité résiduelle', ''
                ].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lignes.map((ligne) => {
                const risque = ligne.numero_risque_ed840
                  ? RISQUES_ED840.find((r) => r.numero === ligne.numero_risque_ed840)
                  : null
                const pm = ligne.pm
                const mesuresResume = [
                  pm?.mesures_techniques ? `T: ${pm.mesures_techniques}` : null,
                  pm?.mesures_humaines ? `H: ${pm.mesures_humaines}` : null,
                  pm?.mesures_organisationnelles ? `O: ${pm.mesures_organisationnelles}` : null,
                  pm?.mesures_epi ? `EPI: ${pm.mesures_epi}` : null,
                ].filter(Boolean).join(' | ') || '—'

                return (
                  <tr key={ligne.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                        {ligne.identifiant_auto ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 max-w-[160px]">
                      <div className="text-xs font-medium text-gray-900 leading-snug">
                        {risque ? `${risque.numero}. ${risque.intitule}` : ligne.numero_risque_ed840 ? `Fiche ${ligne.numero_risque_ed840}` : '—'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        ligne.type_risque === 'aigu'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ligne.type_risque === 'aigu' ? 'Aigu' : 'Chronique'}
                      </span>
                    </td>
                    <td className="px-3 py-2 max-w-[140px]">
                      <p className="text-xs text-gray-700 truncate" title={ligne.danger ?? ''}>
                        {ligne.danger || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-2 max-w-[140px]">
                      <p className="text-xs text-gray-700 truncate" title={ligne.situation_dangereuse ?? ''}>
                        {ligne.situation_dangereuse || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-2 max-w-[120px]">
                      <p className="text-xs text-gray-500 truncate" title={ligne.evenement_dangereux ?? ''}>
                        {ligne.evenement_dangereux || (ligne.type_risque === 'chronique' ? <span className="italic">N/A</span> : '—')}
                      </p>
                    </td>
                    <td className="px-3 py-2 max-w-[120px]">
                      <p className="text-xs text-gray-700 truncate" title={ligne.dommage ?? ''}>
                        {ligne.dommage || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-2 max-w-[100px]">
                      <p className="text-xs text-gray-500 truncate" title={ligne.siege_lesions ?? ''}>
                        {ligne.siege_lesions || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-medium">{ligne.gravite ?? '—'}</td>
                    <td className="px-3 py-2 text-center text-xs font-medium">
                      {ligne.type_risque === 'aigu' ? (ligne.probabilite ?? '—') : (ligne.duree_exposition ?? '—')}
                    </td>
                    <td className="px-3 py-2">
                      <ScoreBadge score={ligne.criticite_brute} />
                    </td>
                    <td className="px-3 py-2 max-w-[140px]">
                      <p className="text-xs text-gray-500 truncate" title={mesuresResume}>
                        {mesuresResume.length > 40 ? mesuresResume.slice(0, 40) + '…' : mesuresResume}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-medium">
                      {pm ? `×${pm.coefficient_pm}` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <ScoreBadge score={pm?.criticite_residuelle ?? null} />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleSupprimer(ligne.id)}
                        disabled={isPending}
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Supprimer cette ligne"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Dialog ajout risque ────────────────────────────────────────────── */}
      <Dialog open={dialogOuvert} onOpenChange={(o) => { if (!o) fermerDialog() }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un risque — {operationNom}</DialogTitle>
            {/* Étapes */}
            <div className="flex items-center gap-2 mt-2">
              {(['1. Risque', '2. Contexte', '3. Cotation', '4. Maîtrise'] as const).map((label, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    form.etape === i + 1
                      ? 'bg-blue-600 text-white'
                      : form.etape > i + 1
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {label}
                  </span>
                  {i < 3 && <span className="text-gray-300 text-xs">›</span>}
                </div>
              ))}
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* ── ÉTAPE 1 : Sélection du risque ── */}
            {form.etape === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risque ED840 <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.numero_risque_ed840}
                    onValueChange={(v) => {
                      if (v === null) return
                      const r = RISQUES_ED840.find((x) => x.numero === parseInt(v))
                      set('numero_risque_ed840', v)
                      // Pré-remplir le type si pas LES_DEUX
                      if (r && r.type !== 'LES_DEUX') {
                        set('type_choisi', r.type === 'AIGU' ? 'aigu' : 'chronique')
                      } else {
                        set('type_choisi', '')
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un risque dans la liste ED840…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                        Risques AIGUS
                      </div>
                      {RISQUES_ED840.filter((r) => r.type === 'AIGU').map((r) => (
                        <SelectItem key={r.numero} value={String(r.numero)}>
                          {r.numero}. {r.intitule}
                        </SelectItem>
                      ))}
                      <div className="px-3 py-1 mt-1 text-xs font-semibold text-gray-400 uppercase border-t">
                        Risques CHRONIQUES
                      </div>
                      {RISQUES_ED840.filter((r) => r.type === 'CHRONIQUE').map((r) => (
                        <SelectItem key={r.numero} value={String(r.numero)}>
                          {r.numero}. {r.intitule}
                        </SelectItem>
                      ))}
                      <div className="px-3 py-1 mt-1 text-xs font-semibold text-gray-400 uppercase border-t">
                        Les DEUX composantes
                      </div>
                      {RISQUES_ED840.filter((r) => r.type === 'LES_DEUX').map((r) => (
                        <SelectItem key={r.numero} value={String(r.numero)}>
                          {r.numero}. {r.intitule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description du risque sélectionné */}
                {risqueSelectionne && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        risqueSelectionne.type === 'AIGU' ? 'bg-amber-100 text-amber-800' :
                        risqueSelectionne.type === 'CHRONIQUE' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {risqueSelectionne.type === 'LES_DEUX' ? 'Aigu + Chronique' : risqueSelectionne.type}
                      </span>
                      {risqueSelectionne.module && (
                        <span className="text-xs text-gray-500">
                          Module dédié : {risqueSelectionne.module}
                          {aModuleDedieActif(risqueSelectionne) ? ' (actif)' : ' (à venir)'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-900">{risqueSelectionne.description}</p>
                  </div>
                )}

                {/* Choix du type si LES_DEUX */}
                {risqueSelectionne?.type === 'LES_DEUX' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quelle composante évaluez-vous pour cette ligne ? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {(['aigu', 'chronique'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => set('type_choisi', t)}
                          className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                            form.type_choisi === t
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {t === 'aigu' ? 'Aigu (G × P)' : 'Chronique (G × DE)'}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Vous pouvez créer une deuxième ligne pour l'autre composante.
                    </p>
                  </div>
                )}

                {/* Alerte module dédié actif (Bruit M01) */}
                {risqueSelectionne && aModuleDedieActif(risqueSelectionne) &&
                 typeEffectif === 'chronique' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800 font-medium mb-1">
                      Module normé disponible (ED 6035 — Méthode des points)
                    </p>
                    <p className="text-xs text-amber-700 mb-2">
                      Pour le Bruit, une évaluation normée plus précise est disponible.
                      Vous pouvez ajouter cette ligne APR avec une cotation simplifiée,
                      puis utiliser le module Bruit pour affiner.
                    </p>
                    <Link
                      href={moduleUrl}
                      className="text-xs font-medium text-amber-700 underline"
                      onClick={fermerDialog}
                    >
                      → Aller directement au Module Bruit
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── ÉTAPE 2 : Contexte ── */}
            {form.etape === 2 && risqueSelectionne && (
              <div className="space-y-3">
                <FormField
                  label="Danger"
                  requis
                  aide="Ce qui peut blesser / la source physique du risque"
                  value={form.danger}
                  onChange={(v) => set('danger', v)}
                  placeholder={risqueSelectionne.exemplesDanger[0] ?? 'Ex: Sol glissant'}
                />
                <FormField
                  label="Situation dangereuse"
                  requis
                  aide="Ce que fait l'opérateur qui le met en danger"
                  value={form.situation_dangereuse}
                  onChange={(v) => set('situation_dangereuse', v)}
                  placeholder="Ex: Traversée de la zone humide avec des chaussures inadaptées"
                />
                {typeEffectif === 'aigu' && (
                  <FormField
                    label="Événement dangereux"
                    requis
                    aide="L'accident possible (déclencheur)"
                    value={form.evenement_dangereux}
                    onChange={(v) => set('evenement_dangereux', v)}
                    placeholder="Ex: Glissade → chute"
                  />
                )}
                <FormField
                  label="Dommage"
                  requis
                  aide="Conséquence corporelle subie par l'opérateur"
                  value={form.dommage}
                  onChange={(v) => set('dommage', v)}
                  placeholder={risqueSelectionne.exemplesDommage[0] ?? 'Ex: Entorse'}
                />
                <FormField
                  label="Siège des lésions"
                  requis
                  aide="Localisation anatomique des dommages"
                  value={form.siege_lesions}
                  onChange={(v) => set('siege_lesions', v)}
                  placeholder={risqueSelectionne.exemplesSiege[0] ?? 'Ex: Membres inférieurs'}
                />
              </div>
            )}

            {/* ── ÉTAPE 3 : Cotation ── */}
            {form.etape === 3 && (
              <div className="space-y-4">
                {/* Gravité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gravité (G) <span className="text-red-500">*</span>
                  </label>
                  <Select value={form.gravite} onValueChange={(v) => { if (v !== null) set('gravite', v) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sévérité si l'accident survient…" />
                    </SelectTrigger>
                    <SelectContent>
                      {ECHELLE_GRAVITE.map((e) => (
                        <SelectItem key={e.valeur} value={String(e.valeur)}>
                          {e.valeur} — {e.label} : {e.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Probabilité ou Durée d'exposition */}
                {typeEffectif === 'aigu' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probabilité (P) <span className="text-red-500">*</span>
                    </label>
                    <Select value={form.probabilite} onValueChange={(v) => { if (v !== null) set('probabilite', v) }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Probabilité que l'accident survienne…" />
                      </SelectTrigger>
                      <SelectContent>
                        {ECHELLE_PROBABILITE.map((e) => (
                          <SelectItem key={e.valeur} value={String(e.valeur)}>
                            {e.valeur} — {e.label} : {e.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée d'exposition (DE) <span className="text-red-500">*</span>
                    </label>
                    <Select value={form.duree_exposition} onValueChange={(v) => { if (v !== null) set('duree_exposition', v) }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Fréquence / durée d'exposition…" />
                      </SelectTrigger>
                      <SelectContent>
                        {ECHELLE_DUREE_EXPOSITION.map((e) => (
                          <SelectItem key={e.valeur} value={String(e.valeur)}>
                            {e.valeur} — {e.label} : {e.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Criticité brute calculée */}
                {critBrute !== null && (
                  <div className={`rounded-lg p-3 border ${couleurBadge(critBrute).replace('text-', 'border-').replace('bg-', 'bg-').split(' ')[0]} bg-opacity-30`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">
                          Criticité brute = G ({g}) × {typeEffectif === 'aigu' ? `P (${p})` : `DE (${de})`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getNiveauCriticite(critBrute).action}
                        </p>
                      </div>
                      <ScoreBadge score={critBrute} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ÉTAPE 4 : Plan de Maîtrise ── */}
            {form.etape === 4 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  Décrivez les moyens de maîtrise <strong>déjà en place</strong> (T.H.O. + EPI), puis choisissez le coefficient PM correspondant.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="T — Technique"
                    value={form.mesures_t}
                    onChange={(v) => set('mesures_t', v)}
                    placeholder="Ex: Garde-corps, capotage"
                  />
                  <FormField
                    label="H — Humain"
                    value={form.mesures_h}
                    onChange={(v) => set('mesures_h', v)}
                    placeholder="Ex: Travail en binôme, rotation"
                  />
                  <FormField
                    label="O — Organisationnel"
                    value={form.mesures_o}
                    onChange={(v) => set('mesures_o', v)}
                    placeholder="Ex: Procédure, consigne, signalétique"
                  />
                  <FormField
                    label="EPI"
                    value={form.mesures_epi}
                    onChange={(v) => set('mesures_epi', v)}
                    placeholder="Ex: Casque, chaussures de sécurité"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan de Maîtrise (PM) <span className="text-red-500">*</span>
                  </label>
                  <Select value={form.coefficient_pm} onValueChange={(v) => { if (v !== null) set('coefficient_pm', v) }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COEFFICIENTS_PM.map((c) => (
                        <SelectItem key={c.valeur} value={String(c.valeur)}>
                          ×{c.valeur} — {c.label} : {c.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Récapitulatif criticité */}
                {critBrute !== null && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Criticité brute</span>
                      <ScoreBadge score={critBrute} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">× PM ({pm})</span>
                      <span className="text-gray-500 text-xs">= {critBrute} × {pm}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium border-t pt-2">
                      <span className="text-gray-700">Criticité résiduelle</span>
                      <ScoreBadge score={critResid} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Erreur */}
          {erreur && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {erreur}
            </p>
          )}

          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              {form.etape > 1 && (
                <Button variant="outline" onClick={precedent} disabled={isPending}>
                  ← Précédent
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={fermerDialog} disabled={isPending}>
                Annuler
              </Button>
              {form.etape < 4 ? (
                <Button
                  onClick={suivant}
                  disabled={
                    (form.etape === 1 && !etape1Valide) ||
                    (form.etape === 2 && !etape2Valide) ||
                    isPending
                  }
                >
                  Suivant →
                </Button>
              ) : (
                <Button
                  onClick={soumettre}
                  disabled={!etape3Valide || isPending}
                >
                  {isPending ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Champ formulaire générique ───────────────────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  placeholder,
  aide,
  requis,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  aide?: string
  requis?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {requis && <span className="text-red-500">*</span>}
      </label>
      {aide && <p className="text-xs text-gray-500 mb-1">{aide}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}
