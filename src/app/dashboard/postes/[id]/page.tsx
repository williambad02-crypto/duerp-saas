import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TableauAPR, OperationUI, RisqueUI } from './_components/tableau-apr'

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
          // module_status et preselection_responses activés après migration 009
          module_status: null,
          preselection_responses: null,
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
    <div className="h-full flex flex-col">
      <div className="-mx-4 lg:-mx-6 flex-1 min-h-0">
        <TableauAPR
          operationsInitiales={operationsUI}
          posteId={poste.id}
          nomPoste={poste.nom}
          descriptionPoste={poste.description ?? null}
        />
      </div>
    </div>
  )
}
