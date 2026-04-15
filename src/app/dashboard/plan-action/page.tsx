import { getEvaluationsAiguesAvecActions } from './_actions'
import { getContacts } from '../parametres/contacts/_actions'
import { TableauPlanAction } from './_components/tableau-plan-action'

export const metadata = { title: "Plan d'action — SafeAnalyse." }

export default async function PlanActionPage() {
  const [evaluations, contacts] = await Promise.all([
    getEvaluationsAiguesAvecActions(),
    getContacts(),
  ])

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-amber-100 pb-4">
        <h1 className="text-2xl font-bold text-brand-navy">Plan d&apos;action</h1>
        <p className="text-sm text-amber-800 mt-1">Risques aigus — actions correctives à planifier et suivre</p>
      </div>

      <TableauPlanAction
        evaluations={evaluations}
        contacts={contacts}
      />
    </div>
  )
}
