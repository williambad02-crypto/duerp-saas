// Carte module sur la page de liste des risques

import Link from 'next/link'
import { CriticiteBadge } from './criticite-badge'
import { ModuleRisque } from '@/lib/constants/modules'

interface EtatModule {
  preselectFaite: boolean
  moduleActif: boolean | null // null = pas de présélection
  evaluationTerminee: boolean
  criticiteBrute?: number | null
  couleurCriticite?: 'vert' | 'jaune' | 'orange' | 'rouge'
  criticiteResiduelle?: number | null
}

interface ModuleCardProps {
  module: ModuleRisque
  etat: EtatModule
  posteId: string
  operationId: string
}

function StatutPill({ etat }: { etat: EtatModule }) {
  if (!etat.preselectFaite) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        À évaluer
      </span>
    )
  }

  if (!etat.moduleActif) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Non concerné
      </span>
    )
  }

  if (!etat.evaluationTerminee) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        En cours
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      Terminé
    </span>
  )
}

export function ModuleCard({ module, etat, posteId, operationId }: ModuleCardProps) {
  const estDesactive = module.statut === 'desactive'

  const cardContent = (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        estDesactive
          ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
          : etat.evaluationTerminee && !etat.moduleActif
          ? 'border-green-100 bg-green-50/30 hover:border-green-200'
          : etat.evaluationTerminee
          ? 'border-indigo-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/20 cursor-pointer'
          : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/20 cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-gray-900">{module.nom}</span>
            {module.statut === 'coming_soon' && (
              <span className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                V2
              </span>
            )}
            {module.statut === 'desactive' && (
              <span className="text-xs text-gray-400 font-medium bg-gray-100 rounded px-1.5 py-0.5">
                Bientôt
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{module.description}</p>
          <StatutPill etat={etat} />
        </div>

        {/* Criticité */}
        {etat.evaluationTerminee && etat.criticiteBrute != null && etat.couleurCriticite && (
          <div className="text-right shrink-0">
            <div className="text-xs text-gray-400 mb-1">Criticité</div>
            <CriticiteBadge
              score={
                etat.criticiteResiduelle != null
                  ? etat.criticiteResiduelle
                  : etat.criticiteBrute
              }
              couleur={etat.couleurCriticite}
              size="sm"
            />
          </div>
        )}

        {/* Flèche pour les modules actifs non désactivés */}
        {!estDesactive && (
          <div className="text-gray-400 shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )

  if (estDesactive) return cardContent

  return (
    <Link href={`/dashboard/postes/${posteId}/operations/${operationId}/risques/${module.code}`}>
      {cardContent}
    </Link>
  )
}
