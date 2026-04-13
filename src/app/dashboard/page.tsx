import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MODULES_RISQUES } from '@/lib/constants/modules'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const { data: postes } = await supabase
    .from('postes')
    .select('id')
    .eq('entreprise_id', entreprise?.id ?? '')

  const nbPostes = postes?.length ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Document Unique d&apos;Évaluation des Risques Professionnels
        </p>
      </div>

      {/* Cartes résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Postes de travail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{nbPostes}</p>
            <Link href="/dashboard/postes" className="mt-1 text-xs text-blue-600 hover:underline">
              Gérer les postes →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Évaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="mt-1 text-xs text-gray-400">en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Statut DUERP</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">En construction</Badge>
            <p className="mt-1 text-xs text-gray-400">Dernière mise à jour : —</p>
          </CardContent>
        </Card>
      </div>

      {/* Modules disponibles */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Modules de risques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES_RISQUES.map((module) => (
            <div
              key={module.code}
              className={`rounded-lg border p-4 ${
                module.statut === 'actif'
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{module.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                </div>
                <Badge
                  variant={module.statut === 'actif' ? 'default' : 'secondary'}
                  className="shrink-0 text-xs"
                >
                  {module.statut === 'actif'
                    ? 'Actif'
                    : module.statut === 'coming_soon'
                    ? 'Bientôt'
                    : 'V2'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      {nbPostes === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Pour commencer</p>
                <p className="text-sm text-blue-700 mt-1">
                  Créez vos premiers postes de travail pour démarrer l&apos;évaluation des risques.
                </p>
                <Link
                  href="/dashboard/postes"
                  className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-500 underline"
                >
                  Créer un poste de travail →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
