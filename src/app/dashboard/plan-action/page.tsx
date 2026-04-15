import { getEvaluationsAiguesAvecActions } from './_actions'
import { getContacts } from '../parametres/contacts/_actions'
import { TableauPlanAction } from './_components/tableau-plan-action'

export const metadata = { title: "Plan d'action — SafeAnalyse." }

export default async function PlanActionPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string }>
}) {
  const { onglet: ongletParam } = await searchParams
  const onglet = ongletParam === 'par_poste' ? 'par_poste' : 'priorites'

  const [evaluations, contacts] = await Promise.all([
    getEvaluationsAiguesAvecActions(),
    getContacts(),
  ])

  return (
    <div className="space-y-6">
      {/* En-tête + onglets */}
      <div className="border-b border-amber-100 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Plan d&apos;action</h1>
            <p className="text-sm text-amber-800 mt-1">Risques aigus — actions correctives à planifier et suivre</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-0">
          <a
            href="/dashboard/plan-action?onglet=priorites"
            className={`px-5 py-2 text-sm font-semibold border-b-2 transition-colors ${
              onglet === 'priorites'
                ? 'text-brand-navy border-brand-navy'
                : 'text-amber-700 border-transparent hover:text-brand-navy'
            }`}
          >
            🔴 Priorités
          </a>
          <a
            href="/dashboard/plan-action?onglet=par_poste"
            className={`px-5 py-2 text-sm font-semibold border-b-2 transition-colors ${
              onglet === 'par_poste'
                ? 'text-brand-navy border-brand-navy'
                : 'text-amber-700 border-transparent hover:text-brand-navy'
            }`}
          >
            🏭 Par poste
          </a>
        </div>
      </div>

      <TableauPlanAction
        evaluations={evaluations}
        contacts={contacts}
        onglet={onglet}
      />
    </div>
  )
}
