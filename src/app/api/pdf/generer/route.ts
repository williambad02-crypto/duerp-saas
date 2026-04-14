// API Route — Génération du DUERP en PDF
// POST /api/pdf/generer
// Auth requise. Génère le PDF côté serveur et insère un enregistrement de version.

import { NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer'
import type { JSXElementConstructor, ReactElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DuerpDocument, PDFData, PDFPoste, PDFOperation, PDFEvaluation, CouleurCriticite } from '@/components/pdf/duerp-document'
import { MODULE_PAR_CODE } from '@/lib/constants/modules'
import { CodeModule } from '@/types'

// Couleur de criticité selon le score (M01_BRUIT a une échelle différente)
function couleurDepuisScore(score: number, codeModule: string): CouleurCriticite {
  if (codeModule === 'M01_BRUIT') {
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

// Formater les mesures PM en texte lisible
function formaterMesures(
  techniques: string | null,
  organisationnelles: string | null,
  humaines: string | null,
  epi: string | null
): string {
  const parts: string[] = []
  const parse = (s: string | null) =>
    s
      ? s
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : []

  const T = parse(techniques)
  const O = parse(organisationnelles)
  const H = parse(humaines)
  const E = parse(epi)

  if (T.length) parts.push(`T: ${T.join(', ')}`)
  if (O.length) parts.push(`O: ${O.join(', ')}`)
  if (H.length) parts.push(`H: ${H.join(', ')}`)
  if (E.length) parts.push(`EPI: ${E.join(', ')}`)

  return parts.join(' | ') || '—'
}

// Texte d'action selon la couleur résiduelle
function actionDepuisCouleur(couleur: CouleurCriticite | null): string {
  switch (couleur) {
    case 'rouge':
      return 'Action immédiate requise'
    case 'orange':
      return 'Action prioritaire'
    case 'jaune':
      return 'À planifier'
    case 'vert':
      return 'Acceptable — surveiller'
    default:
      return '—'
  }
}

export async function POST() {
  const supabase = await createClient()

  // Vérifier l'authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  // Récupérer l'entreprise
  const { data: entreprise, error: errEntreprise } = await supabase
    .from('entreprises')
    .select('id, nom, siret, secteur_activite, effectif, adresse, code_postal, ville')
    .eq('user_id', user.id)
    .single()

  if (errEntreprise || !entreprise) {
    return NextResponse.json({ erreur: "Entreprise introuvable" }, { status: 404 })
  }

  // Charger les postes
  const { data: postesRaw } = await supabase
    .from('postes')
    .select('id, nom, description, ordre')
    .eq('entreprise_id', entreprise.id)
    .order('ordre')

  if (!postesRaw || postesRaw.length === 0) {
    return NextResponse.json({ erreur: 'Aucun poste trouvé' }, { status: 400 })
  }

  // Charger toutes les évaluations avec opérations, postes et plans de maîtrise
  const { data: evaluationsRaw } = await supabase
    .from('evaluations')
    .select(`
      id,
      code_module,
      statut,
      criticite_brute,
      donnees_module,
      operations!inner(
        id,
        nom,
        est_transversale,
        ordre,
        postes!inner(id, nom, ordre)
      ),
      plans_maitrise(
        coefficient_pm,
        criticite_residuelle,
        mesures_techniques,
        mesures_organisationnelles,
        mesures_humaines,
        mesures_epi
      )
    `)

  // Récupérer la version actuelle (pour auto-incrément)
  const { count: nbVersions } = await supabase
    .from('versions_duerp')
    .select('id', { count: 'exact', head: true })
    .eq('entreprise_id', entreprise.id)

  const numeroVersion = (nbVersions ?? 0) + 1
  const dateGeneration = new Date().toISOString()

  // Structurer les données par poste → opération → évaluations
  const posteMap = new Map<
    string,
    {
      id: string
      nom: string
      description?: string | null
      ordre: number
      operations: Map<
        string,
        {
          id: string
          nom: string
          estTransversale: boolean
          ordre: number
          evaluations: PDFEvaluation[]
        }
      >
    }
  >()

  // Initialiser la map des postes
  for (const poste of postesRaw) {
    posteMap.set(poste.id, {
      id: poste.id,
      nom: poste.nom,
      description: poste.description,
      ordre: poste.ordre,
      operations: new Map(),
    })
  }

  // Remplir avec les évaluations
  for (const ev of evaluationsRaw ?? []) {
    const op = ev.operations as unknown as {
      id: string
      nom: string
      est_transversale: boolean
      ordre: number
      postes: { id: string; nom: string; ordre: number }
    }

    if (!op?.postes?.id) continue

    const posteData = posteMap.get(op.postes.id)
    if (!posteData) continue

    // Ajouter l'opération si absente
    if (!posteData.operations.has(op.id)) {
      posteData.operations.set(op.id, {
        id: op.id,
        nom: op.nom,
        estTransversale: op.est_transversale,
        ordre: op.ordre,
        evaluations: [],
      })
    }

    const pmArr = ev.plans_maitrise as unknown as Array<{
      coefficient_pm: number | null
      criticite_residuelle: number | null
      mesures_techniques: string | null
      mesures_organisationnelles: string | null
      mesures_humaines: string | null
      mesures_epi: string | null
    }>
    const pm = pmArr?.[0] ?? null

    const donnees = ev.donnees_module as Record<string, unknown> | null
    const moduleIgnore = donnees?.module_ignore === true

    const moduleInfo = MODULE_PAR_CODE[ev.code_module as CodeModule]

    const couleurBrute =
      ev.criticite_brute != null
        ? couleurDepuisScore(ev.criticite_brute, ev.code_module)
        : null

    const couleurResiduelle =
      pm?.criticite_residuelle != null
        ? couleurDepuisScore(pm.criticite_residuelle, ev.code_module)
        : null

    const mesures = pm
      ? formaterMesures(
          pm.mesures_techniques,
          pm.mesures_organisationnelles,
          pm.mesures_humaines,
          pm.mesures_epi
        )
      : '—'

    const pdfEval: PDFEvaluation = {
      codeModule: ev.code_module,
      nomModule: moduleInfo?.nom ?? ev.code_module,
      moduleIgnore,
      criticiteBrute: ev.criticite_brute ?? null,
      couleurBrute,
      coefficientPm: pm?.coefficient_pm ?? null,
      criticiteResiduelle: pm?.criticite_residuelle ?? null,
      couleurResiduelle,
      mesures,
      action: moduleIgnore ? 'Module non applicable' : actionDepuisCouleur(couleurResiduelle ?? couleurBrute),
    }

    posteData.operations.get(op.id)!.evaluations.push(pdfEval)
  }

  // Construire l'arbre PDF final
  const postes: PDFPoste[] = []

  for (const [, posteData] of posteMap) {
    // Opérations triées par ordre
    const operations: PDFOperation[] = Array.from(posteData.operations.values())
      .sort((a, b) => a.ordre - b.ordre)
      .map((opData) => ({
        nom: opData.nom,
        estTransversale: opData.estTransversale,
        evaluations: opData.evaluations,
      }))

    // Criticité max du poste (sur toutes les opérations / évaluations)
    let criticiteMax: number | null = null
    let couleurMax: CouleurCriticite | null = null

    for (const op of operations) {
      for (const ev of op.evaluations) {
        if (ev.moduleIgnore) continue
        const score = ev.criticiteResiduelle ?? ev.criticiteBrute
        if (score != null && (criticiteMax === null || score > criticiteMax)) {
          criticiteMax = score
          couleurMax = ev.couleurResiduelle ?? ev.couleurBrute
        }
      }
    }

    postes.push({
      nom: posteData.nom,
      description: posteData.description,
      operations,
      criticiteMax,
      couleurMax,
    })
  }

  // Construire la structure PDFData
  const pdfData: PDFData = {
    entreprise: {
      nom: entreprise.nom,
      siret: entreprise.siret,
      secteur_activite: entreprise.secteur_activite,
      effectif: entreprise.effectif,
      adresse: entreprise.adresse,
      code_postal: entreprise.code_postal,
      ville: entreprise.ville,
    },
    numeroVersion,
    dateGeneration,
    postes,
    effectifMajeur50: (entreprise.effectif ?? 0) >= 50,
  }

  // Générer le PDF
  let buffer: Buffer
  try {
    buffer = await renderToBuffer(
      React.createElement(DuerpDocument, { data: pdfData }) as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>
    )
  } catch (err) {
    console.error('[PDF] Erreur renderToBuffer:', err)
    return NextResponse.json({ erreur: 'Erreur lors de la génération du PDF' }, { status: 500 })
  }

  // Insérer la version en base
  await supabase.from('versions_duerp').insert({
    entreprise_id: entreprise.id,
    numero_version: numeroVersion,
    generated_by: user.id,
  })

  // Nom du fichier pour le téléchargement
  const nomFichier = `DUERP_${entreprise.nom.replace(/[^a-zA-Z0-9\u00C0-\u017E]/g, '_')}_v${numeroVersion}_${new Date().toISOString().slice(0, 10)}.pdf`

  return new Response(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nomFichier}"`,
      'Content-Length': buffer.length.toString(),
    },
  })
}
