// Composant affiché pour les modules M02-M05 (coming soon en V1)

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ModuleRisque } from '@/lib/constants/modules'

interface ModuleComingSoonProps {
  module: ModuleRisque
  posteId: string
  operationId: string
}

export function ModuleComingSoon({ module, posteId, operationId }: ModuleComingSoonProps) {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-900">Module disponible prochainement</h3>
            <p className="text-sm text-amber-700 mt-1">
              Le module <strong>{module.nom}</strong> sera disponible dans une prochaine version du DUERP.
              Votre présélection a bien été enregistrée — ce risque est signalé comme à évaluer dans votre APR.
            </p>
          </div>
        </div>
      </div>

      {/* Info pratique */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Ce que vous pouvez faire en attendant</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Documenter vos observations dans la description de l&apos;opération
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Consulter votre médecin du travail pour une évaluation provisoire
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mettre en place des mesures de précaution basées sur votre expérience terrain
          </li>
        </ul>
      </div>

      <div className="flex justify-start">
        <Link
          href={`/dashboard/postes/${posteId}/operations/${operationId}/risques`}
          className={buttonVariants({ variant: 'outline' })}
        >
          ← Retour aux modules
        </Link>
      </div>
    </div>
  )
}
