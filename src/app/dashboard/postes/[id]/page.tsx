import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TableauAPR, OperationUI, RisqueUI } from './_components/tableau-apr'
import { EditerPosteModal } from '@/components/postes/editer-poste-modal'
import { SupprimerPosteButton } from '@/components/postes/supprimer-poste-button'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PosteDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!entreprise) redirect('/dashboard/onboarding')

  // Charger le poste + opérations + évaluations APR + plans de maîtrise
  const { data: poste } = await supabase
    .from('postes')
    .select(`
      id, nom, description, ordre,
      operations (
        id, nom, est_transversale, ordre,
        evaluations (
          id, numero_risque_ed840, identifiant_auto, type_risque,
          danger, situation_dangereuse, evenement_dangereux,
          dommage, siege_lesions, gravite, probabilite, duree_exposition,
          criticite_brute, ordre, code_module,
          module_status, preselection_responses,
          plans_maitrise (
            coefficient_pm, criticite_residuelle, mesures_techniques,
            mesures_humaines, mesures_organisationnelles, mesures_epi
          )
        )
      )
    `)
    .eq('id', id)
    .eq('entreprise_id', entreprise.id)
    .single()

  if (!poste) notFound()

  // Transformer les données pour le composant client
  const operationsUI: OperationUI[] = (poste.operations ?? []).map((op) => {
    const risques: RisqueUI[] = (op.evaluations ?? [])
      .filter((ev) => ev.code_module === 'APR')
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .map((ev) => {
        const pmArr = (ev.plans_maitrise ?? []) as Array<{
          coefficient_pm: number
          criticite_residuelle: number | null
          mesures_techniques: string | null
          mesures_humaines: string | null
          mesures_organisationnelles: string | null
          mesures_epi: string | null
        }>
        const pm = pmArr[0] ?? null

        return {
          id: ev.id,
          operation_id: op.id,
          identifiant_auto: (ev.identifiant_auto as string | null),
          numero_risque_ed840: (ev.numero_risque_ed840 as number | null),
          type_risque: (ev.type_risque as 'aigu' | 'chronique'),
          danger: (ev.danger as string | null),
          situation_dangereuse: (ev.situation_dangereuse as string | null),
          evenement_dangereux: (ev.evenement_dangereux as string | null),
          dommage: (ev.dommage as string | null),
          siege_lesions: (ev.siege_lesions as string | null),
          gravite: (ev.gravite as number | null),
          probabilite: (ev.probabilite as number | null),
          duree_exposition: (ev.duree_exposition as number | null),
          criticite_brute: (ev.criticite_brute as number | null),
          coefficient_pm: pm?.coefficient_pm ?? 1.0,
          criticite_residuelle: pm?.criticite_residuelle ?? null,
          mesures_techniques: pm?.mesures_techniques ?? null,
          ordre: (ev.ordre as number) ?? 0,
          module_status: (ev.module_status as 'non_initie' | 'maitrise' | 'creuser' | null) ?? null,
          preselection_responses: (ev.preselection_responses as boolean[] | null) ?? null,
        }
      })

    return {
      id: op.id,
      nom: op.nom,
      est_transversale: op.est_transversale,
      ordre: op.ordre ?? 0,
      risques,
    }
  })

  return (
    <div className="space-y-6">

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm text-brand-bronze/70">
        <Link href="/dashboard/postes" className="hover:text-brand-navy transition-colors">
          Postes de travail
        </Link>
        <span>/</span>
        <span className="text-brand-navy font-medium">{poste.nom}</span>
      </nav>

      {/* En-tête du poste */}
      <div className="bg-brand-off border border-brand-sand rounded-xl p-5 shadow-[0_1px_3px_rgba(3,25,72,0.05)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-brand-navy leading-tight">{poste.nom}</h1>
            {poste.description && (
              <p className="mt-1 text-sm text-brand-bronze">{poste.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <EditerPosteModal poste={{ id: poste.id, nom: poste.nom, description: poste.description ?? '' }} />
            <SupprimerPosteButton posteId={poste.id} nomPoste={poste.nom} />
          </div>
        </div>
      </div>

      {/* Tableau APR inline */}
      <TableauAPR
        operationsInitiales={operationsUI}
        posteId={poste.id}
      />

      {/* Lien modules normés */}
      <div className="bg-brand-off border border-brand-sand rounded-xl p-4">
        <p className="text-xs font-semibold text-brand-navy mb-2">Évaluations normées disponibles</p>
        <div className="flex flex-wrap gap-2">
          {operationsUI.map(op => (
            <Link
              key={op.id}
              href={`/dashboard/postes/${poste.id}/operations/${op.id}/risques/M01_BRUIT`}
              className="text-xs px-3 py-1 bg-brand-gold-pale text-brand-bronze border border-brand-sand hover:border-brand-navy hover:text-brand-navy rounded-full transition-colors"
            >
              Bruit — {op.nom}
            </Link>
          ))}
          <span className="text-xs px-3 py-1 bg-brand-cream text-brand-bronze/50 border border-brand-sand/50 rounded-full cursor-not-allowed">
            TMS · Vibrations · RPS (bientôt)
          </span>
        </div>
      </div>

    </div>
  )
}
