// Composant PDF — Document Unique d'Évaluation des Risques Professionnels
// Généré côté serveur uniquement via @react-pdf/renderer
// NE PAS importer ce fichier dans des composants client

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// ── Types ──────────────────────────────────────────────────────────────────────

export type CouleurCriticite = 'vert' | 'jaune' | 'orange' | 'rouge'

export interface PDFEvaluation {
  codeModule: string
  nomModule: string
  moduleIgnore: boolean
  criticiteBrute: number | null
  couleurBrute: CouleurCriticite | null
  coefficientPm: number | null
  criticiteResiduelle: number | null
  couleurResiduelle: CouleurCriticite | null
  mesures: string
  action: string
}

export interface PDFOperation {
  nom: string
  estTransversale: boolean
  evaluations: PDFEvaluation[]
}

export interface PDFPoste {
  nom: string
  description?: string | null
  operations: PDFOperation[]
  criticiteMax: number | null
  couleurMax: CouleurCriticite | null
}

export interface PDFData {
  entreprise: {
    nom: string
    siret?: string | null
    secteur_activite?: string | null
    effectif?: number | null
    adresse?: string | null
    code_postal?: string | null
    ville?: string | null
  }
  numeroVersion: number
  dateGeneration: string
  postes: PDFPoste[]
  effectifMajeur50: boolean
}

// ── Couleurs ───────────────────────────────────────────────────────────────────

const C = {
  primary: '#031948',    // brand-navy SafeAnalyse.
  gray900: '#111827',
  gray700: '#374151',
  gray500: '#6b7280',
  gray300: '#d1d5db',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
  white: '#ffffff',
  criticite: {
    vert: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    jaune: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
    orange: { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
    rouge: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  },
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.gray900,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },

  // ── En-tête et pied de page fixes ──
  header: {
    position: 'absolute',
    top: 16,
    left: 40,
    right: 40,
    borderBottomWidth: 1,
    borderBottomColor: C.gray300,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 7,
    color: C.gray500,
    fontFamily: 'Helvetica',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: C.gray300,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: C.gray500,
  },

  // ── Page de garde ──
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: C.primary,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
    textAlign: 'center',
    marginBottom: 32,
  },
  coverRule: {
    width: 60,
    height: 3,
    backgroundColor: C.primary,
    marginBottom: 32,
  },
  coverEntrepriseName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
    textAlign: 'center',
    marginBottom: 24,
  },
  coverInfoBox: {
    width: 320,
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: C.gray300,
    borderRadius: 4,
    padding: 16,
    marginBottom: 32,
  },
  coverInfoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  coverInfoLabel: {
    fontSize: 8,
    color: C.gray500,
    width: 100,
    fontFamily: 'Helvetica-Bold',
  },
  coverInfoValue: {
    fontSize: 8,
    color: C.gray900,
    flex: 1,
  },
  coverDateBlock: {
    textAlign: 'center',
    marginBottom: 32,
  },
  coverDateText: {
    fontSize: 9,
    color: C.gray700,
    marginBottom: 4,
  },
  coverVersion: {
    fontSize: 8,
    color: C.gray500,
  },
  coverSignature: {
    width: 320,
    borderTopWidth: 1,
    borderTopColor: C.gray300,
    paddingTop: 16,
    marginBottom: 8,
  },
  coverSignatureLabel: {
    fontSize: 8,
    color: C.gray500,
    marginBottom: 40,
  },
  coverSignatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: C.gray900,
    width: 180,
    marginBottom: 4,
  },
  coverSignatureText: {
    fontSize: 7,
    color: C.gray500,
  },
  coverLegal: {
    marginTop: 24,
    fontSize: 7,
    color: C.gray500,
    textAlign: 'center',
  },

  // ── Sections génériques ──
  sectionBreak: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: C.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
    marginBottom: 8,
    marginTop: 16,
  },

  // ── Sommaire ──
  tocEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.gray100,
  },
  tocPoste: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
  },
  tocOps: {
    fontSize: 8,
    color: C.gray500,
  },

  // ── Blocs de poste ──
  posteHeader: {
    backgroundColor: C.primary,
    padding: '10 12',
    marginBottom: 8,
    marginTop: 16,
    borderRadius: 4,
  },
  posteHeaderText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  posteHeaderDesc: {
    fontSize: 8,
    color: '#bfdbfe',
    marginTop: 2,
  },

  // ── Opération ──
  operationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray100,
    padding: '6 10',
    marginBottom: 4,
    marginTop: 8,
    borderRadius: 3,
  },
  operationName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
    flex: 1,
  },
  operationTag: {
    fontSize: 7,
    color: '#7c3aed',
    backgroundColor: '#ede9fe',
    padding: '1 4',
    borderRadius: 8,
  },

  // ── Tableau d'évaluations ──
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.gray900,
    padding: '5 6',
    borderRadius: 3,
    marginBottom: 1,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.gray100,
    padding: '4 6',
    minHeight: 22,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: C.gray50,
  },
  tableCell: {
    fontSize: 8,
    color: C.gray700,
  },

  // ── Widths des colonnes ──
  colModule: { width: '18%' },
  colAppl: { width: '10%' },
  colBrute: { width: '13%' },
  colMesures: { width: '22%' },
  colPM: { width: '10%' },
  colResid: { width: '13%' },
  colAction: { width: '14%' },

  // ── Badge de criticité ──
  badge: {
    borderRadius: 10,
    padding: '2 6',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Plan de maîtrise section ──
  priorityItem: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  priorityTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
    marginBottom: 2,
  },
  priorityDetail: {
    fontSize: 8,
    color: C.gray700,
  },

  // ── Info box ──
  infoBox: {
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: C.gray300,
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
  },
  infoText: {
    fontSize: 8,
    color: C.gray700,
  },

  // ── Récap APR ──
  aprSection: {
    marginTop: 8,
  },
  aprRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.gray100,
    padding: '3 4',
    alignItems: 'center',
    minHeight: 20,
  },
  aprHeaderRow: {
    flexDirection: 'row',
    backgroundColor: C.gray900,
    padding: '5 4',
    borderRadius: 3,
    marginBottom: 1,
  },
  colAprPoste: { width: '16%' },
  colAprOp: { width: '18%' },
  colAprModule: { width: '14%' },
  colAprBrute: { width: '12%' },
  colAprMesures: { width: '16%' },
  colAprPm: { width: '10%' },
  colAprResid: { width: '14%' },
})

// ── Helpers ────────────────────────────────────────────────────────────────────

function getCouleurStyles(couleur: CouleurCriticite) {
  return C.criticite[couleur]
}

function CriticiteBadge({ score, couleur }: { score: number | null; couleur: CouleurCriticite | null }) {
  if (score === null || couleur === null) {
    return <Text style={[s.tableCell, { color: C.gray500 }]}>—</Text>
  }
  const col = getCouleurStyles(couleur)
  return (
    <View style={[s.badge, { backgroundColor: col.bg, borderColor: col.border, borderWidth: 1 }]}>
      <Text style={[s.badgeText, { color: col.text }]}>{score}</Text>
    </View>
  )
}

function HeaderFooter({ nomEntreprise, dateGeneration, numeroVersion }: {
  nomEntreprise: string
  dateGeneration: string
  numeroVersion: number
}) {
  return (
    <>
      {/* En-tête fixe */}
      <View style={s.header} fixed>
        <Text style={s.headerTitle}>DUERP — {nomEntreprise}</Text>
        <Text style={s.headerTitle}>Version {numeroVersion} — {dateGeneration}</Text>
      </View>
      {/* Pied de page fixe */}
      <View style={s.footer} fixed>
        <Text style={s.footerText}>Document Unique d&apos;Évaluation des Risques Professionnels</Text>
        <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </>
  )
}

// ── Page de garde ──────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: PDFData }) {
  const { entreprise, numeroVersion, dateGeneration } = data
  const adresseFull = [
    entreprise.adresse,
    [entreprise.code_postal, entreprise.ville].filter(Boolean).join(' '),
  ].filter(Boolean).join(' — ')

  return (
    <View style={s.coverPage}>
      <Text style={s.coverTitle}>DOCUMENT UNIQUE</Text>
      <Text style={s.coverTitle}>D&apos;ÉVALUATION DES RISQUES</Text>
      <Text style={s.coverTitle}>PROFESSIONNELS</Text>

      <View style={s.coverRule} />

      <Text style={s.coverEntrepriseName}>{entreprise.nom}</Text>

      <View style={s.coverInfoBox}>
        {entreprise.siret && (
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>SIRET</Text>
            <Text style={s.coverInfoValue}>{entreprise.siret}</Text>
          </View>
        )}
        {entreprise.secteur_activite && (
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Secteur d&apos;activité</Text>
            <Text style={s.coverInfoValue}>{entreprise.secteur_activite}</Text>
          </View>
        )}
        {entreprise.effectif != null && (
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Effectif</Text>
            <Text style={s.coverInfoValue}>{entreprise.effectif} salarié{entreprise.effectif > 1 ? 's' : ''}</Text>
          </View>
        )}
        {adresseFull && (
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Site évalué</Text>
            <Text style={s.coverInfoValue}>{adresseFull}</Text>
          </View>
        )}
      </View>

      <View style={s.coverDateBlock}>
        <Text style={s.coverDateText}>Date de génération : {dateGeneration}</Text>
        <Text style={s.coverVersion}>Version n° {numeroVersion}</Text>
      </View>

      <View style={s.coverSignature}>
        <Text style={s.coverSignatureLabel}>Signature de l&apos;employeur / responsable</Text>
        <View style={s.coverSignatureLine} />
        <Text style={s.coverSignatureText}>Nom, qualité et signature</Text>
      </View>

      <Text style={s.coverLegal}>
        Conformément aux articles L4121-1 à L4121-4 du Code du travail et à la Loi du 2 août 2021.{'\n'}
        Document à conserver 40 ans minimum (Article R4121-4). — Généré via SafeAnalyse.
      </Text>
    </View>
  )
}

// ── Sommaire ───────────────────────────────────────────────────────────────────

function Sommaire({ postes }: { postes: PDFPoste[] }) {
  return (
    <View>
      <Text style={s.sectionTitle}>Sommaire</Text>

      <View style={s.infoBox}>
        <Text style={s.infoText}>
          Ce document contient l&apos;évaluation des risques pour {postes.length} poste{postes.length > 1 ? 's' : ''} de travail.
          Chaque poste est évalué selon les modules de risques applicables.
        </Text>
      </View>

      {postes.map((poste, i) => (
        <View key={i} style={s.tocEntry}>
          <View>
            <Text style={s.tocPoste}>{i + 1}. {poste.nom}</Text>
            <Text style={s.tocOps}>
              {poste.operations.length} opération{poste.operations.length > 1 ? 's' : ''}
              {poste.criticiteMax != null && ` — Criticité max : ${poste.criticiteMax}`}
            </Text>
          </View>
          {poste.couleurMax && (
            <CriticiteBadge score={poste.criticiteMax} couleur={poste.couleurMax} />
          )}
        </View>
      ))}
    </View>
  )
}

// ── Section Poste ──────────────────────────────────────────────────────────────

function PosteSection({ poste }: { poste: PDFPoste }) {
  return (
    <View>
      <View style={s.posteHeader}>
        <Text style={s.posteHeaderText}>{poste.nom}</Text>
        {poste.description && (
          <Text style={s.posteHeaderDesc}>{poste.description}</Text>
        )}
      </View>

      {poste.operations.map((op, i) => (
        <OperationSection key={i} operation={op} index={i} />
      ))}

      {/* Criticité max du poste */}
      {poste.criticiteMax != null && poste.couleurMax && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: 8,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: C.gray300,
          gap: 8,
        }}>
          <Text style={{ fontSize: 8, color: C.gray500, fontFamily: 'Helvetica-Bold' }}>
            Criticité maximale du poste :
          </Text>
          <CriticiteBadge score={poste.criticiteMax} couleur={poste.couleurMax} />
        </View>
      )}
    </View>
  )
}

function OperationSection({ operation, index }: { operation: PDFOperation; index: number }) {
  return (
    <View>
      <View style={s.operationHeader}>
        <Text style={s.operationName}>{operation.nom}</Text>
        {operation.estTransversale && (
          <Text style={s.operationTag}>Transversale</Text>
        )}
      </View>

      {operation.evaluations.length === 0 ? (
        <View style={{ padding: '4 10' }}>
          <Text style={{ fontSize: 8, color: C.gray500, fontStyle: 'italic' }}>
            Aucune évaluation enregistrée pour cette opération.
          </Text>
        </View>
      ) : (
        <View>
          {/* En-tête du tableau */}
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, s.colModule]}>Module</Text>
            <Text style={[s.tableHeaderCell, s.colAppl]}>Applicable</Text>
            <Text style={[s.tableHeaderCell, s.colBrute]}>Criticité brute</Text>
            <Text style={[s.tableHeaderCell, s.colMesures]}>Mesures PM en place</Text>
            <Text style={[s.tableHeaderCell, s.colPM]}>Coeff. PM</Text>
            <Text style={[s.tableHeaderCell, s.colResid]}>Criticité résid.</Text>
            <Text style={[s.tableHeaderCell, s.colAction]}>Action</Text>
          </View>

          {operation.evaluations.map((ev, j) => (
            <View key={j} style={[s.tableRow, j % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.tableCell, s.colModule, { fontFamily: 'Helvetica-Bold' }]}>
                {ev.nomModule}
              </Text>
              <Text style={[s.tableCell, s.colAppl, { color: ev.moduleIgnore ? C.gray500 : C.gray900 }]}>
                {ev.moduleIgnore ? 'NON' : 'OUI'}
              </Text>
              <View style={s.colBrute}>
                <CriticiteBadge score={ev.criticiteBrute} couleur={ev.moduleIgnore ? null : ev.couleurBrute} />
              </View>
              <Text style={[s.tableCell, s.colMesures, { fontSize: 7 }]}>
                {ev.moduleIgnore ? '—' : (ev.mesures || 'Aucune')}
              </Text>
              <Text style={[s.tableCell, s.colPM]}>
                {ev.moduleIgnore || ev.coefficientPm === null
                  ? '—'
                  : ev.coefficientPm === 0 ? '0,0' : String(ev.coefficientPm).replace('.', ',')}
              </Text>
              <View style={s.colResid}>
                <CriticiteBadge
                  score={ev.criticiteResiduelle}
                  couleur={ev.moduleIgnore ? null : ev.couleurResiduelle}
                />
              </View>
              <Text style={[s.tableCell, s.colAction, { fontSize: 7, color: C.gray700 }]}>
                {ev.action}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// ── Tableau APR récapitulatif ──────────────────────────────────────────────────

function APRRecap({ postes }: { postes: PDFPoste[] }) {
  // Aplatir toutes les évaluations
  const lignes: Array<{
    posteNom: string
    operationNom: string
    evaluation: PDFEvaluation
  }> = []

  for (const poste of postes) {
    for (const op of poste.operations) {
      for (const ev of op.evaluations) {
        lignes.push({ posteNom: poste.nom, operationNom: op.nom, evaluation: ev })
      }
    }
  }

  // Trier par criticité résiduelle décroissante
  lignes.sort((a, b) => {
    const ra = a.evaluation.criticiteResiduelle ?? a.evaluation.criticiteBrute ?? 0
    const rb = b.evaluation.criticiteResiduelle ?? b.evaluation.criticiteBrute ?? 0
    return rb - ra
  })

  return (
    <View>
      <Text style={s.sectionTitle}>Tableau de synthèse APR</Text>
      <Text style={{ fontSize: 8, color: C.gray500, marginBottom: 10 }}>
        Toutes les évaluations triées par criticité résiduelle décroissante.
      </Text>

      {lignes.length === 0 ? (
        <View style={s.infoBox}>
          <Text style={s.infoText}>Aucune évaluation enregistrée.</Text>
        </View>
      ) : (
        <View style={s.aprSection}>
          <View style={s.aprHeaderRow}>
            <Text style={[s.tableHeaderCell, s.colAprPoste]}>Poste</Text>
            <Text style={[s.tableHeaderCell, s.colAprOp]}>Opération</Text>
            <Text style={[s.tableHeaderCell, s.colAprModule]}>Module</Text>
            <Text style={[s.tableHeaderCell, s.colAprBrute]}>Crit. brute</Text>
            <Text style={[s.tableHeaderCell, s.colAprMesures]}>Mesures PM</Text>
            <Text style={[s.tableHeaderCell, s.colAprPm]}>Coeff. PM</Text>
            <Text style={[s.tableHeaderCell, s.colAprResid]}>Crit. résid.</Text>
          </View>

          {lignes.map((l, i) => (
            <View key={i} style={[s.aprRow, i % 2 === 1 ? { backgroundColor: C.gray50 } : {}]}>
              <Text style={[s.tableCell, s.colAprPoste]}>{l.posteNom}</Text>
              <Text style={[s.tableCell, s.colAprOp]}>{l.operationNom}</Text>
              <Text style={[s.tableCell, s.colAprModule, { fontSize: 7 }]}>{l.evaluation.nomModule}</Text>
              <View style={s.colAprBrute}>
                <CriticiteBadge
                  score={l.evaluation.criticiteBrute}
                  couleur={l.evaluation.moduleIgnore ? null : l.evaluation.couleurBrute}
                />
              </View>
              <Text style={[s.tableCell, s.colAprMesures, { fontSize: 7 }]}>
                {l.evaluation.moduleIgnore ? 'NA' : (l.evaluation.mesures || '—')}
              </Text>
              <Text style={[s.tableCell, s.colAprPm]}>
                {l.evaluation.moduleIgnore || l.evaluation.coefficientPm === null
                  ? '—'
                  : l.evaluation.coefficientPm === 0 ? '0,0' : String(l.evaluation.coefficientPm).replace('.', ',')}
              </Text>
              <View style={s.colAprResid}>
                <CriticiteBadge
                  score={l.evaluation.criticiteResiduelle}
                  couleur={l.evaluation.moduleIgnore ? null : l.evaluation.couleurResiduelle}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// ── Plan de maîtrise global ────────────────────────────────────────────────────

function PlanMaitriseSection({ postes }: { postes: PDFPoste[] }) {
  const prioritaires: Array<{
    posteNom: string
    operationNom: string
    evaluation: PDFEvaluation
  }> = []

  for (const poste of postes) {
    for (const op of poste.operations) {
      for (const ev of op.evaluations) {
        if (ev.moduleIgnore) continue
        const score = ev.criticiteResiduelle ?? ev.criticiteBrute ?? 0
        if (ev.couleurResiduelle === 'rouge' || ev.couleurResiduelle === 'orange') {
          prioritaires.push({ posteNom: poste.nom, operationNom: op.nom, evaluation: ev })
        }
      }
    }
  }

  prioritaires.sort((a, b) => {
    const ra = a.evaluation.criticiteResiduelle ?? a.evaluation.criticiteBrute ?? 0
    const rb = b.evaluation.criticiteResiduelle ?? b.evaluation.criticiteBrute ?? 0
    return rb - ra
  })

  return (
    <View>
      <Text style={s.sectionTitle}>Plan de maîtrise — Actions prioritaires</Text>
      <Text style={{ fontSize: 8, color: C.gray500, marginBottom: 10 }}>
        Risques orange et rouge nécessitant une action. Les mesures listées sont celles déjà en place.
      </Text>

      {prioritaires.length === 0 ? (
        <View style={s.infoBox}>
          <Text style={[s.infoText, { color: '#166534' }]}>
            Aucun risque prioritaire identifié (tous les risques sont verts ou jaunes).
          </Text>
        </View>
      ) : (
        prioritaires.map((item, i) => {
          const col = item.evaluation.couleurResiduelle
            ? getCouleurStyles(item.evaluation.couleurResiduelle)
            : C.criticite.vert
          return (
            <View
              key={i}
              style={[
                s.priorityItem,
                {
                  borderLeftColor: col.border,
                  backgroundColor: col.bg,
                  borderRadius: 3,
                  padding: '6 10',
                  marginBottom: 6,
                },
              ]}
            >
              <Text style={s.priorityTitle}>
                {item.posteNom} — {item.operationNom} — {item.evaluation.nomModule}
              </Text>
              <Text style={s.priorityDetail}>
                Criticité résiduelle : {item.evaluation.criticiteResiduelle ?? '—'}
                {item.evaluation.mesures ? `  |  Mesures en place : ${item.evaluation.mesures}` : ''}
              </Text>
              <Text style={[s.priorityDetail, { marginTop: 3, fontFamily: 'Helvetica-Bold' }]}>
                ⚠ {item.evaluation.action}
              </Text>
            </View>
          )
        })
      )}
    </View>
  )
}

// ── Programme Annuel de Prévention (effectif ≥ 50) ────────────────────────────

function ProgrammeAnnuelPrevention() {
  return (
    <View>
      <Text style={s.sectionTitle}>Programme Annuel de Prévention</Text>
      <Text style={{ fontSize: 8, color: C.gray500, marginBottom: 10 }}>
        Obligation légale pour les entreprises de 50 salariés et plus — Loi du 2 août 2021.
      </Text>
      <View style={[s.infoBox, { borderColor: '#93c5fd', backgroundColor: '#eff6ff' }]}>
        <Text style={[s.infoText, { color: '#1e40af', fontFamily: 'Helvetica-Bold', marginBottom: 4 }]}>
          Section à compléter
        </Text>
        <Text style={[s.infoText, { color: '#1e40af' }]}>
          Cette section doit être complétée par le responsable prévention de l&apos;entreprise
          avec le plan d&apos;action annuel détaillé, les échéances et les responsables désignés.{'\n\n'}
          Pour chaque risque rouge ou orange identifié dans l&apos;APR, un plan d&apos;action avec
          délai et responsable doit être formalisé ici, conformément aux exigences de la
          Loi du 2 août 2021 pour les entreprises de 50 salariés et plus.
        </Text>
      </View>
    </View>
  )
}

// ── Document principal ─────────────────────────────────────────────────────────

export function DuerpDocument({ data }: { data: PDFData }) {
  return (
    <Document
      title={`DUERP - ${data.entreprise.nom}`}
      author="SafeAnalyse."
      subject="Document Unique d'Évaluation des Risques Professionnels"
      keywords="DUERP, risques professionnels, évaluation"
    >
      <Page size="A4" style={s.page}>
        {/* Page de garde — sans header/footer */}
        <CoverPage data={data} />

        {/* Sommaire */}
        <View break>
          <HeaderFooter
            nomEntreprise={data.entreprise.nom}
            dateGeneration={data.dateGeneration}
            numeroVersion={data.numeroVersion}
          />
          <Sommaire postes={data.postes} />
        </View>

        {/* Sections par poste */}
        {data.postes.map((poste, i) => (
          <View key={i} break>
            <PosteSection poste={poste} />
          </View>
        ))}

        {/* APR récapitulatif */}
        <View break>
          <APRRecap postes={data.postes} />
        </View>

        {/* Plan de maîtrise */}
        <View break>
          <PlanMaitriseSection postes={data.postes} />
        </View>

        {/* Programme Annuel de Prévention */}
        {data.effectifMajeur50 && (
          <View break>
            <ProgrammeAnnuelPrevention />
          </View>
        )}
      </Page>
    </Document>
  )
}
