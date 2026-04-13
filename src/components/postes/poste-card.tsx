import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface PosteCardProps {
  poste: {
    id: string
    nom: string
    description?: string
    nbOperations: number
    nbEvaluations: number
  }
}

export function PosteCard({ poste }: PosteCardProps) {
  return (
    <Link
      href={`/dashboard/postes/${poste.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 truncate">
            {poste.nom}
          </h3>
          {poste.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{poste.description}</p>
          )}
        </div>
        {/* Badge criticité — "Non évalué" tant que pas d'évaluations */}
        <Badge variant="secondary" className="shrink-0">
          Non évalué
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span>
          <strong className="text-gray-700">{poste.nbOperations}</strong>{' '}
          opération{poste.nbOperations > 1 ? 's' : ''}
        </span>
        <span>
          <strong className="text-gray-700">{poste.nbEvaluations}</strong>{' '}
          évaluation{poste.nbEvaluations > 1 ? 's' : ''}
        </span>
        <span className="ml-auto text-blue-500 group-hover:translate-x-1 transition-transform">
          Voir →
        </span>
      </div>
    </Link>
  )
}
